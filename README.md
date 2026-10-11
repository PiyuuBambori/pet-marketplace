# Doom — Pet Clothes Marketplace

An open-source marketplace for dog and cat apparel. Built with Next.js 14 (App
Router), TypeScript, Tailwind CSS, Prisma/Postgres and Stripe.

---

## What's in the box

| Area | Route | Notes |
|---|---|---|
| Home | `/` | Hero carousel, category tiles, rails, deal section |
| Catalogue | `/products` | Filter by pet type, brand, size, colour, price, discount |
| Product detail | `/products/[id]` | Gallery, size chart (clickable rows), add to bag |
| Size guide | `/size-guide` | Dog XXS–4XL and cat S–XL charts, how to measure |
| Bag | `/cart` | Quantity controls, free-shipping progress bar |
| Checkout | `/checkout` | Two-step address + payment, requires a profile |
| Sign in / register | `/login`, `/register` | Buyer profiles with avatar picker |
| Account | `/account` | Stats, orders, saved addresses, profile settings |
| Order tracking | `/account/orders` | Filter All / On the way / Past, search by order ID |
| Seller Studio | `/admin/designs` | Upload designs with drag-and-drop photos |
| Catalogue admin | `/admin/catalogue` | List, edit, hide and delete listings |
| Fulfilment | `/admin/orders` | Orders to ship, by buyer and delivery address |

---

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the values
npx prisma generate
npx prisma db push        # or: npm run db:push
npm run db:seed           # optional demo data
npm run dev
```

Open <http://localhost:3000>.

### The catalogue works without a database

The storefront reads from Postgres when it is reachable and falls back to the
bundled catalogue in `lib/products.ts` otherwise, so the site never renders
blank. Admin uploads and orders require a database.

---

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Required | Purpose |
|---|---|---|
| `DATABASE_URL` | For admin + orders | Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical URL, used for metadata, sitemap and Stripe redirects |
| `STRIPE_SECRET_KEY` | For real payments | Server-side Stripe key |
| `STRIPE_WEBHOOK_SECRET` | For real payments | From `stripe listen` or the dashboard |
| `ADMIN_EMAIL` | Optional | Override the permanent admin login (default `admin@doom.shop`) |
| `ADMIN_PASSWORD` | Optional | Override the permanent admin password (default `admin123`) |
| `SESSION_SECRET` | Recommended | Random string used to sign session tokens |

Generate a secret with:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

---

## Accounts

The app ships with two account types:

- **Permanent admin** — `admin@doom.shop` / `admin123` by default. Cannot be
  deleted or demoted. Can post and edit catalogue listings and manage
  fulfilment. Override the credentials with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- **Buyer profiles** — create as many as you like at `/register`. Each profile
  keeps its own order history, saved addresses and cart.

> Sessions are stored server-side in the `Session` table and delivered in an
> `httpOnly` cookie, so they cannot be forged from the browser. The permanent
> admin is upserted into the database by the seed script, which is what makes
> the role enforceable server-side rather than only in the UI.

---

## Scripts

| Command | Description |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint via `next lint` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | Regenerate the Prisma client |
| `npm run db:push` | Sync the schema to the database |
| `npm run db:migrate` | Create and apply a migration |
| `npm run db:seed` | Seed demo designs and the admin account |
| `npm run db:studio` | Browse data in Prisma Studio |

---

## Deploying to Vercel

1. Push the project to GitHub.
2. Import the repo at [vercel.com/new](https://vercel.com/new). The framework
   preset and build command are detected automatically.
3. Add the environment variables from the table above in
   **Project → Settings → Environment Variables**. Add `DATABASE_URL`,
   `NEXT_PUBLIC_APP_URL`, `SESSION_SECRET` and the Stripe keys.
4. For a hosted Postgres, also add a `postinstall` script of
   `prisma generate` so the client is built during install.
5. Deploy. Set `NEXT_PUBLIC_APP_URL` to your production domain afterwards and
   redeploy so metadata and sitemap URLs resolve correctly.

### Stripe webhooks locally

```bash
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

Copy the printed `whsec_…` value into `.env` as `STRIPE_WEBHOOK_SECRET`. Without
webhooks the checkout falls back to a simulated confirmation so the flow stays
testable.

---

## Project layout

```
app/
  api/            route handlers (session, designs, orders, payments, stripe)
  admin/          seller studio, catalogue, fulfilment  (admin-only)
  account/        buyer dashboard and order tracking
  products/[id]/  product detail
components/       UI: header, footer, cards, size chart, order card
lib/
  products.ts     bundled catalogue + size charts (fallback source)
  catalog.ts      DB-first data access with fallback
  auth.ts         bcrypt + session helpers
  prisma.ts       Prisma client singleton
prisma/           schema + seed
public/photos/    product photography
```

---

## Known limitations

- Uploaded design photos are stored as base64 in the database (client-side
  compressed, ~1.5 MB cap) so the app works on any host. Move to Vercel Blob or
  S3 for large catalogues.
- Catalogue deletions are soft deletes (`isActive = false`) so order history
  keeps working.
- Photo credits: imagery in `public/photos/` comes from Openverse/Flickr under
  open licences. Verify each licence before commercial use.

## Licence

MIT