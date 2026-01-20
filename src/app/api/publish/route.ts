import { NextResponse } from "next/server";
import { TEMPLATE_IDS, type TemplateId } from "@/data/templates";
import { canPublish } from "@/lib/builder/publishRules";
import { coerceBuilderDoc } from "@/lib/builder/storage";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

export const runtime = "nodejs";

type PublishRequestBody = {
  templateId?: unknown;
  doc?: unknown;
};

const SLUG_LENGTH = 8;
const MAX_ATTEMPTS = 4;
const TITLE_MAX = 140;
const SUBTITLE_MAX = 500;
const MOMENTS_MAX = 12;
const PHOTOS_MAX = 20;

const generateSlug = () => {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let slug = "";
  for (let i = 0; i < SLUG_LENGTH; i += 1) {
    slug += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return slug;
};

const isValidTemplateId = (value: unknown): value is TemplateId =>
  typeof value === "string" && TEMPLATE_IDS.includes(value as TemplateId);

const validateDoc = (doc: Record<string, unknown>) => {
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  if (!title || title.length > TITLE_MAX) {
    return "Title is required and must be under 140 characters.";
  }

  const subtitle = typeof doc.subtitle === "string" ? doc.subtitle : "";
  if (subtitle.length > SUBTITLE_MAX) {
    return "Subtitle is too long.";
  }

  if (!Array.isArray(doc.moments)) {
    return "Moments must be an array.";
  }
  if (doc.moments.length > MOMENTS_MAX) {
    return "Too many moments.";
  }

  if (!Array.isArray(doc.photos)) {
    return "Photos must be an array.";
  }
  if (doc.photos.length > PHOTOS_MAX) {
    return "Too many photos.";
  }

  return null;
};

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
  const validationError = validateDoc(doc);
  if (validationError) {
    return NextResponse.json(
      { error: "invalid_doc", message: validationError },
      { status: 400 }
    );
  }

  const templateId = payload.templateId;
  const normalizedDoc = coerceBuilderDoc(templateId, doc);
  const gate = canPublish(normalizedDoc, templateId);
  if (!gate.allowed) {
    return NextResponse.json(
      {
        error: "upgrade_required",
        message: gate.reason ?? "Upgrade required to publish.",
        photoCount: gate.photoCount,
        maxPhotos: gate.maxPhotos,
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

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const slug = generateSlug();
    const now = new Date().toISOString();
    const { error } = await supabase.from("pages").insert({
      slug,
      template_id: templateId,
      doc: normalizedDoc,
      status: "published",
      created_at: now,
      updated_at: now,
    });

    if (!error) {
      return NextResponse.json({ slug, url: `/v/${slug}` });
    }

    if (error.code !== "23505") {
      return NextResponse.json(
        {
          error: "publish_failed",
          message: error.message ?? "Publish failed.",
          code: error.code,
        },
        { status: 500 }
      );
    }
  }

  return NextResponse.json(
    {
      error: "slug_failed",
      message: "Unable to generate a unique link. Please try again.",
    },
    { status: 500 }
  );
}
