# Tasks: Customer Grocery Ordering PWA

## Phase 1: Scaffold and Config

### Task 1.1: Initialize Next.js Project
- Create Next.js 15 project with TypeScript and App Router
- Configure TypeScript strict mode
- Install and configure Tailwind CSS
- Set up project structure (src/app, src/components, src/lib, etc.)
- Create .env.example with all required variable names
- Configure tsconfig.json, next.config.js, tailwind.config.ts
- Add package.json scripts: dev, build, start, lint, test

**Dependencies:**
- next, react, react-dom
- typescript, @types/node, @types/react, @types/react-dom
- tailwindcss, postcss, autoprefixer
- eslint, eslint-config-next

### Task 1.2: Install Core Dependencies
- Install Zustand with persist middleware
- Install TanStack Query v5
- Install Drizzle ORM, drizzle-kit, and Neon serverless driver
- Install Zod for validation
- Install jose for JWT
- Install bcryptjs with types
- Install Resend for email
- Install xlsx for catalog script
- Install lucide-react for icons
- Install Vitest and testing utilities

**Dependencies:**
- zustand
- @tanstack/react-query
- drizzle-orm, drizzle-kit, @neondatabase/serverless
- zod
- jose
- bcryptjs, @types/bcryptjs
- resend
- xlsx
- lucide-react
- vitest, @vitest/ui, jsdom, @testing-library/react

### Task 1.3: Configure Build Tools
- Create drizzle.config.ts for migration generation
- Create vitest.config.ts
- Verify project builds with `npm run build`
- Verify TypeScript checks pass with `npx tsc --noEmit`
- Verify linting passes with `npm run lint`

**Files:**
- drizzle.config.ts
- vitest.config.ts

## Phase 2: Catalog Script + Catalog UI + Cart

### Task 2.1: Create Sample Catalog Excel
- Create data/catalog.xlsx with 12 sample products
- Columns: id, name, brand, category, unit, price, step, image_url
- Sample products: milk packet, garlic, garam masala, biryani masala, vinegar, ketchup, bay leaf, cumin seeds, turmeric powder, rice bag, cooking oil, onions

**Files:**
- data/catalog.xlsx

### Task 2.2: Build Catalog Script
- Create scripts/build-catalog.ts
- Read data/catalog.xlsx using xlsx library
- Convert to JSON array
- Calculate content-based version hash (SHA-256 of stringified items)
- Add version field to JSON
- Write to public/catalog.json
- Add "build:catalog" script to package.json

**Files:**
- scripts/build-catalog.ts
- package.json (updated)

**Verification:**
- Run `npm run build:catalog`
- Verify public/catalog.json exists with version field

### Task 2.3: Catalog Types and Client Hook
- Create src/types/catalog.ts with CatalogItem and Catalog types
- Create src/hooks/useCatalog.ts using TanStack Query
- Fetch /catalog.json client-side
- Cache with staleTime based on version

**Files:**
- src/types/catalog.ts
- src/hooks/useCatalog.ts

### Task 2.4: Server-Side Catalog Loader
- Create src/lib/catalog.ts
- Export loadCatalog() function
- Reads public/catalog.json synchronously
- Returns parsed catalog
- Used by API routes for price validation

**Files:**
- src/lib/catalog.ts

### Task 2.5: Cart Store with Zustand
- Create src/store/cart.ts
- Zustand store with persist middleware
- Storage key: "cart-v1"
- State: {[itemId: string]: quantity}
- Actions: addItem, updateQuantity, removeItem, clearCart
- Sync on mount: remove items not in catalog, show toast

**Files:**
- src/store/cart.ts

### Task 2.6: Root Layout with Providers
- Create src/app/layout.tsx
- Add TanStack Query provider
- Add Tailwind base styles
- Configure metadata for PWA
- Add safe-area CSS variables

**Files:**
- src/app/layout.tsx
- src/app/globals.css

### Task 2.7: Bottom Navigation Component
- Create src/components/layout/BottomNav.tsx
- Fixed bottom position with safe-area-inset-bottom
- Four nav items: Home (/), Categories (/categories), Orders (/orders), Account (/account)
- Active state styling
- Lucide icons: Home, Grid3x3, ShoppingBag, User
- Min 44px tap targets

