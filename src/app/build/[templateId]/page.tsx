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
import { getPlanRules, type PlanId } from "@/lib/builder/planRules";
import type { BuilderDoc, PreviewMode } from "@/lib/builder/types";
import {
  loadBuilderDoc,
  resetBuilderDoc,
  saveBuilderDoc,
} from "@/lib/builder/storage";
import { getTemplateRenderer } from "@/templates/renderers";
import { SUPPORT_URL } from "@/config/constants";
import { getClientId } from "@/lib/clientId";

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
  const [supportModalOpen, setSupportModalOpen] = useState(false);
  const [clientId, setClientId] = useState<string | null>(null);
  const [publishCount, setPublishCount] = useState(0);
  const [publishLimitModalOpen, setPublishLimitModalOpen] = useState(false);
  const [limitPublishCount, setLimitPublishCount] = useState(0);
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
    const timers = toastTimers.current;
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  useEffect(() => {
    const id = getClientId();
    if (!id) {
      return;
    }
    setClientId(id);
    const fetchUsage = async () => {
      try {
        const response = await fetch("/api/publish/usage");
        const payload = (await response.json().catch(() => ({}))) as {
          publishCount?: number;
        };
        if (response.ok && typeof payload.publishCount === "number") {
          setPublishCount(payload.publishCount);
        }
      } catch {
        // ignore
      }
    };
    void fetchUsage();
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
  const baseSettings = getBuilderSettings(templateId as TemplateId);
  const planForLimits: PlanId = "normal";
  const planRules = getPlanRules(planForLimits);
  const settings = {
    ...baseSettings,
    maxPhotos: planRules.maxPhotos,
  };
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

  const requestPublish = () => {
    if (isPublishing) return;
    setSupportModalOpen(true);
  };

  const handlePublish = async () => {
    if (!doc || isPublishing) {
      return;
    }

    const id = clientId ?? getClientId();
    if (!id) {
      addToast("Unable to identify this device. Please refresh.");
      return;
    }
    if (!clientId) {
      setClientId(id);
    }

    setIsPublishing(true);
    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          doc,
          clientId: id,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        slug?: string;
        message?: string;
        publishCount?: number;
        limit?: number;
        error?: string;
      };
      if (!response.ok) {
        if (payload.error === "publish_limit_reached") {
          setLimitPublishCount(payload.publishCount ?? payload.limit ?? 3);
          setPublishLimitModalOpen(true);
          return;
        }
        addToast(payload.message ?? "Publish failed. Try again.");
        return;
      }
      if (!payload.slug) {
        addToast("Publish failed. Missing share link.");
        return;
      }
      if (typeof payload.publishCount === "number") {
        setPublishCount(payload.publishCount);
      }
      setPublishSlug(payload.slug);
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

  const handleUpgradeRequest = (payload: {
    reason: string;
    photoCount: number;
    maxPhotos: number;
  }) => {
    addToast(payload.reason);
  };

  return (
    <>
      <BuilderShell
        templateName={template.name}
        backHref="/templates"
        saveStatus={saveStatus}
        previewMode={previewMode}
        onPreviewModeChange={setPreviewMode}
        onPublish={requestPublish}
        publishLabel={isPublishing ? "Publishing..." : "Publish"}
        publishDisabled={isPublishing}
        activeTab={activeTab}
        onTabChange={setActiveTab}
        publishMeta={`Publishes left: ${Math.max(0, 3 - publishCount)}/3`}
        editor={
          <EditorPanel
            doc={doc}
            settings={settings}
            onDocChange={setDoc}
            onSave={handleSave}
            onReset={handleReset}
            onToast={addToast}
            onUpgradeRequest={handleUpgradeRequest}
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

      {showPublishModal ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 px-6">
          <div className="w-full max-w-lg rounded-[2.5rem] bg-white p-8 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
              Your Valentine is ready
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
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("outline")}
              >
                ☕ Buy me a coffee
              </a>
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

      {publishLimitModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-6">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
              Limit reached
            </p>
            <h2 className="mt-4 font-display text-2xl text-slate-900">
              You’ve reached your 3 free publishes
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              This project is free to use. If it made someone smile, you can support it to keep it alive.
            </p>
            <p className="mt-2 text-xs text-slate-400">
              Limit resets only if you clear browser data.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("primary")}
              >
                Support with coffee ☕
              </a>
              <button
                type="button"
                onClick={() => setPublishLimitModalOpen(false)}
                className={buttonClasses("ghost")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {supportModalOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 px-6">
          <div className="w-full max-w-sm rounded-[2rem] bg-white p-6 text-center shadow-soft">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-rose-400">
              Love prevails
            </p>
            <h2 className="mt-4 font-display text-2xl text-slate-900">
              This project stays free
            </h2>
            <p className="mt-3 text-sm text-slate-600">
              I’ve poured a lot of effort and time into spreading love. Buy me a coffee and keep it alive.
            </p>
            <div className="mt-6 flex flex-col gap-3">
              <a
                href={SUPPORT_URL}
                target="_blank"
                rel="noopener noreferrer"
                className={buttonClasses("outline")}
              >
                Buy me coffee ☕
              </a>
              <button
                type="button"
                onClick={() => {
                  setSupportModalOpen(false);
                  handlePublish();
                }}
                className={buttonClasses("primary")}
              >
                Continue to publish
              </button>
              <button
                type="button"
                onClick={() => setSupportModalOpen(false)}
                className={buttonClasses("ghost")}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
