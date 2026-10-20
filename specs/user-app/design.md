# Design: Customer Grocery Ordering PWA

## Architecture Overview

### Technology Stack
- **Framework**: Next.js 15 App Router with TypeScript strict mode
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persist middleware (cart only)
- **Server State**: TanStack Query v5 (React Query)
- **Database**: Neon Postgres (serverless driver with Pool for transactions)
- **ORM**: Drizzle ORM with drizzle-kit for migrations
- **Validation**: Zod schemas
- **Auth**: jose (HS256 JWT in httpOnly cookies)
- **Password Hashing**: bcryptjs
- **Email**: Resend
- **SMS**: textbee.dev gateway
- **Icons**: lucide-react
- **PWA**: Serwist (service worker toolkit)
- **Testing**: Vitest

### Project Structure
```
c:/Intime/
├── data/
│   └── catalog.xlsx                    # Source catalog (12 sample products)
├── public/
│   ├── catalog.json                    # Generated catalog with version hash
│   ├── manifest.json                   # PWA manifest
│   └── icons/                          # PWA icons
├── scripts/
│   └── build-catalog.ts                # Excel → JSON converter
├── src/
│   ├── app/
│   │   ├── layout.tsx                  # Root layout with TanStack Query provider
│   │   ├── page.tsx                    # Home: catalog grid
│   │   ├── categories/page.tsx         # Category view
│   │   ├── login/page.tsx              # Login form
│   │   ├── register/page.tsx           # Registration (after OTP verify)
│   │   ├── checkout/page.tsx           # Checkout form
│   │   ├── order-confirmed/[id]/page.tsx
│   │   ├── orders/
│   │   │   ├── page.tsx                # My orders list
│   │   │   └── [id]/page.tsx           # Order detail
│   │   ├── account/page.tsx            # Account info
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── otp/
│   │       │   │   ├── send/route.ts
│   │       │   │   └── verify/route.ts
│   │       │   ├── register/route.ts
│   │       │   ├── login/route.ts
│   │       │   ├── logout/route.ts
│   │       │   └── me/route.ts
│   │       └── orders/
│   │           ├── route.ts            # POST create, GET list mine
│   │           └── [id]/route.ts       # GET single order
│   ├── components/
│   │   ├── layout/
│   │   │   ├── BottomNav.tsx           # Sticky bottom navigation
│   │   │   └── CartBar.tsx             # Floating cart summary bar
│   │   ├── catalog/
│   │   │   ├── ProductCard.tsx         # Product with add/stepper
│   │   │   ├── SearchBar.tsx           # Search input
│   │   │   └── CategoryChips.tsx       # Filter chips
│   │   ├── cart/
│   │   │   ├── CartSheet.tsx           # Bottom sheet overlay
│   │   │   └── CartItem.tsx            # Cart line item
│   │   ├── checkout/
│   │   │   ├── AddressForm.tsx         # Delivery address fields
│   │   │   └── OrderSummary.tsx        # Items + total
│   │   └── orders/
│   │       ├── OrderCard.tsx           # Order list item
│   │       └── StatusBadge.tsx         # Visual status indicator
│   ├── lib/
│   │   ├── db.ts                       # Neon Pool connection
│   │   ├── auth.ts                     # Session creation, verification, sliding timeout
│   │   ├── sms.ts                      # sendSms(phone, message)
│   │   ├── email.ts                    # sendEmail via Resend
│   │   ├── otp.ts                      # OTP generation, HMAC hashing, verification
│   │   ├── catalog.ts                  # loadCatalog() server-side
│   │   ├── validation.ts               # Quantity step validation (integer math)
│   │   ├── money.ts                    # Paise conversion and calculations
│   │   └── status.ts                   # statusLabel(status) function
│   ├── db/
│   │   └── schema.ts                   # Drizzle schema definitions
│   ├── store/
│   │   └── cart.ts                     # Zustand cart store with persist
│   ├── hooks/
│   │   ├── useAuth.ts                  # TanStack Query for /api/auth/me
│   │   ├── useCatalog.ts               # Load catalog.json client-side
│   │   ├── useOrders.ts                # TanStack Query for orders
│   │   └── useOrderPolling.ts          # 30s polling for active order status
│   └── types/
│       ├── catalog.ts                  # Catalog item type
│       ├── order.ts                    # Order and OrderItem types
│       └── auth.ts                     # User, Session types
├── migrations/
│   └── 0000_initial.sql                # Generated migration (not run by code)
├── .env.example                        # Env var names only
├── drizzle.config.ts                   # Drizzle Kit config
├── next.config.js                      # Next.js config (Serwist plugin)
├── tailwind.config.ts                  # Tailwind config
├── tsconfig.json                       # TypeScript strict config
├── vitest.config.ts                    # Vitest config
└── package.json
```

