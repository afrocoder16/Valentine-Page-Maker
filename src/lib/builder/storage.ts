import type { TemplateId } from "@/data/templates";
import {
  getBuilderSettings,
  getDefaultBuilderDoc,
  getDefaultLoveNoteTitle,
} from "@/lib/builder/config";
import type {
  BuilderDoc,
  BuilderMusic,
  BuilderPerkCard,
  BuilderPhoto,
} from "@/lib/builder/types";

const storageKey = (templateId: TemplateId) => `bmv:builder:${templateId}`;
const MIDNIGHT_PALETTES = ["velvet", "ember", "moonlight"] as const;

const coercePhotos = (value: unknown): BuilderPhoto[] => {
  if (!Array.isArray(value)) {
    return [];
  }
  return value
    .filter(
      (photo): photo is BuilderPhoto =>
        Boolean(photo) &&
        typeof photo.id === "string" &&
        typeof photo.order === "number"
    )
    .map((photo, index) => ({
      ...photo,
      caption: typeof photo.caption === "string" ? photo.caption : "",
      order: Number.isFinite(photo.order) ? photo.order : index,
    }))
    .sort((a, b) => a.order - b.order);
};

const coerceMusic = (value: unknown): BuilderMusic | null => {
  if (!value || typeof value !== "object") {
    return null;
  }
  const music = value as Partial<BuilderMusic>;
  if (typeof music.url !== "string" || typeof music.name !== "string") {
    return null;
  }
  return {
    url: music.url,
    name: music.name,
    mime: typeof music.mime === "string" ? music.mime : undefined,
    duration: typeof music.duration === "number" ? music.duration : undefined,
  };
};

