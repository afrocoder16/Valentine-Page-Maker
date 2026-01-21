import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

const isValidPlan = (value: unknown) => value === "normal" || value === "pro";

export async function POST(request: Request) {
  const stripeSecret = process.env.STRIPE_SECRET_KEY ?? "";
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? "";

  if (!stripeSecret || !webhookSecret) {
    return NextResponse.json(
      {
        error: "missing_env",
        message: "Stripe env vars are missing.",
      },
      { status: 500 }
    );
  }

  const signature = request.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json(
      { error: "missing_signature", message: "Missing Stripe signature." },
      { status: 400 }
    );
  }

  const payload = await request.text();
  const stripe = new Stripe(stripeSecret, { apiVersion: "2024-06-20" });

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(payload, signature, webhookSecret);
  } catch (error) {
    return NextResponse.json(
      {
        error: "invalid_signature",
        message:
          error instanceof Error ? error.message : "Invalid webhook signature.",
      },
      { status: 400 }
    );
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const plan = session.metadata?.plan;
    if (isValidPlan(plan)) {
      const status = session.payment_status === "paid" ? "active" : "inactive";
      const customerEmail =
        session.customer_details?.email ?? session.customer_email ?? null;

      let supabase;
      try {
        supabase = getSupabaseServiceClient();
      } catch (error) {
        return NextResponse.json(
          {
            error: "missing_service_key",
            message:
              error instanceof Error ? error.message : "Service key missing.",
          },
          { status: 500 }
        );
      }

      const now = new Date().toISOString();
      const { error } = await supabase.from("entitlements").upsert(
        {
          session_id: session.id,
          plan,
          status,
          customer_email: customerEmail,
          updated_at: now,
          created_at: now,
        },
        { onConflict: "session_id" }
      );

      if (error) {
        return NextResponse.json(
          {
            error: "entitlement_failed",
            message: error.message ?? "Failed to update entitlements.",
            code: error.code,
          },
          { status: 500 }
        );
      }
    }
  }

  return NextResponse.json({ received: true });
}
