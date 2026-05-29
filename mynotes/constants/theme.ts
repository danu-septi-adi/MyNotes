export const LightColors = {
  primary: '#6366F1',
  primaryLight: '#818CF8',
  primaryDark: '#4F46E5',
  primaryBg: '#EEF2FF',

  success: '#10B981',
  successBg: '#ECFDF5',
  error: '#EF4444',
  errorBg: '#FEF2F2',
  warning: '#F59E0B',
  warningBg: '#FEF3C7',
  info: '#3B82F6',
  infoBg: '#EFF6FF',

  gray50: '#F9FAFB',
  gray100: '#F3F4F6',
  gray200: '#E5E7EB',
  gray300: '#D1D5DB',
  gray400: '#9CA3AF',
  gray500: '#6B7280',
  gray600: '#4B5563',
  gray700: '#374151',
  gray800: '#1F2937',
  gray900: '#111827',

  white: '#FFFFFF',
  black: '#000000',
  bg: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceBorder: '#F3F4F6',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
};

export const DarkColors = {
  primary: '#818CF8',
  primaryLight: '#A5B4FC',
  primaryDark: '#6366F1',
  primaryBg: '#1E1B4B',

  success: '#34D399',
  successBg: '#064E3B',
  error: '#F87171',
  errorBg: '#450A0A',
  warning: '#FBBF24',
  warningBg: '#451A03',
  info: '#60A5FA',
  infoBg: '#172554',

  gray50: '#18181B',
  gray100: '#27272A',
  gray200: '#3F3F46',
  gray300: '#52525B',
  gray400: '#A1A1AA',
  gray500: '#D4D4D8',
  gray600: '#E4E4E7',
  gray700: '#F4F4F5',
  gray800: '#FAFAFA',
  gray900: '#FFFFFF',

  white: '#09090B',
  black: '#FFFFFF',
  bg: '#09090B',
  surface: '#18181B',
  surfaceBorder: '#27272A',
  text: '#FFFFFF',
  textSecondary: '#D4D4D8',
  textMuted: '#A1A1AA',
};

export type ColorTheme = typeof LightColors;

export { LightColors as Colors };

export const Spacing = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, xxxl: 32,
};

export const BorderRadius = {
  sm: 8, md: 12, lg: 16, xl: 20, xxl: 24, full: 9999,
};

export const Typography = {
  h1: { fontSize: 32, fontWeight: '800' as const, letterSpacing: -1, lineHeight: 40 },
  h2: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 36 },
  h3: { fontSize: 24, fontWeight: '700' as const, letterSpacing: -0.5, lineHeight: 32 },
  h4: { fontSize: 20, fontWeight: '600' as const, lineHeight: 28 },
  body: { fontSize: 16, fontWeight: '400' as const, lineHeight: 24 },
  bodyBold: { fontSize: 16, fontWeight: '600' as const, lineHeight: 24 },
  small: { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  smallBold: { fontSize: 14, fontWeight: '600' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const, lineHeight: 16 },
  captionBold: { fontSize: 12, fontWeight: '600' as const, lineHeight: 16 },
};

export const Shadow = (colors: ColorTheme) => ({
  sm: { shadowColor: colors.black, shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  md: { shadowColor: colors.black, shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.12, shadowRadius: 4, elevation: 3 },
  lg: { shadowColor: colors.black, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.15, shadowRadius: 8, elevation: 5 },
  xl: { shadowColor: colors.primary, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8, elevation: 8 },
});
