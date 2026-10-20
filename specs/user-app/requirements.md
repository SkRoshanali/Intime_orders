# Requirements: Customer Grocery Ordering PWA

## Project Overview
A mobile-first Progressive Web App for a local grocery shop where customers can browse a static product catalog, add items to cart, verify their phone number once via OTP, and place cash-on-delivery orders.

## User Personas
**Primary User: Customer**
- Local resident ordering groceries
- Primarily uses mobile device
- Values simplicity and speed
- Places orders for cash-on-delivery

## Core Features

### 1. Product Catalog
- **Browse products**: Display all available items from a static catalog
- **Search**: Real-time search across product names and brands
- **Filter by category**: Quick access via category chips
- **Product details**: Show name, brand, unit, price, and optional image
- **Variable quantities**: Support decimal quantities with item-specific steps (e.g., 0.5 kg for garlic, 1 packet for milk)

### 2. Shopping Cart
- **Add to cart**: Quick add with +/- stepper controls
- **Persistent cart**: Survives page refresh, tab close, logout, and session expiry
- **Cart summary**: Floating bar showing item count and total
- **Cart sheet**: Bottom sheet overlay with full cart details
- **Quantity adjustment**: Modify quantities or remove items
- **Catalog sync**: Auto-remove items that are no longer in catalog with user notification

### 3. Authentication & Registration
**New Customer Flow:**
1. Enter 10-digit Indian mobile number
2. Receive and enter 6-digit OTP via SMS
3. After OTP verification, provide name, email, and password
4. Account created with verified phone
5. Automatically logged in

**Returning Customer Flow:**
1. Login with email and password
2. No OTP required

**Security Requirements:**
- Phone numbers and emails must be unique
- OTP expires after 5 minutes
- Maximum 3 OTP verification attempts per code
- Rate limiting: max 3 OTP sends per phone per hour
- Rate limiting: max 10 OTP sends per IP per hour
- Passwords hashed with bcrypt
- Sessions via httpOnly, Secure, SameSite=Lax cookies
- 30-minute sliding idle timeout (re-issue token when >5 minutes old)
- Cart persists through logout and session expiry

