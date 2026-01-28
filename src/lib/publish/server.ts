import type { TemplateId } from "@/data/templates";
import type { BuilderDoc } from "@/lib/builder/types";
import { getSupabaseServiceClient } from "@/lib/supabase/service";

const SLUG_LENGTH = 8;
const MAX_ATTEMPTS = 4;

const generateSlug = () => {
  const alphabet = "abcdefghjkmnpqrstuvwxyz23456789";
  let slug = "";
  for (let i = 0; i < SLUG_LENGTH; i += 1) {
    slug += alphabet[Math.floor(Math.random() * alphabet.length)];
  }
  return slug;
};

export const publishWithService = async ({
  templateId,
  doc,
  entitlementSessionId,
}: {
  templateId: TemplateId;
  doc: BuilderDoc;
  entitlementSessionId?: string;
}) => {
  const supabase = getSupabaseServiceClient();

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt += 1) {
    const slug = generateSlug();
    const now = new Date().toISOString();
    const { error } = await supabase.from("pages").insert({
      slug,
      template_id: templateId,
      doc,
      status: "published",
      created_at: now,
      updated_at: now,
      entitlement_session_id: entitlementSessionId ?? null,
    });

    if (!error) {
      return { slug };
    }

    if (error.code !== "23505") {
      const err = new Error(error.message ?? "Publish failed.");
      (err as Error & { code?: string }).code = error.code ?? undefined;
      throw err;
    }
  }

  throw new Error("Unable to generate a unique link. Please try again.");
};
