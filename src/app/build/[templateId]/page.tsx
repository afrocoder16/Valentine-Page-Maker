"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { buttonClasses } from "@/components/Button";
import PricingModal from "@/components/PricingModal";
import BuilderShell from "@/components/builder/BuilderShell";
import EditorPanel from "@/components/builder/EditorPanel";
import PreviewFrame from "@/components/builder/PreviewFrame";
import { getTemplateById, type TemplateId } from "@/data/templates";
import {
  getBuilderSettings,
  getBuilderTheme,
} from "@/lib/builder/config";
import {
  getPlanRules,
  isTemplateAllowed,
  type PlanId,
} from "@/lib/builder/planRules";
import type { BuilderDoc, PreviewMode } from "@/lib/builder/types";
import {
  loadBuilderDoc,
  resetBuilderDoc,
  saveBuilderDoc,
} from "@/lib/builder/storage";
import { readEntitlementSessionId } from "@/lib/entitlements";
import { getTemplateRenderer } from "@/templates/renderers";
import { canPublish } from "@/lib/builder/publishRules";

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
  const [entitlementPlan, setEntitlementPlan] = useState<PlanId | null>(null);
  const [entitlementSessionId, setEntitlementSessionId] = useState("");
  const [entitlementLoaded, setEntitlementLoaded] = useState(false);
  const [pricingModalOpen, setPricingModalOpen] = useState(false);
  const [pricingReason, setPricingReason] = useState<string | null>(null);
  const [pricingNeededPlan, setPricingNeededPlan] = useState<PlanId | null>(null);
  const [checkoutPlan, setCheckoutPlan] = useState<PlanId | null>(null);
  const toastTimers = useRef<Record<string, ReturnType<typeof setTimeout>>>({});
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const templateGateShown = useRef(false);

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
    const sessionId = readEntitlementSessionId();
    setEntitlementSessionId(sessionId);

    if (!sessionId) {
      setEntitlementLoaded(true);
      return;
    }

    const fetchEntitlement = async () => {
      try {
        const response = await fetch(
          `/api/entitlements?session_id=${encodeURIComponent(sessionId)}`
        );
        const payload = (await response.json().catch(() => ({}))) as {
          active?: boolean;
          plan?: PlanId;
        };
        if (response.ok && payload.active) {
          setEntitlementPlan(payload.plan ?? null);
        } else {
          setEntitlementPlan(null);
        }
      } catch {
        setEntitlementPlan(null);
      } finally {
        setEntitlementLoaded(true);
      }
    };

    void fetchEntitlement();
  }, []);

  useEffect(() => {
    const timers = toastTimers.current;
    return () => {
      if (saveTimer.current) {
        clearTimeout(saveTimer.current);
      }
      Object.values(timers).forEach(clearTimeout);
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

  const openPricingModal = useCallback(
    (reason: string, neededPlan?: PlanId | null) => {
      setPricingReason(reason);
      setPricingNeededPlan(neededPlan ?? null);
      setPricingModalOpen(true);
    },
    []
  );

  const closePricingModal = useCallback(() => {
    setPricingModalOpen(false);
    setPricingReason(null);
    setPricingNeededPlan(null);
  }, []);

  useEffect(() => {
    if (!templateId || !entitlementLoaded || templateGateShown.current) {
      return;
    }
    const planForTemplate = entitlementPlan ?? "normal";
    if (!isTemplateAllowed(planForTemplate, templateId as TemplateId)) {
      openPricingModal("This template requires Pro to publish.", "pro");
      templateGateShown.current = true;
    }
  }, [entitlementLoaded, entitlementPlan, openPricingModal, templateId]);

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
  const planForLimits = entitlementPlan ?? "normal";
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

  const handleCheckout = async (plan: PlanId) => {
    if (!doc || !templateId) {
      return;
    }
    setCheckoutPlan(plan);
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan, templateId, docSnapshot: doc }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        url?: string;
        error?: string;
        message?: string;
        needed?: PlanId;
      };
      if (!response.ok) {
        if (payload.error === "upgrade_required") {
          openPricingModal(
            payload.message ?? "Upgrade required to continue.",
            payload.needed ?? "pro"
          );
          return;
        }
        addToast(payload.message ?? "Checkout failed. Try again.");
        return;
      }
      if (!payload.url) {
        addToast("Checkout failed. Missing redirect.");
        return;
      }
      window.location.href = payload.url;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Checkout failed. Try again.";
      addToast(message);
    } finally {
      setCheckoutPlan(null);
    }
  };

  const handlePublish = async () => {
    if (!doc || isPublishing) {
      return;
    }

    if (!entitlementSessionId || !entitlementPlan) {
      openPricingModal("Choose a plan to publish your page.");
      return;
    }

    const gate = canPublish(doc, templateId as TemplateId, entitlementPlan);
    if (!gate.allowed) {
      openPricingModal(
        gate.reason ?? "Upgrade required to publish.",
        gate.neededPlan ?? "pro"
      );
      return;
    }

    setIsPublishing(true);
    try {
      const response = await fetch("/api/publish", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          templateId,
          doc,
          sessionId: entitlementSessionId,
        }),
      });
      const payload = (await response.json().catch(() => ({}))) as {
        slug?: string;
        url?: string;
        error?: string;
        message?: string;
        needed?: PlanId;
      };
      if (!response.ok) {
        if (payload.error === "payment_required") {
          openPricingModal(payload.message ?? "Payment required to publish.");
          return;
        }
        if (payload.error === "upgrade_required") {
          openPricingModal(
            payload.message ?? "Upgrade required to publish.",
            payload.needed ?? "pro"
          );
          return;
        }
        if (payload.error === "entitlement_used") {
          openPricingModal(
            payload.message ?? "This purchase has already been used."
          );
          return;
        }
        addToast(payload.message ?? "Publish failed. Try again.");
        return;
      }
      if (!payload.slug) {
        addToast("Publish failed. Missing share link.");
        return;
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
    if (entitlementPlan === "pro") {
      addToast("Photo limit reached.");
      return;
    }
    openPricingModal(payload.reason, "pro");
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

      <PricingModal
        open={pricingModalOpen}
        onClose={closePricingModal}
        onSelectPlan={handleCheckout}
        reason={pricingReason}
        neededPlan={pricingNeededPlan}
        loadingPlan={checkoutPlan}
      />

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
