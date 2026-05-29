import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency, formatCurrencyShort } from '../constants/currencies';

export function useCurrency() {
  const { settings } = useSettings();
  return {
    code: settings.currency,
    format: (amount: number) => formatCurrency(amount, settings.currency),
    short: (amount: number) => formatCurrencyShort(amount, settings.currency),
  };
}
