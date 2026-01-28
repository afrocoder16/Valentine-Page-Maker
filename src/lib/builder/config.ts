import { getDemoCopyByTemplateId } from "@/data/demoCopy";
import { getTemplateById, type TemplateId } from "@/data/templates";
import type {
  BuilderDoc,
  BuilderPerkCard,
  BuilderPhoto,
  BuilderTheme,
  BuilderSettings,
} from "@/lib/builder/types";

const DEFAULT_MAX_PHOTOS = 15;
const DEFAULT_UPSELL_PRICE = 2;
const DEFAULT_MOMENTS_TITLE = "Reasons I am obsessed with you";
const DEFAULT_LOVE_NOTE_TITLE = "Love note";
const DEFAULT_EXTRA_LOVE_TITLE = "Extra love";
const DEFAULT_SWOON_LABEL = "Swoon meter";
const DEFAULT_SWOON_HEADLINE = "Crush level: maxed";
const DEFAULT_SWOON_BODY =
  "Side effects include spontaneous smiling and extra cuddles.";
const DEFAULT_SWOON_TAGS = ["giddy", "smitten", "sparkly", "obsessed"];
const DEFAULT_DATE_PLAN_TITLE = "Our little plan";
const DEFAULT_DATE_PLAN_STEPS: BuilderPerkCard[] = [
  {
    title: "Plan A",
    body: "Snacks, playlists, and the coziest couch fort.",
  },
  {
    title: "Plan B",
    body: "Cute date and a photo booth moment.",
  },
  {
    title: "Plan C",
    body: "Sunset walk and dessert that melts our hearts.",
  },
];
const DEFAULT_PROMISE_TITLE = "Tiny promises";
const DEFAULT_PROMISE_ITEMS = [
  "Always save you the last bite.",
  "Be your personal hype crew.",
  "Laugh at the dumb jokes, every time.",
  "Keep the hugs on standby.",
];
const DEFAULT_MIDNIGHT_PALETTE = "velvet";
const MIDNIGHT_MOMENTS_TITLE = "Why you say yes";
const MIDNIGHT_SWOON_LABEL = "The answer";
const MIDNIGHT_SWOON_HEADLINE = "Yes";
const MIDNIGHT_SWOON_BODY =
  "Because every late-night scene feels better with you in it.";
const MIDNIGHT_SWOON_TAGS = ["afterglow", "slow burn", "electric", "inevitable"];
const MIDNIGHT_PERK_CARDS: BuilderPerkCard[] = [
  {
    title: "Night drive",
    body: "Windows down, city lights, our soundtrack.",
  },
  {
    title: "Rooftop pause",
    body: "A skyline, a soft hand hold, and quiet smiles.",
  },
  {
    title: "Coffee run",
    body: "Warm cups and even warmer laughs.",
  },
  {
    title: "Hidden playlist",
    body: "Songs that feel like us on repeat.",
  },
];
const MIDNIGHT_DATE_PLAN_TITLE = "Our next scene";
const MIDNIGHT_DATE_PLAN_STEPS: BuilderPerkCard[] = [
  {
    title: "Scene one",
    body: "Golden hour walk and a slow start.",
  },
  {
    title: "Scene two",
    body: "Dinner, dessert, and a soft glow.",
  },
  {
    title: "Scene three",
    body: "One last song and the best hug.",
  },
];
const MIDNIGHT_PROMISE_TITLE = "Afterglow promises";
const MIDNIGHT_PROMISE_ITEMS = [
  "Keep the late-night talks honest.",
  "Save a spot for you in every plan.",
  "Hold your hand through every scene.",
  "Always come back to us.",
];
const SUNLIT_MOMENTS_TITLE = "Reasons in the sunlight";
const SUNLIT_SWOON_LABEL = "Sunlit answer";
const SUNLIT_SWOON_HEADLINE = "Yes";
const SUNLIT_SWOON_BODY =
  "For the soft mornings, bright afternoons, and the way you glow.";
