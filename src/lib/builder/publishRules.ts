import type { TemplateId } from "@/data/templates";
import type { BuilderDoc } from "@/lib/builder/types";

export type PublishGateResult = {
  allowed: boolean;
  reason?: string;
  requiresUpgrade?: boolean;
  photoCount?: number;
  maxPhotos?: number;
};

const countPhotos = (doc: BuilderDoc) =>
  doc.photos.filter((photo) => (photo.src ?? "").trim().length > 0).length;

export const canPublish = (
  doc: BuilderDoc,
  templateId: TemplateId
): PublishGateResult => {
  const photoCount = countPhotos(doc);

  if (templateId === "cute-classic") {
    const maxPhotos = 3;
    if (photoCount > maxPhotos) {
      return {
        allowed: false,
        requiresUpgrade: true,
        reason: "Publishing with more than 3 photos requires Premium.",
        photoCount,
        maxPhotos,
      };
    }
    return { allowed: true, photoCount, maxPhotos };
  }

  return { allowed: true, photoCount };
};
