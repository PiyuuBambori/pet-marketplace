# Doom — Pet Clothes Marketplace

An open-source marketplace for dog and cat apparel. Built with Next.js 14 (App
Router), TypeScript, Tailwind CSS, Supabase (Auth, Postgres, Storage) and Stripe.

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
| Sign in / register | `/login`, `/register` | Supabase Auth, profiles with avatar picker |
| Account | `/account` | Stats, orders, saved addresses, profile settings |
| Order tracking | `/account/orders` | Filter All / On the way / Past, search by order ID |
| Seller Studio | `/admin/designs` | Upload designs to Supabase Storage with drag-and-drop |
| Catalogue admin | `/admin/catalogue` | List, edit, hide and delete listings |
| Fulfilment | `/admin/orders` | Orders to ship, by buyer and delivery address |

---

## Quick start

```bash
npm install
cp .env.example .env      # then fill in the values
npx prisma generate
npx prisma db push        # or: npm run db:push
npm run db:seed           # uploads photography + seeds designs + creates admin
npm run dev
```

Open <http://localhost:3000>.

### One-time Supabase setup

1. Create a project and copy the URL and keys from **Project Settings → API**.
2. Run `prisma/supabase-setup.sql` in the **SQL editor**. It is idempotent and
   installs:
   - `on_auth_user_created` / `on_auth_user_updated` triggers that keep the
     public `User` profile in sync with Supabase Auth, plus `promote_to_admin`
     to grant an admin by email.
   - Row level security on `User`, `Design`, `Order` and `OrderItem`, and
     revokes `anon` / `authenticated` grants on them.
3. Create a **public** Storage bucket named `doom-images` (5 MB file limit,
   image MIME types only). `npm run db:seed` fills it with the photography.
4. Run `npm run db:seed`. It uploads every image, creates the 10 catalogue
   designs and upserts the admin profile.

> Row level security is deliberately locked down: the browser never talks to
> the tables directly. Every read and write goes through a route handler that
> verifies the session with Supabase Auth and re-checks the profile role.

### The catalogue works without a database

The storefront reads from Postgres when it is reachable and falls back to the
bundled catalogue in `lib/products.ts` otherwise, so the site never renders
blank. Admin uploads, accounts and orders require the database.

---

## Environment variables

Copy `.env.example` to `.env`:

| Variable | Required | Purpose |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Yes | Browser-safe anon/publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only. Bypasses RLS; never prefix with `NEXT_PUBLIC_` |
| `DATABASE_URL` | Yes | Postgres connection string |
| `NEXT_PUBLIC_APP_URL` | Recommended | Canonical URL, used for metadata, sitemap and Stripe redirects |
| `STRIPE_SECRET_KEY` | For real payments | Server-side Stripe key |
| `STRIPE_WEBHOOK_SECRET` | For real payments | From `stripe listen` or the dashboard |
| `ADMIN_EMAIL` | Optional | Override the seeded admin account (default `admin@doom.shop`) |
| `ADMIN_PASSWORD` | Optional | Override the seeded admin password |

> The service-role key is used only by `lib/supabase/admin.ts`, which is
> imported exclusively by server-side code. It grants full access to every
> table and every storage object, so treat it like a database password and
> rotate it immediately if it is ever exposed.

---

## Accounts

The app ships with two account types:

- **Permanent admin** — `admin@doom.shop` by default. Cannot be deleted or
  demoted. Can post and edit catalogue listings and manage fulfilment.
  Override the credentials with `ADMIN_EMAIL` / `ADMIN_PASSWORD`.
- **Buyer profiles** — create as many as you like at `/register`. Each profile
  keeps its own order history and saved addresses.

> Supabase Auth owns credentials and sessions; the app stores no passwords. The
> `User` table holds only the public profile (name, phone, avatar, role) and is
> kept in sync by database triggers. Sessions live in an `httpOnly` cookie
> refreshed by `middleware.ts`, so they cannot be forged from the browser. Admin
> status is read from the database on the server, never from client input.

### Why registration does not send an email

Supabase's built-in mailer is rate limited to a handful of messages per hour,
so a confirmation email made signup fail outright with *"email rate limit
exceeded"* — a new shopper simply could not create an account.

`POST /api/session { action: "register" }` therefore creates the user through
the admin API with `email_confirm: true` and signs them in immediately. No
email is sent, so the quota cannot be hit and the account is usable straight
away.

Because there is no email to verify, the route is guarded by a best-effort
in-process rate limit (10 accounts per IP per 10 minutes, see `lib/rate-limit.ts`)
and returns `"An account with that email already exists."` rather than leaking
whether an address is registered at signup.

> If you later want verified accounts, switch the endpoint back to
> `supabase.auth.signUp` and turn **Confirm email** on in Supabase — but then
> configure a real SMTP provider (Resend, Postmark) first, or you will hit the
> same limit with legitimate customers.

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
   **Project → Settings → Environment Variables**: the Supabase URL, both
   Supabase keys, `DATABASE_URL`, `NEXT_PUBLIC_APP_URL` and the Stripe keys.
4. Use the **Supavisor pooler** connection string for `DATABASE_URL` and append
   `?pgbouncer=true&connection_limit=1`. A direct connection will exhaust the
   connection pool on serverless.
5. Add a `postinstall` script of `prisma generate` so the client is built
   during install.
6. Deploy. Set `NEXT_PUBLIC_APP_URL` to your production domain afterwards and
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
  api/            route handlers (session, designs, orders, payments, upload, stripe)
  admin/          seller studio, catalogue, fulfilment  (admin-only)
  account/        buyer dashboard and order tracking
  products/[id]/  product detail
components/       UI: header, footer, cards, size chart, order card
lib/
  products.ts       bundled catalogue + size charts (fallback source)
  catalog.ts        DB-first data access with fallback
  auth.ts           Supabase session + role guards (getUser, requireUser, requireAdmin)
  prisma.ts         Prisma client singleton
  supabase/
    client.ts       browser client for sign-in/up/out
    server.ts       cookie-backed server client
    admin.ts        service-role client (server-only)
middleware.ts       refreshes the Supabase session and guards protected pages
prisma/
  schema.prisma     User, Design, Order, OrderItem
  supabase-setup.sql auth triggers, RLS, grants
  seed.ts           uploads photography, seeds designs, creates the admin
public/photos/      bundled photography fallback
```

---

## Known limitations

- The seeded admin uses a known password and lives in a `.env` that was shared
  in chat during setup. Change the password, rotate the Supabase service-role
  key and the database password before going live.
- Catalogue deletions are soft deletes (`isActive = false`) so order history
  keeps working.
- Saved addresses live in browser state only; orders persist the address
  snapshot they were placed with, so history is never lost.
- Photo credits: imagery in `public/photos/` comes from Openverse/Flickr under
  open licences. Verify each licence before commercial use.

## Licence

MIT