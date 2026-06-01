# Triangles Studio — Website & Booking App

Creative agency site (branding, photography, videography, AI) with an inquiry-style
booking system. Clients request services; the studio confirms and takes payment in person.

## Stack
- **Next.js 16** (App Router) + **React 19** + TypeScript
- **Tailwind CSS v4** — cosmic theme drawn from the logo
- **Prisma 7** + **SQLite** (local) via better-sqlite3 driver adapter
- **Resend** — booking emails (optional, stub-safe until a key is set)
- Deploy target: **Vercel**

## Run locally
```bash
npm install
npx prisma migrate dev      # creates dev.db + applies schema
npm run dev                 # http://localhost:3000
```

## Pages
| Route | What |
|-------|------|
| `/` | Home — hero, pillars, services, how-it-works, CTA |
| `/services` | All 10 categories, ~60 services, request links |
| `/portfolio` | Work grid (placeholder tiles until real images) |
| `/about` | Studio story + values |
| `/contact` | Contact details |
| `/book` | Booking form (`?service=<slug>` preselects) |
| `/admin` | Bookings dashboard (password-protected) |
| `/admin/login` | Admin sign-in |

## Booking flow
1. Client picks a service → `/book` form (name, email, phone, date, budget, brief).
2. `POST /api/bookings` validates (zod), saves to DB, fires emails.
3. Studio sees it in `/admin`, updates status (new → contacted → confirmed → done).

## Environment (`.env`)
```
DATABASE_URL="file:./dev.db"
ADMIN_PASSWORD="triangles"          # CHANGE THIS
AUTH_SECRET="change-me-to-random"   # CHANGE THIS (random 32+ chars)
RESEND_API_KEY=""                   # optional; blank = emails logged, not sent
BOOKING_NOTIFY_EMAIL="you@gmail.com"
BOOKING_FROM_EMAIL="Triangles Studio <onboarding@resend.dev>"
```

## TODO before going live
- [ ] **Buy domain** (e.g. `triangles.studio`), set email `booking@triangles-studio.com`.
- [ ] **Swap DB to Postgres** for production: change `provider` to `postgresql` in
      `prisma/schema.prisma`, use `@prisma/adapter-pg`, point `DATABASE_URL` at Neon/Vercel Postgres.
- [ ] **Set Resend API key** + verify sending domain.
- [ ] **Replace logo**: drop real file at `/public/logo.png` (currently an SVG mark).
- [ ] **Add portfolio images** to `/public/portfolio`, wire into `src/app/portfolio/page.tsx`.
- [ ] **Change `ADMIN_PASSWORD` + `AUTH_SECRET`**.
- [ ] Fill real social links + business hours in `src/lib/site.ts`.

## Deploy (Vercel)
1. Push to GitHub.
2. Import repo in Vercel.
3. Add env vars (Postgres `DATABASE_URL`, `ADMIN_PASSWORD`, `AUTH_SECRET`, Resend).
4. Build command `next build` (default). Deploy.
