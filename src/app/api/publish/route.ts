import { NextResponse } from "next/server";
import { TEMPLATE_IDS, type TemplateId } from "@/data/templates";
import { canPublish } from "@/lib/builder/publishRules";
import type { PlanId } from "@/lib/builder/planRules";
import { coerceBuilderDoc } from "@/lib/builder/storage";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import { publishWithService } from "@/lib/publish/server";
import { validateDocShape } from "@/lib/publish/validation";

export const runtime = "nodejs";

type PublishRequestBody = {
  templateId?: unknown;
  doc?: unknown;
  sessionId?: unknown;
};

const isValidTemplateId = (value: unknown): value is TemplateId =>
  typeof value === "string" && TEMPLATE_IDS.includes(value as TemplateId);

export async function POST(request: Request) {
  let payload: PublishRequestBody | null = null;
  try {
    payload = (await request.json()) as PublishRequestBody;
  } catch {
    return NextResponse.json(
      { error: "invalid_body", message: "Invalid JSON body." },
      { status: 400 }
    );
  }

  if (!payload || !isValidTemplateId(payload.templateId)) {
    return NextResponse.json(
      { error: "invalid_template", message: "Invalid template." },
      { status: 400 }
    );
  }

  if (!payload.doc || typeof payload.doc !== "object") {
    return NextResponse.json(
      { error: "invalid_doc", message: "Invalid document." },
      { status: 400 }
    );
  }

  const doc = payload.doc as Record<string, unknown>;
  const validationError = validateDocShape(doc);
  if (validationError) {
    return NextResponse.json(
      { error: "invalid_doc", message: validationError },
      { status: 400 }
    );
  }

  const templateId = payload.templateId;
  const sessionId =
    typeof payload.sessionId === "string" ? payload.sessionId : "";

  if (!sessionId) {
    return NextResponse.json(
      {
        error: "payment_required",
        message: "Payment required to publish.",
      },
      { status: 402 }
    );
  }

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

  const { data: entitlement, error: entitlementError } = await supabase
    .from("entitlements")
    .select("plan, status")
    .eq("session_id", sessionId)
    .eq("status", "active")
    .maybeSingle();

  if (entitlementError || !entitlement) {
    return NextResponse.json(
      {
        error: "payment_required",
        message: "Payment required to publish.",
      },
      { status: 402 }
    );
  }

  const { data: existingPage, error: existingError } = await supabase
    .from("pages")
    .select("slug")
    .eq("entitlement_session_id", sessionId)
    .maybeSingle();

  if (existingError) {
    return NextResponse.json(
      {
        error: "publish_failed",
        message: existingError.message ?? "Publish failed.",
        code: existingError.code,
      },
      { status: 500 }
    );
  }

  if (existingPage) {
    return NextResponse.json(
      {
        error: "entitlement_used",
        message: "This purchase already generated a share link.",
      },
      { status: 409 }
    );
  }

  const plan = entitlement.plan as PlanId | null;
  const normalizedDoc = coerceBuilderDoc(templateId, doc);
  const gate = canPublish(normalizedDoc, templateId, plan);
  if (!gate.allowed) {
    return NextResponse.json(
      {
        error: gate.paymentRequired ? "payment_required" : "upgrade_required",
        message: gate.reason ?? "Upgrade required to publish.",
        needed: gate.neededPlan,
        photoCount: gate.photoCount,
        maxPhotos: gate.maxPhotos,
      },
      { status: 402 }
    );
  }

  try {
    const result = await publishWithService({
      templateId,
      doc: normalizedDoc,
      entitlementSessionId: sessionId,
    });
    return NextResponse.json({ slug: result.slug, url: `/v/${result.slug}` });
  } catch (error) {
    return NextResponse.json(
      {
        error: "publish_failed",
        message:
          error instanceof Error ? error.message : "Publish failed.",
        code:
          error instanceof Error && "code" in error
            ? (error as Error & { code?: string }).code
            : undefined,
      },
      { status: 500 }
    );
  }
}
