import Link from "next/link";
import { buttonClasses } from "@/components/Button";

const tiers = [
  {
    name: "Basic",
    price: "$9.99",
    features: ["Up to 6 photos", "2 templates", "Watermark removed"],
  },
  {
    name: "Plus",
    price: "$19.99",
    features: ["Up to 10 photos", "All templates", "Extra effects"],
  },
  {
    name: "Deluxe",
    price: "$29.99",
    features: [
      "Up to 12 photos",
      "Scheduled reveal",
      "Private mode (coming soon)",
    ],
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
          Preview for free. Pay only to publish.
        </h1>
        <p className="mt-4 text-lg text-slate-600 md:text-xl">
          Simple tiers, flexible for every love story.
        </p>
      </section>

      <section className="mt-10 grid gap-6 md:grid-cols-3">
        {tiers.map((tier, index) => (
          <div
            key={tier.name}
            className={`flex flex-col justify-between rounded-3xl bg-white/90 p-6 shadow-soft ${
              index === 1 ? "ring-2 ring-rose-200/70" : ""
            }`}
          >
            <div>
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
                  {tier.name}
                </p>
                {index === 1 ? (
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
              href="/templates"
              className={`${buttonClasses(index === 1 ? "primary" : "outline")} mt-6`}
            >
              Start with {tier.name}
            </Link>
          </div>
        ))}
      </section>

      <p className="mt-6 text-sm text-slate-500">
        You can preview for free. Pay only to publish.
      </p>
    </main>
  );
}
