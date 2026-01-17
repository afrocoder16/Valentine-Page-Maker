import Link from "next/link";
import { templates } from "@/lib/templates";
import { buttonClasses } from "@/components/Button";
import TemplateCard from "@/components/TemplateCard";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
      <section className="grid items-center gap-12 rounded-[3rem] bg-white/70 p-8 shadow-soft md:p-12 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.4em] text-rose-400">
            Valentine page maker
          </p>
          <h1 className="mt-4 font-display text-4xl leading-tight text-slate-900 md:text-6xl">
            Make a Valentine page in 60 seconds.
          </h1>
          <p className="mt-5 text-lg text-slate-600 md:text-xl">
            Pick a template, add photos + music, share a link.
          </p>
          <p className="mt-3 text-sm text-slate-500">
            Free to preview. No login.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/templates" className={buttonClasses("primary")}>
              Browse templates
            </Link>
            <Link
              href="/builder?template=cute-classic"
              className={buttonClasses("outline")}
            >
              Start building
            </Link>
          </div>
          <div className="mt-4">
            <button className="rounded-lg bg-pink-600 px-4 py-2 text-sm font-semibold text-white shadow">
              Tailwind test
            </button>
          </div>
        </div>
        <div className="glass-card rounded-[2.5rem] border-0 bg-white/60 p-6">
          <div className="rounded-3xl bg-white/70 p-6">
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.3em] text-slate-500">
              <span>Live preview</span>
              <span>In 60 sec</span>
            </div>
            <div className="mt-6 h-72 rounded-[2rem] bg-gradient-to-br from-rose-200 via-amber-100 to-pink-200 shadow-soft" />
            <div className="mt-6 space-y-2 text-sm text-slate-600">
              <p>Tap to add photos, drop in a song, press publish.</p>
              <p className="text-slate-500">
                Your link is ready to share instantly.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="mt-20 grid gap-6 md:grid-cols-3">
        {[
          {
            title: "Pick a template",
            text: "Choose a style that matches your story and vibe.",
          },
          {
            title: "Add photos + music",
            text: "Drop in your favorite moments and a soundtrack.",
          },
          {
            title: "Get link + QR",
            text: "Share instantly or schedule the perfect reveal.",
          },
        ].map((step, index) => (
          <div
            key={step.title}
            className="rounded-3xl bg-white/80 p-6 shadow-soft"
          >
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-rose-100 text-sm font-semibold text-rose-600">
              {index + 1}
            </span>
            <h3 className="mt-4 font-display text-2xl text-slate-900">
              {step.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{step.text}</p>
          </div>
        ))}
      </section>

      <section className="mt-20">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
              Template previews
            </p>
            <h2 className="mt-3 font-display text-3xl text-slate-900">
              Pick your look, then make it yours.
            </h2>
          </div>
          <Link href="/templates" className={buttonClasses("ghost")}>
            See all templates
          </Link>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {templates.slice(0, 5).map((template) => (
            <TemplateCard key={template.id} template={template} compact />
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
              Loved by couples
            </p>
            <h2 className="mt-3 font-display text-3xl text-slate-900">
              Social proof (placeholder).
            </h2>
          </div>
        </div>
        <div className="mt-8 grid gap-6 md:grid-cols-3">
          {[
            "Placeholder quote about the sweetest reveal.",
            "Placeholder note about how easy it was to build.",
            "Placeholder praise for the templates and vibes.",
          ].map((quote, index) => (
            <div
              key={quote}
              className="rounded-3xl bg-white/80 p-6 shadow-soft"
            >
              <p className="text-sm text-slate-600">{quote}</p>
              <p className="mt-4 text-xs uppercase tracking-[0.3em] text-slate-400">
                Placeholder #{index + 1}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <div className="rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-8 py-12 text-white shadow-soft">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-200">
                Ready to build?
              </p>
              <h2 className="mt-3 font-display text-3xl text-white">
                Make your Valentine page today.
              </h2>
              <p className="mt-3 text-sm text-rose-100">
                Preview it free. Publish when it feels perfect.
              </p>
            </div>
            <Link
              href="/templates"
              className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 transition hover:-translate-y-0.5 hover:bg-rose-50"
            >
              Browse templates
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
