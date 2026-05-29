const COINGECKO = 'https://api.coingecko.com/api/v3';

let ratesCache: Record<string, number> = { USD: 1, IDR: 16500 };

async function fetchRates(): Promise<Record<string, number>> {
  try {
    const res = await fetch('https://api.exchangerate-api.com/v4/latest/USD');
    const data = await res.json();
    if (data?.rates) ratesCache = { ...data.rates, USD: 1 };
    return ratesCache;
  } catch { return ratesCache; }
}

export async function fetchCryptoPrice(ids: string[], targetCurrency: string = 'IDR'): Promise<Record<string, number>> {
  try {
    const rates = await fetchRates();
    const rate = rates[targetCurrency] || 1;
    const url = `${COINGECKO}/simple/price?ids=${ids.join(',')}&vs_currencies=usd`;
    const res = await fetch(url);
    const data = await res.json();
    const result: Record<string, number> = {};
    for (const id of ids) {
      const usd = data[id]?.usd || 0;
      result[id] = usd * rate;
    }
    return result;
  } catch { return {}; }
}

export async function fetchGoldPrice(targetCurrency: string = 'IDR'): Promise<number> {
  try {
    const rates = await fetchRates();
    const rate = rates[targetCurrency] || 1;
    const res = await fetch('https://www.goldapi.io/api/XAU/USD', {
      headers: { 'x-access-token': 'goldapi-demo' },
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return (data.price || 0) * rate;
  } catch { return 0; }
}

export async function fetchStockPrice(symbol: string): Promise<number> {
  try {
    const res = await fetch(`https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?range=1d&interval=1d`);
    const data = await res.json();
    return data?.chart?.result?.[0]?.meta?.regularMarketPrice || 0;
  } catch { return 0; }
}