export const coerceBuilderDoc = (
  templateId: TemplateId,
  value: unknown
): BuilderDoc => {
  const defaults = getDefaultBuilderDoc(templateId);
  const settings = getBuilderSettings(templateId);
  if (!value || typeof value !== "object") {
    return defaults;
  }
  const doc = value as Partial<BuilderDoc>;
  const loveNotes = Array.isArray(doc.loveNotes)
    ? doc.loveNotes.filter((note) => typeof note === "string")
    : [];
  const loveNoteValue =
    typeof doc.loveNote === "string" ? doc.loveNote : defaults.loveNote;
  const normalizedLoveNotes =
    loveNotes.length > 0 ? loveNotes : [loveNoteValue];
  const loveNoteTitles = Array.isArray(doc.loveNoteTitles)
    ? doc.loveNoteTitles.filter((title) => typeof title === "string")
    : [];
  const swoonTags = Array.isArray(doc.swoonTags)
    ? doc.swoonTags.filter((tag) => typeof tag === "string")
    : [];
  const perkCards = Array.isArray(doc.perkCards) ? doc.perkCards : [];
  const datePlanSteps = Array.isArray(doc.datePlanSteps)
    ? doc.datePlanSteps
    : [];
  const promiseItems = Array.isArray(doc.promiseItems)
    ? doc.promiseItems.filter((item) => typeof item === "string")
    : [];
  const sectionOrder = Array.isArray(doc.sectionOrder)
    ? doc.sectionOrder.filter(
        (section): section is "gallery" | "love-note" | "moments" =>
          section === "gallery" ||
          section === "love-note" ||
          section === "moments"
      )
    : defaults.sectionOrder;
  const midnightPalette =
    typeof doc.midnightPalette === "string" &&
    MIDNIGHT_PALETTES.includes(doc.midnightPalette as (typeof MIDNIGHT_PALETTES)[number])
      ? (doc.midnightPalette as BuilderDoc["midnightPalette"])
      : defaults.midnightPalette;

  const photos = coercePhotos(doc.photos);
  const normalizedMusic = coerceMusic(doc.music) ?? defaults.music;
  const sanitizedMusic =
    templateId === "cute-classic" &&
    normalizedMusic?.url === "/demos/audio/soft-piano.mp3"
      ? null
      : normalizedMusic;

  return {
    templateId,
    tagline: typeof doc.tagline === "string" ? doc.tagline : defaults.tagline,
    title: typeof doc.title === "string" ? doc.title : defaults.title,
    subtitle: typeof doc.subtitle === "string" ? doc.subtitle : defaults.subtitle,
    loveNote: normalizedLoveNotes[0] ?? defaults.loveNote,
    loveNotes: normalizedLoveNotes,
    loveNoteTitles: normalizedLoveNotes.map(
      (_, index) => loveNoteTitles[index] ?? getDefaultLoveNoteTitle(templateId, index)
    ),
    momentsTitle:
      typeof doc.momentsTitle === "string"
        ? doc.momentsTitle
        : defaults.momentsTitle,
    moments: Array.isArray(doc.moments)
      ? doc.moments.filter((moment) => typeof moment === "string")
      : defaults.moments,
    swoonLabel:
      typeof doc.swoonLabel === "string" ? doc.swoonLabel : defaults.swoonLabel,
    swoonHeadline:
      typeof doc.swoonHeadline === "string"
        ? doc.swoonHeadline
        : defaults.swoonHeadline,
    swoonBody:
      typeof doc.swoonBody === "string" ? doc.swoonBody : defaults.swoonBody,
    swoonTags: defaults.swoonTags.map(
      (tag, index) => swoonTags[index] ?? tag
    ),
    perkCards: defaults.perkCards.map((defaultCard, index) => {
      const card = perkCards[index] as Partial<BuilderPerkCard> | undefined;
      if (!card || typeof card !== "object") {
        return { ...defaultCard };
      }
      return {
        title:
          typeof card.title === "string" ? card.title : defaultCard.title,
        body: typeof card.body === "string" ? card.body : defaultCard.body,
      };
    }),
    datePlanTitle:
      typeof doc.datePlanTitle === "string"
        ? doc.datePlanTitle
        : defaults.datePlanTitle,
    datePlanSteps: defaults.datePlanSteps.map((defaultStep, index) => {
      const step = datePlanSteps[index] as Partial<BuilderPerkCard> | undefined;
      if (!step || typeof step !== "object") {
        return { ...defaultStep };
      }
      return {
        title:
          typeof step.title === "string" ? step.title : defaultStep.title,
        body: typeof step.body === "string" ? step.body : defaultStep.body,
      };
    }),
    promiseTitle:
      typeof doc.promiseTitle === "string"
        ? doc.promiseTitle
        : defaults.promiseTitle,
    promiseItems: defaults.promiseItems.map(
      (item, index) => promiseItems[index] ?? item
    ),
    photos:
      photos.length > 0
        ? photos.slice(0, settings.maxPhotos)
        : defaults.photos.slice(0, settings.maxPhotos),
    music: sanitizedMusic,
    selectedFont:
      typeof doc.selectedFont === "string"
        ? doc.selectedFont
        : defaults.selectedFont,
    titleSize: doc.titleSize ?? defaults.titleSize,
    showSubtitle:
      typeof doc.showSubtitle === "boolean"
        ? doc.showSubtitle
        : defaults.showSubtitle,
    sectionOrder: sectionOrder && sectionOrder.length === 3 ? sectionOrder : defaults.sectionOrder,
    photoMood: doc.photoMood ?? defaults.photoMood,
    backgroundIntensity: doc.backgroundIntensity ?? defaults.backgroundIntensity,
    midnightPalette,
  };
};

export const loadBuilderDoc = (templateId: TemplateId): BuilderDoc => {
  if (typeof window === "undefined") {
    return getDefaultBuilderDoc(templateId);
  }
  const raw = window.localStorage.getItem(storageKey(templateId));
  if (!raw) {
    return getDefaultBuilderDoc(templateId);
  }
  try {
    return coerceBuilderDoc(templateId, JSON.parse(raw));
  } catch {
    return getDefaultBuilderDoc(templateId);
  }
};

export const saveBuilderDoc = (templateId: TemplateId, doc: BuilderDoc) => {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(storageKey(templateId), JSON.stringify(doc));
  } catch {
    // Ignore storage failures (quota, disabled storage, etc.)
  }
};

export const resetBuilderDoc = (templateId: TemplateId) => {
  if (typeof window !== "undefined") {
    window.localStorage.removeItem(storageKey(templateId));
  }
  return getDefaultBuilderDoc(templateId);
};
