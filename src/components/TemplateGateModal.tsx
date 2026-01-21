"use client";

import Link from "next/link";
import { buttonClasses } from "@/components/Button";

type TemplateGateModalProps = {
  open: boolean;
  templateName?: string;
  onClose: () => void;
  onContinue: () => void;
};

export default function TemplateGateModal({
  open,
  templateName,
  onClose,
  onContinue,
}: TemplateGateModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6">
      <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 text-center shadow-soft">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
          Pro template
        </p>
        <h2 className="mt-4 font-display text-2xl text-slate-900">
          {templateName ?? "This template"} needs Pro to publish
        </h2>
        <p className="mt-3 text-sm text-slate-600">
          You can still build and preview for free, then upgrade when you are
          ready to publish.
        </p>
        <div className="mt-5 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={onContinue}
            className={buttonClasses("primary")}
          >
            Continue to builder
          </button>
          <button
            type="button"
            onClick={onClose}
            className={buttonClasses("outline")}
          >
            Back
          </button>
        </div>
        <Link href="/pricing" className={`${buttonClasses("ghost")} mt-5`}>
          View pricing
        </Link>
      </div>
    </div>
  );
}
