"use client";

import { useEffect, useRef, useState, type CSSProperties } from "react";
import type { TemplateRendererProps } from "@/lib/builder/types";
import {
  resolveBackgroundOverlayClass,
  resolveFontClass,
  resolvePhotoFilterStyle,
  resolveTitleSizeClass,
} from "@/templates/renderers/utils";

type BackgroundStar = {
  id: number;
  top: string;
  left: string;
  size: number;
  delay: number;
  duration: number;
  opacity: number;
};

type ShootingStar = {
  id: number;
  top: string;
  left: string;
  delay: number;
};

type ShowerStar = {
  id: number;
  left: string;
  delay: number;
  size: number;
};

type ConstellationPoint = {
  x: number;
  y: number;
  align: "left" | "right" | "top";
};

const rootStyle = {
  "--starlit-base": "#0a0f22",
  "--starlit-mid": "#1b1533",
  "--starlit-glow": "#b8b9ff",
  "--starlit-ice": "#7dd3fc",
  "--starlit-gold": "#f6d28a",
  "--starlit-white": "#e2e8f0",
  "--starlit-parallax": "0px",
} as CSSProperties;

const CONSTELLATION_POINTS: ConstellationPoint[] = [
  { x: 12, y: 18, align: "right" },
  { x: 26, y: 34, align: "left" },
  { x: 44, y: 28, align: "right" },
  { x: 58, y: 36, align: "left" },
  { x: 72, y: 52, align: "right" },
  { x: 64, y: 66, align: "left" },
  { x: 50, y: 78, align: "right" },
  { x: 34, y: 88, align: "top" },
  { x: 22, y: 74, align: "left" },
  { x: 10, y: 60, align: "right" },
];

const FALLBACK_MOMENTS = [
  "The first hello that started it all.",
  "Our late-night talks that felt endless.",
  "The way you make ordinary days glow.",
  "The tiny adventures that feel like fate.",
  "That look you give me when it is just us.",
  "Shared playlists that feel like constellations.",
  "Quiet routines that keep our orbit steady.",
  "Whispers that sound like destiny aligning.",
  "Serendipitous detours written in the stars.",
  "Every hello that lands like a shooting star.",
];

const createBackgroundStars = (): BackgroundStar[] =>
  Array.from({ length: 42 }, (_, index) => ({
    id: index,
    top: `${Math.random() * 100}%`,
    left: `${Math.random() * 100}%`,
    size: Math.random() * 1.4 + 0.6,
    delay: Math.random() * 6,
    duration: Math.random() * 5 + 4,
    opacity: Math.random() * 0.4 + 0.25,
  }));

const BACKGROUND_STARS = createBackgroundStars();

type AudioControlProps = {
  title: string;
  src: string;
};

function StarlitAudioControl({ title, src }: AudioControlProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }

    const handleEnded = () => setIsPlaying(false);
    audio.addEventListener("ended", handleEnded);
    return () => audio.removeEventListener("ended", handleEnded);
  }, []);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    audio.pause();
    audio.currentTime = 0;
    const reset = window.setTimeout(() => setIsPlaying(false), 0);
    return () => window.clearTimeout(reset);
  }, [src]);

  const handleToggle = async () => {
    const audio = audioRef.current;
    if (!audio) {
      return;
    }
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
      return;
    }
    try {
      await audio.play();
      setIsPlaying(true);
    } catch {
      setIsPlaying(false);
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-slate-100 backdrop-blur">
      <button
        type="button"
        onClick={handleToggle}
        aria-pressed={isPlaying}
        className="rounded-full bg-white/20 px-4 py-2 text-[0.6rem] font-semibold uppercase tracking-[0.35em] text-white transition hover:bg-white/30"
      >
        {isPlaying ? "Pause" : "Play"}
      </button>
      <span className="text-[0.55rem] text-slate-200">
        <span aria-hidden="true">&#9835;</span> {title}
      </span>
      <audio ref={audioRef} src={src} preload="metadata" />
    </div>
  );
}

