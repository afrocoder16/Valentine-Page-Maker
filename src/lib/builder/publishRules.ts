import type { TemplateId } from "@/data/templates";
import type { BuilderDoc } from "@/lib/builder/types";
import type { PlanId } from "@/lib/builder/planRules";
import { getPlanRules, isTemplateAllowed } from "@/lib/builder/planRules";

export type PublishGateResult = {
  allowed: boolean;
  reason?: string;
  requiresUpgrade?: boolean;
  paymentRequired?: boolean;
  neededPlan?: PlanId;
  photoCount?: number;
  maxPhotos?: number;
};

const countPhotos = (doc: BuilderDoc) =>
  doc.photos.filter((photo) => (photo.src ?? "").trim().length > 0).length;

export const canPublish = (
  doc: BuilderDoc,
  templateId: TemplateId,
  plan?: PlanId | null
): PublishGateResult => {
  const photoCount = countPhotos(doc);

  if (!plan) {
    return {
      allowed: false,
      requiresUpgrade: true,
      paymentRequired: true,
      reason: "Payment required to publish.",
      photoCount,
    };
  }

  const rules = getPlanRules(plan);

  if (!isTemplateAllowed(plan, templateId)) {
    return {
      allowed: false,
      requiresUpgrade: true,
      neededPlan: "pro",
      reason: "This template requires Pro.",
      photoCount,
      maxPhotos: rules.maxPhotos,
    };
  }

  if (photoCount > rules.maxPhotos) {
    return {
      allowed: false,
      requiresUpgrade: true,
      neededPlan: plan === "normal" ? "pro" : undefined,
      reason: `This plan allows up to ${rules.maxPhotos} photos.`,
      photoCount,
      maxPhotos: rules.maxPhotos,
    };
  }

  return { allowed: true, photoCount, maxPhotos: rules.maxPhotos };
};
