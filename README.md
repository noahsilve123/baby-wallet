## Destination College FAFSA Helper

This Next.js application powers the FAFSA prep and donation pages for Destination College. The FAFSA helper now relies on the standalone Go service in [`Financial-tools`](https://github.com/noahsilve123/Financial-tools) to do all document parsing and OCR.

## Prerequisites

- Node.js 20+
- Go extractor service running locally or deployed somewhere reachable
- Environment variable `NEXT_PUBLIC_EXTRACTOR_URL` pointing at that service (e.g. `http://localhost:8080`)

## Local development

1. Install dependencies

	```bash
	npm install
	```

2. Start the FAFSA extractor backend (from the Financial-tools repo)

	```bash
	cd ../Financial-tools
	make run   # or go run .
	```

3. Create an `.env.local` in this project with

	```env
	NEXT_PUBLIC_EXTRACTOR_URL=http://localhost:8080
	```

4. Back in this repo, run the frontend

	```bash
	npm run dev
	```

Open [http://localhost:3000](http://localhost:3000) to use the site. Dropped PDFs/images will be uploaded to the extractor service and the text streamed back to the FAFSA helper UI.

## Optional reminder queue

- Set `REDIS_URL` to a reachable Redis instance to enable `/api/reminders`.
- Run `node worker/reminderWorker.js` locally to process queued reminder jobs (currently logs to console; wire to your email/SMS provider in production).

## PWA/offline

- A service worker (`public/sw.js`) caches the planner page for offline viewing. The manifest is served from `/manifest.webmanifest`.
- Add `public/icon-192.png` and `public/icon-512.png` to improve the install prompt on mobile.

## Testing the extractor connection

- The FAFSA uploader expects a JSON payload `{ "text": "..." }`. You can hit the Go service manually with `curl -F "file=@samples/sample.pdf" $NEXT_PUBLIC_EXTRACTOR_URL/extract` to confirm it returns data before opening the Next.js UI.
- If the spinner stays at 0 %, check the browser devtools network tab for any `/extract` errors. Missing or incorrect `NEXT_PUBLIC_EXTRACTOR_URL` is the most common issue.

## Deployment notes

- Deploy the Go extractor first (Render, Railway, Fly.io, etc.) and expose it via HTTPS.
- Set `NEXT_PUBLIC_EXTRACTOR_URL` in the hosting provider’s environment settings so the frontend always points to the correct backend.
- The frontend is a standard Next.js 16 app, so any platform that supports Next.js (Vercel, Netlify, Azure Static Web Apps) will work.

## Environment variables

- `NEXT_PUBLIC_EXTRACTOR_URL` – URL to the FAFSA extractor service (required for document scanning).
- `REDIS_URL` – enables reminder queue processing for `/api/reminders`.
- `STRIPE_SECRET_KEY`, `STRIPE_DEFAULT_PRICE_ID`, `STRIPE_WEBHOOK_SECRET` – Stripe donation flow (kept separate; untouched in this iteration).
- `NEXT_PUBLIC_SITE_URL` – canonical site URL for building absolute links.

## Local development quickstart

```bash
npm install
npm run dev
```

If you need reminders locally, start a Redis instance and run `node worker/reminderWorker.js` in another terminal.

## Tests and quality gates

```bash
npm run lint
npm run test:e2e          # Playwright (includes unit-style tests)
npm run a11y:axe          # axe-core scans for key routes
npm run a11y              # pa11y-ci across primary pages
```

## QA checklist (manual)

- Scholarships planner: build list, save item, generate share link, export calendar (ICS downloads), reminders error message when REDIS_URL missing.
- FAFSA helper: upload PDF, run “Scan document”, verify extracted values and contrast of status pills.
- Programs/resources pages: heading order and focus outlines visible when tabbing.
- Offline/PWA: load `/resources/scholarships` then toggle offline and confirm cached content renders; service worker registered via `public/sw.js`.

## Reminder queue

- Set `REDIS_URL` to a reachable Redis instance.
- Run `node worker/reminderWorker.js` to process jobs (currently logs; wire to email/SMS provider for production).

## PWA / offline notes

- `public/sw.js` caches the planner page and assets for offline viewing.
- `app/manifest.ts` defines icons/metadata; add `public/icon-192.png` and `public/icon-512.png` for install prompts.

## Stripe setup (separate)

- Donation checkout lives in `app/api/create-checkout-session/route.ts`; it requires `STRIPE_SECRET_KEY` and optional `STRIPE_DEFAULT_PRICE_ID` for monthly plans.
- Webhooks use `STRIPE_WEBHOOK_SECRET` and append to `data/donations.json` for admin views.