**Files:**
- src/components/layout/BottomNav.tsx

### Task 2.8: Catalog Page Components
- Create src/components/catalog/ProductCard.tsx
  - Display image (or placeholder), name, brand, unit, price
  - "Add" button if not in cart
  - -/+ stepper with quantity if in cart
  - Min 44px tap targets
  - Step-aware increment/decrement
- Create src/components/catalog/SearchBar.tsx
  - Sticky input with clear button
  - 16px font size
- Create src/components/catalog/CategoryChips.tsx
  - Horizontal scroll chips
  - "All" + unique categories from catalog
  - Active state

**Files:**
- src/components/catalog/ProductCard.tsx
- src/components/catalog/SearchBar.tsx
- src/components/catalog/CategoryChips.tsx

### Task 2.9: Home Page (Catalog Grid)
- Create src/app/page.tsx
- Use useCatalog() hook
- Render SearchBar, CategoryChips
- Filter by search term and category
- Grid of ProductCard components
- Max width 480px centered
- Include BottomNav

**Files:**
- src/app/page.tsx

### Task 2.10: Cart Bar and Cart Sheet
- Create src/components/layout/CartBar.tsx
  - Floating above BottomNav
  - Show item count and total
  - Tap to open sheet
  - Hidden if empty
- Create src/components/cart/CartSheet.tsx
  - Bottom sheet modal overlay
  - List of cart items with +/- controls
  - Calculate total from current catalog prices
  - "Proceed to Checkout" button
  - Close button (X icon)
- Create src/components/cart/CartItem.tsx
  - Name, unit, quantity, price, subtotal
  - Remove button

**Files:**
- src/components/layout/CartBar.tsx
- src/components/cart/CartSheet.tsx
- src/components/cart/CartItem.tsx

### Task 2.11: Categories Page
- Create src/app/categories/page.tsx
- List all unique categories from catalog
- Each category shows item count
- Navigate to home with category pre-selected

**Files:**
- src/app/categories/page.tsx

**Phase 2 Verification:**
- `npx tsc --noEmit` passes
- `npm run lint` passes
- Catalog displays on home page
- Search and category filter work
- Add to cart, stepper controls work
- Cart bar shows count and total
- Cart sheet opens and closes
- Items persist in localStorage after refresh

## Phase 3: DB Schema + Migration Files

### Task 3.1: Database Schema Definition
- Create src/db/schema.ts
- Define Drizzle schemas for all tables:
  - users (uuid primary key, role enum, email/phone unique, timestamps)
  - otp_codes (serial primary key, phone, code_hash, ip, expires_at, attempts, created_at)
  - batches (serial primary key, agent_id, status, timestamps)
  - orders (uuid primary key, order_no serial unique, user_id, status enum, total numeric, address fields, idempotency_key with unique constraint per user, timestamps)
  - order_items (serial primary key, order_id, item snapshots, quantity numeric, unavailable bool)
  - order_status_history (serial primary key, order_id, status, changed_by, changed_at, notes)
- Export all schemas and types

**Files:**
- src/db/schema.ts

### Task 3.2: Generate Migration SQL
- Run `npx drizzle-kit generate`
- Review generated migration SQL in migrations/ directory
- DO NOT run the migration (user will run manually)
- Verify schema includes all constraints, indexes, and defaults

**Files:**
- migrations/0000_*.sql (generated)

### Task 3.3: Database Connection
- Create src/lib/db.ts
- Export Neon Pool connection using DATABASE_URL
- Configure for transactions (required)
- Export drizzle instance

**Files:**
- src/lib/db.ts

**Phase 3 Verification:**
- `npx tsc --noEmit` passes
- `npm run lint` passes
- Migration SQL file exists in migrations/
- Schema types are exported correctly

## Phase 4: Auth (OTP, Register, Login, Session)

### Task 4.1: Pure Auth Utility Functions
- Create src/lib/otp.ts
  - generateOTP(): 6-digit string
  - hashOTP(otp, secret): HMAC-SHA256 hash
  - verifyOTP(otp, hash, secret): boolean
