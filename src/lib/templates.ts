export type Template = {
  id: string;
  name: string;
  vibe: string;
  description: string;
  previewStyle: string;
};

export const templates: Template[] = [
  {
    id: "cute-classic",
    name: "Cute Classic",
    vibe: "Warm, playful, timeless.",
    description: "Soft gradients, sweet captions, and a gentle story flow.",
    previewStyle: "from-rose-300 via-pink-200 to-amber-100",
  },
  {
    id: "midnight-muse",
    name: "Midnight Muse",
    vibe: "Moody, cinematic, modern.",
    description: "Deep tones with glowing highlights for a dramatic reveal.",
    previewStyle: "from-slate-900 via-slate-700 to-rose-500",
  },
  {
    id: "sunlit-picnic",
    name: "Sunlit Picnic",
    vibe: "Bright, breezy, joyful.",
    description: "Daylight vibes with airy spacing and crisp accents.",
    previewStyle: "from-amber-200 via-orange-200 to-rose-200",
  },
  {
    id: "garden-party",
    name: "Garden Party",
    vibe: "Fresh, floral, romantic.",
    description: "Petal-inspired hues with a soft, luxe finish.",
    previewStyle: "from-emerald-200 via-rose-200 to-amber-100",
  },
  {
    id: "retro-love",
    name: "Retro Love",
    vibe: "Bold, nostalgic, fun.",
    description: "Vintage poster energy with rich contrast and pop.",
    previewStyle: "from-amber-300 via-rose-300 to-fuchsia-300",
  },
];
