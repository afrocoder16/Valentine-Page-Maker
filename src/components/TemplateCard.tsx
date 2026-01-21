import Link from "next/link";
import type { Template } from "@/data/templates";
import { buttonClasses } from "@/components/Button";

type TemplateCardProps = {
  template: Template;
  compact?: boolean;
  locked?: boolean;
  onLockedClick?: () => void;
};

export default function TemplateCard({
  template,
  compact,
  locked = false,
  onLockedClick,
}: TemplateCardProps) {
  return (
    <div className="group flex h-full flex-col overflow-hidden rounded-3xl bg-white/90 shadow-soft transition duration-300 hover:-translate-y-1 hover:shadow-[0_28px_80px_-60px_rgba(244,63,94,0.9)]">
      <div className="relative">
        <div
          className={`h-44 w-full bg-gradient-to-br ${template.theme.gradient}`}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-white/80 via-transparent to-transparent" />
      </div>
      <div className={`flex flex-1 flex-col ${compact ? "p-5" : "p-6"}`}>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400">
            {template.vibeTagline}
          </p>
          {locked ? (
            <span className="rounded-full bg-rose-100 px-3 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.2em] text-rose-600">
              Pro only
            </span>
          ) : null}
        </div>
        <h3 className="mt-2 font-display text-2xl text-slate-900">
          {template.name}
        </h3>
        <p className="mt-2 text-sm text-slate-600">
          {template.description}
        </p>
        <div className="mt-5">
          {locked ? (
            <button
              type="button"
              onClick={onLockedClick}
              className={buttonClasses("outline")}
            >
              Unlock Pro
            </button>
          ) : (
            <Link
              href={`/build/${template.id}`}
              className={buttonClasses("primary")}
            >
              Use template
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
