export type DemoCopy = {
  title: string;
  intro: string;
  loveNote: string;
  cuteMoments: string[];
};

const defaultCopy: DemoCopy = {
  title: "Will u be my Valentine?",
  intro:
    "I made this little page for you, because loving you is my favorite thing.",
  loveNote:
    "From the first hello, you have been my safest place and my biggest smile. Thank you for the way you show up, the way you listen, and the way you love. I cannot wait for our next chapter together.",
  cuteMoments: [
    "The quiet morning hugs that start everything right.",
    "Your laugh when I say something ridiculous.",
    "That look you give me when you are happy.",
  ],
};

const demoCopyByTemplateId: Record<string, DemoCopy> = {
  "cute-classic": {
    title: "Will u be my Valentine?",
    intro:
      "I made this tiny page to ask a big question and offer snacks, memes, and hugs.",
    loveNote:
      "You are my favorite notification and my favorite laugh. Say yes and I will bring the cozy blanket, the popcorn, and the best playlist.",
    cuteMoments: [
      "Your laugh when I do my dramatic voice.",
      "The way you steal my fries and smile.",
      "Our inside jokes that make no sense to anyone else.",
    ],
  },
  "midnight-muse": {
    title: "Will u be my Valentine?",
    intro: "For the nights that glow and the moments that linger, this is for you.",
    loveNote:
      "You are the spark in my late-night thoughts and the calm in my chaos. Every time I see you, the world slows down just enough to breathe.",
    cuteMoments: [
      "The way the city hums when you are beside me.",
      "The slow dance we do without music.",
      "That look you give me when the night is ours.",
    ],
  },
  "sunlit-picnic": {
    title: "Will u be my Valentine?",
    intro: "You are my sunny day, the soft breeze, and the calm I keep.",
    loveNote:
      "Being with you feels like golden light on my skin and a soft laugh in the air. Thank you for making ordinary days feel like a picnic I never want to leave.",
    cuteMoments: [
      "The way your smile follows the sunlight.",
      "Our slow walks that turn into adventures.",
      "The calm that shows up when you are near.",
    ],
  },
  "garden-party": {
    title: "Will u be my Valentine?",
    intro: "A little love note, wrapped in petals and soft light.",
    loveNote:
      "You make everything feel gentle and bright. Thank you for being my calm, my cheer, and my favorite bloom in every season.",
    cuteMoments: [
      "The quiet strolls under warm skies.",
      "The tiny surprises tucked in every day.",
      "The way you make everything feel like home.",
    ],
  },
  "retro-love": {
    title: "I LIKE U",
    intro: "Insert heart to continue.",
    loveNote: "You just unlocked the bonus level of us.",
    cuteMoments: [
      "Arcade glow and late-night laughs.",
      "The freeze-frame moments I replay.",
      "Our soundtrack stuck on repeat.",
    ],
  },
  "starlit-constellations": {
    title: "I'd name a star after you.",
    intro:
      "I traced our story across the night sky so you can feel how every moment glows together.",
    loveNote:
      "You are the steady constellation I follow - the glow that calms and the pull that never lets go. Let's keep orbiting toward every dream we share.",
    cuteMoments: [
      "The first look that felt like a supernova.",
      "Holding hands beneath city lights that shimmered like stars.",
      "Late-night whispers that felt like destiny aligning.",
      "Playlists that always start with the same opening note.",
      "Tiny rituals that prove we were meant to cross paths.",
      "Naming constellations together when the sky was perfectly clear.",
      "The way adventure feels safe when you are beside me.",
      "Shared meaning in every detour and magical pause.",
      "That feeling of being meant to cross paths every single day.",
      "The silent promise that every starry night belongs to us."
    ],
  },
};

export const getDemoCopyByTemplateId = (id?: string | null) =>
  demoCopyByTemplateId[id ?? ""] ?? defaultCopy;
