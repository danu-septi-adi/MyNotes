import { useSettings } from '../contexts/SettingsContext';
import { LightColors, DarkColors, ColorTheme, Shadow } from '../constants/theme';

export function useColors(): { colors: ColorTheme; shadow: ReturnType<typeof Shadow> } {
  const { resolvedTheme, settings } = useSettings();
  const base = resolvedTheme === 'dark' ? { ...DarkColors } : { ...LightColors };

  if (settings.tabColor && settings.tabColor !== base.primary) {
    base.primary = settings.tabColor;
  }

  return {
    colors: base,
    shadow: Shadow(base),
  };
}
