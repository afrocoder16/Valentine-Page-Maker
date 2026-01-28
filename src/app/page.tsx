"use client";

import Link from "next/link";
import Hero from "@/components/Hero";
import LoveNotes from "@/components/LoveNotes";
import StepGuideSection from "@/components/StepGuideSection";
import TemplateCard from "@/components/TemplateCard";
import { buttonClasses } from "@/components/Button";
import { getTemplates } from "@/data/templates";

export default function Home() {
  const templates = getTemplates();

  return (
    <main className="bg-[var(--cream)] min-h-screen text-[var(--ink)]">
      <Hero />
      <StepGuideSection />
      <section id="templates" className="mx-auto w-full max-w-6xl space-y-6 px-6 pb-32 pt-10">
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
    </main>
  );
}