const SUNLIT_SWOON_TAGS = ["golden", "soft breeze", "sunbeam", "forever"];
const SUNLIT_PERK_CARDS: BuilderPerkCard[] = [
  {
    title: "Blanket ready",
    body: "Sun-warmed, corner tucked, made for two.",
  },
  {
    title: "Fresh blooms",
    body: "Wildflowers and notes tucked inside.",
  },
  {
    title: "Sweet bites",
    body: "Berries, pastries, and the last bite saved.",
  },
  {
    title: "Slow songs",
    body: "A playlist for soft smiles and shared skies.",
  },
];
const SUNLIT_DATE_PLAN_TITLE = "Picnic plan";
const SUNLIT_DATE_PLAN_STEPS: BuilderPerkCard[] = [
  {
    title: "Find the light",
    body: "A sunny spot with room for us.",
  },
  {
    title: "Unpack the magic",
    body: "Tea, snacks, and handwritten notes.",
  },
  {
    title: "Stay a little longer",
    body: "Stories, laughter, and slow kisses.",
  },
];
const SUNLIT_PROMISE_TITLE = "Sunlit quotes";
const SUNLIT_PROMISE_ITEMS = [
  "You are my favorite kind of morning.",
  "Every day is softer with you in it.",
  "Let us keep chasing the light together.",
  "You are my calm, my bloom, my yes.",
];
const GARDEN_MOMENTS_TITLE = "Blooming moments";
const GARDEN_SWOON_LABEL = "Garden RSVP";
const GARDEN_SWOON_HEADLINE = "Yes";
const GARDEN_SWOON_BODY =
  "Because every season with you feels like spring.";
const GARDEN_SWOON_TAGS = ["petals", "evergreen", "sweetheart", "in bloom"];
const GARDEN_PERK_CARDS: BuilderPerkCard[] = [
  {
    title: "Fresh blooms",
    body: "Wildflowers tucked with little notes.",
  },
  {
    title: "Sweet sips",
    body: "Sparkling lemonade and shared smiles.",
  },
  {
    title: "Soft linens",
    body: "Pastel ribbons and gentle textures.",
  },
  {
    title: "Golden hour",
    body: "Light that makes everything glow.",
  },
];
const GARDEN_DATE_PLAN_TITLE = "Garden party plan";
const GARDEN_DATE_PLAN_STEPS: BuilderPerkCard[] = [
  {
    title: "Arrive in bloom",
    body: "A soft entrance and a hand to hold.",
  },
  {
    title: "Toast and taste",
    body: "Petite bites and sweet pours.",
  },
  {
    title: "Stroll the garden",
    body: "A quiet walk and stolen smiles.",
  },
];
const GARDEN_PROMISE_TITLE = "Garden toasts";
const GARDEN_PROMISE_ITEMS = [
  "You make every day feel like a bouquet.",
  "Let us keep growing together, always.",
  "Your laugh is my favorite bloom.",
  "I choose you in every season.",
];
const RETRO_TAGLINE = "PLAYER 2";
const RETRO_MOMENTS_TITLE = "Replay list";
const RETRO_SWOON_LABEL = "Tracking";
const RETRO_SWOON_HEADLINE = "LIKE, A LOT";
const RETRO_PROMISE_TITLE = "Neon chorus";
const RETRO_PROMISE_ITEMS = [
  "PRESS PLAY ON US",
  "NEON NIGHT FAVORITE",
  "SIDE A FOREVER",
  "REWIND FOR MORE",
];

const STARLIT_MOMENTS_TITLE = "Constellation moments";
const STARLIT_SWOON_LABEL = "Name a star";
const STARLIT_SWOON_HEADLINE = "Yes, we are meant to be";
const STARLIT_SWOON_BODY =
  "Our story has always been written in the night sky—every choice, every orbit, every light pulls us closer.";
