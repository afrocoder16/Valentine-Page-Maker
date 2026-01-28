import { NextResponse } from "next/server";
import { TEMPLATE_IDS, type TemplateId } from "@/data/templates";
import { coerceBuilderDoc } from "@/lib/builder/storage";
import { publishWithService } from "@/lib/publish/server";
import { validateDocShape } from "@/lib/publish/validation";

export const runtime = "nodejs";

type PublishRequestBody = {
  templateId?: unknown;
  doc?: unknown;
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
  const normalizedDoc = coerceBuilderDoc(templateId, doc);

  try {
    const result = await publishWithService({
      templateId,
      doc: normalizedDoc,
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
