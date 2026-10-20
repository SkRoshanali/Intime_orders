import { pgTable, uuid, text, boolean, timestamp, serial, numeric, integer, pgEnum, unique, index } from 'drizzle-orm/pg-core';

// Enums
export const userRoleEnum = pgEnum('user_role', ['customer', 'agent', 'admin']);
export const orderStatusEnum = pgEnum('order_status', ['PLACED', 'IN_TRIP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED']);

// Users table
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  role: userRoleEnum('role').notNull().default('customer'),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash').notNull(),
  phone: text('phone').notNull().unique(),
  phoneVerified: boolean('phone_verified').notNull().default(false),
  phoneVerifiedAt: timestamp('phone_verified_at'),
  createdAt: timestamp('created_at').notNull().defaultNow(),
});

// OTP codes table
export const otpCodes = pgTable('otp_codes', {
  id: serial('id').primaryKey(),
  phone: text('phone').notNull(),
  codeHash: text('code_hash').notNull(),
  ip: text('ip').notNull(),
  expiresAt: timestamp('expires_at').notNull(),
  attempts: integer('attempts').notNull().default(0),
  createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
  phoneIdx: index('idx_otp_codes_phone').on(table.phone),
  ipIdx: index('idx_otp_codes_ip').on(table.ip),
}));

// Batches table (for future admin app)
export const batches = pgTable('batches', {
  id: serial('id').primaryKey(),
  agentId: uuid('agent_id').references(() => users.id),
  status: text('status').notNull(),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  sealedAt: timestamp('sealed_at'),
  dispatchedAt: timestamp('dispatched_at'),
  completedAt: timestamp('completed_at'),
});

// Orders table
export const orders = pgTable('orders', {
  id: uuid('id').defaultRandom().primaryKey(),
  orderNo: serial('order_no').unique().notNull(),
  userId: uuid('user_id').notNull().references(() => users.id),
  agentId: uuid('agent_id').references(() => users.id),
  batchId: integer('batch_id').references(() => batches.id),
  status: orderStatusEnum('status').notNull().default('PLACED'),
  total: numeric('total', { precision: 10, scale: 2 }).notNull(),
  addressLine1: text('address_line1').notNull(),
  addressLine2: text('address_line2'),
  city: text('city').notNull(),
  pincode: text('pincode').notNull(),
  lat: numeric('lat', { precision: 10, scale: 7 }),
  lng: numeric('lng', { precision: 10, scale: 7 }),
  deliveryPhone: text('delivery_phone').notNull(),
  notes: text('notes'),
  idempotencyKey: text('idempotency_key').notNull(),
  placedAt: timestamp('placed_at').notNull().defaultNow(),
  claimedAt: timestamp('claimed_at'),
  packedAt: timestamp('packed_at'),
  dispatchedAt: timestamp('dispatched_at'),
  deliveredAt: timestamp('delivered_at'),
}, (table) => ({
  uniqueUserIdempotencyKey: unique('unique_user_idempotency_key').on(table.userId, table.idempotencyKey),
  userIdIdx: index('idx_orders_user_id').on(table.userId),
  statusIdx: index('idx_orders_status').on(table.status),
}));

// Order items table
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  itemId: text('item_id').notNull(),
  nameSnapshot: text('name_snapshot').notNull(),
  brandSnapshot: text('brand_snapshot'),
  unitSnapshot: text('unit_snapshot').notNull(),
  priceSnapshot: numeric('price_snapshot', { precision: 10, scale: 2 }).notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 3 }).notNull(),
  unavailable: boolean('unavailable').notNull().default(false),
}, (table) => ({
  orderIdIdx: index('idx_order_items_order_id').on(table.orderId),
}));

// Order status history table
export const orderStatusHistory = pgTable('order_status_history', {
  id: serial('id').primaryKey(),
  orderId: uuid('order_id').notNull().references(() => orders.id, { onDelete: 'cascade' }),
  status: text('status').notNull(),
  changedBy: uuid('changed_by').references(() => users.id),
  changedAt: timestamp('changed_at').notNull().defaultNow(),
  notes: text('notes'),
}, (table) => ({
  orderIdIdx: index('idx_order_status_history_order_id').on(table.orderId),
}));

// Type exports
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type OtpCode = typeof otpCodes.$inferSelect;
export type NewOtpCode = typeof otpCodes.$inferInsert;

export type Batch = typeof batches.$inferSelect;
export type NewBatch = typeof batches.$inferInsert;

export type Order = typeof orders.$inferSelect;
export type NewOrder = typeof orders.$inferInsert;

export type OrderItem = typeof orderItems.$inferSelect;
export type NewOrderItem = typeof orderItems.$inferInsert;

export type OrderStatusHistory = typeof orderStatusHistory.$inferSelect;
export type NewOrderStatusHistory = typeof orderStatusHistory.$inferInsert;
