import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { db, pool } from '@/lib/db';
import { orders, orderItems, orderStatusHistory } from '@/db/schema';
import { verifySession, shouldRefreshSession, refreshSession } from '@/lib/auth';
import { loadCatalog } from '@/lib/catalog';
import { isValidQuantity, PINCODE_REGEX } from '@/lib/validation';
import { calculateTotal, toRupees } from '@/lib/money';
import { MAX_QTY_PER_LINE } from '@/lib/constants';
import { sendEmail } from '@/lib/email';
import { eq, desc, and } from 'drizzle-orm';

const createOrderSchema = z.object({
  items: z
    .array(
      z.object({
        id: z.string(),
        quantity: z.number().positive(),
      })
    )
    .min(1, 'Cart must contain at least one item'),
  addressLine1: z.string().min(1, 'Address line 1 is required'),
  addressLine2: z.string().optional(),
  city: z.string().min(1, 'City is required'),
  pincode: z.string().regex(PINCODE_REGEX, 'Invalid pincode'),
  deliveryPhone: z.string().regex(/^[6-9]\d{9}$/, 'Invalid phone number'),
  notes: z.string().optional(),
  lat: z.number().optional(),
  lng: z.number().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify session
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get idempotency key
    const idempotencyKey = request.headers.get('idempotency-key');
    if (!idempotencyKey) {
      return NextResponse.json(
        { error: 'Idempotency-Key header required' },
        { status: 400 }
      );
    }

    // Parse and validate request
    const body = await request.json();
    const data = createOrderSchema.parse(body);

    // Load catalog (fresh read, no cache)
    const catalog = loadCatalog();
    const catalogMap = new Map(catalog.items.map((item) => [item.id, item]));

    // Validate all items exist and quantities are valid
    for (const orderItem of data.items) {
      const catalogItem = catalogMap.get(orderItem.id);
      if (!catalogItem) {
        return NextResponse.json(
          { error: `Item ${orderItem.id} not found in catalog` },
          { status: 400 }
        );
      }

      if (!isValidQuantity(orderItem.quantity, catalogItem.step)) {
        return NextResponse.json(
          {
            error: `Quantity ${orderItem.quantity} for ${catalogItem.name} must be a multiple of ${catalogItem.step}`,
          },
          { status: 400 }
        );
      }

      if (orderItem.quantity > MAX_QTY_PER_LINE) {
        return NextResponse.json(
          {
            error: `Quantity ${orderItem.quantity} for ${catalogItem.name} exceeds maximum of ${MAX_QTY_PER_LINE}`,
          },
          { status: 400 }
        );
      }
    }

    // Calculate total in paise using integer math
    const itemsForTotal = data.items.map((orderItem) => {
      const catalogItem = catalogMap.get(orderItem.id)!;
      return {
        price: catalogItem.price,
        quantity: orderItem.quantity,
      };
    });
    const totalPaise = calculateTotal(itemsForTotal);
    const totalRupees = toRupees(totalPaise);

    // Begin transaction - idempotency check happens INSIDE transaction
    const result = await pool.connect().then(async (client) => {
      try {
        await client.query('BEGIN');

        // Check for existing order with this idempotency key INSIDE transaction
        const existingOrder = await db
          .select()
          .from(orders)
          .where(
            and(
              eq(orders.userId, session.userId),
              eq(orders.idempotencyKey, idempotencyKey)
            )
          )
          .limit(1);

        if (existingOrder.length > 0) {
          await client.query('COMMIT');
          return { existing: true, order: existingOrder[0] };
        }

        // Insert order
        const [newOrder] = await db
          .insert(orders)
          .values({
            userId: session.userId,
            status: 'PLACED',
            total: totalRupees.toFixed(2),
            addressLine1: data.addressLine1,
            addressLine2: data.addressLine2 || null,
            city: data.city,
            pincode: data.pincode,
            lat: data.lat?.toFixed(7) || null,
            lng: data.lng?.toFixed(7) || null,
            deliveryPhone: data.deliveryPhone,
            notes: data.notes || null,
            idempotencyKey,
          })
          .returning();

        // Insert order items
        const orderItemsData = data.items.map((orderItem) => {
          const catalogItem = catalogMap.get(orderItem.id)!;
          return {
            orderId: newOrder.id,
            itemId: catalogItem.id,
            nameSnapshot: catalogItem.name,
            brandSnapshot: catalogItem.brand || null,
            unitSnapshot: catalogItem.unit,
            priceSnapshot: catalogItem.price.toFixed(2),
            quantity: orderItem.quantity.toFixed(3),
          };
        });
        await db.insert(orderItems).values(orderItemsData);

        // Insert order status history
        await db.insert(orderStatusHistory).values({
          orderId: newOrder.id,
          status: 'PLACED',
          changedBy: session.userId,
        });

        await client.query('COMMIT');
        return { existing: false, order: newOrder };
      } catch (error) {
        await client.query('ROLLBACK');
        
        // Check for unique constraint violation on idempotency key (Postgres error code 23505)
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === '23505' &&
          'constraint' in error &&
          typeof error.constraint === 'string' &&
          error.constraint.includes('idempotency')
        ) {
          // Duplicate idempotency key - fetch and return existing order
          const existingOrder = await db
            .select()
            .from(orders)
            .where(
              and(
                eq(orders.userId, session.userId),
                eq(orders.idempotencyKey, idempotencyKey)
              )
            )
            .limit(1);
          
          if (existingOrder.length > 0) {
            return { existing: true, order: existingOrder[0] };
          }
        }
        
        throw error;
      } finally {
        client.release();
      }
    });

    // If existing order was found, return it
    if (result.existing) {
      return NextResponse.json({
        orderId: result.order.id,
        orderNo: result.order.orderNo,
      });
    }

    // Send emails asynchronously (best effort, don't fail order)
    setTimeout(async () => {
      try {
        // Get user info and order items
        const { users } = await import('@/db/schema');
        const { orderConfirmationEmail, newOrderNotificationEmail } = await import('@/lib/email-templates');
        
        const [user] = await db
          .select()
          .from(users)
          .where(eq(users.id, session.userId))
          .limit(1);

        const items = await db
          .select()
          .from(orderItems)
          .where(eq(orderItems.orderId, result.order.id));

        if (user && items.length > 0) {
          // Convert order dates to strings for email templates
          const orderForEmail = {
            ...result.order,
            placedAt: result.order.placedAt.toISOString(),
            claimedAt: result.order.claimedAt?.toISOString() || null,
            packedAt: result.order.packedAt?.toISOString() || null,
            dispatchedAt: result.order.dispatchedAt?.toISOString() || null,
            deliveredAt: result.order.deliveredAt?.toISOString() || null,
          };
          
          // Convert items for email templates
          const itemsForEmail = items.map(item => ({
            ...item,
            id: item.id.toString(),
          }));
          
          // Send confirmation email to customer
          const confirmEmail = orderConfirmationEmail(orderForEmail, itemsForEmail, user);
          await sendEmail({
            to: user.email,
            subject: confirmEmail.subject,
            html: confirmEmail.html,
          });

          // Send notification to admin
          const adminEmails = process.env.ADMIN_NOTIFY_EMAILS?.split(',').map((e) => e.trim()).filter(Boolean) || [];
          const notificationEmail = newOrderNotificationEmail(orderForEmail, itemsForEmail, user);
          
          for (const adminEmail of adminEmails) {
            await sendEmail({
              to: adminEmail,
              subject: notificationEmail.subject,
              html: notificationEmail.html,
            });
          }
        }
      } catch (error) {
        console.error('Failed to send order emails:', error);
      }
    }, 0);

    // Refresh session if needed
    if (shouldRefreshSession(session.iat)) {
      await refreshSession(session.userId, session.role);
    }

    return NextResponse.json({
      orderId: result.order.id,
      orderNo: result.order.orderNo,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      );
    }
    console.error('Create order error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify session
    const session = await verifySession();
    if (!session) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    // Get orders for this user
    const userOrders = await db
      .select()
      .from(orders)
      .where(eq(orders.userId, session.userId))
      .orderBy(desc(orders.placedAt));

    // Refresh session if needed
    if (shouldRefreshSession(session.iat)) {
      await refreshSession(session.userId, session.role);
    }

    return NextResponse.json({
      orders: userOrders,
      total: userOrders.length,
    });
  } catch (error) {
    console.error('Get orders error:', error);
    return NextResponse.json(
      { error: 'Failed to get orders' },
      { status: 500 }
    );
  }
}
