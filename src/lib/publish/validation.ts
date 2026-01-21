export const TITLE_MAX = 140;
export const SUBTITLE_MAX = 500;
export const MOMENTS_MAX = 12;
export const PHOTOS_MAX = 20;

export const validateDocShape = (doc: Record<string, unknown>) => {
  const title = typeof doc.title === "string" ? doc.title.trim() : "";
  if (!title || title.length > TITLE_MAX) {
    return "Title is required and must be under 140 characters.";
  }

  const subtitle = typeof doc.subtitle === "string" ? doc.subtitle : "";
  if (subtitle.length > SUBTITLE_MAX) {
    return "Subtitle is too long.";
  }

  if (!Array.isArray(doc.moments)) {
    return "Moments must be an array.";
  }
  if (doc.moments.length > MOMENTS_MAX) {
    return "Too many moments.";
  }

  if (!Array.isArray(doc.photos)) {
    return "Photos must be an array.";
  }
  if (doc.photos.length > PHOTOS_MAX) {
    return "Too many photos.";
  }

  return null;
};
