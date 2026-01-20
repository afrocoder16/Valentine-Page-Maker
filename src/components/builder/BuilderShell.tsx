"use client";

import Link from "next/link";
import { ArrowLeft, Monitor, Smartphone } from "lucide-react";
import type { PreviewMode } from "@/lib/builder/types";

type BuilderShellProps = {
  templateName: string;
  backHref: string;
  saveStatus: "Saved" | "Saving";
  previewMode: PreviewMode;
  onPreviewModeChange: (mode: PreviewMode) => void;
  onPublish: () => void;
  publishLabel?: string;
  publishDisabled?: boolean;
  editor: React.ReactNode;
  preview: React.ReactNode;
  activeTab: "edit" | "preview";
  onTabChange: (tab: "edit" | "preview") => void;
};

export default function BuilderShell({
  templateName,
  backHref,
  saveStatus,
  previewMode,
  onPreviewModeChange,
  onPublish,
  publishLabel = "Publish",
  publishDisabled = false,
  editor,
  preview,
  activeTab,
  onTabChange,
}: BuilderShellProps) {
  return (
    <main className="min-h-screen overflow-y-auto lg:h-screen lg:overflow-hidden">
      <div className="flex min-h-screen flex-col bg-white/50 backdrop-blur-sm lg:h-full">
        <header className="sticky top-0 z-30 flex flex-wrap items-center justify-between gap-4 border-b border-white/70 bg-white/80 px-6 py-4 backdrop-blur">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-semibold text-rose-500 transition hover:text-rose-600"
          >
            <ArrowLeft className="h-4 w-4" />
            Templates
          </Link>
          <div className="flex flex-col items-center text-center">
            <p className="font-display text-lg text-slate-900 sm:text-xl">
              {templateName} Builder
            </p>
            <div className="mt-1 flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-500">
              <span
                className={`h-2 w-2 rounded-full ${
                  saveStatus === "Saving" ? "bg-amber-400" : "bg-emerald-400"
                }`}
              />
              <span>{saveStatus === "Saving" ? "Saving..." : "Autosaved"}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex rounded-full bg-white/80 p-1 shadow-soft">
              <button
                type="button"
                onClick={() => onPreviewModeChange("desktop")}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  previewMode === "desktop"
                    ? "bg-rose-600 text-white shadow-soft"
                    : "text-slate-600 hover:text-rose-500"
                }`}
              >
                <Monitor className="h-4 w-4" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => onPreviewModeChange("phone")}
                className={`flex items-center gap-2 rounded-full px-3 py-2 text-xs font-semibold uppercase tracking-[0.25em] transition ${
                  previewMode === "phone"
                    ? "bg-rose-600 text-white shadow-soft"
                    : "text-slate-600 hover:text-rose-500"
                }`}
              >
                <Smartphone className="h-4 w-4" />
                <span className="hidden sm:inline">Phone</span>
              </button>
            </div>
            <button
              type="button"
              onClick={onPublish}
              disabled={publishDisabled}
              className="rounded-full bg-rose-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-white shadow-soft transition hover:-translate-y-0.5 hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-70"
            >
              {publishLabel}
            </button>
          </div>
        </header>

        <div className="flex flex-1 flex-col lg:h-full lg:min-h-0 lg:flex-row">
          <aside className="flex w-full flex-col border-b border-white/60 bg-white/60 px-6 py-6 lg:h-full lg:w-[380px] lg:border-b-0 lg:border-r">
            <div className="mb-6 flex items-center justify-between lg:hidden">
              <div className="flex rounded-full bg-white/80 p-1 shadow-soft">
                <button
                  type="button"
                  onClick={() => onTabChange("edit")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
                    activeTab === "edit"
                      ? "bg-rose-600 text-white shadow-soft"
                      : "text-slate-600"
                  }`}
                >
                  Edit
                </button>
                <button
                  type="button"
                  onClick={() => onTabChange("preview")}
                  className={`rounded-full px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] ${
                    activeTab === "preview"
                      ? "bg-rose-600 text-white shadow-soft"
                      : "text-slate-600"
                  }`}
                >
                  Preview
                </button>
              </div>
            </div>
            <div
              className={`flex-1 overflow-y-visible pr-0 lg:overflow-y-auto lg:pr-2 ${
                activeTab === "preview" ? "hidden lg:block" : "block"
              }`}
            >
              {editor}
            </div>
          </aside>

          <section
            className={`flex w-full flex-1 flex-col overflow-y-visible border-t border-white/60 px-6 py-6 lg:h-full lg:min-h-0 lg:overflow-y-auto lg:border-l lg:border-t-0 ${
              activeTab === "edit" ? "hidden lg:flex" : "flex"
            }`}
          >
            <div className="flex w-full flex-1 items-start justify-center">
              {preview}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
