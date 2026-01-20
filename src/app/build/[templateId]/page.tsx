"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonClasses } from "@/components/Button";
import BuilderShell from "@/components/builder/BuilderShell";
import EditorPanel from "@/components/builder/EditorPanel";
import PreviewFrame from "@/components/builder/PreviewFrame";
import { getTemplateById, type TemplateId } from "@/data/templates";
import {
  getBuilderSettings,
  getBuilderTheme,
} from "@/lib/builder/config";
import type { BuilderDoc, PreviewMode } from "@/lib/builder/types";
import { publishPage } from "@/lib/publish";
import {
  loadBuilderDoc,
  resetBuilderDoc,
  saveBuilderDoc,
} from "@/lib/builder/storage";
import { getTemplateRenderer } from "@/templates/renderers";
import { canPublish, type PublishGateResult } from "@/lib/builder/publishRules";

const AUTOSAVE_DELAY_MS = 600;
const TOAST_DURATION_MS = 10000;

type ToastItem = {
  id: string;
  message: string;
};

export default function BuildTemplatePage() {
  const params = useParams();
  const templateIdRaw =
    typeof params.templateId === "string"
      ? params.templateId
      : Array.isArray(params.templateId)
        ? params.templateId[0]
        : null;
  const template = getTemplateById(templateIdRaw);
  const templateId = template?.id ?? null;
  const [doc, setDoc] = useState<BuilderDoc | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [previewMode, setPreviewMode] = useState<PreviewMode>("desktop");
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");
  const [saveStatus, setSaveStatus] = useState<"Saved" | "Saving">("Saved");
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [showPublishModal, setShowPublishModal] = useState(false);
  const [publishSlug, setPublishSlug] = useState<string | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [upgradeGate, setUpgradeGate] = useState<PublishGateResult | null>(null);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!templateId) {
      return;
    }
    const initialDoc = loadBuilderDoc(templateId);
    setDoc(initialDoc);
    setHydrated(true);
  }, [templateId]);

  useEffect(() => {
    if (!hydrated || !doc || !templateId) {
      return;
    }
    setSaveStatus("Saving");
    if (saveTimer.current) {
      clearTimeout(saveTimer.current);
    }
    saveTimer.current = setTimeout(() => {
      saveBuilderDoc(templateId, doc);
      setSaveStatus("Saved");
    }, AUTOSAVE_DELAY_MS);
  }, [doc, hydrated, templateId]);

  useEffect(() => {
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      Object.values(toastTimers.current).forEach(clearTimeout);
    };
  }, []);

  const addToast = (message: string) => {
    const id = Math.random().toString(36).slice(2, 9);
    setToasts((prev) => [...prev, { id, message }]);
    const timeout = setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
      delete toastTimers.current[id];
    }, TOAST_DURATION_MS);
    toastTimers.current[id] = timeout;
  };

  const shareUrl = useMemo(() => {
    if (!publishSlug || typeof window === "undefined") {
      return "";
    }
    return `${window.location.origin}/v/${publishSlug}`;
  }, [publishSlug]);

  if (!templateId || !template) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 pb-24 pt-16 md:pt-24">
        <div className="rounded-[2.5rem] bg-white/90 p-8 text-center shadow-soft">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
            Builder
          </p>
          <h1 className="mt-4 font-display text-3xl text-slate-900 md:text-4xl">
            We could not find that template.
          </h1>
          <p className="mt-3 text-sm text-slate-600">
            Choose another template to start editing.
          </p>
          <Link href="/templates" className={`${buttonClasses("primary")} mt-6`}>
            Browse templates
          </Link>
        </div>
      </main>
    );
  }

  if (!doc) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 pb-24 pt-16 md:pt-24">
        <div className="rounded-[2.5rem] bg-white/90 p-8 text-center shadow-soft">
          <p className="text-sm text-slate-600">Loading your draft...</p>
        </div>
      </main>
    );
  }

  const theme = getBuilderTheme(templateId as TemplateId);
  const settings = getBuilderSettings(templateId as TemplateId);
  const Renderer = getTemplateRenderer(templateId as TemplateId);

  const handleSave = () => {
    saveBuilderDoc(templateId as TemplateId, doc);
    setSaveStatus("Saved");
    addToast("Saved");
  };

  const handleReset = () => {
    const nextDoc = resetBuilderDoc(templateId as TemplateId);
    setDoc(nextDoc);
    addToast("Reset to defaults");
  };

  const handlePublish = async () => {
    if (!doc || isPublishing) {
      return;
    }
    const gate = canPublish(doc, templateId as TemplateId);
    if (!gate.allowed) {
      setUpgradeGate(gate);
      return;
    }
    setIsPublishing(true);
    try {
      const result = await publishPage(templateId as TemplateId, doc);
      setPublishSlug(result.slug);
      setShowPublishModal(true);
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Publish failed. Try again.";
      addToast(message);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      addToast("Link copied");
    } catch {
      addToast("Copy failed");
    }
  };

  const handleUpgrade = () => {
    setUpgradeGate(null);
    addToast("Payments coming soon");
  };

  return (
    <>
      <BuilderShell
        templateName={template.name}
        backHref="/templates"
        saveStatus={saveStatus}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onPublish={handlePublish}
        publishLabel={isPublishing ? "Publishing..." : "Publish"}
        publishDisabled={isPublishing}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        editor={
          <EditorPanel
            doc={doc}
            settings={settings}
            onDocChange={setDoc}
            onSave={handleSave}
            onReset={handleReset}
            onToast={addToast}
          />
        }
        preview={
          <PreviewFrame mode={previewMode}>
            <Renderer
              doc={doc}
              theme={theme}
              mode={previewMode}
              context="builder"
            />
          </PreviewFrame>
        }
      />

      {toasts.length > 0 ? (
        <div className="pointer-events-none fixed right-6 top-24 z-40 space-y-3">
          {toasts.map((toast) => (
            <div
              key={toast.id}
              className="rounded-full bg-white/90 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-rose-500 shadow-soft"
            >
              {toast.message}
            </div>
          ))}
        </div>
      ) : null}

      {upgradeGate && upgradeGate.requiresUpgrade ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
              Upgrade to publish
            </p>
            <h2 className="mt-4 font-display text-2xl text-slate-900">
              This page is ready
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              {upgradeGate.reason ??
                "Publishing with extra photos requires Premium."}
            </p>
            <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-slate-700">
              Photos: {upgradeGate.photoCount ?? 0} / {upgradeGate.maxPhotos ?? 0}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleUpgrade}
                className={buttonClasses("primary")}
              >
                Upgrade
              </button>
              <button
                type="button"
                onClick={() => setUpgradeGate(null)}
                className={buttonClasses("outline")}
              >
                Back
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {showPublishModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
              Your Valentine is ready 💖
            </p>
            <h2 className="mt-4 font-display text-2xl text-slate-900">
              Share it with your person
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              Anyone with this link can view your Valentine page.
            </p>
            <div className="mt-5 rounded-2xl border border-rose-100 bg-rose-50/70 px-4 py-3 text-sm text-slate-700">
              {shareUrl || "Generating link..."}
            </div>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <button
                type="button"
                onClick={handleCopyLink}
                className={buttonClasses("outline")}
                disabled={!shareUrl}
              >
                Copy link
              </button>
              <Link
                href={shareUrl || "#"}
                target="_blank"
                rel="noreferrer"
                className={`${buttonClasses("primary")} ${
                  shareUrl ? "" : "pointer-events-none opacity-60"
                }`}
                aria-disabled={!shareUrl}
              >
                Open link
              </Link>
            </div>
            <button
              type="button"
              className={`${buttonClasses("ghost")} mt-5`}
              onClick={() => setShowPublishModal(false)}
            >
              Close
            </button>
          </div>
        </div>
      ) : null}
    </>
  );
}