## Data Flow

### 1. Catalog Flow
```
Excel (catalog.xlsx)
  ↓ [scripts/build-catalog.ts]
JSON (public/catalog.json) + version hash
  ↓ [client fetch or server read]
React components / API routes
```

**Client-side**: `useCatalog()` hook fetches `/catalog.json`, caches with TanStack Query, displays in ProductCard grid.

**Server-side**: `loadCatalog()` reads `public/catalog.json`, validates prices before order insertion.

### 2. Cart Flow
```
User adds item
  ↓
Zustand store (cart-v1 in localStorage)
  ↓ {itemId: quantity}
Merge with catalog on render
  ↓
Display prices, totals
```

**Storage**: `{itemId: quantity}` map only. Prices always from current catalog.

**Persistence**: Survives logout, session expiry, page refresh. Cleared after successful order or manual clear.

**Sync**: On mount, remove items no longer in catalog, show toast.

### 3. Authentication Flow

#### New Customer Registration
```
1. Enter phone → POST /api/auth/otp/send
   ├─ Validate phone format
   ├─ Check rate limits (3/hour per phone, 10/hour per IP)
   ├─ Generate 6-digit OTP
   ├─ Store HMAC-SHA256(OTP) in otp_codes (expires 5 min)
   └─ Send SMS (or log to console if dev)

2. Enter OTP → POST /api/auth/otp/verify
   ├─ Validate OTP (max 3 attempts)
   ├─ Check expiry
   ├─ Hash input and compare
   ├─ Sign 15-minute verification_token (jose JWT with phone claim)
   └─ Return token to client

3. Enter name, email, password → POST /api/auth/register
   ├─ Verify verification_token (extract phone)
   ├─ Validate email unique
   ├─ Hash password (bcrypt)
   ├─ Insert user (phone_verified=true)
   ├─ Create session (30-min JWT in httpOnly cookie)
   └─ Return user object
```

#### Returning Customer Login
```
Enter email, password → POST /api/auth/login
  ├─ Find user by email
  ├─ Compare password hash
  ├─ Create session (30-min JWT in httpOnly cookie)
  └─ Return user object
```

#### Session Management
```
Every authenticated request:
  1. Extract JWT from httpOnly cookie
  2. Verify signature (jose HS256)
  3. Check expiry (30 min idle)
  4. If token age > 5 min: issue new cookie (sliding window)
  5. Proceed with request
```

### 4. Order Placement Flow
```
User clicks "Place Order" → POST /api/orders
  ├─ Header: Idempotency-Key (UUID v4)
  ├─ Body: {items: [{id, quantity}], address, delivery_phone, notes, lat, lng}
  ↓
API Route:
  1. Verify session (extract user_id)
  2. Check idempotency_key (if exists, return existing order)
  3. Validate with Zod:
     - items non-empty
     - quantity > 0, <= MAX_QTY_PER_LINE (100)
     - address fields required
  4. Load server catalog
  5. Validate each item ID exists
  6. Validate quantities are exact multiples of step (integer math)
  7. Calculate total in paise (integer math)
  8. Begin DB transaction:
     a. Insert orders row (status=PLACED, total, address, etc.)
     b. Insert order_items rows (with price/name snapshots)
     c. Insert order_status_history row
     d. Commit
  9. Return {orderId, orderNo}
  10. After response (async, best-effort):
      - Send confirmation email to customer
      - Send notification email to ADMIN_NOTIFY_EMAILS
```

### 5. Order Polling Flow
```
Order detail page:
  1. Fetch order on mount
  2. If status is active (PLACED, IN_TRIP, OUT_FOR_DELIVERY):
     - Start 30s interval polling
     - Poll only if tab is visible (Page Visibility API)
  3. On window focus: refetch immediately
  4. If status becomes terminal (DELIVERED, CANCELLED, FAILED):
     - Stop polling
```

