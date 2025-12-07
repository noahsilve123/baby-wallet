# Stripe setup and local testing

This document explains how to safely configure Stripe for local development and testing.

1) Rotate any exposed keys
- If you accidentally exposed a secret key (e.g., in chat or a public place), rotate it immediately in the Stripe Dashboard:
  - Dashboard → Developers → API keys → Reveal / Rotate secret key
  - Copy the new `sk_test_...` and update your local `.env.local`.

2) Create `.env.local` (do not commit)
- Copy the included `.env.example` to `.env.local` and fill in the test keys.

Example `.env.local`:
```
STRIPE_SECRET_KEY=sk_test_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
STRIPE_DEFAULT_PRICE_ID=price_xxx
```

3) Start the app and Stripe CLI
- Start Next.js:
```powershell
npm run dev
```
- Install and login with Stripe CLI (if not installed). On Windows you can install via npm or the Stripe downloads page.
```powershell
npm install -g stripe-cli
stripe login
stripe listen --forward-to http://localhost:3000/api/webhook
```
When `stripe listen` runs it will show a `Webhook signing secret:`. Copy that value into `STRIPE_WEBHOOK_SECRET` in `.env.local`.

4) Test a donation (Test mode)
- Visit `http://localhost:3000/donate` and create a donation using a test card like `4242 4242 4242 4242`.
- Confirm `stripe listen` shows a `checkout.session.completed` event and the dev server handles it.
- Check `data/donations.json` to see the appended record.

5) Production checklist (before going live)
- Switch keys in production to Live keys in the Dashboard.
- Create a webhook endpoint in Dashboard pointing to `https://your-site.com/api/webhook` and copy the live `whsec_...` into PROD env.
- Enable email receipts and complete identity/business verification to receive payouts.

Security notes
- Never commit `.env.local` to source control.
- Use environment secrets in deployment platforms (Vercel, Netlify, etc.) and keep keys out of logs.