const STARLIT_SWOON_TAGS = [
  "destiny",
  "quiet glow",
  "inevitable",
  "aligned",
];
const STARLIT_PERK_CARDS: BuilderPerkCard[] = [
  {
    title: "First radiance",
    body: "The day our eyes met felt like the brightest starburst.",
  },
  {
    title: "Nebula whispers",
    body: "Soft conversations that glow long after the night ends.",
  },
  {
    title: "Orbit ritual",
    body: "We keep coming back to the same constellations, always brighter.",
  },
  {
    title: "Aurora pulse",
    body: "Every shared dream adds a streak of light across a midnight canvas.",
  },
];
const STARLIT_DATE_PLAN_TITLE = "Wish list";
const STARLIT_DATE_PLAN_STEPS: BuilderPerkCard[] = [
  {
    title: "Trace our story",
    body: "Pick a quiet rooftop or a spacious field, and name a star together.",
  },
  {
    title: "Shared galaxies",
    body: "Swap playlists that feel like cosmic maps of us.",
  },
  {
    title: "Soft aurora",
    body: "Let the night stretch as long as it needs to, with warm whispers and hand squeezes.",
  },
];
const STARLIT_PROMISE_TITLE = "Orbit reasons";
const STARLIT_PROMISE_ITEMS = [
  "I will always point you toward the brightest nights.",
  "Our love is a steady constellation across the seasons.",
  "I promise to notice the tiny stars you are made of.",
  "Your gravity keeps me grounded in the most beautiful orbit.",
];
const DEFAULT_PERK_CARDS: BuilderPerkCard[] = [
  {
    title: "Snack mission",
    body: "Crunchy, sweet, and extra napkins. We are prepared.",
  },
  {
    title: "Playlist swap",
    body: "You pick the mood. I queue the heart songs.",
  },
  {
    title: "Hug voucher",
    body: "Unlimited squeezes. Redeem any time you want.",
  },
  {
    title: "Meme reserve",
    body: "Curated chaos, saved just for us.",
  },
];

const themePresets: Record<TemplateId, Omit<BuilderTheme, "gradient" | "tagline">> = {
  "cute-classic": {
    card: "bg-white/85",
    text: "text-slate-900",
    mutedText: "text-slate-600",
    accent: "text-rose-500",
    maxPhotos: DEFAULT_MAX_PHOTOS,
    photoUpsellPrice: DEFAULT_UPSELL_PRICE,
    defaultFont: "soft",
  },
  "midnight-muse": {
    card: "bg-slate-900/70",
    text: "text-slate-50",
    mutedText: "text-slate-300",
    accent: "text-rose-300",
    maxPhotos: DEFAULT_MAX_PHOTOS,
    photoUpsellPrice: DEFAULT_UPSELL_PRICE,
    defaultFont: "romantic",
  },
  "sunlit-picnic": {
    card: "bg-white/85",
    text: "text-slate-900",
    mutedText: "text-slate-600",
    accent: "text-amber-500",
    maxPhotos: DEFAULT_MAX_PHOTOS,
    photoUpsellPrice: DEFAULT_UPSELL_PRICE,
    defaultFont: "soft",
  },
  "garden-party": {
    card: "bg-white/85",
    text: "text-slate-900",
    mutedText: "text-slate-600",
    accent: "text-emerald-500",
    maxPhotos: DEFAULT_MAX_PHOTOS,
    photoUpsellPrice: DEFAULT_UPSELL_PRICE,
    defaultFont: "classic",
  },
  "retro-love": {
    card: "bg-white/85",
    text: "text-slate-900",
    mutedText: "text-slate-600",
    accent: "text-rose-500",
    maxPhotos: DEFAULT_MAX_PHOTOS,
    photoUpsellPrice: DEFAULT_UPSELL_PRICE,
    defaultFont: "playful",
  },
  "starlit-constellations": {
    card: "bg-slate-950/60",
    text: "text-white",
    mutedText: "text-slate-300",
    accent: "text-sky-200",
    maxPhotos: DEFAULT_MAX_PHOTOS,
    photoUpsellPrice: DEFAULT_UPSELL_PRICE,
    defaultFont: "soft",
  },
};

