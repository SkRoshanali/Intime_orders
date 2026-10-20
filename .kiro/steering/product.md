# Grocery PWA Product Rules

## Locked Decisions

### Stack
Latest stable versions only. No other libraries without explicit approval:
- Next.js App Router
- TypeScript strict mode
- Tailwind CSS
- Zustand + persist
- TanStack Query
- Drizzle ORM + drizzle-kit
- Neon Postgres via `drizzle-orm/neon-serverless` Pool (transactions REQUIRED, do not use neon-http)
- Zod
- jose (JWT)
- bcryptjs
- resend
- xlsx (script only)
- lucide-react
- Serwist (PWA)
- Vitest

### Catalog
- Source: Excel file `data/catalog.xlsx` with columns: id, name, brand, category, unit, price, step, image_url (optional)
- `scripts/build-catalog.ts` converts it to `public/catalog.json` and adds a `version` (content hash)
- Sample xlsx with 12 rows: milk packet, garlic, garam masala, biryani masala, vinegar, ketchup, bay leaf, etc.
- All items are always available. NO inventory table, NO stock checks, NO row locking
- `step` is the quantity increment (0.5 for garlic, 1 for milk packets). Quantities are decimals
- Server re-reads catalog file for prices. NEVER trust prices sent by the client

### Cart
- Zustand persist in localStorage key `cart-v1`, storing only {itemId: quantity}
- Prices always come from the current catalog
- Cart survives refresh, closing the tab, logout, and session expiry
- Cleared ONLY after successful order or manual removal
- Items no longer in catalog are dropped with a visible toast

### Auth
**NEW customer:**
- Enter phone → OTP by SMS → verify → server returns signed 15-minute `verification_token` (phone inside) → customer sets name, email, password → account created with phone_verified=true → session started
- OTP happens once in a lifetime

**RETURNING customer:**
- Email + password only. No OTP

**Phone & Validation:**
- Phone format: Indian 10-digit `^[6-9]\d{9}$`
- Pincode: `^\d{6}$`
- Phone and email are unique

**OTP:**
- 6 digits, stored as HMAC-SHA256 with OTP_HMAC_SECRET (never plain)
- Expires in 5 minutes
- Max 3 verify attempts
- Max 3 sends per phone per hour AND max 10 sends per IP per hour (counted from otp_codes rows)

**Session:**
- httpOnly + Secure + SameSite=Lax cookie holding a jose HS256 JWT
- 30-minute SLIDING idle timeout: re-issue cookie on authenticated requests when it is older than 5 minutes
- After expiry customer logs in again with email + password
- Cart is untouched

**SMS Gateway:**
- `src/lib/sms.ts` exports `sendSms(phone, message)` calling textbee.dev gateway
- Uses SMS_GATEWAY_URL and SMS_GATEWAY_API_KEY
- If SMS_GATEWAY_URL is unset, log OTP to server console instead (dev mode)

**Email:**
- `src/lib/email.ts` uses Resend
- If RESEND_API_KEY is unset, log instead of sending

### Data Model
Drizzle schema in `src/db/schema.ts`. Generate migration SQL only.

**users:**
- id uuid
- role enum(customer|agent|admin) default customer
- name
- email unique
- password_hash
- phone unique
- phone_verified bool
- phone_verified_at
- created_at

**otp_codes:**
- id
- phone
- code_hash
- ip
- expires_at
- attempts int default 0
- created_at

**batches:**
- id
- agent_id
- status
- created_at
- sealed_at
- dispatched_at
- completed_at
(Unused here; admin app will use it)

**orders:**
- id uuid
- order_no serial (human-friendly)
- user_id
- agent_id null
- batch_id null
- status enum(PLACED|IN_TRIP|OUT_FOR_DELIVERY|DELIVERED|CANCELLED|FAILED) default PLACED
- total numeric(10,2)
- address_line1
- address_line2
- city
- pincode
- lat
- lng
- delivery_phone
- notes
- idempotency_key (unique per user)
- placed_at
- claimed_at
- packed_at
- dispatched_at
- delivered_at

