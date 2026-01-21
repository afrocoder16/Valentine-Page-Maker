import { getTemplates } from "@/data/templates";
import TemplateGallery from "@/components/TemplateGallery";

export default function TemplatesPage() {
  const templates = getTemplates();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
          Templates
        </p>
        <h1 className="mt-3 font-display text-4xl text-slate-900 md:text-5xl">
          Choose a vibe to start.
        </h1>
        <p className="mt-4 text-lg text-slate-600 md:text-xl">
          Pick a template, then add your photos, music, and message.
        </p>
      </section>
      <section className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <TemplateGallery templates={templates} />
      </section>
    </main>
  );
}
