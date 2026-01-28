"use client";

import Link from "next/link";
import Hero from "@/components/Hero";
import LoveNotes from "@/components/LoveNotes";
import TemplateCard from "@/components/TemplateCard";
import { buttonClasses } from "@/components/Button";
import { getTemplates } from "@/data/templates";

const steps = [
  {
    title: "Pick a template",
    text: "Choose a style that matches your story and vibe.",
  },
  {
    title: "Make it yours",
    text: "Add your photos, music, and words that feel like you.",
  },
  {
    title: "Share instantly",
    text: "Send a link or QR so your moment can be replayed.",
  },
];

export default function Home() {
  const templates = getTemplates();

  return (
    <main className="bg-[var(--cream)] min-h-screen text-[var(--ink)]">
      <Hero />
      <section className="mx-auto w-full max-w-6xl space-y-8 px-6 pb-32 pt-10">
        <div className="grid gap-6 md:grid-cols-3">
          <div className="rounded-[2.25rem] border border-white/80 bg-white/80 p-6 shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
              Why it matters
            </p>
            <h2 className="mt-4 font-display text-3xl text-[var(--ink)]">
              Make a Valentine page in 60 seconds.
            </h2>
            <p className="mt-3 text-sm text-[var(--muted)]">
              Instant sharing, ambient textures, and guided buildup so your story glows.
            </p>
            <div className="mt-4 flex gap-3">
              <Link href="/templates" className={`${buttonClasses("primary")} px-4 py-2 text-xs`}>
                Browse templates
              </Link>
              <Link href="/build" className={`${buttonClasses("outline")} px-4 py-2 text-xs`}>
                Start building
              </Link>
            </div>
          </div>
          {steps.map((step) => (
            <div
              key={step.title}
              className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-soft"
            >
              <h3 className="font-display text-2xl text-[var(--ink)]">{step.title}</h3>
              <p className="mt-3 text-sm text-[var(--muted)]">{step.text}</p>
            </div>
          ))}
        </div>

        <section id="templates" className="space-y-6">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                Templates
              </p>
              <h3 className="font-display text-3xl text-[var(--ink)]">
                Pick a vibe and let it glow.
              </h3>
            </div>
            <Link href="/templates" className={buttonClasses("ghost")}>
              See all templates
            </Link>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {templates.map((template) => (
              <TemplateCard key={template.id} template={template} compact />
            ))}
          </div>
        </section>

        <LoveNotes />
      </section>
    </main>
  );
}
