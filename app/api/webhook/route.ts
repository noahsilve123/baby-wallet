import Stripe from 'stripe'
import fs from 'fs'
import path from 'path'

export const runtime = 'node'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', { apiVersion: '2022-11-15' })

type DonationRecord = {
  id: string
  amount: number | null
  currency: string | null
  email: string | null
  status: string
  payment_intent: string | null
  createdAt: string
}

async function appendDonation(record: DonationRecord) {
  try {
    const dataPath = path.join(process.cwd(), 'data', 'donations.json')
    let existing: DonationRecord[] = []
    try {
      const raw = fs.readFileSync(dataPath, 'utf8')
      existing = JSON.parse(raw || '[]') as DonationRecord[]
    } catch {
      existing = []
    }
    existing.push(record)
    fs.writeFileSync(dataPath, JSON.stringify(existing, null, 2))
  } catch (e) {
    // don't crash webhook on persistence errors
    console.error('Failed to persist donation', e)
  }
}

export async function POST(req: Request) {
  const sig = req.headers.get('stripe-signature') || ''
  const secret = process.env.STRIPE_WEBHOOK_SECRET || ''

  const buf = Buffer.from(await req.arrayBuffer())
  let event: Stripe.Event
  try {
    event = stripe.webhooks.constructEvent(buf, sig, secret)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown signature error'
    console.error('Webhook signature verification failed.', message)
    return new Response(`Webhook Error: ${message}`, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const record: DonationRecord = {
          id: session.id,
          amount: session.amount_total ?? null,
          currency: session.currency ?? 'usd',
          email: session.customer_details?.email ?? session.customer_email ?? null,
          status: 'completed',
          payment_intent: typeof session.payment_intent === 'string' ? session.payment_intent : null,
          createdAt: new Date().toISOString(),
        }
        await appendDonation(record)
        break
      }
      default:
        // ignore other events for now
        break
    }
  } catch (err) {
    console.error('Error handling webhook event', err)
  }

  return new Response(JSON.stringify({ received: true }), { status: 200 })
}