- Create src/lib/validation.ts
  - isValidQuantity(quantity, step): boolean using integer math
  - Phone validation regex: `^[6-9]\d{9}$`
  - Pincode validation regex: `^\d{6}$`
- Create src/lib/money.ts
  - toPaise(rupees): number
  - calculateTotal(items): number in paise (integer math)
  - toRupees(paise): number
- Create src/lib/status.ts
  - statusLabel(status): string
  - isActiveStatus(status): boolean

**Files:**
- src/lib/otp.ts
- src/lib/validation.ts
- src/lib/money.ts
- src/lib/status.ts

### Task 4.2: Auth Utility Functions Tests
- Create src/lib/otp.test.ts
  - Test OTP generation (6 digits)
  - Test hash consistency
  - Test verification (correct and incorrect OTP)
- Create src/lib/validation.test.ts
  - Test isValidQuantity with various steps (0.5, 1, 0.25)
  - Test edge cases (zero, negative, non-multiples)
- Create src/lib/money.test.ts
  - Test toPaise conversion
  - Test calculateTotal with multiple items
  - Test toRupees conversion
- Create src/lib/status.test.ts
  - Test statusLabel for all statuses
  - Test isActiveStatus for each status

**Files:**
- src/lib/otp.test.ts
- src/lib/validation.test.ts
- src/lib/money.test.ts
- src/lib/status.test.ts

**Phase 4.2 Verification:**
- `npx vitest run` passes all tests

### Task 4.3: Session Management
- Create src/lib/auth.ts
- createSession(userId, role): Set httpOnly cookie with jose JWT (HS256, 30-min expiry)
- verifySession(request): Extract and verify JWT, return user payload or null
- shouldRefreshSession(iat): Check if token is older than 5 minutes
- refreshSession(userId, role): Re-issue cookie with new expiry
- clearSession(): Clear httpOnly cookie

**Files:**
- src/lib/auth.ts

### Task 4.4: SMS and Email Utilities
- Create src/lib/sms.ts
  - sendSms(phone, message): Call textbee.dev gateway or console.log if SMS_GATEWAY_URL unset
- Create src/lib/email.ts
  - sendEmail(to, subject, html): Use Resend or console.log if RESEND_API_KEY unset

**Files:**
- src/lib/sms.ts
- src/lib/email.ts

### Task 4.5: OTP Send Endpoint
- Create src/app/api/auth/otp/send/route.ts
- POST handler
- Validate phone format (Zod)
- Check rate limits: max 3 per phone/hour, max 10 per IP/hour (query otp_codes table)
- Generate 6-digit OTP
- Hash with OTP_HMAC_SECRET
- Insert otp_codes row (expires_at = now + 5 min)
- Send SMS with OTP
- Return {message: "OTP sent", expiresIn: 300}

**Files:**
- src/app/api/auth/otp/send/route.ts

### Task 4.6: OTP Verify Endpoint
- Create src/app/api/auth/otp/verify/route.ts
- POST handler
- Validate phone and otp (Zod)
- Find latest otp_codes row for phone where expires_at > now
- Check attempts < 3
- Verify OTP hash
- If incorrect: increment attempts, return 400
- If correct: sign 15-minute verification_token (jose JWT with phone claim)
- Return {verificationToken}

**Files:**
- src/app/api/auth/otp/verify/route.ts

### Task 4.7: Register Endpoint
- Create src/app/api/auth/register/route.ts
- POST handler
- Extract verification_token from Authorization header
- Verify token, extract phone claim
- Validate name, email, password (Zod)
- Check email uniqueness
- Hash password (bcrypt, 10 rounds)
- Insert user (phone_verified=true, phone_verified_at=now)
- Create session cookie
- Return {user: {id, name, email, phone, role}}

**Files:**
- src/app/api/auth/register/route.ts

### Task 4.8: Login Endpoint
- Create src/app/api/auth/login/route.ts
- POST handler
- Validate email, password (Zod)
- Find user by email
- Compare password hash (bcrypt)
- Create session cookie
- Return {user: {id, name, email, phone, role}}

**Files:**
- src/app/api/auth/login/route.ts

### Task 4.9: Logout and Me Endpoints
- Create src/app/api/auth/logout/route.ts
  - POST handler
  - Clear session cookie
  - Return {message: "Logged out"}