### 4. Checkout & Order Placement
**Checkout Page:**
- Single scrollable page with delivery address form
- Fields: address line 1, address line 2, city, 6-digit pincode
- Optional: latitude/longitude via browser geolocation ("Use current location" button)
- Delivery phone (defaults to user's phone)
- Optional order notes
- Order summary: items, quantities, prices, total
- Sticky "Place Order" button

**Address Prefill:**
- Automatically prefill from customer's most recent order if available

**Order Requirements:**
- Must be authenticated to place order
- Cart must contain at least one item
- All quantities must be valid multiples of item steps
- Maximum quantity per line: 100 units
- Idempotency: duplicate requests (same Idempotency-Key) return existing order

**Order Confirmation:**
- Display order number (human-friendly serial)
- Show order status and delivery address
- Send confirmation email to customer
- Send notification email to admin address(es)

### 5. Order Management
**My Orders Page:**
- List all orders by current user, newest first
- Show order number, date, status label, total
- Tap to view order details

**Order Detail Page:**
- Order number and placed date
- Current status with customer-friendly label
- Delivery address
- Itemized list with snapshots (name, brand, unit, price, quantity)
- Order total
- Real-time status updates:
  - Poll every 30 seconds while status is active (PLACED, IN_TRIP, OUT_FOR_DELIVERY)
  - Stop polling when status is terminal (DELIVERED, CANCELLED, FAILED)
  - Resume polling on tab focus if status is still active

**Status Labels:**
- PLACED → "Order is placed"
- IN_TRIP, OUT_FOR_DELIVERY → "Out for delivery"
- DELIVERED → "Delivered"
- CANCELLED → "Cancelled"
- FAILED → "Delivery failed"

### 6. Account Management
**Account Page:**
- Display user name, email, phone (verified)
- Logout button
- Order count/summary (optional)

### 7. Progressive Web App (PWA)
- Service worker with offline catalog caching
- Installable on mobile home screen
- App manifest with name, icons, theme color
- Offline-first for catalog browsing
- Graceful online/offline state handling

## Technical Constraints

### Data Sources
- **Product catalog**: Generated from `data/catalog.xlsx` by `scripts/build-catalog.ts`
- Catalog includes: id, name, brand, category, unit, price, step, image_url (optional)
- Catalog includes content-based version hash
- NO inventory tracking, NO stock checks, all items always available

### Database Schema
Shared Neon Postgres database (separate admin app will use same DB):

**users** table: id, role (customer/agent/admin), name, email (unique), password_hash, phone (unique), phone_verified, phone_verified_at, created_at

**otp_codes** table: id, phone, code_hash (HMAC-SHA256), ip, expires_at, attempts, created_at

**orders** table: id, order_no (serial), user_id, agent_id, batch_id, status, total, address fields (line1, line2, city, pincode, lat, lng), delivery_phone, notes, idempotency_key (unique per user), timestamps (placed_at, claimed_at, packed_at, dispatched_at, delivered_at)

**order_items** table: id, order_id, item_id, snapshots (name, brand, unit, price), quantity, unavailable flag

**order_status_history** table: id, order_id, status, changed_by, changed_at, notes

**batches** table: id, agent_id, status, timestamps (created_at, sealed_at, dispatched_at, completed_at) - for future admin app

### Calculation Rules
- **Never use floating-point arithmetic for money or quantities**
- Convert quantities to integers (multiply by 1000)
- Convert prices to paise (multiply by 100)
- Perform all calculations with integers
- Validate quantities are exact multiples of step (using integer math)

### External Services
- **SMS**: textbee.dev gateway for OTP delivery (fallback: console log in dev)
- **Email**: Resend for order confirmations and admin notifications (fallback: console log in dev)

### UI/UX Requirements
- Mobile-first responsive design
- Maximum content width: 480px, centered
- Minimum tap target size: 44px
- Input font size: minimum 16px (prevents iOS zoom)
- Bottom navigation: Home, Categories, Orders, Account
- Sticky search bar with category filter chips
- Safe-area padding for iOS home bar
- Cart appears as bottom sheet overlay, not a separate page
- All numeric inputs use type="tel" and inputMode="numeric"
- Proper autoComplete attributes for forms
- Guest checkout not allowed: redirect to login/register, preserve cart, return to checkout after auth

## Non-Functional Requirements

### Performance
- Fast catalog browsing (pre-generated JSON)
- Optimistic UI updates for cart operations
- Efficient re-renders (Zustand for cart state)
- Service worker caching for repeat visits

### Security
- No sensitive data in localStorage (cart contains only item IDs and quantities)
- Passwords never stored in plain text
- OTPs never stored in plain text (HMAC-SHA256)
- Session tokens in httpOnly cookies only
- HTTPS required in production
- Rate limiting on OTP endpoints
- Server-side price validation (never trust client)
- Idempotency keys prevent duplicate orders
- User can only access their own orders

### Accessibility
- Semantic HTML
- Proper ARIA labels for interactive elements
- Keyboard navigation support
- Sufficient color contrast
- Screen reader friendly

### Compatibility
- Modern mobile browsers (iOS Safari 14+, Chrome Android 90+)
- Progressive enhancement (works without JS for initial catalog view)
- Responsive down to 320px width

## Out of Scope (Explicitly NOT Included)
- Online payments (cash-on-delivery only)
- Forgot password / password reset
- Delivery time slot selection
- Inventory management or stock levels
- Multiple saved addresses
- Push notifications
- Interactive maps / address autocomplete
- Admin or agent interfaces (separate app)
- Dark mode
- Internationalization
- Analytics tracking
- Docker containers
- CI/CD pipelines

## Success Criteria
1. Customer can browse all catalog items with search and category filter
2. Customer can add items to cart with correct quantity steps
3. Cart persists across page refresh and logout
4. New customer can register with phone OTP verification
5. Returning customer can login with email/password
6. Authenticated customer can place an order with delivery address
7. Order confirmation shows with correct order number and total
8. Customer receives confirmation email
9. Customer can view list of their orders
10. Customer can view order details with real-time status updates
11. App passes TypeScript strict checks
12. App passes linting
13. Pure utility functions have passing Vitest tests
14. App is installable as PWA
15. README documents complete setup and run instructions