const momentsTitlePresets: Partial<Record<TemplateId, string>> = {
  "midnight-muse": MIDNIGHT_MOMENTS_TITLE,
  "sunlit-picnic": SUNLIT_MOMENTS_TITLE,
  "garden-party": GARDEN_MOMENTS_TITLE,
};

const extraLoveTitlePresets: Partial<Record<TemplateId, string>> = {
  "midnight-muse": "Midnight echoes",
  "sunlit-picnic": "Golden note",
  "garden-party": "Garden note",
};

export const getDefaultMomentsTitle = (templateId: TemplateId) =>
  momentsTitlePresets[templateId] ?? DEFAULT_MOMENTS_TITLE;

export const getDefaultLoveNoteTitle = (
  templateId: TemplateId,
  index: number
) => {
  if (index === 0) {
    return DEFAULT_LOVE_NOTE_TITLE;
  }
  return extraLoveTitlePresets[templateId] ?? DEFAULT_EXTRA_LOVE_TITLE;
};

const createPhoto = (src: string, order: number): BuilderPhoto => ({
  id: `photo-${order}-${Math.random().toString(36).slice(2, 8)}`,
  src,
  caption: "",
  order,
});

export const getBuilderTheme = (templateId: TemplateId): BuilderTheme => {
  const template = getTemplateById(templateId);
  const preset = themePresets[templateId];
  return {
    gradient: template?.theme.gradient ?? "from-rose-300 via-pink-200 to-amber-100",
    tagline: template?.vibeTagline ?? "Made with love.",
    ...preset,
  };
};

export const getBuilderSettings = (templateId: TemplateId): BuilderSettings => {
  const theme = getBuilderTheme(templateId);
  return {
    maxPhotos: theme.maxPhotos,
    photoUpsellPrice: theme.photoUpsellPrice,
  };
};

