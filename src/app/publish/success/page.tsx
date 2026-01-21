import Link from "next/link";
import { buttonClasses } from "@/components/Button";
import { TEMPLATE_IDS, type TemplateId } from "@/data/templates";
import { coerceBuilderDoc } from "@/lib/builder/storage";
import { publishWithService } from "@/lib/publish/server";
import { getSupabaseServiceClient } from "@/lib/supabase/service";
import PublishSuccessClient from "./PublishSuccessClient";

type PublishSuccessPageProps = {
  searchParams: Promise<{ session_id?: string }>;
};

const renderMessage = (title: string, message: string) => (
  <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-amber-50 to-rose-100 px-6 py-16">
    <div className="w-full max-w-xl rounded-[2.5rem] bg-white/90 p-8 text-center shadow-soft">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
        Publish
      </p>
      <h1 className="mt-4 font-display text-3xl text-slate-900 md:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-sm text-slate-600">{message}</p>
      <Link href="/templates" className={`${buttonClasses("primary")} mt-6`}>
        Browse templates
      </Link>
    </div>
  </main>
);

export default async function PublishSuccessPage({
  searchParams,
}: PublishSuccessPageProps) {
  const resolvedParams = await searchParams;
  const sessionId =
    typeof resolvedParams.session_id === "string"
      ? resolvedParams.session_id
      : null;

  if (!sessionId) {
    return renderMessage(
      "Missing checkout session",
      "We could not confirm your payment. Please try again."
    );
  }

  let supabase;
  try {
    supabase = getSupabaseServiceClient();
  } catch (error) {
    return renderMessage(
      "Server configuration missing",
      error instanceof Error ? error.message : "Service key missing."
    );
  }

  const { data: entitlement, error: entitlementError } = await supabase
    .from("entitlements")
    .select("plan, status")
    .eq("session_id", sessionId)
    .eq("status", "active")
    .maybeSingle();

  if (entitlementError || !entitlement) {
    return renderMessage(
      "Payment not verified",
      "We could not confirm your payment yet. Please refresh in a minute."
    );
  }

  const { data: existing } = await supabase
    .from("pages")
    .select("slug")
    .eq("entitlement_session_id", sessionId)
    .maybeSingle();

  let slug: string | null = existing?.slug ?? null;

  if (!slug) {
    const { data: pending, error: pendingError } = await supabase
      .from("pending_publishes")
      .select("template_id, doc")
      .eq("session_id", sessionId)
      .maybeSingle();

    if (pendingError || !pending) {
      return renderMessage(
        "Draft not found",
        "We could not find your draft. Try publishing again from the builder."
      );
    }

    const templateId = pending.template_id as TemplateId;
    if (!TEMPLATE_IDS.includes(templateId)) {
      return renderMessage(
        "Template missing",
        "We could not load your template. Please try again."
      );
    }

    const doc = coerceBuilderDoc(
      templateId,
      pending.doc as Record<string, unknown>
    );

    try {
      const result = await publishWithService({
        templateId,
        doc,
        entitlementSessionId: sessionId,
      });
      slug = result.slug;
      await supabase
        .from("pending_publishes")
        .delete()
        .eq("session_id", sessionId);
    } catch (error) {
      return renderMessage(
        "Publish failed",
        error instanceof Error ? error.message : "Publish failed."
      );
    }
  }

  if (!slug) {
    return renderMessage(
      "Publish failed",
      "We could not generate your share link. Please try again."
    );
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-amber-50 to-rose-100 px-6 py-16">
      <div className="w-full max-w-xl rounded-[2.5rem] bg-white/90 p-8 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
          Success
        </p>
        <h1 className="mt-4 font-display text-3xl text-slate-900 md:text-4xl">
          Your Valentine is live
        </h1>
        <p className="mt-3 text-sm text-slate-600">
          Share the link below with your person.
        </p>
        <PublishSuccessClient
          sessionId={sessionId}
          sharePath={`/v/${slug}`}
        />
      </div>
    </main>
  );
}