export default function StarlitConstellationsRenderer({
  doc,
  theme,
  mode,
  context = "builder",
}: TemplateRendererProps) {
  const isPhone = mode === "phone";
  const isPublished = context === "published";
  const fontStyleClass = resolveFontClass(doc.selectedFont);
  const titleSizeClass = resolveTitleSizeClass(doc.titleSize);
  const backgroundOverlayClass = resolveBackgroundOverlayClass(
    doc.backgroundIntensity
  );
  const photoFilterStyle = resolvePhotoFilterStyle(doc.photoMood);
  const containerShadow = isPhone || !isPublished ? "shadow-2xl" : "shadow-none";
  const containerRadius = isPhone
    ? "rounded-[2.5rem]"
    : isPublished
      ? "rounded-none"
      : "rounded-[2rem]";
  const containerHeight = isPhone
    ? "h-full"
    : isPublished
      ? "min-h-screen"
      : "min-h-full";

  const photos = doc.photos.length
    ? [...doc.photos].sort((a, b) => a.order - b.order)
    : Array.from({ length: 5 }, (_, index) => ({
        id: `placeholder-${index + 1}`,
        src: "",
        alt: undefined,
        caption: "",
        order: index,
      }));

  const momentsSource =
    doc.moments.filter((moment) => moment.trim().length > 0).length > 0
      ? doc.moments.filter((moment) => moment.trim().length > 0)
      : FALLBACK_MOMENTS;
  const loveNotes =
    doc.loveNotes && doc.loveNotes.length > 0
      ? doc.loveNotes.filter((note) => note.trim().length > 0)
      : doc.loveNote
        ? [doc.loveNote]
        : [];
  const loveNoteTitles = loveNotes.map(
    (_, index) => doc.loveNoteTitles?.[index]?.trim() || "Love note"
  );
  const perkCards = doc.perkCards.filter(
    (card) => card.title.trim().length > 0 || card.body.trim().length > 0
  );
  const datePlanSteps = doc.datePlanSteps.filter(
    (step) => step.title.trim().length > 0 || step.body.trim().length > 0
  );
  const promiseItems = doc.promiseItems.filter(
    (item) => item.trim().length > 0
  );
  const swoonTags = doc.swoonTags.filter((tag) => tag.trim().length > 0);

  const constellationItems = [
    ...momentsSource.map((moment, index) => {
      const perk = perkCards[index];
      const photo = photos[index];
      const label = moment.trim() || perk?.title?.trim() || `Star ${index + 1}`;
      const detail =
        perk?.body?.trim() ||
        (perk?.title?.trim() && perk.title.trim() !== label ? perk.title.trim() : "") ||
        photo?.caption?.trim() ||
        "";
      return {
        id: `moment-${index}`,
        label,
        detail,
        photo,
      };
    }),
    ...perkCards.slice(momentsSource.length).map((perk, index) => {
      const photo = photos[momentsSource.length + index];
      const label = perk.title.trim() || `Star ${momentsSource.length + index + 1}`;
      return {
        id: `perk-${index}`,
        label,
        detail: perk.body.trim(),
        photo,
      };
    }),
  ].slice(0, CONSTELLATION_POINTS.length);

  const constellationPoints = CONSTELLATION_POINTS.slice(
    0,
    constellationItems.length
  );

  const [skyIgnited, setSkyIgnited] = useState(false);
  const [ignitePulse, setIgnitePulse] = useState(false);
  const [constellationActive, setConstellationActive] = useState(false);
  const [constellationConnected, setConstellationConnected] = useState(false);
  const [activeMoment, setActiveMoment] = useState<number | null>(null);
  const [revealedOrbits, setRevealedOrbits] = useState<Set<number>>(new Set());
  const [activeOrbit, setActiveOrbit] = useState<number | null>(null);
  const [savedWishes, setSavedWishes] = useState<Set<number>>(new Set());
  const [wishRevealCount, setWishRevealCount] = useState(0);
  const [shootingStars, setShootingStars] = useState<ShootingStar[]>([]);
  const [auroraActive, setAuroraActive] = useState(false);
  const [showerActive, setShowerActive] = useState(false);
  const [showerStars, setShowerStars] = useState<ShowerStar[]>([]);
  const [reduceMotion, setReduceMotion] = useState(false);
  const [heroBurst, setHeroBurst] = useState(false);

  const containerRef = useRef<HTMLDivElement | null>(null);
  const constellationRef = useRef<HTMLDivElement | null>(null);
  const wishRef = useRef<HTMLDivElement | null>(null);
  const parallaxRef = useRef(0);
  const igniteTimer = useRef<number | null>(null);
  const askTimer = useRef<number | null>(null);
  const heroBurstTimer = useRef<number | null>(null);

  const backgroundStars = BACKGROUND_STARS;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handleChange = () => setReduceMotion(media.matches);
    handleChange();
    if (media.addEventListener) {
      media.addEventListener("change", handleChange);
    } else {
      media.addListener(handleChange);
    }
    return () => {
      if (media.removeEventListener) {
        media.removeEventListener("change", handleChange);
      } else {
        media.removeListener(handleChange);
      }
    };
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || reduceMotion) {
      return;
    }
    const target = isPhone ? containerRef.current : window;
    if (!target) {
      return;
    }
    let raf = 0;
    const handleScroll = () => {
      if (raf) {
        return;
      }
      raf = window.requestAnimationFrame(() => {
        const container = containerRef.current;
        if (!container) {
          raf = 0;
          return;
        }
        const scrollTop = isPhone ? container.scrollTop : window.scrollY;
        const parallax = Math.min(scrollTop * 0.08, 140);
        parallaxRef.current = parallax;
        container.style.setProperty("--starlit-parallax", `${parallax}px`);
        raf = 0;
      });
    };
    handleScroll();
    target.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      target.removeEventListener("scroll", handleScroll);
      if (raf) {
        window.cancelAnimationFrame(raf);
      }
    };
  }, [isPhone, reduceMotion]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const target = constellationRef.current;
    if (!target) {
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setConstellationActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.35 }
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const target = wishRef.current;
    if (!target || datePlanSteps.length === 0) {
      return;
    }
    let intervalId: number | null = null;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) {
          return;
        }
        if (reduceMotion) {
          setWishRevealCount(datePlanSteps.length);
        } else {
          setWishRevealCount((prev) => Math.max(prev, 1));
          intervalId = window.setInterval(() => {
            setWishRevealCount((prev) => {
              if (prev >= datePlanSteps.length) {
                if (intervalId) {
                  window.clearInterval(intervalId);
                }
                return prev;
              }
              return prev + 1;
            });
          }, 900);
        }
        observer.disconnect();
      },
      { threshold: 0.4 }
    );
    observer.observe(target);
    return () => {
      observer.disconnect();
      if (intervalId) {
        window.clearInterval(intervalId);
      }
    };
  }, [datePlanSteps.length, reduceMotion]);

  useEffect(() => {
    if (typeof window === "undefined" || reduceMotion) {
      return;
    }
    const interval = window.setInterval(() => {
      const id = Date.now();
      setShootingStars((prev) => [
        ...prev,
        {
          id,
          top: `${Math.random() * 60 + 10}%`,
          left: `${Math.random() * 70 + 10}%`,
          delay: Math.random() * 0.5,
        },
      ]);
      window.setTimeout(() => {
        setShootingStars((prev) => prev.filter((star) => star.id !== id));
      }, 1600);
    }, 10000);
    return () => window.clearInterval(interval);
  }, [reduceMotion]);

  useEffect(() => {
    if (!showerActive || typeof window === "undefined") {
      const reset = window.setTimeout(() => setShowerStars([]), 0);
      return () => window.clearTimeout(reset);
    }
    const stars = Array.from({ length: 12 }, (_, index) => ({
      id: index,
      left: `${Math.random() * 100}%`,
      delay: Math.random() * 0.8,
      size: Math.random() * 2 + 1,
    }));
    const scheduled = window.setTimeout(() => setShowerStars(stars), 0);
    const timeout = window.setTimeout(() => {
      setShowerActive(false);
    }, 2000);
    return () => {
      window.clearTimeout(scheduled);
      window.clearTimeout(timeout);
    };
  }, [showerActive]);

  useEffect(() => {
    return () => {
      if (igniteTimer.current) {
        window.clearTimeout(igniteTimer.current);
      }
      if (askTimer.current) {
        window.clearTimeout(askTimer.current);
      }
      if (heroBurstTimer.current) {
        window.clearTimeout(heroBurstTimer.current);
      }
    };
  }, []);

  const handleIgnite = () => {
    setSkyIgnited(true);
    setIgnitePulse(true);
    setHeroBurst(true);
    if (igniteTimer.current) {
      window.clearTimeout(igniteTimer.current);
    }
    igniteTimer.current = window.setTimeout(() => {
      setIgnitePulse(false);
    }, 1200);
    if (heroBurstTimer.current) {
      window.clearTimeout(heroBurstTimer.current);
    }
    heroBurstTimer.current = window.setTimeout(() => setHeroBurst(false), 1600);
  };

  const handleAsk = (variant: "yes" | "brighter") => {
    setConstellationConnected(true);
    setConstellationActive(true);
    if (variant === "brighter") {
      setAuroraActive(true);
      setShowerActive(true);
      if (askTimer.current) {
        window.clearTimeout(askTimer.current);
      }
      askTimer.current = window.setTimeout(() => {
        setAuroraActive(false);
      }, 2000);
    }
  };

  const handleOrbitClick = (index: number) => {
    setActiveOrbit(index);
    setRevealedOrbits((prev) => new Set([...prev, index]));
  };

  const handleWishSave = (index: number) => {
    setSavedWishes((prev) => new Set([...prev, index]));
  };

  return (
    <div
      ref={containerRef}
      className={`preview-body ${fontStyleClass} starlit-root relative w-full overflow-hidden ${containerRadius} ${containerHeight} ${containerShadow} ${
        skyIgnited ? "is-ignited" : ""
      } ${constellationConnected ? "is-connected" : ""}`}
      style={{ fontFamily: "var(--preview-body)", ...rootStyle }}
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="starlit-nebula absolute inset-0" />
        <div className="starlit-grain absolute inset-0" />
        <div className="absolute inset-0 starlit-stars">
          {backgroundStars.map((star) => (
            <span
              key={star.id}
              className="starlit-star"
              style={{
                top: star.top,
                left: star.left,
                width: `${star.size}px`,
                height: `${star.size}px`,
                opacity: star.opacity,
                animationDelay: `${star.delay}s`,
                animationDuration: `${star.duration}s`,
              }}
              aria-hidden="true"
            />
          ))}
        </div>
        <div className={`absolute inset-0 ${backgroundOverlayClass}`} />
        {auroraActive ? <div className="starlit-aurora absolute inset-0" /> : null}
        {showerStars.length > 0 ? (
          <div className="starlit-shower absolute inset-0">
            {showerStars.map((star) => (
              <span
                key={`shower-${star.id}`}
                className="starlit-shower-star"
                style={{
                  left: star.left,
                  animationDelay: `${star.delay}s`,
                  width: `${star.size}px`,
                  height: `${star.size}px`,
                }}
              />
            ))}
          </div>
        ) : null}
      </div>

      {shootingStars.length > 0 ? (
        <div className="pointer-events-none absolute inset-0">
          {shootingStars.map((star) => (
            <span
              key={`shooting-${star.id}`}
              className="starlit-shooting"
              style={{
                top: star.top,
                left: star.left,
                animationDelay: `${star.delay}s`,
              }}
              aria-hidden="true"
            />
          ))}
        </div>
      ) : null}

      {isPublished ? null : (
        <div className="absolute right-6 top-6 z-10 rounded-full border border-white/10 bg-slate-950/60 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.3em] text-slate-200">
          Recipient view
        </div>
      )}

      <div
        className={`relative z-10 mx-auto flex w-full max-w-6xl flex-col gap-20 px-6 pb-24 pt-16 md:px-12 ${
          isPhone ? "h-full overflow-y-auto" : ""
        }`}
      >
        <header className="text-center">
          <div className="flex flex-wrap items-center justify-center gap-3 text-[0.6rem] font-semibold uppercase tracking-[0.4em] text-slate-200/80">
            <span className="rounded-full border border-white/10 bg-slate-950/60 px-4 py-2">
              {doc.tagline.trim() || "Name a star"}
            </span>
            <span className="rounded-full border border-white/10 bg-slate-950/50 px-4 py-2 text-[color:var(--starlit-gold)]">
              Starlit constellation
            </span>
          </div>
          <h1
            className={`preview-heading starlit-heading mt-6 ${titleSizeClass} text-[color:var(--starlit-white)]`}
          >
            {doc.title}
          </h1>
          {doc.showSubtitle === false ? null : (
            <p className="mx-auto mt-4 max-w-2xl text-sm text-slate-200/90 md:text-base">
              {doc.subtitle}
            </p>
          )}
          {swoonTags.length > 0 ? (
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-[0.55rem] font-semibold uppercase tracking-[0.35em] text-slate-200/80">
              {swoonTags.map((tag, index) => (
                <span
                  key={`${tag}-${index}`}
                  className="rounded-full border border-white/10 px-4 py-2"
                  style={{
                    background: "rgba(125, 211, 252, 0.12)",
                    color: "var(--starlit-ice)",
                  }}
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}
          <div className="mt-10 flex flex-col items-center gap-6">
            <button
              type="button"
              onClick={handleIgnite}
              className={`starlit-hero-star ${ignitePulse ? "is-pulsing" : ""} ${
                heroBurst ? "is-glowing" : ""
              }`}
              aria-pressed={skyIgnited}
              aria-label="Ignite the sky"
            >
              <span className="starlit-hero-glow" aria-hidden="true" />
              <span className="starlit-hero-star-core" aria-hidden="true" />
              <span className="starlit-hero-ripple" aria-hidden="true" />
            </button>
            <p className="text-xs uppercase tracking-[0.4em] text-slate-300">
              Tap to ignite the sky and watch it bloom.
            </p>
            {doc.music ? (
              <StarlitAudioControl
                title={doc.music.name}
                src={doc.music.url}
              />
            ) : null}
          </div>
          {loveNotes.length > 0 ? (
            <div className="mt-10 grid gap-4 md:grid-cols-2">
              {loveNotes.map((note, index) => (
                <div key={`love-note-${index}`} className="starlit-note">
                  <p className="text-[0.55rem] font-semibold uppercase tracking-[0.4em] text-[color:var(--starlit-gold)]">
                    {loveNoteTitles[index] || "Love note"}
                  </p>
                  <p className="mt-3 text-sm text-slate-200/90 md:text-base">
                    {note}
                  </p>
                </div>
              ))}
            </div>
          ) : null}
        </header>

        <section ref={constellationRef} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="preview-heading starlit-heading text-2xl text-[color:var(--starlit-white)] md:text-3xl">
              {doc.momentsTitle}
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
              Constellation moments
            </span>
          </div>
          <div className="starlit-constellation">
            <svg
              className={`starlit-constellation-lines ${
                constellationActive ? "is-active" : ""
              }`}
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
              aria-hidden="true"
            >
              {constellationPoints.map((point, index) => {
                const next = constellationPoints[index + 1];
                if (!next) {
                  return null;
                }
                return (
                  <line
                    key={`line-${index}`}
                    x1={point.x}
                    y1={point.y}
                    x2={next.x}
                    y2={next.y}
                    className="starlit-line"
                  />
                );
              })}
            </svg>
            {constellationItems.map((item, index) => {
              const point = constellationPoints[index];
              const align = point?.align ?? "top";
              const isActive = activeMoment === index;
              return (
                <div
                  key={item.id}
                  className={`starlit-node ${
                    constellationActive ? "is-visible" : ""
                  } ${isActive ? "is-active" : ""}`}
                  style={
                    {
                      left: `${point?.x ?? 0}%`,
                      top: `${point?.y ?? 0}%`,
                      transitionDelay: `${index * 0.12}s`,
                    } as CSSProperties
                  }
                >
                  <button
                    type="button"
                    className="starlit-node-button"
                    onClick={() =>
                      setActiveMoment((prev) => (prev === index ? null : index))
                    }
                    aria-pressed={isActive}
                    aria-label={`Reveal ${item.label}`}
                  >
                    <span className="starlit-node-core" aria-hidden="true" />
                  </button>
                  {isActive ? (
                    <div className={`starlit-card starlit-card-${align}`}>
                      <div className="starlit-card-photo">
                        {item.photo?.src ? (
                          <img
                            src={item.photo.src}
                            alt={item.photo.alt ?? item.label}
                            className="h-full w-full object-cover"
                            style={photoFilterStyle}
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={`h-full w-full bg-gradient-to-br ${theme.gradient}`}
                            style={photoFilterStyle}
                          />
                        )}
                      </div>
                      <div className="starlit-card-body">
                        <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--starlit-gold)]">
                          Star {index + 1}
                        </p>
                        <h3 className="preview-heading starlit-heading mt-2 text-lg text-[color:var(--starlit-white)]">
                          {item.label}
                        </h3>
                        {item.detail ? (
                          <p className="mt-2 text-sm text-slate-200/90">
                            {item.detail}
                          </p>
                        ) : null}
                        {item.photo?.caption?.trim() ? (
                          <p className="mt-2 text-xs uppercase tracking-[0.3em] text-slate-300/80">
                            {item.photo.caption}
                          </p>
                        ) : null}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>

        <section className="grid gap-10 lg:grid-cols-[1.05fr_0.95fr]">
          <div className="space-y-6">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">
                Our orbit
              </p>
              <h2 className="preview-heading starlit-heading mt-3 text-2xl text-[color:var(--starlit-white)] md:text-3xl">
                {doc.promiseTitle}
              </h2>
              <p className="mt-3 text-sm text-slate-200/90 md:text-base">
                Tap each star to reveal why our orbit never breaks.
              </p>
            </div>
            <div className="starlit-orbit-card">
              <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--starlit-gold)]">
                Signal received
              </p>
              <p className="mt-3 text-base text-slate-100">
                {activeOrbit !== null
                  ? promiseItems[activeOrbit]
                  : promiseItems.length > 0
                    ? "Pick a star to reveal a reason."
                    : "Add your orbit reasons in the builder."}
              </p>
            </div>
          </div>
          <div className="starlit-orbit">
            <div
              className={`starlit-orbit-ring ${
                reduceMotion ? "is-static" : ""
              }`}
            >
              <div className="starlit-orbit-track" aria-hidden="true" />
              {promiseItems.map((item, index) => {
                const angle = (360 / promiseItems.length) * index;
                const isLit = revealedOrbits.has(index);
                return (
                  <button
                    key={`orbit-${index}`}
                    type="button"
                    onClick={() => handleOrbitClick(index)}
                    className={`starlit-orbit-dot ${isLit ? "is-lit" : ""}`}
                    style={{ ["--orbit-angle" as string]: `${angle}deg` }}
                    aria-label={`Reveal ${item}`}
                    aria-pressed={isLit}
                  >
                    <span className="starlit-orbit-dot-core" aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section ref={wishRef} className="space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="preview-heading starlit-heading text-2xl text-[color:var(--starlit-white)] md:text-3xl">
              {doc.datePlanTitle}
            </h2>
            <span className="text-xs uppercase tracking-[0.3em] text-slate-300/80">
              Shooting stars
            </span>
          </div>
          {datePlanSteps.length > 0 ? (
            <div className="grid gap-4 md:grid-cols-2">
              {datePlanSteps.map((step, index) => {
                const isVisible = reduceMotion || index < wishRevealCount;
                const isSaved = savedWishes.has(index);
                return (
                  <div
                    key={`wish-${index}`}
                    className={`starlit-wish ${isVisible ? "is-visible" : ""}`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-xs uppercase tracking-[0.35em] text-[color:var(--starlit-gold)]">
                          Wish {index + 1}
                        </p>
                        {step.title.trim() ? (
                          <h3 className="preview-heading starlit-heading mt-2 text-lg text-slate-100">
                            {step.title}
                          </h3>
                        ) : null}
                      </div>
                      <span className={`starlit-wish-pin ${isSaved ? "is-saved" : ""}`}>
                        {isSaved ? "Saved" : "Save this"}
                      </span>
                    </div>
                    {step.body.trim() ? (
                      <p className="mt-3 text-sm text-slate-200/90">
                        {step.body}
                      </p>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => handleWishSave(index)}
                      className="starlit-wish-action"
                      aria-pressed={isSaved}
                    >
                      {isSaved ? "Pinned as a star" : "Save this"}
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-slate-200/80">
              Add date ideas to trigger a shooting star list.
            </p>
          )}
        </section>

        <section className="starlit-ask">
          <div className="space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-300">
              {doc.swoonLabel}
            </p>
            <h2 className="preview-heading starlit-heading text-3xl text-[color:var(--starlit-white)] md:text-4xl">
              {doc.swoonHeadline}
            </h2>
            <p className="max-w-2xl text-sm text-slate-200/90 md:text-base">
              {doc.swoonBody}
            </p>
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <button
              type="button"
              onClick={() => handleAsk("yes")}
              className="starlit-ask-button"
            >
              YES
            </button>
            <button
              type="button"
              onClick={() => handleAsk("brighter")}
              className="starlit-ask-button starlit-ask-button--bright"
            >
              YES (brighter)
            </button>
          </div>
        </section>

        <footer className="text-center text-xs uppercase tracking-[0.35em] text-slate-300/80">
          <p>Coordinates: the moment I realized it was u</p>
          <p className="mt-3 text-[0.65rem] text-slate-200/80">
            {doc.tagline.trim() || "Under our shared sky"}
          </p>
        </footer>
      </div>

      <style jsx global>{`
        .starlit-root {
          background: linear-gradient(
            160deg,
            var(--starlit-base),
            var(--starlit-mid) 55%,
            #0b132d
          );
          color: var(--starlit-white);
        }

        .starlit-nebula {
          background: radial-gradient(
              circle at 18% 18%,
              rgba(125, 211, 252, 0.16),
              transparent 55%
            ),
            radial-gradient(
              circle at 76% 32%,
              rgba(167, 139, 250, 0.2),
              transparent 60%
            ),
            radial-gradient(
              circle at 50% 80%,
              rgba(56, 189, 248, 0.12),
              transparent 65%
            );
          transform: translateY(var(--starlit-parallax));
          transition: transform 0.3s ease-out;
        }

        .starlit-grain {
          background-image: url("/textures/noise.png");
          background-repeat: repeat;
          mix-blend-mode: screen;
          opacity: 0.2;
        }

        .starlit-stars {
          position: absolute;
          inset: 0;
        }

        .starlit-star {
          position: absolute;
          border-radius: 999px;
          background: rgba(226, 232, 240, 0.9);
          box-shadow: 0 0 8px rgba(125, 211, 252, 0.35);
          animation: starlit-twinkle 6s ease-in-out infinite;
        }

        .starlit-root.is-ignited .starlit-star {
          box-shadow: 0 0 12px rgba(184, 185, 255, 0.5);
        }

        .starlit-hero-star {
          position: relative;
          width: 102px;
          height: 102px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          background: radial-gradient(
            circle,
            rgba(184, 185, 255, 0.8),
            rgba(11, 19, 45, 0.3) 70%,
            transparent
          );
          box-shadow: 0 0 45px rgba(184, 185, 255, 0.5),
            0 0 100px rgba(125, 211, 252, 0.35);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .starlit-hero-star:hover {
          transform: scale(1.08);
        }

        .starlit-hero-glow {
          position: absolute;
          inset: -18px;
          border-radius: 999px;
          background: radial-gradient(
            circle,
            rgba(125, 211, 252, 0.45),
            rgba(184, 185, 255, 0) 70%
          );
          opacity: 0;
          pointer-events: none;
        }

        .starlit-hero-star-core {
          width: 32px;
          height: 32px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 18px rgba(255, 255, 255, 0.8),
            0 0 42px rgba(125, 211, 252, 0.65);
        }

        .starlit-hero-ripple {
          position: absolute;
          inset: 0;
          border-radius: 999px;
          border: 1px solid rgba(186, 218, 255, 0.45);
          opacity: 0;
          transform: scale(0.6);
        }

        .starlit-hero-star.is-glowing .starlit-hero-ripple {
          animation: starlit-ripple 1.6s ease-out forwards;
          opacity: 1;
        }

        .starlit-hero-star.is-glowing .starlit-hero-glow {
          opacity: 0.9;
          animation: starlit-bloom 1.6s ease-out forwards;
        }

        .starlit-hero-star.is-pulsing {
          animation: starlit-ignite 1.2s ease;
        }

        .starlit-hero-star.is-glowing {
          transform: scale(1.15);
          box-shadow: 0 0 45px rgba(255, 255, 255, 0.9),
            0 0 90px rgba(125, 211, 252, 0.35);
        }

        .starlit-note {
          border-radius: 2rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.65);
          padding: 1.6rem;
          box-shadow: 0 25px 60px -45px rgba(15, 23, 42, 0.9);
        }

        .starlit-heading {
          font-family: var(--preview-body, var(--font-body));
          letter-spacing: 0.04em;
          text-transform: none;
        }

        .starlit-constellation {
          position: relative;
          border-radius: 2.5rem;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(11, 15, 32, 0.7);
          min-height: 420px;
          overflow: visible;
        }

        .starlit-constellation-lines {
          position: absolute;
          inset: 6%;
          width: 88%;
          height: 88%;
        }

        .starlit-line {
          stroke: rgba(148, 163, 184, 0.4);
          stroke-width: 0.5;
          stroke-linecap: round;
          stroke-dasharray: 120;
          stroke-dashoffset: 120;
          transition: stroke-dashoffset 1.6s ease,
            stroke 0.6s ease,
            stroke-width 0.6s ease;
        }

        .starlit-constellation-lines.is-active .starlit-line {
          stroke-dashoffset: 0;
        }

        .starlit-root.is-connected .starlit-line {
          stroke: rgba(184, 185, 255, 0.75);
          stroke-width: 0.7;
        }

        .starlit-node {
          position: absolute;
          transform: translate(-50%, -50%);
          opacity: 0;
          transition: opacity 0.6s ease, transform 0.6s ease;
        }

        .starlit-node.is-visible {
          opacity: 1;
        }

        .starlit-node-button {
          width: 22px;
          height: 22px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.3);
          background: rgba(15, 23, 42, 0.7);
          display: inline-flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 0 14px rgba(125, 211, 252, 0.45);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }

        .starlit-node-button:hover {
          transform: scale(1.1);
          box-shadow: 0 0 22px rgba(184, 185, 255, 0.6);
        }

        .starlit-node-core {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.95);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.7);
        }

        .starlit-node.is-active .starlit-node-button {
          box-shadow: 0 0 26px rgba(184, 185, 255, 0.8);
        }

        .starlit-card {
          position: absolute;
          width: min(240px, 70vw);
          border-radius: 1.6rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.9);
          box-shadow: 0 30px 70px -55px rgba(15, 23, 42, 0.9);
          overflow: hidden;
          transform: translate(-50%, -110%);
        }

        .starlit-card-left {
          transform: translate(-110%, -50%);
        }

        .starlit-card-right {
          transform: translate(10%, -50%);
        }

        .starlit-card-top {
          transform: translate(-50%, -120%);
        }

        .starlit-card-photo {
          width: 100%;
          height: 140px;
          overflow: hidden;
        }

        .starlit-card-body {
          padding: 1rem 1.2rem 1.2rem;
        }

        @media (max-width: 640px) {
          .starlit-card {
            position: absolute;
            width: calc(100% - 32px);
            left: 50% !important;
            top: calc(100% + 16px) !important;
            transform: translate(-50%, 0);
          }
          .starlit-card-left,
          .starlit-card-right,
          .starlit-card-top {
            transform: none !important;
          }
          .starlit-card > .starlit-card-photo {
            height: 120px;
          }
        }

        .starlit-orbit {
          display: grid;
          place-items: center;
        }

        .starlit-orbit-ring {
          position: relative;
          width: 260px;
          height: 260px;
          border-radius: 999px;
          animation: starlit-orbit 48s linear infinite;
        }

        .starlit-orbit-ring.is-static {
          animation: none;
        }

        .starlit-orbit-track {
          position: absolute;
          inset: 14px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          box-shadow: inset 0 0 30px rgba(125, 211, 252, 0.15);
        }

        .starlit-orbit-dot {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: rotate(var(--orbit-angle)) translateX(110px);
          width: 20px;
          height: 20px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          background: rgba(15, 23, 42, 0.85);
          display: grid;
          place-items: center;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }

        .starlit-orbit-dot.is-lit {
          border-color: rgba(184, 185, 255, 0.6);
          box-shadow: 0 0 18px rgba(184, 185, 255, 0.7);
        }

        .starlit-orbit-dot-core {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 10px rgba(255, 255, 255, 0.6);
        }

        .starlit-orbit-card {
          border-radius: 1.8rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.7);
          padding: 1.5rem;
          box-shadow: 0 25px 60px -45px rgba(15, 23, 42, 0.9);
        }

        .starlit-wish {
          position: relative;
          border-radius: 1.8rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(15, 23, 42, 0.75);
          padding: 1.4rem;
          opacity: 0;
          transform: translateY(16px);
          transition: opacity 0.6s ease, transform 0.6s ease;
          overflow: hidden;
        }

        .starlit-wish.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .starlit-wish::before {
          content: "";
          position: absolute;
          top: 20px;
          left: -30%;
          width: 160px;
          height: 2px;
          background: linear-gradient(
            90deg,
            transparent,
            rgba(125, 211, 252, 0.8),
            transparent
          );
          opacity: 0;
        }

        .starlit-wish.is-visible::before {
          animation: starlit-shoot 1.4s ease;
        }

        .starlit-wish-pin {
          display: inline-flex;
          align-items: center;
          gap: 0.4rem;
          font-size: 0.55rem;
          text-transform: uppercase;
          letter-spacing: 0.3em;
          padding: 0.35rem 0.7rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          color: rgba(226, 232, 240, 0.8);
        }

        .starlit-wish-pin.is-saved {
          color: var(--starlit-gold);
          border-color: rgba(246, 210, 138, 0.45);
        }

        .starlit-wish-action {
          margin-top: 1rem;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.2);
          padding: 0.5rem 1.1rem;
          font-size: 0.6rem;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: var(--starlit-white);
          background: rgba(15, 23, 42, 0.6);
        }

        .starlit-ask {
          border-radius: 2.4rem;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(11, 15, 32, 0.8);
          padding: 2.2rem;
          box-shadow: 0 30px 70px -55px rgba(15, 23, 42, 0.9);
        }

        .starlit-ask-button {
          border-radius: 999px;
          padding: 0.75rem 1.8rem;
          font-size: 0.7rem;
          font-weight: 600;
          letter-spacing: 0.35em;
          text-transform: uppercase;
          color: #0b1226;
          background: linear-gradient(
            135deg,
            var(--starlit-ice),
            var(--starlit-glow)
          );
          box-shadow: 0 20px 50px -35px rgba(125, 211, 252, 0.8);
          transition: transform 0.2s ease;
        }

        .starlit-ask-button:hover {
          transform: translateY(-2px);
        }

        .starlit-ask-button--bright {
          color: #0b1226;
          background: linear-gradient(135deg, #fde68a, #bae6fd);
        }

        .starlit-aurora {
          background: radial-gradient(
              circle at 20% 20%,
              rgba(125, 211, 252, 0.35),
              transparent 50%
            ),
            radial-gradient(
              circle at 70% 35%,
              rgba(167, 139, 250, 0.35),
              transparent 55%
            ),
            radial-gradient(
              circle at 50% 80%,
              rgba(253, 230, 138, 0.3),
              transparent 60%
            );
          opacity: 0.7;
          animation: starlit-aurora 2s ease-out forwards;
        }

        .starlit-shower {
          pointer-events: none;
        }

        .starlit-shower-star {
          position: absolute;
          top: -10px;
          border-radius: 999px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 0 12px rgba(184, 185, 255, 0.8);
          animation: starlit-shower 1.6s ease-in forwards;
        }

        .starlit-shooting {
          position: absolute;
          width: 160px;
          height: 2px;
          background: linear-gradient(
            90deg,
            rgba(255, 255, 255, 0.1),
            rgba(125, 211, 252, 0.8),
            transparent
          );
          transform: rotate(-18deg);
          animation: starlit-shooting 1.6s ease-out forwards;
        }

        @keyframes starlit-twinkle {
          0%,
          100% {
            opacity: 0.5;
            transform: scale(0.95);
          }
          50% {
            opacity: 1;
            transform: scale(1.2);
          }
        }

        @keyframes starlit-ignite {
          0% {
            transform: scale(1);
            box-shadow: 0 0 30px rgba(184, 185, 255, 0.5);
          }
          60% {
            transform: scale(1.08);
            box-shadow: 0 0 80px rgba(184, 185, 255, 0.75);
          }
          100% {
            transform: scale(1);
            box-shadow: 0 0 40px rgba(125, 211, 252, 0.5);
          }
        }

        @keyframes starlit-ripple {
          0% {
            transform: scale(0.6);
            opacity: 0.9;
          }
          60% {
            transform: scale(1.6);
            opacity: 0.4;
          }
          100% {
            transform: scale(2.3);
            opacity: 0;
          }
        }

        @keyframes starlit-bloom {
          0% {
            transform: scale(0.7);
            opacity: 0.6;
          }
          60% {
            opacity: 0.9;
          }
          100% {
            transform: scale(1.3);
            opacity: 0;
          }
        }

        @keyframes starlit-orbit {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @keyframes starlit-shoot {
          0% {
            opacity: 0;
            transform: translateX(-40%);
          }
          40% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(140%);
          }
        }

        @keyframes starlit-shooting {
          0% {
            opacity: 0;
            transform: translateX(-40%) translateY(0) rotate(-18deg);
          }
          40% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateX(140%) translateY(40px) rotate(-18deg);
          }
        }

        @keyframes starlit-aurora {
          0% {
            opacity: 0;
          }
          40% {
            opacity: 0.8;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes starlit-shower {
          0% {
            opacity: 0;
            transform: translateY(0) scale(0.6);
          }
          20% {
            opacity: 1;
          }
          100% {
            opacity: 0;
            transform: translateY(260px) scale(1);
          }
        }

        @media (max-width: 768px) {
          .starlit-constellation {
            min-height: 360px;
          }
          .starlit-orbit-ring {
            width: 220px;
            height: 220px;
          }
          .starlit-orbit-dot {
            transform: rotate(var(--orbit-angle)) translateX(95px);
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .starlit-star,
          .starlit-hero-star,
          .starlit-orbit-ring,
          .starlit-shooting,
          .starlit-wish::before,
          .starlit-shower-star {
            animation: none;
          }
          .starlit-wish {
            opacity: 1;
            transform: none;
          }
        }
      `}</style>
   </div>
 );
}
