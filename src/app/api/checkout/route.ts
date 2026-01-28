import { NextResponse } from "next/server";
import { TEMPLATE_IDS, type TemplateId } from "@/data/templates";
import type { PlanId } from "@/lib/builder/planRules";
import { getPlanRules, isTemplateAllowed } from "@/lib/builder/planRules";
import { coerceBuilderDoc } from "@/lib/builder/storage";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { validateDocShape } from "@/lib/publish/validation";

export const runtime = "nodejs";

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

  const origin = request.headers.get("origin");
  const siteUrl = origin ?? process.env.NEXT_PUBLIC_SITE_URL ?? "";
  if (!siteUrl) {
    return NextResponse.json(
      { error: "missing_env", message: "Missing site URL environment variable." },
      { status: 500 }
    );
  }

  try {
    const supabase = getSupabaseServiceClient();
    const { error } = await supabase.from("pending_publishes").insert({
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

    return NextResponse.json({
      message:
        "The checkout link is now free—thank you for sharing the love. Spread the story, and feel free to buy me a coffee via Cash App @sam16 if it moved you.",
      shareUrl: `${siteUrl}/publish/success`,
      free: true,
      supportLink: "https://cash.app/$sam16",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "publish_error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to register publish request.",
      },
      { status: 500 }
    );
  }
}
