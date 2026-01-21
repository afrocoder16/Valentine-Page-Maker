import Link from "next/link";
import { buttonClasses } from "@/components/Button";
import { getBuilderTheme } from "@/lib/builder/config";
import { coerceBuilderDoc } from "@/lib/builder/storage";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getTemplateById, type TemplateId } from "@/data/templates";
import type { TemplateRenderer } from "@/lib/builder/types";
import CuteClassicRenderer from "@/templates/renderers/CuteClassicRenderer";
import MidnightMuseRenderer from "@/templates/renderers/MidnightMuseRenderer";

const renderers: Partial<Record<TemplateId, TemplateRenderer>> = {
  "cute-classic": CuteClassicRenderer,
  "midnight-muse": MidnightMuseRenderer,
};

type RecipientPageProps = {
  params: Promise<{ slug?: string }>;
};

export default async function RecipientPage({ params }: RecipientPageProps) {
  const resolvedParams = await params;
  const slug = typeof resolvedParams.slug === "string" ? resolvedParams.slug : null;

  if (!slug) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-amber-50 to-rose-100 px-6 py-16">
        <div className="w-full max-w-xl rounded-[2.5rem] bg-white/90 p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            Share link
          </p>
          <h1 className="mt-4 font-display text-3xl text-slate-900 md:text-4xl">
            We could not find that Valentine.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Double-check the link or browse templates to make your own.
          </p>
          <Link href="/templates" className={`${buttonClasses("primary")} mt-6`}>
            Browse templates
          </Link>
        </div>
      </main>
    );
  }

  const supabase = getSupabaseServerClient();
  const { data, error } = await supabase
    .from("pages")
    .select("slug, template_id, doc, status")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error || !data) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-amber-50 to-rose-100 px-6 py-16">
        <div className="w-full max-w-xl rounded-[2.5rem] bg-white/90 p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            Share link
          </p>
          <h1 className="mt-4 font-display text-3xl text-slate-900 md:text-4xl">
            This Valentine is not available.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            It may have been unpublished or the link is incorrect.
          </p>
          <Link href="/templates" className={`${buttonClasses("primary")} mt-6`}>
            Browse templates
          </Link>
        </div>
      </main>
    );
  }

  const templateId = data.template_id as TemplateId;
  const template = getTemplateById(templateId);
  if (!template) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-rose-100 via-amber-50 to-rose-100 px-6 py-16">
        <div className="w-full max-w-xl rounded-[2.5rem] bg-white/90 p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            Share link
          </p>
          <h1 className="mt-4 font-display text-3xl text-slate-900 md:text-4xl">
            We could not find that template.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Pick another style and we will load its demo preview.
          </p>
          <Link href="/templates" className={`${buttonClasses("primary")} mt-6`}>
            Browse templates
          </Link>
        </div>
      </main>
    );
  }

  const theme = getBuilderTheme(templateId);
  const doc = coerceBuilderDoc(templateId, data.doc);
  const Renderer = renderers[templateId] ?? CuteClassicRenderer;

  return (
    <main className={`relative min-h-screen bg-gradient-to-br ${theme.gradient}`}>
      <div className="pointer-events-none absolute inset-0 opacity-30">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: "url('/textures/noise.png')",
            backgroundRepeat: "repeat",
          }}
        />
      </div>
      <div className="relative w-full">
        <Renderer doc={doc} theme={theme} mode="desktop" context="published" />
      </div>
      <footer className="relative pb-10 text-center text-xs uppercase tracking-[0.3em] text-white/80">
        Made with BeMyValentine
      </footer>
    </main>
  );
}
