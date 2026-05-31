import db from '../database';

export async function syncRates(): Promise<void> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const data = await res.json();
    if (!data?.rates) return;

    db.runSync('DELETE FROM currency_rates');
    for (const [code, rate] of Object.entries(data.rates)) {
      db.runSync('INSERT OR REPLACE INTO currency_rates (code, rate, updated_at) VALUES (?, ?, datetime("now"))', [code, rate as number]);
    }
  } catch {
    // fallback: gunakan rate minimal
    const existing = db.getAllSync('SELECT count(*) as c FROM currency_rates') as any[];
    if (existing[0]?.c === 0) {
      seedDefaultRates();
    }
  }
}

function seedDefaultRates() {
  const rates: Record<string, number> = { USD: 1, IDR: 16500, EUR: 0.92, GBP: 0.79, SGD: 1.35, MYR: 4.68, JPY: 156.5, CNY: 7.24, KRW: 1370, SAR: 3.75, CHF: 0.90, AUD: 1.53, THB: 36.5 };
  for (const [code, rate] of Object.entries(rates)) {
    db.runSync('INSERT OR REPLACE INTO currency_rates (code, rate, updated_at) VALUES (?, ?, datetime("now"))', [code, rate]);
  }
}

export function getRate(code: string): number {
  if (code === 'USD') return 1;
  const rows = db.getAllSync('SELECT rate FROM currency_rates WHERE code = ?', [code]) as any[];
  return rows[0]?.rate || 0;
}

export function convert(value: number, from: string, to: string): number {
  if (from === to || value === 0) return value;
  const fromRate = getRate(from);
  const toRate = getRate(to);
  if (fromRate === 0 || toRate === 0) return value;
  const usdValue = value / fromRate;
  return usdValue * toRate;
}
