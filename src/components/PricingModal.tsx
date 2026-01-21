"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/Button";
import { PLAN_RULES, type PlanId } from "@/lib/builder/planRules";

type PricingModalProps = {
  open: boolean;
  onClose: () => void;
  onSelectPlan: (plan: PlanId) => void;
  reason?: string | null;
  neededPlan?: PlanId | null;
  loadingPlan?: PlanId | null;
};

const planFeatures: Record<PlanId, string[]> = {
  normal: [
    "Up to 6 photos",
    "Cute Classic + Midnight Muse",
    "1 share link",
  ],
  pro: ["Up to 15 photos", "All templates", "1 share link"],
};

export default function PricingModal({
  open,
  onClose,
  onSelectPlan,
  reason,
  neededPlan,
  loadingPlan,
}: PricingModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6">
      <div className="w-full max-w-4xl rounded-[2.5rem] bg-white p-8 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
          Upgrade to publish
        </p>
        <h2 className="mt-4 font-display text-3xl text-slate-900">
          Choose your plan
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          {reason ??
            "Preview for free. Pay once to generate your share link."}
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {(Object.keys(PLAN_RULES) as PlanId[]).map((plan) => {
            const rules = PLAN_RULES[plan];
            const isHighlighted = neededPlan === plan;
            const isLoading = loadingPlan === plan;

            return (
              <div
                key={plan}
                className={`flex flex-col justify-between rounded-3xl border bg-white/90 p-6 text-left shadow-soft ${
                  isHighlighted
                    ? "border-rose-300 ring-2 ring-rose-200/80"
                    : "border-rose-100"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
                      {rules.label}
                    </p>
                    {plan === "pro" ? (
                      <span className="rounded-full bg-rose-100 px-3 py-1 text-xs font-semibold text-rose-600">
                        Most popular
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 font-display text-3xl text-slate-900">
                    {rules.price}
                  </h3>
                  <ul className="mt-4 space-y-3 text-sm text-slate-600">
                    {planFeatures[plan].map((feature) => (
                      <li key={feature} className="flex items-start gap-2">
                        <span className="mt-0.5 text-rose-500">&#10003;</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <button
                  type="button"
                  onClick={() => onSelectPlan(plan)}
                  className={`${buttonClasses(
                    plan === "pro" ? "primary" : "outline"
                  )} mt-6`}
                  disabled={Boolean(loadingPlan)}
                >
                  {isLoading ? "Redirecting..." : `Choose ${rules.label}`}
                </button>
              </div>
            );
          })}
        </div>

        <div className="mt-6 rounded-3xl border border-rose-100 bg-rose-50/40 p-6 text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            Deluxe
          </p>
          <h3 className="mt-3 font-display text-2xl text-slate-900">
            Custom template built by us
          </h3>
          <p className="mt-2 text-sm text-slate-600">
            Want something totally unique? We will craft a custom template just
            for you.
          </p>
          <div className="mt-4">
            <Link
              href="mailto:hello@bemyvalentine.com"
              className={buttonClasses("outline")}
            >
              Contact
            </Link>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className={`${buttonClasses("ghost")} mt-6`}
        >
          Close
        </button>
      </div>
    </div>
  );
}
