import { NextResponse } from "next/server";
import Stripe from "stripe";
import { TEMPLATE_IDS, type TemplateId } from "@/data/templates";
import type { PlanId } from "@/lib/builder/planRules";
import { getPlanRules, isTemplateAllowed } from "@/lib/builder/planRules";
import { coerceBuilderDoc } from "@/lib/builder/storage";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { validateDocShape } from "@/lib/publish/validation";

export const runtime = "nodejs";

const stripeSecret = process.env.STRIPE_SECRET_KEY;
if (!stripeSecret) {
  throw new Error("Missing STRIPE_SECRET_KEY");
}
const stripe = new Stripe(stripeSecret);

type CheckoutRequestBody = {
  plan?: unknown;
  templateId?: unknown;
  docSnapshot?: unknown;
};

const isValidTemplateId = (value: unknown): value is TemplateId =>
  typeof value === "string" && TEMPLATE_IDS.includes(value as TemplateId);

const isValidPlan = (value: unknown): value is PlanId =>
  value === "normal" || value === "pro";

export async function POST(request: Request) {
  const url = new URL(request.url);
  let payload: CheckoutRequestBody | null = null;
  try {
    payload = (await request.json()) as CheckoutRequestBody;
  } catch {
    payload = null;
  }

  const fallbackPlan = url.searchParams.get("plan");
  const receivedPlan = payload?.plan ?? fallbackPlan;
  // Minimal logging to verify payloads in server logs.
  console.log("checkout plan:", receivedPlan ?? "missing");

  if (!isValidPlan(receivedPlan)) {
    return NextResponse.json(
      { error: "Missing or invalid plan" },
      { status: 400 }
    );
  }

  if (!payload) {
    return NextResponse.json(
      { error: "invalid_body", message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (!isValidTemplateId(payload.templateId)) {
    return NextResponse.json(
      { error: "invalid_template", message: "Invalid template." },
      { status: 400 }
    );
  }

  if (!payload.docSnapshot || typeof payload.docSnapshot !== "object") {
    return NextResponse.json(
      { error: "invalid_doc", message: "Invalid document." },
      { status: 400 }
    );
  }

  const doc = payload.docSnapshot as Record<string, unknown>;
  const validationError = validateDocShape(doc);
  if (validationError) {
    return NextResponse.json(
      { error: "invalid_doc", message: validationError },
      { status: 400 }
    );
  }

  const plan = receivedPlan;
  const templateId = payload.templateId;
  const normalizedDoc = coerceBuilderDoc(templateId, doc);
  const rules = getPlanRules(plan);

  if (!isTemplateAllowed(plan, templateId)) {
    return NextResponse.json(
      {
        error: "upgrade_required",
        message: "This template requires Pro.",
        needed: "pro",
      },
      { status: 402 }
    );
  }

  const photoCount = normalizedDoc.photos.filter(
    (photo) => (photo.src ?? "").trim().length > 0
  ).length;
  if (photoCount > rules.maxPhotos) {
    return NextResponse.json(
      {
        error: "upgrade_required",
        message: `This plan allows up to ${rules.maxPhotos} photos.`,
        needed: "pro",
        photoCount,
        maxPhotos: rules.maxPhotos,
      },
      { status: 402 }
    );
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const priceNormal = process.env.STRIPE_PRICE_NORMAL ?? "";
  const pricePro = process.env.STRIPE_PRICE_PRO ?? "";

  if (!siteUrl || !priceNormal || !pricePro) {
    return NextResponse.json(
      {
        error: "missing_env",
        message: "Stripe or site URL env vars are missing.",
      },
      { status: 500 }
    );
  }
  const priceId = plan === "normal" ? priceNormal : pricePro;

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${siteUrl}/publish/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/pricing?canceled=1`,
      metadata: {
        plan,
        templateId,
      },
    });

    if (!session.url || !session.id) {
      return NextResponse.json(
        { error: "stripe_error", message: "Stripe session failed." },
        { status: 500 }
      );
    }

    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("pending_publishes").insert({
      stripe_session_id: session.id,
      template_id: templateId,
      plan,
      doc: normalizedDoc,
      created_at: new Date().toISOString(),
    });

    if (error) {
      return NextResponse.json(
        {
          error: "pending_failed",
          message: error.message ?? "Failed to save pending publish.",
          code: error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    return NextResponse.json(
      {
        error: "stripe_error",
        message:
          error instanceof Error ? error.message : "Stripe session failed.",
      },
      { status: 500 }
    );
  }
}
