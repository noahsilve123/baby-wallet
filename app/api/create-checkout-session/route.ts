import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripeSecretKey = process.env.STRIPE_SECRET_KEY

if (!stripeSecretKey) {
	console.warn('STRIPE_SECRET_KEY is not set. Stripe Checkout will not work until it is configured.')
}

const stripe = stripeSecretKey ? new Stripe(stripeSecretKey) : undefined

export async function POST(req: Request) {
	if (!stripe) {
		return NextResponse.json({ error: 'Stripe is not configured.' }, { status: 500 })
	}

	const origin = req.headers.get('origin') ?? new URL(req.url).origin

	let payload: { amount?: number; note?: string } = {}
	try {
		payload = await req.json()
	} catch (error) {
		console.debug('Donation request received without JSON body.', error)
	}

	const amount = typeof payload.amount === 'number' ? payload.amount : 0
	if (!Number.isFinite(amount) || amount < 5) {
		return NextResponse.json({ error: 'Minimum online donation is $5.' }, { status: 400 })
	}

	const note = typeof payload.note === 'string' ? payload.note.slice(0, 250) : undefined

	try {
		const session = await stripe.checkout.sessions.create({
			mode: 'payment',
			payment_method_types: ['card'],
			line_items: [
				{
					price_data: {
						currency: 'usd',
						product_data: {
							name: 'Destination College Donation',
							description: 'Scholarship and program support for Summit High School students',
						},
						unit_amount: Math.round(amount * 100),
					},
					quantity: 1,
				},
			],
			allow_promotion_codes: true,
			success_url: `${origin}/donate?success=1`,
			cancel_url: `${origin}/donate?canceled=1`,
			metadata: note ? { note } : undefined,
		})

		return NextResponse.json({ url: session.url })
	} catch (error) {
		console.error('Stripe Checkout session error:', error)
		return NextResponse.json({ error: 'Unable to start checkout session.' }, { status: 500 })
	}
}
