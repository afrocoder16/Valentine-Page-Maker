export const TEMPLATE_IDS = [
  "cute-classic",
  "midnight-muse",
  "sunlit-picnic",
  "garden-party",
  "retro-love",
  "starlit-constellations",
] as const;

export type TemplateId = (typeof TEMPLATE_IDS)[number];

export type Template = {
  id: TemplateId;
  name: string;
  vibeTagline: string;
  description: string;
  demo: {
    caption: string;
    images: string[];
    music?: {
      title: string;
      src: string;
    };
  };
  theme: {
    gradient: string;
  };
};

const templates: Template[] = [
  {
    id: "cute-classic",
    name: "Cute Classic",
    vibeTagline: "Cute, goofy, totally smitten.",
    description: "Playful prompts, meme-friendly moments, and big YES energy.",
    demo: {
      caption: "Cute chaos, meme energy, and a loud YES.",
      images: [
        "/demos/cute-classic/1.jpg",
        "/demos/cute-classic/2.jpg",
        "/demos/cute-classic/3.jpg",
      ],
    },
    theme: {
      gradient: "from-rose-200 via-pink-100 to-amber-100",
    },
  },
  {
    id: "midnight-muse",
    name: "Midnight Muse",
    vibeTagline: "Moody, cinematic, modern.",
    description: "Deep tones with glowing highlights for a dramatic reveal.",
    demo: {
      caption: "Midnight tones with a glowing love note.",
      images: [
        "/demos/midnight-muse/1.jpg",
        "/demos/midnight-muse/2.jpg",
        "/demos/midnight-muse/3.jpg",
      ],
    },
    theme: {
      gradient: "from-slate-900 via-slate-700 to-rose-500",
    },
  },
  {
    id: "sunlit-picnic",
    name: "Sunlit Picnic",
    vibeTagline: "Bright, breezy, joyful.",
    description: "Daylight vibes with airy spacing and crisp accents.",
    demo: {
      caption: "Golden hour smiles with easy, open air.",
      images: [
        "/demos/sunlit-picnic/1.jpg",
        "/demos/sunlit-picnic/2.jpg",
        "/demos/sunlit-picnic/3.jpg",
      ],
    },
    theme: {
      gradient: "from-amber-200 via-orange-200 to-rose-200",
    },
  },
  {
    id: "garden-party",
    name: "Garden Party",
    vibeTagline: "Fresh, floral, romantic.",
    description: "Petal-inspired hues with a soft, luxe finish.",
    demo: {
      caption: "Petal hues and a soft romantic glow.",
      images: [
        "/demos/garden-party/1.jpg",
        "/demos/garden-party/2.jpg",
        "/demos/garden-party/3.jpg",
      ],
    },
    theme: {
      gradient: "from-emerald-200 via-rose-200 to-amber-100",
    },
  },
  {
    id: "retro-love",
    name: "Retro Love: VHS Arcade",
    vibeTagline: "VHS arcade, neon, kinetic.",
    description: "Playable VHS arcade love story with snap scenes and bold type.",
    demo: {
      caption: "VHS arcade glow with playable love scenes.",
      images: [
        "/demos/retro-love/1.jpg",
        "/demos/retro-love/2.jpg",
        "/demos/retro-love/3.jpg",
      ],
    },
    theme: {
      gradient: "from-amber-300 via-rose-300 to-fuchsia-300",
    },
  },
  {
    id: "starlit-constellations",
    name: "Starlit Constellations",
    vibeTagline: "Dreamy, intimate, magical.",
    description:
      "A guided night sky that traces your story into constellations, orbiting reasons, and wishful sparks.",
    demo: {
      caption:
        "A velvety nebula, glowing stars, and tap-to-ignite moments that bloom as you scroll.",
      images: [
        "/demos/starlit-constellations/1.svg",
        "/demos/starlit-constellations/2.svg",
        "/demos/starlit-constellations/3.svg",
      ],
      music: {
        title:
          "Vincent (Starry Starry Night) - string quartet cover by The Manila String Machine",
        src: "/demos/audio/vincent-starry-night.mp3",
      },
    },
    theme: {
      gradient: "from-slate-900 via-indigo-950 to-purple-700",
    },
  },
];

export const getTemplates = () => templates;

export const getTemplateById = (id?: TemplateId | string | null) =>
  templates.find((template) => template.id === id);
