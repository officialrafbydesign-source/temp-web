import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' });

export async function POST(request: NextRequest) {
  const { beatId, licenseId, price, beatTitle } = await request.json();
  
  try {
    // Create Stripe Checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: `License: ${beatTitle}` },
          unit_amount: price * 100,  // Stripe expects amount in cents
        },
        quantity: 1,
      }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/cancel`,
    });
    
    return NextResponse.json({ ok: true, url: session.url });
  } catch (error) {
    return NextResponse.json({ error: 'Error creating Stripe session: ' + error.message });
  }
}
