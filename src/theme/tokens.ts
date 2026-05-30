export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
  xxxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  full: 999,
} as const;

const lightColors = {
  background: {
    screen: '#FFFFFF',
    card: '#F5F5F5',
    input: '#EFEFEF',
  },
  text: {
    primary: '#3C3C3C',
    secondary: '#777777',
    inverse: '#FFFFFF',
  },
  brand: {
    primary: '#58CC02',
    secondary: '#89E219',
  },
  state: {
    correct: { background: '#D7FFB8', text: '#2B7000' },
    wrong: { background: '#FFE5E5', text: '#CC0000' },
  },
  gamification: {
    xp: '#FFD700',
    streak: '#FF9600',
  },
  border: {
    default: '#E0E0E0',
    focus: '#58CC02',
  },
  icon: {
    default: '#3C3C3C',
    muted: '#AAAAAA',
    active: '#58CC02',
  },
};

const darkColors = {
  background: {
    screen: '#131F24',
    card: '#1E2D34',
    input: '#253540',
  },
  text: {
    primary: '#F0EDD4',
    secondary: '#9EADB6',
    inverse: '#131F24',
  },
  brand: {
    primary: '#58CC02',
    secondary: '#3D8C00',
  },
  state: {
    correct: { background: '#1A3D0F', text: '#89E219' },
    wrong: { background: '#3D1212', text: '#FF6B6B' },
  },
  gamification: {
    xp: '#FFD700',
    streak: '#FF9600',
  },
  border: {
    default: '#2E4050',
    focus: '#58CC02',
  },
  icon: {
    default: '#F0EDD4',
    muted: '#4A6070',
    active: '#58CC02',
  },
};

export type Theme = {
  colors: {
    background: { screen: string; card: string; input: string };
    text: { primary: string; secondary: string; inverse: string };
    brand: { primary: string; secondary: string };
    state: {
      correct: { background: string; text: string };
      wrong: { background: string; text: string };
    };
    gamification: { xp: string; streak: string };
    border: { default: string; focus: string };
    icon: { default: string; muted: string; active: string };
  };
  spacing: typeof spacing;
  radius: typeof radius;
  dark: boolean;
};

export const lightTheme: Theme = {
  colors: lightColors,
  spacing,
  radius,
  dark: false,
};

export const darkTheme: Theme = {
  colors: darkColors,
  spacing,
  radius,
  dark: true,
};