## Component Design

### Layout Components

#### BottomNav
- Fixed bottom, z-index above content
- 4 buttons: Home, Categories, Orders, Account
- Active state styling
- Safe-area-inset-bottom for iOS

#### CartBar
- Floating above BottomNav
- Shows item count + total
- Tap to open CartSheet
- Hidden if cart is empty

#### CartSheet
- Modal overlay with bottom sheet animation
- Full cart item list with +/- controls
- "Proceed to Checkout" button
- Close button

### Catalog Components

#### SearchBar
- Sticky top position
- Real-time filter by name/brand
- Clear button
- 16px font size

#### CategoryChips
- Horizontal scroll (no scrollbar)
- Pill buttons for each category
- "All" chip to clear filter
- Active state styling

#### ProductCard
- Image (or placeholder)
- Name, brand, unit, price
- If not in cart: "Add" button (44px min height)
- If in cart: -/+ stepper with quantity label (44px buttons)
- Step-aware increment/decrement

### Checkout Components

#### AddressForm
- Text inputs: line1, line2, city, pincode
- Delivery phone (prefilled)
- Optional notes textarea
- "Use current location" button (navigator.geolocation)
- Prefill from last order if available
- All inputs: type="tel" for numeric, inputMode="numeric", autoComplete

#### OrderSummary
- Item list: name, unit, qty, price, subtotal
- Total in bold
- Read-only display

### Order Components

#### OrderCard (list)
- Order number (e.g., "#1234")
- Placed date (relative: "2 hours ago")
- Status badge
- Total amount
- Tap to navigate to detail

#### StatusBadge
- Color-coded by status:
  - PLACED: blue
  - IN_TRIP, OUT_FOR_DELIVERY: orange
  - DELIVERED: green
  - CANCELLED, FAILED: red
- Text from `statusLabel(status)`

## Database Schema

### users
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role TEXT NOT NULL DEFAULT 'customer' CHECK (role IN ('customer', 'agent', 'admin')),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  phone TEXT UNIQUE NOT NULL,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### otp_codes
```sql
CREATE TABLE otp_codes (
  id SERIAL PRIMARY KEY,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  ip TEXT NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX idx_otp_codes_phone ON otp_codes(phone);
CREATE INDEX idx_otp_codes_ip ON otp_codes(ip);
```

### batches
```sql
CREATE TABLE batches (
  id SERIAL PRIMARY KEY,
  agent_id UUID REFERENCES users(id),
  status TEXT NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  sealed_at TIMESTAMP,
  dispatched_at TIMESTAMP,
  completed_at TIMESTAMP
);
```

### orders
```sql
CREATE TABLE orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_no SERIAL UNIQUE,
  user_id UUID NOT NULL REFERENCES users(id),
  agent_id UUID REFERENCES users(id),
  batch_id INT REFERENCES batches(id),
  status TEXT NOT NULL DEFAULT 'PLACED' CHECK (status IN ('PLACED', 'IN_TRIP', 'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'FAILED')),
  total NUMERIC(10,2) NOT NULL,
  address_line1 TEXT NOT NULL,
  address_line2 TEXT,
  city TEXT NOT NULL,
  pincode TEXT NOT NULL,
  lat NUMERIC(10,7),
  lng NUMERIC(10,7),
  delivery_phone TEXT NOT NULL,
  notes TEXT,
  idempotency_key TEXT NOT NULL,
  placed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  claimed_at TIMESTAMP,
  packed_at TIMESTAMP,
  dispatched_at TIMESTAMP,
  delivered_at TIMESTAMP,
  UNIQUE(user_id, idempotency_key)
);
CREATE INDEX idx_orders_user_id ON orders(user_id);
CREATE INDEX idx_orders_status ON orders(status);
```

### order_items
```sql
CREATE TABLE order_items (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  item_id TEXT NOT NULL,
  name_snapshot TEXT NOT NULL,
  brand_snapshot TEXT,
  unit_snapshot TEXT NOT NULL,
  price_snapshot NUMERIC(10,2) NOT NULL,
  quantity NUMERIC(10,3) NOT NULL,
  unavailable BOOLEAN NOT NULL DEFAULT FALSE
);
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
```

