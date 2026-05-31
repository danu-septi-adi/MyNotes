import { useSettings } from '../contexts/SettingsContext';
import { formatCurrency, formatCurrencyShort } from '../constants/currencies';
import { convert } from '../services/rates';

export function useCurrency() {
  const { settings } = useSettings();
  const display = settings.displayCurrency;

  return {
    nativeCode: settings.nativeCurrency,
    displayCode: display,
    /**
     * Format angka. Jika dariCurrency diberikan, konversi dari mata uang asal ke display.
     * Jika tidak, format langsung dalam display currency (tanpa konversi).
     */
    format: (amount: number, fromCurrency?: string) => {
      if (fromCurrency && fromCurrency !== display) {
        const converted = convert(amount, fromCurrency, display);
        return formatCurrency(converted, display);
      }
      return formatCurrency(amount, display);
    },
    short: (amount: number, fromCurrency?: string) => {
      if (fromCurrency && fromCurrency !== display) {
        const converted = convert(amount, fromCurrency, display);
        return formatCurrencyShort(converted, display);
      }
      return formatCurrencyShort(amount, display);
    },
    convert: (amount: number, from: string, to?: string) => convert(amount, from, to || display),
  };
}
