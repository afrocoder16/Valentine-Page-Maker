import Link from "next/link";
import { templates } from "@/lib/templates";
import { buttonClasses } from "@/components/Button";

type BuilderPageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function BuilderPage({ searchParams }: BuilderPageProps) {
  const resolvedParams = await searchParams;
  const templateId =
    typeof resolvedParams.template === "string"
      ? resolvedParams.template
      : null;
  const selectedTemplate = templates.find(
    (template) => template.id === templateId
  );

  if (!selectedTemplate) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
        <div className="rounded-[2.5rem] bg-white/80 p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            Builder
          </p>
          <h1 className="mt-4 font-display text-3xl text-slate-900 md:text-4xl">
            Choose a template to start building.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Pick a style and we will load the builder placeholder.
          </p>
          <Link href="/templates" className={`${buttonClasses("primary")} mt-6`}>
            Browse templates
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
      <section className="grid items-center gap-8 lg:grid-cols-[1fr_1.1fr]">
        <div className="rounded-3xl bg-white/80 p-6 text-center shadow-soft lg:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            Selected template
          </p>
          <h1 className="mt-4 font-display text-4xl text-slate-900">
            {selectedTemplate.name}
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            {selectedTemplate.vibe}
          </p>
          <p className="mt-4 text-sm text-slate-600">
            {selectedTemplate.description}
          </p>
          <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
            <button className={buttonClasses("primary")} disabled>
              Continue
            </button>
            <Link href="/templates" className={buttonClasses("ghost")}>
              Change template
            </Link>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] p-6">
          <div className="rounded-[2rem] bg-white/80 p-6">
            <div className="mx-auto h-[420px] w-[220px] rounded-[2.5rem] bg-gradient-to-br from-rose-200 via-amber-100 to-pink-200 shadow-soft" />
            <p className="mt-4 text-center text-sm text-slate-500">
              Preview placeholder (phone mock)
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