### order_status_history
```sql
CREATE TABLE order_status_history (
  id SERIAL PRIMARY KEY,
  order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  changed_by UUID REFERENCES users(id),
  changed_at TIMESTAMP NOT NULL DEFAULT NOW(),
  notes TEXT
);
CREATE INDEX idx_order_status_history_order_id ON order_status_history(order_id);
```

## API Design

### Authentication Endpoints

#### POST /api/auth/otp/send
**Request:**
```json
{
  "phone": "9876543210"
}
```
**Response:**
```json
{
  "message": "OTP sent",
  "expiresIn": 300
}
```
**Errors:**
- 400: Invalid phone format
- 429: Rate limit exceeded (phone or IP)

#### POST /api/auth/otp/verify
**Request:**
```json
{
  "phone": "9876543210",
  "otp": "123456"
}
```
**Response:**
```json
{
  "verificationToken": "eyJhbGc..."
}
```
**Errors:**
- 400: Invalid OTP
- 429: Max attempts exceeded

#### POST /api/auth/register
**Headers:**
```
Authorization: Bearer <verificationToken>
```
**Request:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "securepass"
}
```
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```
**Sets httpOnly cookie:** `session=<jwt>`

**Errors:**
- 401: Invalid verification token
- 400: Email already exists

#### POST /api/auth/login
**Request:**
```json
{
  "email": "john@example.com",
  "password": "securepass"
}
```
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```
**Sets httpOnly cookie:** `session=<jwt>`

**Errors:**
- 401: Invalid credentials

#### POST /api/auth/logout
**Response:**
```json
{
  "message": "Logged out"
}
```
**Clears httpOnly cookie**

#### GET /api/auth/me
**Response:**
```json
{
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "9876543210",
    "role": "customer"
  }
}
```
**Errors:**
- 401: Not authenticated

### Order Endpoints

#### POST /api/orders
**Headers:**
```
Idempotency-Key: <uuid>
```
**Request:**
```json
{
  "items": [
    {"id": "item-001", "quantity": 2},
    {"id": "item-002", "quantity": 0.5}
  ],
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "pincode": "400001",
  "deliveryPhone": "9876543210",
  "notes": "Ring bell twice",
  "lat": 19.0760,
  "lng": 72.8777
}
```
**Response:**
```json
{
  "orderId": "uuid",
  "orderNo": 1234
}
```
**Errors:**
- 401: Not authenticated
- 400: Validation errors (invalid quantity, item not found, etc.)
- 409: Duplicate idempotency key (returns existing order)

#### GET /api/orders
**Query:** `?limit=20&offset=0`
**Response:**
```json
{
  "orders": [
    {
      "id": "uuid",
      "orderNo": 1234,
      "status": "PLACED",
      "total": "450.50",
      "placedAt": "2026-09-28T12:00:00Z"
    }
  ],
  "total": 1
}
```

#### GET /api/orders/[id]
**Response:**
```json
{
  "id": "uuid",
  "orderNo": 1234,
  "status": "PLACED",
  "total": "450.50",
  "addressLine1": "123 Main St",
  "addressLine2": "Apt 4B",
  "city": "Mumbai",
  "pincode": "400001",
  "lat": 19.0760,
  "lng": 72.8777,
  "deliveryPhone": "9876543210",
  "notes": "Ring bell twice",
  "placedAt": "2026-09-28T12:00:00Z",
  "items": [
    {
      "id": "1",
      "itemId": "item-001",
      "nameSnapshot": "Milk Packet",
      "brandSnapshot": "Amul",
      "unitSnapshot": "1L",
      "priceSnapshot": "60.00",
      "quantity": "2.000",
      "unavailable": false
    }
  ]
}
```
**Errors:**
- 401: Not authenticated
- 403: Not order owner
- 404: Order not found

## Pure Functions (Tested with Vitest)

### src/lib/validation.ts
```typescript
// Validate quantity is exact multiple of step (integer math)
export function isValidQuantity(quantity: number, step: number): boolean {
  const qtyMillis = Math.round(quantity * 1000);
  const stepMillis = Math.round(step * 1000);
  return qtyMillis > 0 && qtyMillis % stepMillis === 0;
}
```

### src/lib/money.ts
```typescript
// Convert rupees to paise
export function toPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

