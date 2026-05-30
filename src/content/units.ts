export interface UnitMeta {
  id: number;
  title: string;
  icon: string;
  order: number;
  unlockThreshold: number;
}

export const units: UnitMeta[] = [
  { id: 1,  title: 'Greetings',         icon: 'chatbubble-ellipses-outline', order: 1,  unlockThreshold: 0 },
  { id: 2,  title: 'Numbers & Time',    icon: 'time-outline',                order: 2,  unlockThreshold: 0.8 },
  { id: 3,  title: 'Daily Life',        icon: 'basket-outline',              order: 3,  unlockThreshold: 0.8 },
  { id: 4,  title: 'The Body',          icon: 'body-outline',                order: 4,  unlockThreshold: 0.8 },
  { id: 5,  title: 'Family',            icon: 'people-outline',              order: 5,  unlockThreshold: 0.8 },
  { id: 6,  title: 'Emotions',          icon: 'heart-outline',               order: 6,  unlockThreshold: 0.8 },
  { id: 7,  title: 'Action Verbs I',    icon: 'walk-outline',                order: 7,  unlockThreshold: 0.8 },
  { id: 8,  title: 'Action Verbs II',   icon: 'flash-outline',               order: 8,  unlockThreshold: 0.8 },
  { id: 9,  title: 'Verb Tenses',       icon: 'repeat-outline',              order: 9,  unlockThreshold: 0.8 },
  { id: 10, title: 'Colours & Adjectives', icon: 'color-palette-outline',   order: 10, unlockThreshold: 0.8 },
  { id: 11, title: 'Home & Furniture',  icon: 'home-outline',                order: 11, unlockThreshold: 0.8 },
  { id: 12, title: 'Food & Cooking',    icon: 'restaurant-outline',          order: 12, unlockThreshold: 0.8 },
  { id: 13, title: 'Clothing',          icon: 'shirt-outline',               order: 13, unlockThreshold: 0.8 },
  { id: 14, title: 'Directions',        icon: 'navigate-outline',            order: 14, unlockThreshold: 0.8 },
  { id: 15, title: 'Transport',         icon: 'car-outline',                 order: 15, unlockThreshold: 0.8 },
  { id: 16, title: 'Shopping & Money',  icon: 'cash-outline',                order: 16, unlockThreshold: 0.8 },
  { id: 17, title: 'Health',            icon: 'medkit-outline',              order: 17, unlockThreshold: 0.8 },
  { id: 18, title: 'School & Work',     icon: 'briefcase-outline',           order: 18, unlockThreshold: 0.8 },
  { id: 19, title: 'Nature & Weather',  icon: 'partly-sunny-outline',        order: 19, unlockThreshold: 0.8 },
  { id: 20, title: 'Phrases',           icon: 'mic-outline',                 order: 20, unlockThreshold: 0.8 },
];