- Create src/app/api/auth/me/route.ts
  - GET handler
  - Verify session
  - Return {user} or 401

**Files:**
- src/app/api/auth/logout/route.ts
- src/app/api/auth/me/route.ts

### Task 4.10: Auth Hook and Types
- Create src/types/auth.ts
  - User type
  - Session type
- Create src/hooks/useAuth.ts
  - TanStack Query hook for GET /api/auth/me
  - Returns user, isLoading, isAuthenticated
  - Retry: false

**Files:**
- src/types/auth.ts
- src/hooks/useAuth.ts

### Task 4.11: Login Page
- Create src/app/login/page.tsx
- Email and password inputs
- Submit to POST /api/auth/login
- On success: redirect to checkout if redirected from there, else to home
- Link to "New user? Register"
- Show loading and error states

**Files:**
- src/app/login/page.tsx

### Task 4.12: Register Flow Pages
- Create src/app/register/page.tsx
  - Step 1: Phone input, send OTP button
    - Calls POST /api/auth/otp/send
  - Step 2: OTP input (6 digits), verify button
    - Calls POST /api/auth/otp/verify
    - Store verificationToken in state
  - Step 3: Name, email, password inputs, submit button
    - Calls POST /api/auth/register with Authorization header
    - On success: redirect to checkout if redirected from there, else to home
  - Show loading and error states
  - Link to "Already registered? Login"

**Files:**
- src/app/register/page.tsx

**Phase 4 Verification:**
- `npx tsc --noEmit` passes
- `npm run lint` passes
- `npx vitest run` passes (pure function tests)
- Can register new user with phone OTP
- Can login with email/password
- Session cookie is set
- GET /api/auth/me returns user
- Logout clears session

## Phase 5: Checkout + Order API + Confirmation

### Task 5.1: Order Types
- Create src/types/order.ts
- OrderStatus enum
- Order type
- OrderItem type
- CreateOrderRequest type
- CreateOrderResponse type

**Files:**
- src/types/order.ts

### Task 5.2: Checkout Page
- Create src/app/checkout/page.tsx
- Require authentication (redirect to /login with return URL if not logged in)
- Require non-empty cart
- Create src/components/checkout/AddressForm.tsx
  - Inputs: line1, line2, city, pincode, delivery phone, notes
  - "Use current location" button (navigator.geolocation for lat/lng)
  - Prefill from user's latest order (fetch from API or pass as prop)
  - All inputs: 16px font, type="tel" for phone/pincode, inputMode="numeric", autoComplete
- Create src/components/checkout/OrderSummary.tsx
  - Display cart items with name, unit, quantity, price, subtotal
  - Calculate and display total
- Sticky "Place Order" button
- On submit:
  - Generate Idempotency-Key (UUID v4)
  - Validate quantities against catalog steps
  - POST /api/orders with items, address, lat/lng
  - On success: clear cart, redirect to /order-confirmed/[orderId]
  - Show loading and error states

**Files:**
- src/app/checkout/page.tsx
- src/components/checkout/AddressForm.tsx
- src/components/checkout/OrderSummary.tsx

### Task 5.3: Create Order Endpoint
- Create src/app/api/orders/route.ts
- POST handler (create order):
  - Verify session (extract user_id)
  - Extract Idempotency-Key header
  - Check if order with this user_id + idempotency_key exists; if yes, return existing order
  - Validate request body with Zod:
    - items: [{id, quantity}] non-empty
    - quantity > 0 and <= MAX_QTY_PER_LINE (100)
    - address fields (line1, city, pincode required)
    - lat, lng, delivery_phone, notes optional
  - Load server catalog
  - Validate each item.id exists in catalog
  - Validate each quantity is exact multiple of item's step (use isValidQuantity)
  - Calculate total in paise using calculateTotal
  - Begin DB transaction:
    - Insert orders row (id, order_no auto, user_id, status=PLACED, total in rupees, address, idempotency_key, placed_at)
    - Insert order_items rows (order_id, item_id, snapshots from catalog, quantity)
    - Insert order_status_history row (order_id, status=PLACED, changed_by=user_id, changed_at=now)
    - Commit transaction
  - After response (async, best-effort):
    - Send confirmation email to user
    - Send notification email to ADMIN_NOTIFY_EMAILS
  - Return {orderId, orderNo}
