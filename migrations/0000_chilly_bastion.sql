CREATE TYPE "public"."order_status" AS ENUM('PLACED', 'IN_TRIP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED');--> statement-breakpoint
CREATE TYPE "public"."user_role" AS ENUM('customer', 'agent', 'admin');--> statement-breakpoint
CREATE TABLE "batches" (
	"id" serial PRIMARY KEY NOT NULL,
	"agent_id" uuid,
	"status" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"sealed_at" timestamp,
	"dispatched_at" timestamp,
	"completed_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "order_items" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"item_id" text NOT NULL,
	"name_snapshot" text NOT NULL,
	"brand_snapshot" text,
	"unit_snapshot" text NOT NULL,
	"price_snapshot" numeric(10, 2) NOT NULL,
	"quantity" numeric(10, 3) NOT NULL,
	"unavailable" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "order_status_history" (
	"id" serial PRIMARY KEY NOT NULL,
	"order_id" uuid NOT NULL,
	"status" text NOT NULL,
	"changed_by" uuid,
	"changed_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"order_no" serial NOT NULL,
	"user_id" uuid NOT NULL,
	"agent_id" uuid,
	"batch_id" integer,
	"status" "order_status" DEFAULT 'PLACED' NOT NULL,
	"total" numeric(10, 2) NOT NULL,
	"address_line1" text NOT NULL,
	"address_line2" text,
	"city" text NOT NULL,
	"pincode" text NOT NULL,
	"lat" numeric(10, 7),
	"lng" numeric(10, 7),
	"delivery_phone" text NOT NULL,
	"notes" text,
	"idempotency_key" text NOT NULL,
	"placed_at" timestamp DEFAULT now() NOT NULL,
	"claimed_at" timestamp,
	"packed_at" timestamp,
	"dispatched_at" timestamp,
	"delivered_at" timestamp,
	CONSTRAINT "orders_order_no_unique" UNIQUE("order_no"),
	CONSTRAINT "unique_user_idempotency_key" UNIQUE("user_id","idempotency_key")
);

CREATE TABLE "otp_codes" (
	"id" serial PRIMARY KEY NOT NULL,
	"phone" text NOT NULL,
	"code_hash" text NOT NULL,
	"ip" text NOT NULL,
	"expires_at" timestamp NOT NULL,
	"attempts" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" "user_role" DEFAULT 'customer' NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"password_hash" text NOT NULL,
	"phone" text NOT NULL,
	"phone_verified" boolean DEFAULT false NOT NULL,
	"phone_verified_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email"),
	CONSTRAINT "users_phone_unique" UNIQUE("phone")
);
--> statement-breakpoint
ALTER TABLE "batches" ADD CONSTRAINT "batches_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "order_status_history" ADD CONSTRAINT "order_status_history_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_agent_id_users_id_fk" FOREIGN KEY ("agent_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "orders" ADD CONSTRAINT "orders_batch_id_batches_id_fk" FOREIGN KEY ("batch_id") REFERENCES "public"."batches"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "idx_order_items_order_id" ON "order_items" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_order_status_history_order_id" ON "order_status_history" USING btree ("order_id");--> statement-breakpoint
CREATE INDEX "idx_orders_user_id" ON "orders" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "idx_orders_status" ON "orders" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_otp_codes_phone" ON "otp_codes" USING btree ("phone");--> statement-breakpoint
CREATE INDEX "idx_otp_codes_ip" ON "otp_codes" USING btree ("ip");