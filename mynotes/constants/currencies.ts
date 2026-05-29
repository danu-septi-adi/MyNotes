export const currencies = [
  { code: 'IDR', symbol: 'Rp', locale: 'id-ID', name: 'Rupiah Indonesia' },
  { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
  { code: 'SGD', symbol: 'S$', locale: 'en-SG', name: 'Singapore Dollar' },
  { code: 'MYR', symbol: 'RM', locale: 'ms-MY', name: 'Malaysian Ringgit' },
  { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
  { code: 'CNY', symbol: '¥', locale: 'zh-CN', name: 'Chinese Yuan' },
  { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
  { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
  { code: 'KRW', symbol: '₩', locale: 'ko-KR', name: 'South Korean Won' },
  { code: 'SAR', symbol: '﷼', locale: 'ar-SA', name: 'Saudi Riyal' },
];

export function formatCurrency(amount: number, code: string): string {
  const c = currencies.find(c => c.code === code) || currencies[0];
  try {
    return new Intl.NumberFormat(c.locale, { style: 'currency', currency: code, minimumFractionDigits: 0 }).format(Math.abs(amount));
  } catch {
    return `${c.symbol} ${Math.abs(amount).toLocaleString()}`;
  }
}

export function formatCurrencyShort(amount: number, code: string): string {
  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';
  const c = currencies.find(c => c.code === code) || currencies[0];
  const sym = c.symbol;

  if (abs >= 1_000_000_000_000) return `${sign}${sym}${(abs / 1_000_000_000_000).toFixed(1)}T`;
  if (abs >= 1_000_000_000) return `${sign}${sym}${(abs / 1_000_000_000).toFixed(1)}M`;
  if (abs >= 1_000_000) return `${sign}${sym}${(abs / 1_000_000).toFixed(1)}jt`;
  if (abs >= 1_000) return `${sign}${sym}${(abs / 1_000).toFixed(1)}rb`;

  return formatCurrency(amount, code);
}
