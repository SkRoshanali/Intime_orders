# Intime User App - Local Grocery PWA

A Progressive Web App (PWA) for ordering groceries from your local shop. Built with Next.js 15, TypeScript, and modern web technologies.

## Features

- 📱 Mobile-first responsive design with PWA capabilities
- 🛒 Cart persistence across sessions with Zustand
- 🔐 OTP-based authentication via SMS
- 📦 Real-time order tracking with status updates
- 💳 Secure checkout with transaction safety
- 📧 Email notifications for orders
- 🔄 Offline capability with service worker caching

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (strict mode)
- **Styling**: Tailwind CSS
- **State Management**: Zustand with persistence
- **Data Fetching**: TanStack Query
- **Database**: Neon Postgres with Drizzle ORM
- **Authentication**: JWT with jose, SMS OTP via textbee.dev
- **Email**: Resend
- **PWA**: Serwist service worker
- **Testing**: Vitest
- **Icons**: Lucide React

## Prerequisites

- Node.js 18+ 
- PostgreSQL database (we recommend [Neon](https://neon.tech))
- SMS gateway account at [textbee.dev](https://textbee.dev) (optional for dev)
- Email account at [Resend](https://resend.com) (optional for dev)

## Environment Variables

Copy `.env.example` to `.env` and fill in your values:

```bash
# Database
DATABASE_URL=postgresql://user:password@host:port/database

# Auth & Security
SESSION_SECRET=your-32-character-secret-key
OTP_HMAC_SECRET=your-32-character-otp-secret

# SMS Gateway (textbee.dev)
SMS_GATEWAY_URL=https://api.textbee.dev/api/send
SMS_GATEWAY_API_KEY=your-textbee-api-key

# Email (Resend)
RESEND_API_KEY=re_your-resend-api-key
EMAIL_FROM=noreply@yourdomain.com

# Notifications
ADMIN_NOTIFY_EMAILS=admin@yourdomain.com,orders@yourdomain.com

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Development Mode**: If `SMS_GATEWAY_URL` or `RESEND_API_KEY` are not set, OTPs and emails will be logged to the console instead of being sent.

## Setup Instructions

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Set Environment Variables**
   - Copy `.env.example` to `.env`
   - Fill in your database URL and other credentials

3. **Generate Catalog**
   ```bash
   npm run build:catalog
   ```
   This converts `data/catalog.xlsx` to `public/catalog.json`

4. **Generate Database Migration**
   ```bash
   npx drizzle-kit generate
   ```
   This creates SQL migration files in `migrations/`

5. **Run Migration on Database**
   Execute the generated SQL manually on your PostgreSQL database. The migration file will be in `migrations/0000_*.sql`

6. **Start Development Server**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000)

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Create production build  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run test` - Run Vitest tests
- `npm run test:watch` - Run Vitest in watch mode
- `npm run build:catalog` - Generate catalog.json from Excel file

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── auth/         # Authentication endpoints
│   │   └── orders/       # Order management endpoints
│   ├── (auth)/           # Auth pages (login, register)
│   ├── checkout/         # Checkout flow
│   └── orders/           # Order history and details
├── components/            # Reusable UI components
│   ├── auth/             # Auth-related components
│   ├── cart/             # Shopping cart components
│   ├── catalog/          # Product catalog components
│   ├── checkout/         # Checkout components
│   ├── layout/           # Layout components (nav, etc)
│   └── orders/           # Order-related components
├── db/                   # Database schema and config
├── hooks/                # Custom React hooks
├── lib/                  # Utility libraries
├── store/                # Zustand stores
└── types/                # TypeScript type definitions

data/
└── catalog.xlsx          # Source Excel file for products

public/
├── catalog.json          # Generated product catalog
├── icons/                # PWA icons
├── manifest.json         # PWA manifest
└── sw.js                 # Generated service worker

migrations/               # Drizzle database migrations
```

## Key Features Implementation

### Authentication
- **Phone-based registration**: OTP sent via SMS for new users
- **Email/password login**: For returning customers  
- **JWT sessions**: 30-minute sliding timeout with automatic refresh
- **Session persistence**: Cart survives login/logout

### Shopping Cart
- **Persistent storage**: LocalStorage with Zustand persist
- **Fresh pricing**: Always fetches current catalog prices
- **Quantity validation**: Enforces product step increments
- **Item removal**: Automatic cleanup of unavailable items

### Order Management  
- **Idempotency protection**: Prevents duplicate orders from double-taps
- **Transaction safety**: Database transactions with rollback on failure
- **Price snapshots**: Order items store pricing at time of purchase
- **Status tracking**: Real-time updates with 30-second polling

### Progressive Web App
- **Service worker**: Network-first caching for catalog, cache-first for static assets
- **Offline support**: Cached catalog and UI available offline
- **Install prompt**: Users can install as native-like app
- **Background sync**: Failed requests retry when back online

## Testing

The app includes Vitest tests for critical business logic:

- **Input validation**: Step quantities, phone/pincode formats
- **Money calculations**: Paise arithmetic for precise totals  
- **OTP handling**: HMAC-based hashing and verification
- **Status mapping**: Order status to customer-friendly labels

Run tests with:
```bash
npm run test           # Single run
npm run test:watch     # Watch mode
```

## Database Migration

⚠️ **Important**: Never run `drizzle-kit migrate` or `drizzle-kit push`. Always generate SQL files and execute them manually:

1. Generate migration: `npx drizzle-kit generate`
2. Review the SQL in `migrations/0000_*.sql`  
3. Execute manually on your database
4. Commit the migration file to version control

This approach ensures you review all schema changes and maintain migration history.

## Development Notes

### OTP in Development
If `SMS_GATEWAY_URL` is not configured, OTPs will be logged to the server console:
```
[OTP] Phone: 9876543210, Code: 123456
```

### Email in Development  
If `RESEND_API_KEY` is not configured, emails will be logged to the server console instead of being sent.

### Catalog Management
- Source: `data/catalog.xlsx` with columns: id, name, brand, category, unit, price, step, image_url (optional, local files take priority)
- Build: `npm run build:catalog` generates `public/catalog.json` with content hash version
- No inventory tracking - all items are always available
- Price updates take effect immediately on next catalog build

### Product Images
Product images are stored locally in `public/product-images/` for faster loading and offline availability.

**Adding or updating a product image:**
1. Prepare an image file (`.jpg`, `.jpeg`, `.png`, or `.webp`)
2. Name it exactly after the item's `id` from the catalog (e.g., `item-001.jpg` for item with id "item-001")
3. Place the file in `public/product-images/`
4. Run `npm run build:catalog` to rebuild the catalog with image references
5. Images are automatically bundled into the production build

**Current item IDs for image naming:**
- `item-001` - Corn Floor
- `item-002` - Garlic
- `item-003` - Garam Masala
- `item-004` - Biryani Masala
- `item-005` - Vinegar
- `item-006` - Ketchup
- `item-007` - Bay Leaf
- `item-008` - Cumin Seeds
- `item-009` - Turmeric Powder
- `item-010` - Basmati Rice
- `item-011` - Cooking Oil
- `item-012` - Onions

**Example**: To add an image for "Garlic" (item-002), save a file as `public/product-images/item-002.jpg` and rebuild.

**Note**: The build process checks for local images first, then falls back to the optional `image_url` column in Excel. If neither exists, products display without an image (a light gray placeholder is shown).

### Security Notes
- Never commit real environment variables
- Use strong random values for `SESSION_SECRET` and `OTP_HMAC_SECRET`  
- OTPs are stored as HMAC-SHA256 hashes, never plain text
- Rate limiting protects OTP endpoints from abuse
- All passwords are bcrypt hashed

## Deployment

1. Set all environment variables on your hosting platform
2. Ensure your database is accessible  
3. Run the migration SQL manually on production database
4. Generate fresh catalog: `npm run build:catalog`
5. Build the app: `npm run build`
6. Start production server: `npm run start`

The app is now ready for production use with full PWA capabilities, SMS authentication, and email notifications.

## License

MIT License - see LICENSE file for details