"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { Template } from "@/data/templates";
import TemplateCard from "@/components/TemplateCard";
import TemplateGateModal from "@/components/TemplateGateModal";
import { isTemplateAllowed, type PlanId } from "@/lib/builder/planRules";
import { readEntitlementSessionId } from "@/lib/entitlements";

type TemplateGalleryProps = {
  templates: Template[];
};

export default function TemplateGallery({ templates }: TemplateGalleryProps) {
  const router = useRouter();
  const [entitlementPlan, setEntitlementPlan] = useState<PlanId | null>(null);
  const [gateTemplate, setGateTemplate] = useState<Template | null>(null);

  useEffect(() => {
    const sessionId = readEntitlementSessionId();
    if (!sessionId) {
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
      }
    };

    void fetchEntitlement();
  }, []);

  const planForAccess = entitlementPlan ?? "normal";

  const handleLockedClick = (template: Template) => {
    setGateTemplate(template);
  };

  const handleContinue = () => {
    if (!gateTemplate) {
      return;
    }
    const id = gateTemplate.id;
    setGateTemplate(null);
    router.push(`/build/${id}`);
  };

  return (
    <>
      {templates.map((template) => {
        const locked = !isTemplateAllowed(planForAccess, template.id);
        return (
          <TemplateCard
            key={template.id}
            template={template}
            locked={locked}
            onLockedClick={locked ? () => handleLockedClick(template) : undefined}
          />
        );
      })}
      <TemplateGateModal
        open={Boolean(gateTemplate)}
        templateName={gateTemplate?.name}
        onClose={() => setGateTemplate(null)}
        onContinue={handleContinue}
      />
    </>
  );
}