- GET handler (list my orders):
  - Verify session
  - Query orders where user_id = session.userId
  - Order by placed_at DESC
  - Limit/offset pagination (default limit=20)
  - Return {orders, total}

**Files:**
- src/app/api/orders/route.ts
- src/lib/constants.ts (export MAX_QTY_PER_LINE = 100)

### Task 5.4: Get Single Order Endpoint
- Create src/app/api/orders/[id]/route.ts
- GET handler:
  - Verify session
  - Extract order id from params
  - Query orders with order_items (join)
  - Check order.user_id === session.userId (403 if not)
  - Return order with items array

**Files:**
- src/app/api/orders/[id]/route.ts

### Task 5.5: Order Confirmation Page
- Create src/app/order-confirmed/[id]/page.tsx
- Fetch order by id (use TanStack Query)
- Display order number, status badge, total
- Display delivery address
- Link to view order details (/orders/[id])
- Link to continue shopping (/)

**Files:**
- src/app/order-confirmed/[id]/page.tsx

**Phase 5 Verification:**
- `npx tsc --noEmit` passes
- `npm run lint` passes
- Can access checkout page when authenticated
- Checkout redirects to login if not authenticated
- Cart returns to checkout after login
- Can place order with address
- Order confirmation page displays
- Order appears in database (manually verify)
- Confirmation email sent (check console or inbox)

## Phase 6: My Orders, Order Detail, Account

### Task 6.1: Orders Hook
- Create src/hooks/useOrders.ts
- TanStack Query hook for GET /api/orders
- Returns orders list, isLoading, error
- Pagination support (limit, offset)

**Files:**
- src/hooks/useOrders.ts

### Task 6.2: Order Polling Hook
- Create src/hooks/useOrderPolling.ts
- TanStack Query hook for GET /api/orders/[id]
- Accepts orderId
- If status is active (use isActiveStatus): poll every 30 seconds
- Use Page Visibility API: pause polling when tab hidden
- Refetch on window focus
- Stop polling when status becomes terminal

**Files:**
- src/hooks/useOrderPolling.ts

### Task 6.3: Order Components
- Create src/components/orders/OrderCard.tsx
  - Display order number, placed date (relative), status badge, total
  - Tap to navigate to /orders/[id]
- Create src/components/orders/StatusBadge.tsx
  - Use statusLabel() for text
  - Color-coded background:
    - PLACED: blue
    - IN_TRIP, OUT_FOR_DELIVERY: orange
    - DELIVERED: green
    - CANCELLED, FAILED: red

**Files:**
- src/components/orders/OrderCard.tsx
- src/components/orders/StatusBadge.tsx

### Task 6.4: My Orders Page
- Create src/app/orders/page.tsx
- Require authentication (redirect to /login if not)
- Use useOrders() hook
- Display list of OrderCard components
- Show empty state if no orders
- Include BottomNav

**Files:**
- src/app/orders/page.tsx

### Task 6.5: Order Detail Page
- Create src/app/orders/[id]/page.tsx
- Require authentication
- Use useOrderPolling(orderId) hook
- Display order number, status badge, placed date
- Display delivery address
- Display itemized list (name, brand, unit, quantity, price)
- Display total
- Include BottomNav

**Files:**
- src/app/orders/[id]/page.tsx

### Task 6.6: Account Page
- Create src/app/account/page.tsx
- Require authentication
- Use useAuth() hook
- Display user name, email, phone
- Show "Phone verified" badge
- Logout button (calls POST /api/auth/logout, redirects to /)
- Include BottomNav

**Files:**
- src/app/account/page.tsx

**Phase 6 Verification:**
- `npx tsc --noEmit` passes
- `npm run lint` passes
- My orders page shows list of orders
- Order detail page shows full order info
- Order detail polls for status updates (manually change status in DB to test)
- Account page displays user info
- Logout button clears session and redirects

## Phase 7: Emails + PWA