export const getDefaultBuilderDoc = (templateId: TemplateId): BuilderDoc => {
  const template = getTemplateById(templateId);
  const copy = getDemoCopyByTemplateId(templateId);
  const theme = getBuilderTheme(templateId);
  const demoImages = template?.demo.images ?? [];

  const photos = demoImages.slice(0, 3).map((src, index) =>
    createPhoto(src, index)
  );

  const baseDoc: BuilderDoc = {
    templateId,
    tagline: theme.tagline,
    title: copy.title,
    subtitle: copy.intro,
    loveNote: copy.loveNote,
    loveNotes: [copy.loveNote],
    loveNoteTitles: [getDefaultLoveNoteTitle(templateId, 0)],
    momentsTitle: getDefaultMomentsTitle(templateId),
    moments: copy.cuteMoments,
    swoonLabel: DEFAULT_SWOON_LABEL,
    swoonHeadline: DEFAULT_SWOON_HEADLINE,
    swoonBody: DEFAULT_SWOON_BODY,
    swoonTags: [...DEFAULT_SWOON_TAGS],
    perkCards: DEFAULT_PERK_CARDS.map((card) => ({ ...card })),
    datePlanTitle: DEFAULT_DATE_PLAN_TITLE,
    datePlanSteps: DEFAULT_DATE_PLAN_STEPS.map((step) => ({ ...step })),
    promiseTitle: DEFAULT_PROMISE_TITLE,
    promiseItems: [...DEFAULT_PROMISE_ITEMS],
    photos,
    music: template?.demo.music
      ? {
          url: template.demo.music.src,
          name: template.demo.music.title,
        }
      : null,
    selectedFont: theme.defaultFont,
    titleSize: "normal",
    showSubtitle: true,
    sectionOrder: ["gallery", "love-note", "moments"],
    photoMood: "natural",
    backgroundIntensity: "medium",
    midnightPalette: DEFAULT_MIDNIGHT_PALETTE,
  };

  if (templateId === "midnight-muse") {
    return {
      ...baseDoc,
      momentsTitle: MIDNIGHT_MOMENTS_TITLE,
      swoonLabel: MIDNIGHT_SWOON_LABEL,
      swoonHeadline: MIDNIGHT_SWOON_HEADLINE,
      swoonBody: MIDNIGHT_SWOON_BODY,
      swoonTags: [...MIDNIGHT_SWOON_TAGS],
      perkCards: MIDNIGHT_PERK_CARDS.map((card) => ({ ...card })),
      datePlanTitle: MIDNIGHT_DATE_PLAN_TITLE,
      datePlanSteps: MIDNIGHT_DATE_PLAN_STEPS.map((step) => ({ ...step })),
      promiseTitle: MIDNIGHT_PROMISE_TITLE,
      promiseItems: [...MIDNIGHT_PROMISE_ITEMS],
    };
  }

  if (templateId === "sunlit-picnic") {
    return {
      ...baseDoc,
      momentsTitle: SUNLIT_MOMENTS_TITLE,
      swoonLabel: SUNLIT_SWOON_LABEL,
      swoonHeadline: SUNLIT_SWOON_HEADLINE,
      swoonBody: SUNLIT_SWOON_BODY,
      swoonTags: [...SUNLIT_SWOON_TAGS],
      perkCards: SUNLIT_PERK_CARDS.map((card) => ({ ...card })),
      datePlanTitle: SUNLIT_DATE_PLAN_TITLE,
      datePlanSteps: SUNLIT_DATE_PLAN_STEPS.map((step) => ({ ...step })),
      promiseTitle: SUNLIT_PROMISE_TITLE,
      promiseItems: [...SUNLIT_PROMISE_ITEMS],
    };
  }

  if (templateId === "garden-party") {
    return {
      ...baseDoc,
      momentsTitle: GARDEN_MOMENTS_TITLE,
      swoonLabel: GARDEN_SWOON_LABEL,
      swoonHeadline: GARDEN_SWOON_HEADLINE,
      swoonBody: GARDEN_SWOON_BODY,
      swoonTags: [...GARDEN_SWOON_TAGS],
      perkCards: GARDEN_PERK_CARDS.map((card) => ({ ...card })),
      datePlanTitle: GARDEN_DATE_PLAN_TITLE,
      datePlanSteps: GARDEN_DATE_PLAN_STEPS.map((step) => ({ ...step })),
      promiseTitle: GARDEN_PROMISE_TITLE,
      promiseItems: [...GARDEN_PROMISE_ITEMS],
    };
  }

  if (templateId === "retro-love") {
    return {
      ...baseDoc,
      tagline: RETRO_TAGLINE,
      momentsTitle: RETRO_MOMENTS_TITLE,
      swoonLabel: RETRO_SWOON_LABEL,
      swoonHeadline: RETRO_SWOON_HEADLINE,
      promiseTitle: RETRO_PROMISE_TITLE,
      promiseItems: [...RETRO_PROMISE_ITEMS],
    };
  }

  if (templateId === "starlit-constellations") {
    return {
      ...baseDoc,
      tagline: "Name a star",
      momentsTitle: STARLIT_MOMENTS_TITLE,
      swoonLabel: STARLIT_SWOON_LABEL,
      swoonHeadline: STARLIT_SWOON_HEADLINE,
      swoonBody: STARLIT_SWOON_BODY,
      swoonTags: [...STARLIT_SWOON_TAGS],
      perkCards: STARLIT_PERK_CARDS.map((card) => ({ ...card })),
      datePlanTitle: STARLIT_DATE_PLAN_TITLE,
      datePlanSteps: STARLIT_DATE_PLAN_STEPS.map((step) => ({ ...step })),
      promiseTitle: STARLIT_PROMISE_TITLE,
      promiseItems: [...STARLIT_PROMISE_ITEMS],
    };
  }

  return baseDoc;
};

export const createUploadedPhoto = (src: string, order: number): BuilderPhoto =>
  createPhoto(src, order);
