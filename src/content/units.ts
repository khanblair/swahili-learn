export type CefrLevel = 'A1' | 'A2' | 'B1';

export interface UnitMeta {
  id: number;
  title: string;
  icon: string;
  order: number;
  unlockThreshold: number;
  level: CefrLevel;
}

export const units: UnitMeta[] = [
  // ── A1 · Absolute Beginner ───────────────────────────────────────────────
  { id: 1,  title: 'Greetings',            icon: 'chatbubble-ellipses-outline', order: 1,  unlockThreshold: 0,   level: 'A1' },
  { id: 2,  title: 'Numbers & Time',       icon: 'time-outline',                order: 2,  unlockThreshold: 0.8, level: 'A1' },
  { id: 3,  title: 'Daily Life',           icon: 'basket-outline',              order: 3,  unlockThreshold: 0.8, level: 'A1' },
  { id: 4,  title: 'The Body',             icon: 'body-outline',                order: 4,  unlockThreshold: 0.8, level: 'A1' },
  { id: 5,  title: 'Family',               icon: 'people-outline',              order: 5,  unlockThreshold: 0.8, level: 'A1' },
  { id: 6,  title: 'Emotions',             icon: 'heart-outline',               order: 6,  unlockThreshold: 0.8, level: 'A1' },
  { id: 7,  title: 'Action Verbs I',       icon: 'walk-outline',                order: 7,  unlockThreshold: 0.8, level: 'A1' },
  // ── A2 · Elementary ──────────────────────────────────────────────────────
  { id: 8,  title: 'Action Verbs II',      icon: 'flash-outline',               order: 8,  unlockThreshold: 0.8, level: 'A2' },
  { id: 9,  title: 'Verb Tenses',          icon: 'repeat-outline',              order: 9,  unlockThreshold: 0.8, level: 'A2' },
  { id: 10, title: 'Colours & Adjectives', icon: 'color-palette-outline',       order: 10, unlockThreshold: 0.8, level: 'A2' },
  { id: 11, title: 'Home & Furniture',     icon: 'home-outline',                order: 11, unlockThreshold: 0.8, level: 'A2' },
  { id: 12, title: 'Food & Cooking',       icon: 'restaurant-outline',          order: 12, unlockThreshold: 0.8, level: 'A2' },
  { id: 13, title: 'Clothing',             icon: 'shirt-outline',               order: 13, unlockThreshold: 0.8, level: 'A2' },
  { id: 14, title: 'Directions',           icon: 'navigate-outline',            order: 14, unlockThreshold: 0.8, level: 'A2' },
  // ── B1 · Intermediate ────────────────────────────────────────────────────
  { id: 15, title: 'Transport',            icon: 'car-outline',                 order: 15, unlockThreshold: 0.8, level: 'B1' },
  { id: 16, title: 'Shopping & Money',     icon: 'cash-outline',                order: 16, unlockThreshold: 0.8, level: 'B1' },
  { id: 17, title: 'Health',               icon: 'medkit-outline',              order: 17, unlockThreshold: 0.8, level: 'B1' },
  { id: 18, title: 'School & Work',        icon: 'briefcase-outline',           order: 18, unlockThreshold: 0.8, level: 'B1' },
  { id: 19, title: 'Nature & Weather',     icon: 'partly-sunny-outline',        order: 19, unlockThreshold: 0.8, level: 'B1' },
  { id: 20, title: 'Phrases',              icon: 'mic-outline',                 order: 20, unlockThreshold: 0.8, level: 'B1' },

  // ── A1 · Grammar Track (Teach Yourself Swahili) ───────────────────────────
  { id: 21, title: 'Pronouns & "To Be"',   icon: 'person-outline',              order: 21, unlockThreshold: 0.8, level: 'A1' },
  { id: 22, title: 'Present Tense -NA-',   icon: 'ellipsis-horizontal-outline', order: 22, unlockThreshold: 0.8, level: 'A1' },
  { id: 23, title: 'Negation',             icon: 'close-circle-outline',        order: 23, unlockThreshold: 0.8, level: 'A1' },
  { id: 24, title: 'Past Tense -LI-',      icon: 'arrow-back-circle-outline',   order: 24, unlockThreshold: 0.8, level: 'A2' },
  { id: 25, title: 'Future Tense -TA-',    icon: 'arrow-forward-circle-outline', order: 25, unlockThreshold: 0.8, level: 'A2' },
  { id: 26, title: 'Days & Time Phrases',  icon: 'calendar-outline',            order: 26, unlockThreshold: 0.8, level: 'A1' },
  { id: 27, title: 'Animals',              icon: 'paw-outline',                 order: 27, unlockThreshold: 0.8, level: 'A2' },
  { id: 28, title: 'Jobs & Professions',   icon: 'hammer-outline',              order: 28, unlockThreshold: 0.8, level: 'A2' },
  { id: 29, title: 'Numbers 11–1000',      icon: 'calculator-outline',          order: 29, unlockThreshold: 0.8, level: 'A1' },
  { id: 30, title: 'Object Infixes',       icon: 'git-merge-outline',           order: 30, unlockThreshold: 0.8, level: 'A2' },

  // ── B1 · Expanded Topics ────────────────────────────────────────────────
  { id: 31, title: 'Hobbies & Sports',      icon: 'football-outline',            order: 31, unlockThreshold: 0.8, level: 'A2' },
  { id: 32, title: 'Technology & Internet', icon: 'laptop-outline',              order: 32, unlockThreshold: 0.8, level: 'A2' },
  { id: 33, title: 'Travel & Tourism',      icon: 'airplane-outline',            order: 33, unlockThreshold: 0.8, level: 'B1' },
  { id: 34, title: 'Ordinals & Comparison', icon: 'podium-outline',              order: 34, unlockThreshold: 0.8, level: 'A2' },
  { id: 35, title: 'Measurements',          icon: 'resize-outline',              order: 35, unlockThreshold: 0.8, level: 'A2' },
  { id: 36, title: 'Daily Routines',         icon: 'sunny-outline',              order: 36, unlockThreshold: 0.8, level: 'A1' },
  { id: 37, title: 'EA Geography & Culture', icon: 'globe-outline',              order: 37, unlockThreshold: 0.8, level: 'B1' },
  { id: 38, title: 'Formal & Polite Speech', icon: 'ribbon-outline',             order: 38, unlockThreshold: 0.8, level: 'B1' },
  { id: 39, title: 'Media & Entertainment',  icon: 'film-outline',               order: 39, unlockThreshold: 0.8, level: 'B1' },
  { id: 40, title: 'Politics & Government',  icon: 'flag-outline',               order: 40, unlockThreshold: 0.8, level: 'B1' },
];