// Calculate total in paise (integer math)
export function calculateTotal(items: Array<{price: number, quantity: number}>): number {
  return items.reduce((sum, item) => {
    const pricePaise = toPaise(item.price);
    const qtyMillis = Math.round(item.quantity * 1000);
    const lineTotalPaise = Math.round((pricePaise * qtyMillis) / 1000);
    return sum + lineTotalPaise;
  }, 0);
}

// Convert paise back to rupees
export function toRupees(paise: number): number {
  return paise / 100;
}
```

### src/lib/otp.ts
```typescript
import crypto from 'crypto';

// Generate 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Hash OTP with HMAC-SHA256
export function hashOTP(otp: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(otp).digest('hex');
}

// Verify OTP
export function verifyOTP(otp: string, hash: string, secret: string): boolean {
  return hashOTP(otp, secret) === hash;
}
```

### src/lib/status.ts
```typescript
export type OrderStatus = 'PLACED' | 'IN_TRIP' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'FAILED';

export function statusLabel(status: OrderStatus): string {
  switch (status) {
    case 'PLACED':
      return 'Order is placed';
    case 'IN_TRIP':
    case 'OUT_FOR_DELIVERY':
      return 'Out for delivery';
    case 'DELIVERED':
      return 'Delivered';
    case 'CANCELLED':
      return 'Cancelled';
    case 'FAILED':
      return 'Delivery failed';
  }
}

// Check if status is active (should poll)
export function isActiveStatus(status: OrderStatus): boolean {
  return status === 'PLACED' || status === 'IN_TRIP' || status === 'OUT_FOR_DELIVERY';
}
```

## Environment Variables

`.env.example`:
```
# Database
DATABASE_URL=

# Auth & Security
SESSION_SECRET=
OTP_HMAC_SECRET=

# SMS Gateway (textbee.dev)
SMS_GATEWAY_URL=
SMS_GATEWAY_API_KEY=

# Email (Resend)
RESEND_API_KEY=
EMAIL_FROM=

# Notifications
ADMIN_NOTIFY_EMAILS=

# App URL
NEXT_PUBLIC_APP_URL=
```

## PWA Configuration

### manifest.json
```json
{
  "name": "Local Grocery",
  "short_name": "Grocery",
  "description": "Order groceries from your local shop",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#ffffff",
  "theme_color": "#10b981",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png"
    }
  ]
}
```

### Service Worker (Serwist)
- Precache: catalog.json, static assets
- Runtime cache: API responses (orders, auth)
- Network-first for API routes
- Cache-first for catalog.json with version-based invalidation
- Offline fallback for catalog browsing

## Security Considerations

1. **No sensitive data in localStorage**: Only cart item IDs and quantities
2. **Server-side price validation**: Never trust client-submitted prices
3. **Rate limiting**: OTP endpoints protected by phone and IP limits
4. **Idempotency**: Duplicate order prevention via unique keys per user
5. **Session security**: httpOnly, Secure, SameSite=Lax cookies
6. **Password hashing**: bcrypt with salt rounds
7. **OTP hashing**: HMAC-SHA256, never plain text
8. **SQL injection prevention**: Drizzle ORM parameterized queries
9. **Authorization**: Users can only access their own orders
10. **HTTPS required**: All cookies have Secure flag in production

## Testing Strategy

### Unit Tests (Vitest)
- `validation.test.ts`: isValidQuantity edge cases
- `money.test.ts`: paise conversions, total calculations
- `otp.test.ts`: generation, hashing, verification
- `status.test.ts`: statusLabel, isActiveStatus

### Manual Testing Checklist
1. Browse catalog, search, filter by category
2. Add items to cart with different step values
3. Cart persists after page refresh
4. New user: phone OTP flow → registration → session created
5. Returning user: login with email/password
6. Cart survives logout
7. Checkout with address, prefill from last order
8. Place order, verify confirmation page
9. View orders list
10. View order detail, status updates
11. Install as PWA
12. Offline catalog browsing

## Performance Targets
- First Contentful Paint: < 1.5s
- Largest Contentful Paint: < 2.5s
- Time to Interactive: < 3.5s
- Catalog load: < 500ms (cached)
- Order submission: < 2s (network dependent)

## Accessibility Goals
- WCAG 2.1 Level AA compliance
- Keyboard navigation for all interactive elements
- ARIA labels for icon buttons
- Color contrast ratio ≥ 4.5:1 for text
- Focus indicators visible
- Screen reader tested (NVDA, VoiceOver)
