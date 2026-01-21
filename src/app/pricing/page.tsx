import Link from "next/link";
import { buttonClasses } from "@/components/Button";

const tiers = [
  {
    name: "Normal",
    price: "$9.99",
    features: ["Up to 6 photos", "Cute Classic + Midnight Muse", "1 share link"],
    cta: "Start building",
    href: "/templates",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$15",
    features: ["Up to 15 photos", "All templates", "1 share link"],
    cta: "Go Pro",
    href: "/templates",
    highlight: true,
  },
  {
    name: "Deluxe",
    price: "Custom",
    features: [
      "Custom template built by us",
      "One-on-one creative direction",
      "Priority turnaround",
    ],
    cta: "Contact",
    href: "mailto:hello@bemyvalentine.com",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 pb-24 pt-16 md:pt-24">
      <section>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
          Pricing
        </p>
        <h1 className="mt-3 font-display text-4xl text-slate-900 md:text-5xl">
          Build for free. Pay only to publish.
        </h1>
        <p className="mt-4 text-lg text-slate-600 md:text-xl">
          Pick a plan for your share link. Deluxe is custom-built by us.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((tier) => (
          <div
            key={tier.name}
            className={`flex flex-col justify-between rounded-3xl bg-white/90 p-6 shadow-soft ${
              tier.highlight ? "ring-2 ring-rose-200/70" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
                  {tier.name}
                </p>
                {tier.highlight ? (
                  <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                    Most popular
                  </span>
                ) : null}
              </div>
              <h2 className="mt-4 font-display text-3xl text-slate-900">
                {tier.price}
              </h2>
              <ul className="mt-5 space-y-3 text-sm text-slate-600">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-start gap-2">
                    <span className="mt-0.5 text-rose-500">&#10003;</span>
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
            <Link
              href={tier.href}
              className={`${buttonClasses(
                tier.highlight ? "primary" : "outline"
              )} mt-6`}
            >
              {tier.cta}
            </Link>
          </div>
        ))}
      </section>

      <p className="mt-6 text-sm text-slate-500">
        You can preview for free. Payment is only required to publish.
      </p>
    </main>
  );
}
