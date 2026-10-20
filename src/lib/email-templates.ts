import type { Order, OrderItem } from '@/types/order';
import type { User } from '@/types/auth';

export function orderConfirmationEmail(
  order: Order,
  items: OrderItem[],
  user: User
): { subject: string; html: string } {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        ${item.nameSnapshot}<br/>
        <span style="font-size: 12px; color: #6b7280;">
          ${item.brandSnapshot ? item.brandSnapshot + ' • ' : ''}${item.unitSnapshot}
        </span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${parseFloat(item.quantity)}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${item.priceSnapshot}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${(parseFloat(item.priceSnapshot) * parseFloat(item.quantity)).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  return {
    subject: `Order Confirmed #${order.orderNo}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Order Confirmed</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #10b981; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Order Confirmed!</h1>
          </div>
          
          <p>Hi ${user.name},</p>
          
          <p>Your order <strong>#${order.orderNo}</strong> has been placed successfully.</p>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; font-size: 18px; color: #1f2937;">Order Details</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background-color: #e5e7eb;">
                  <th style="padding: 8px; text-align: left;">Item</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="text-align: right; padding: 12px 8px; border-top: 2px solid #d1d5db;">
              <strong style="font-size: 18px;">Total: ₹${order.total}</strong>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Cash on delivery</div>
            </div>
          </div>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px; color: #1f2937;">Delivery Address</h3>
            <p style="margin: 4px 0;">${order.addressLine1}</p>
            ${order.addressLine2 ? `<p style="margin: 4px 0;">${order.addressLine2}</p>` : ''}
            <p style="margin: 4px 0;">${order.city}, ${order.pincode}</p>
            <p style="margin: 4px 0; color: #6b7280;">Phone: ${order.deliveryPhone}</p>
            ${order.notes ? `<p style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #bfdbfe; color: #6b7280; font-size: 14px;"><strong>Note:</strong> ${order.notes}</p>` : ''}
          </div>
          
          <p style="margin-top: 24px;">We'll notify you when your order is out for delivery.</p>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            Thank you for shopping with us!
          </p>
        </body>
      </html>
    `,
  };
}

export function newOrderNotificationEmail(
  order: Order,
  items: OrderItem[],
  user: User
): { subject: string; html: string } {
  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">
        ${item.nameSnapshot}<br/>
        <span style="font-size: 12px; color: #6b7280;">
          ${item.brandSnapshot ? item.brandSnapshot + ' • ' : ''}${item.unitSnapshot}
        </span>
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: center;">
        ${parseFloat(item.quantity)}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${item.priceSnapshot}
      </td>
      <td style="padding: 8px; border-bottom: 1px solid #e5e7eb; text-align: right;">
        ₹${(parseFloat(item.priceSnapshot) * parseFloat(item.quantity)).toFixed(2)}
      </td>
    </tr>
  `
    )
    .join('');

  return {
    subject: `New Order #${order.orderNo} from ${user.name}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>New Order</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #3b82f6; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">New Order Received</h1>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin-bottom: 20px;">
            <strong>Order Number:</strong> #${order.orderNo}
          </div>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; font-size: 18px; color: #1f2937;">Customer Information</h2>
            <p style="margin: 4px 0;"><strong>Name:</strong> ${user.name}</p>
            <p style="margin: 4px 0;"><strong>Phone:</strong> ${user.phone}</p>
            <p style="margin: 4px 0;"><strong>Email:</strong> ${user.email}</p>
          </div>
          
          <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h2 style="margin-top: 0; font-size: 18px; color: #1f2937;">Order Items</h2>
            
            <table style="width: 100%; border-collapse: collapse; margin-bottom: 16px;">
              <thead>
                <tr style="background-color: #e5e7eb;">
                  <th style="padding: 8px; text-align: left;">Item</th>
                  <th style="padding: 8px; text-align: center;">Qty</th>
                  <th style="padding: 8px; text-align: right;">Price</th>
                  <th style="padding: 8px; text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${itemsHtml}
              </tbody>
            </table>
            
            <div style="text-align: right; padding: 12px 8px; border-top: 2px solid #d1d5db;">
              <strong style="font-size: 18px;">Total: ₹${order.total}</strong>
              <div style="font-size: 12px; color: #6b7280; margin-top: 4px;">Cash on delivery</div>
            </div>
          </div>
          
          <div style="background-color: #eff6ff; padding: 16px; border-radius: 8px; margin: 20px 0;">
            <h3 style="margin-top: 0; font-size: 16px; color: #1f2937;">Delivery Address</h3>
            <p style="margin: 4px 0;">${order.addressLine1}</p>
            ${order.addressLine2 ? `<p style="margin: 4px 0;">${order.addressLine2}</p>` : ''}
            <p style="margin: 4px 0;">${order.city}, ${order.pincode}</p>
            <p style="margin: 4px 0; color: #6b7280;">Phone: ${order.deliveryPhone}</p>
            ${order.notes ? `<p style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #bfdbfe; color: #6b7280; font-size: 14px;"><strong>Delivery Note:</strong> ${order.notes}</p>` : ''}
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            This is an automated notification.
          </p>
        </body>
      </html>
    `,
  };
}

export function resetPasswordEmail(code: string): { subject: string; html: string } {
  return {
    subject: 'Reset Your Password',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Password</title>
        </head>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #374151; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="background-color: #f59e0b; color: white; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">Reset Your Password</h1>
          </div>
          
          <p>You requested to reset your password. Please use the code below to continue:</p>
          
          <div style="background-color: #f3f4f6; padding: 24px; border-radius: 8px; margin: 24px 0; text-align: center;">
            <div style="font-size: 32px; font-weight: bold; color: #1f2937; letter-spacing: 4px; font-family: monospace;">
              ${code}
            </div>
            <div style="font-size: 14px; color: #6b7280; margin-top: 8px;">
              This code expires in 5 minutes
            </div>
          </div>
          
          <div style="background-color: #fef3c7; border-left: 4px solid #f59e0b; padding: 16px; margin: 20px 0;">
            <p style="margin: 0; font-size: 14px; color: #92400e;">
              <strong>Security Notice:</strong> If you didn't request this password reset, you can safely ignore this email. Your password will not be changed.
            </p>
          </div>
          
          <p style="color: #6b7280; font-size: 14px; margin-top: 32px;">
            This is an automated message from your grocery delivery service.
          </p>
        </body>
      </html>
    `,
  };
}