**order_items:**
- id
- order_id
- item_id
- name_snapshot
- brand_snapshot
- unit_snapshot
- price_snapshot numeric(10,2)
- quantity numeric(10,3)
- unavailable bool default false

**order_status_history:**
- id
- order_id
- status
- changed_by
- changed_at
- notes

**Math Rules:**
- Quantity step validation and totals MUST use integer math (quantity x1000, price in paise)
- Never use float arithmetic

### Order Placement
POST /api/orders (single DB transaction):
- Requires valid session
- Requires header `Idempotency-Key`; repeat key returns existing order
- Zod-validate:
  - items [{id, quantity}] non-empty
  - Each id in server catalog
  - Quantity > 0 and exact multiple of item's step
  - Sanity cap MAX_QTY_PER_LINE=100 (constant in one file)
  - Address line1, city, pincode required
  - lat/lng optional
- Compute total on server
- Insert order (PLACED), order_items snapshots, and one history row
- Return {orderId, orderNo}
- After response, best-effort (never fail order):
  - Resend confirmation email to customer
  - "New order" email to ADMIN_NOTIFY_EMAILS (comma-separated)

### Customer-Facing Status Labels
One shared function `statusLabel()`:
- PLACED → "Order is placed"
- IN_TRIP and OUT_FOR_DELIVERY → "Out for delivery"
- DELIVERED → "Delivered"
- CANCELLED → "Cancelled"
- FAILED → "Delivery failed"

### Routes
**API:**
- POST /api/auth/otp/send
- POST /api/auth/otp/verify
- POST /api/auth/register
- POST /api/auth/login
- POST /api/auth/logout
- GET /api/auth/me
- POST /api/orders
- GET /api/orders (mine)
- GET /api/orders/[id] (owner only)

**Pages:**
- / (catalog)
- /categories
- /orders
- /orders/[id]
- /account
- /login
- /register
- /checkout
- /order-confirmed/[id]

### UI Rules
- Mobile-first, max-width 480px centered
- Bottom nav (Home, Categories, Orders, Account)
- Sticky search + category chips
- Product cards with Add button and -/+ stepper (min 44px tap targets)
- Floating cart bar above bottom nav
- Cart opens as bottom sheet, not a page
- Checkout: one scrollable page with sticky "Place Order" button
- Address: manual fields plus "Use current location" button (browser geolocation, no maps API)
- Prefill address from customer's latest order
- Inputs: 16px minimum font, type="tel", inputMode="numeric", autoComplete attributes
- Safe-area padding for iPhone home bar
- Unauthenticated customer tapping Checkout goes to login/register and returns to checkout with cart intact
- Order detail polls every 30s only while status is active and tab is visible; also refetch on window focus

## Out of Scope
- Payments
- Forgot-password
- Delivery slots
- Inventory or stock
- Saved-address table
- Push notifications
- Maps
- Admin or agent screens
- Dark mode
- i18n
- Analytics
- Docker
- CI

## Credit Rules
- Read a file before editing it; never rewrite files that are already correct
- Never run `drizzle-kit migrate` or `push`, and never touch any database. Generate migration SQL only
- Never create real secrets. Provide `.env.example` with variable NAMES only:
  - DATABASE_URL
  - SESSION_SECRET
  - OTP_HMAC_SECRET
  - SMS_GATEWAY_URL
  - SMS_GATEWAY_API_KEY
  - RESEND_API_KEY
  - EMAIL_FROM
  - ADMIN_NOTIFY_EMAILS
  - NEXT_PUBLIC_APP_URL
- Do not start dev server or open browser unless asked
- Verify with `npx tsc --noEmit`, `npm run lint`, and `npx vitest run` only
- Vitest covers only pure functions:
  - Step validation
  - Paise total calculation
  - OTP hash/verify
  - statusLabel
- Stop and ask before:
  - Adding any dependency not listed
  - Deleting files
  - Changing the locked schema
  - If same error persists after 2 fix attempts
- After every task output: "✅ [what was done] | changed files | verification result". No long explanations