### Task 7.1: Email Templates
- Create src/lib/email-templates.ts
- orderConfirmationEmail(order, items, user): HTML email
  - Subject: "Order Confirmed #[orderNo]"
  - Body: greeting, order number, items table, total, delivery address, footer
- newOrderNotificationEmail(order, items, user): HTML email for admin
  - Subject: "New Order #[orderNo] from [userName]"
  - Body: customer info, order details, items table, delivery address

**Files:**
- src/lib/email-templates.ts

### Task 7.2: Update Order Endpoint to Send Emails
- Modify src/app/api/orders/route.ts POST handler
- After order creation, in async block (don't await, catch errors):
  - Fetch order with items
  - Send confirmation email to user.email
  - Parse ADMIN_NOTIFY_EMAILS (comma-separated), send notification to each

**Files:**
- src/app/api/orders/route.ts (updated)

### Task 7.3: PWA Manifest and Icons
- Create public/manifest.json
  - name: "Local Grocery"
  - short_name: "Grocery"
  - start_url: "/"
  - display: "standalone"
  - background_color: "#ffffff"
  - theme_color: "#10b981"
  - icons: 192x192, 512x512
- Create placeholder icons: public/icons/icon-192.png, public/icons/icon-512.png
- Link manifest in src/app/layout.tsx

**Files:**
- public/manifest.json
- public/icons/icon-192.png
- public/icons/icon-512.png
- src/app/layout.tsx (updated)

### Task 7.4: Service Worker with Serwist
- Install @serwist/next, serwist
- Create src/app/sw.ts
  - Precache: catalog.json, static assets
  - Runtime cache: catalog.json with cache-first, API routes with network-first
- Update next.config.js to use Serwist plugin
- Add service worker registration in src/app/layout.tsx

**Dependencies:**
- @serwist/next, serwist

**Files:**
- src/app/sw.ts
- next.config.js (updated)
- src/app/layout.tsx (updated)

**Phase 7 Verification:**
- `npx tsc --noEmit` passes
- `npm run lint` passes
- Order confirmation emails are sent (check console or inbox)
- Admin notification emails are sent
- PWA manifest is accessible at /manifest.json
- App is installable (check browser prompt or DevTools)
- Service worker registers and caches catalog

## Phase 8: Final Verification + README

### Task 8.1: Add Missing Dependencies Check
- Verify all dependencies in package.json match the locked list
- Ensure no extra dependencies were added

**Verification:**
- Review package.json dependencies

### Task 8.2: End-to-End Manual Test
- Run `npm run build:catalog` to generate catalog.json
- Run `npm run build` to verify production build
- Manually test full flow:
  1. Browse catalog, search, filter
  2. Add items to cart, verify persistence
  3. Register with phone OTP
  4. Place order
  5. View order in list and detail
  6. Logout and login again
  7. Install as PWA

**Verification:**
- Full flow works without errors

### Task 8.3: Create README
- Create README.md
- Sections:
  - Project overview
  - Prerequisites (Node.js version, database)
  - Environment variables (copy from .env.example)
  - Setup steps:
    1. Install dependencies: `npm install`
    2. Set up environment variables
    3. Generate catalog: `npm run build:catalog`
    4. Generate migration: `npx drizzle-kit generate`
    5. Run migration manually on database
    6. Start dev server: `npm run dev`
  - Scripts:
    - `npm run dev`: Start development server
    - `npm run build`: Production build
    - `npm run start`: Start production server
    - `npm run lint`: Run ESLint
    - `npm run test`: Run Vitest tests
    - `npm run build:catalog`: Generate catalog.json from Excel
  - Project structure overview
  - Testing approach
  - Notes on OTP and email in dev mode (console logging)
  - Database migration instructions

**Files:**
- README.md

### Task 8.4: Final Verification
- Run `npx tsc --noEmit` (must pass)
- Run `npm run lint` (must pass)
- Run `npx vitest run` (must pass)
- Run `npm run build` (must succeed)
- Verify .env.example has all variables
- Verify no real secrets in repo
- Verify migration SQL exists in migrations/

**Output:**
- Confirmation that all checks pass

**Phase 8 Verification:**
- All TypeScript checks pass
- All linting passes
- All tests pass
- Production build succeeds
- README is complete and accurate
- Ready for deployment
