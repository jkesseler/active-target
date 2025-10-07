import { createMantineTheme } from './createMantineTheme';
import { themes } from './index';

export type Theme = {
  label: string
  mantineTheme: ReturnType<typeof createMantineTheme>
};

export type ThemeName = keyof typeof themes;
