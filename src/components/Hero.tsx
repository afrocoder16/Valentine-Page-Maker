"use client";

import Link from "next/link";
import type { CSSProperties } from "react";
import { useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import styles from "./Hero.module.css";

type Vibe = {
  id: string;
  label: string;
  gradient: string;
  bloom: string;
  copy: string;
  sliderColor: string;
  petals: number;
};

const vibes: Vibe[] = [
  {
    id: "cozy",
    label: "Cozy",
    gradient: "linear-gradient(135deg, #FFF7F6 15%, #ffe7df 50%, #ffd8c5)",
    bloom: "rgba(247, 182, 194, 0.35)",
    copy: "Soft photos, warm words, and a little safe place.",
    sliderColor: "#F7B6C2",
    petals: 8,
  },
  {
    id: "flirty",
    label: "Flirty",
    gradient: "linear-gradient(135deg, #fff3f3 10%, #ffccd1 55%, #ffd2b8)",
    bloom: "rgba(247, 182, 194, 0.55)",
    copy: "A playful note, a song, and one bold question.",
    sliderColor: "#FF8DA2",
    petals: 10,
  },
  {
    id: "deep",
    label: "Deep",
    gradient: "linear-gradient(135deg, #ffeef2 15%, #f9b3c0 55%, #ffc9c0)",
    bloom: "rgba(231, 89, 105, 0.55)",
    copy: "The kind of page that makes someone pause.",
    sliderColor: "#E74B63",
    petals: 12,
  },
  {
    id: "wild",
    label: "Wild",
    gradient: "linear-gradient(135deg, #ffedf0 20%, #ffa0b3 55%, #ffd9c8)",
    bloom: "rgba(231, 89, 105, 0.75)",
    copy: "Cute chaos, inside jokes, and a YES button with confidence.",
    sliderColor: "#D93E56",
    petals: 14,
  },
];

const driftSeed = [
  { top: 12, left: 14 },
  { top: 22, left: 65 },
  { top: 32, left: 43 },
  { top: 44, left: 70 },
  { top: 55, left: 18 },
  { top: 60, left: 52 },
  { top: 72, left: 35 },
  { top: 80, left: 60 },
  { top: 18, left: 32 },
  { top: 38, left: 85 },
  { top: 50, left: 10 },
  { top: 65, left: 75 },
];

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();
  const [activeVibeId, setActiveVibeId] = useState(vibes[0].id);
  const activeVibe = vibes.find((vibe) => vibe.id === activeVibeId) ?? vibes[0];
  const activeIndex = vibes.findIndex((vibe) => vibe.id === activeVibeId);

  const driftElements = useMemo(() => {
    if (prefersReducedMotion) {
      return [];
    }
    const total = Math.min(activeVibe.petals, driftSeed.length);
    return Array.from({ length: total }, (_, index) => {
      const seed = driftSeed[index % driftSeed.length];
      return {
        id: `${activeVibe.id}-${index}`,
        top: `${seed.top + (index % 3) * 2}%`,
        left: `${seed.left + (index % 4) * 1.5}%`,
        size: 4 + (index % 3),
        type: index % 3 === 0 ? "heart" : "petal",
        delay: index * 0.5,
      };
    });
  }, [activeVibe.id, activeVibe.petals, prefersReducedMotion]);

  const sliderPercent =
    (activeIndex / Math.max(vibes.length - 1, 1)) * 100;

  const bloomAnimation = prefersReducedMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1, transition: { duration: 0.6 } } }
    : { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1.3, transition: { duration: 1.8, ease: "easeOut" } } };

  const thumbTransition = prefersReducedMotion
    ? { duration: 0 }
    : { type: "spring", stiffness: 210, damping: 30 };

  const highlightCards = [
    {
      title: "Guided story path",
      copy: "Pick a vibe, add photos, and let the warmth bloom into a story.",
    },
    {
      title: "Ambient textures",
      copy: "Soft grain, glow, and petals that animate gently around your copy.",
    },
    {
      title: "Ready-to-share",
      copy: "Instant link + QR, autosaves, sensorial touches ready to send.",
    },
  ];

  return (
    <section
      className="bg-[var(--cream)] py-16 sm:py-24"
      style={
        {
          "--cream": "#FFF7F6",
          "--blush": "#FDE3E6",
          "--rose": "#F7B6C2",
          "--peach": "#FFD2B8",
          "--ink": "#17171B",
          "--muted": "rgba(23,23,27,0.68)",
          "--btn": "#E74B63",
          "--btnHover": "#D93E56",
        } as CSSProperties
      }
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div
          className={`${styles.heroCanvas} relative overflow-hidden rounded-[48px] border border-white/80 bg-[var(--cream)]/80 px-6 py-10 shadow-[0_40px_120px_-30px_rgba(15,23,42,0.45)] sm:px-10 sm:py-14`}
          style={{
            backgroundImage: `${activeVibe.gradient}`,
          }}
        >
          <motion.div
            {...bloomAnimation}
            className="pointer-events-none absolute inset-0 rounded-[48px]"
            style={{
              background: `radial-gradient(circle at 20% 35%, ${activeVibe.bloom}, transparent 65%)`,
              filter: "blur(14px)",
            }}
          />

          <div className="absolute inset-0 pointer-events-none">
            {driftElements.map((dot, driftIndex) => (
              <motion.span
                key={dot.id}
                className="absolute"
                style={{
                  top: dot.top,
                  left: dot.left,
                  width: dot.size,
                  height: dot.size,
                  transform: "translate(-50%, -50%)",
                }}
                animate={
                  prefersReducedMotion
                    ? undefined
                    : {
                        y: [0, dot.type === "heart" ? -8 : -6, 0],
                        opacity: [0.2, 0.7, 0.2],
                      }
                }
                transition={
                  prefersReducedMotion
                    ? undefined
                    : {
                        duration: 8 + driftIndex,
                        repeat: Infinity,
                        repeatType: "mirror",
                        ease: "easeInOut",
                        delay: dot.delay,
                      }
                }
              >
                {dot.type === "heart" ? (
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="rgba(255,255,255,0.9)"
                    strokeWidth="1.1"
                    className="h-full w-full"
                  >
                    <path d="M12 20S4 13.667 4 8.667C4 5.667 6 4 8.667 4 10.5 4 12 5.167 12 5.167S13.5 4 15.333 4C18 4 20 5.667 20 8.667 20 13.667 12 20 12 20Z" />
                  </svg>
                ) : (
                  <span className="block h-full w-full rounded-full bg-white/65" />
                )}
              </motion.span>
            ))}
          </div>

          <div className={`${styles.laceDivider}`} />

          <div className="relative z-10 space-y-6 md:space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.1 } }}
              className="flex flex-wrap gap-3 text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-[var(--muted)]"
            >
              {["VALENTINE PAGE MAKER", "NO LOGIN NEEDED", "INSTANT SHARE LINK"].map((label) => (
                <span
                  key={label}
                  className="rounded-full border border-white/70 bg-white/90 px-3 py-1 text-[var(--ink)]"
                >
                  {label}
                </span>
              ))}
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.3 } }}
              className="font-display text-4xl leading-tight tracking-tight text-[var(--ink)] sm:text-5xl"
            >
              Make a Valentine page in 60 seconds.
            </motion.h1>

            <AnimatePresence mode="wait">
              <motion.p
                key={activeVibe.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45 } }}
                exit={{ opacity: 0, y: 16, transition: { duration: 0.35 } }}
                className="max-w-2xl text-lg text-[var(--muted)]"
              >
                {activeVibe.copy}
              </motion.p>
            </AnimatePresence>

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1, transition: { delay: 0.9, duration: 0.6 } }}
              className="text-sm font-semibold uppercase tracking-[0.3em] text-[var(--muted)]"
            >
              They’ll replay it. More than once.
            </motion.p>

            <div className="flex flex-wrap gap-3">
              <Link
                href="/build"
                className="inline-flex items-center justify-center rounded-full bg-[var(--btn)] px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-white shadow-lg transition hover:bg-[var(--btnHover)] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--btn)]"
              >
                Start building
              </Link>
              <Link
                href="/templates"
                className="inline-flex items-center justify-center rounded-full border border-white/70 px-6 py-3 text-sm font-semibold uppercase tracking-[0.3em] text-[var(--ink)] transition hover:bg-white/80 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)]"
              >
                Browse templates
              </Link>
            </div>

            <p className="text-[0.65rem] font-semibold uppercase tracking-[0.4em] text-[var(--muted)]">
              Made for mobile. Share with link or QR.
            </p>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0, transition: { delay: 0.5 } }}
              className="rounded-[32px] border border-white/60 bg-white/70 p-4 shadow-inner backdrop-blur"
            >
              <div className="flex items-center justify-between text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-[var(--muted)]">
                <span>Set the vibe</span>
                <span className="text-[0.7rem] tracking-[0.4em] text-[var(--ink)]">
                  {activeVibe.label}
                </span>
              </div>
              <div className="relative mt-3 h-2 rounded-full bg-white/40">
                <motion.div
                  animate={{ background: activeVibe.gradient }}
                  transition={{ ...thumbTransition }}
                  className="absolute inset-0 rounded-full opacity-80"
                />
                <motion.span
                  className="absolute top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border border-white bg-white shadow-[0_10px_20px_rgba(0,0,0,0.25)]"
                  style={{
                    left: `${sliderPercent}%`,
                    boxShadow: `0 0 15px ${activeVibe.sliderColor}`,
                    transform: "translate(-50%, -50%)",
                  }}
                  transition={thumbTransition}
                />
              </div>
            <div className="mt-4 flex flex-wrap gap-2 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-[var(--muted)]">
                {vibes.map((vibe, index) => (
                  <button
                    key={vibe.id}
                    type="button"
                    aria-pressed={activeVibe.id === vibe.id}
                    onClick={() => setActiveVibeId(vibe.id)}
                    className={`rounded-full px-3 py-1 transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--ink)] ${
                      activeVibe.id === vibe.id
                        ? "bg-white text-[var(--ink)] shadow-lg"
                        : "hover:text-[var(--ink)]"
                    }`}
                  >
                    {vibe.label}
                  </button>
                ))}
              </div>
            </motion.div>
            <motion.div className="mt-8 grid gap-4 sm:grid-cols-3">
              {highlightCards.map((card, index) => (
                <motion.div
                  key={card.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.15 * index } }}
                  className="group relative overflow-hidden rounded-[28px] border border-white/60 bg-white/60 p-4 text-[0.85rem] shadow-[0_20px_60px_-40px_rgba(23,23,27,0.6)] backdrop-blur transition hover:border-white"
                >
                  <span className="absolute inset-0 opacity-0 transition group-hover:opacity-100" />
                  <p className="text-[0.7rem] uppercase tracking-[0.4em] text-[var(--muted)]">Live build</p>
                  <h3 className="mt-2 text-lg font-semibold text-[var(--ink)]">{card.title}</h3>
                  <p className="mt-2 text-[0.8rem] text-[var(--muted)]">{card.copy}</p>
                  <div className={styles.glowOrbit} />
                </motion.div>
              ))}
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
