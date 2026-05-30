export interface UnitMeta {
  id: number;
  title: string;
  icon: string;
  order: number;
  unlockThreshold: number;
}

export const units: UnitMeta[] = [
  {
    id: 1,
    title: 'Greetings',
    icon: 'chatbubble-ellipses-outline',
    order: 1,
    unlockThreshold: 0,
  },
  {
    id: 2,
    title: 'Numbers & Time',
    icon: 'time-outline',
    order: 2,
    unlockThreshold: 0.8,
  },
  {
    id: 3,
    title: 'Daily Life',
    icon: 'basket-outline',
    order: 3,
    unlockThreshold: 0.8,
  },
];
