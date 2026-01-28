"use client";

import { Fragment } from "react";
import { useReducedMotion } from "framer-motion";

const steps = [
  {
    title: "Pick a template",
    text: "Choose a style that matches your vibe.",
  },
  {
    title: "Build it",
    text: "Add your words, photos, and music. Drag to reorder and make it feel like you.",
  },
  {
    title: "Preview it",
    text: "Best on laptop or iPad. On phone, tap Preview to see exactly what your person will see.",
  },
  {
    title: "Publish + share",
    text: "Get a private link and send it when the moment feels right.",
  },
];

const ArrowGraphic = ({
  orientation,
  animate,
}: {
  orientation: "horizontal" | "vertical";
  animate: boolean;
}) => {
  const isHorizontal = orientation === "horizontal";
  return (
    <div
      className={`flex ${isHorizontal ? "w-16" : "h-12"} items-center justify-center`}
    >
      <svg
        width={isHorizontal ? 64 : 24}
        height={isHorizontal ? 24 : 64}
        viewBox={isHorizontal ? "0 0 64 24" : "0 0 24 64"}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={
          animate
            ? {
                animation: "arrowFloat 3s ease-in-out infinite",
              }
            : undefined
        }
        className="text-rose-400"
      >
        <path
          d={
            isHorizontal
              ? "M4 12H60M56 8l4 4-4 4M8 8L4 12l4 4"
              : "M12 4V60M8 56l4 4 4-4M8 8l4-4 4 4"
          }
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
  );
};

export default function StepGuideSection() {
  const prefersReduce = useReducedMotion();

  return (
    <section className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="rounded-[3rem] bg-white/80 p-8 shadow-soft md:p-12">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
            How it works
          </p>
          <h2 className="mt-3 font-display text-3xl text-[var(--ink)]">
            How it works
          </h2>
          <p className="mt-3 text-sm text-[var(--muted)]">
            Build a page in minutes. No account needed.
          </p>
        </div>
        <div className="mt-10 flex flex-col gap-6 md:flex-row md:items-start md:gap-6">
          {steps.map((step, index) => (
            <Fragment key={step.title}>
              <div className="flex-1">
                <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-soft">
                  <p className="text-xs font-semibold uppercase tracking-[0.4em] text-rose-400">
                    Step {index + 1}
                  </p>
                  <h3 className="mt-3 font-display text-2xl text-[var(--ink)]">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-sm text-[var(--muted)]">{step.text}</p>
                </div>
              </div>
              {index < steps.length - 1 && (
                <>
                  <div
                    className="md:hidden flex justify-center"
                    style={{ marginBottom: 4 }}
                  >
                    <ArrowGraphic
                      orientation="vertical"
                      animate={!prefersReduce}
                    />
                  </div>
                  <div
                    className="hidden md:flex items-center justify-center self-center"
                    style={{ transform: "translateY(6px)" }}
                  >
                    <ArrowGraphic
                      orientation="horizontal"
                      animate={!prefersReduce}
                    />
                  </div>
                </>
              )}
            </Fragment>
          ))}
        </div>
        <p className="mt-6 text-xs font-semibold text-rose-500/80">
          Tip: You can reset anytime and keep editing until it’s perfect.
        </p>
      </div>
    </section>
  );
}
