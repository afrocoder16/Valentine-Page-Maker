import type { TemplateId } from "@/data/templates";

export type PlanId = "normal" | "pro";

export const NORMAL_TEMPLATES: TemplateId[] = ["cute-classic", "midnight-muse"];

export const PLAN_RULES: Record<
  PlanId,
  { label: string; price: string; maxPhotos: number; templates: TemplateId[] }
> = {
  normal: {
    label: "Normal",
    price: "$9.99",
    maxPhotos: 6,
    templates: NORMAL_TEMPLATES,
  },
  pro: {
    label: "Pro",
    price: "$15",
    maxPhotos: 15,
    templates: [
      "cute-classic",
      "midnight-muse",
      "sunlit-picnic",
      "garden-party",
      "retro-love",
    ],
  },
};

export const getPlanRules = (plan: PlanId) => PLAN_RULES[plan];

export const isTemplateAllowed = (plan: PlanId, templateId: TemplateId) =>
  PLAN_RULES[plan].templates.includes(templateId);
