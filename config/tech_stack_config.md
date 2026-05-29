---
name: tech_stack_config
description: Tech stack configuration untuk project Aplikasi Catatan Keuangan & Aktifitas Harian
metadata:
  type: reference
---

## Tech Stack

| Kategori | Teknologi |
|----------|-----------|
| Framework | Expo SDK 52+ (React Native) |
| State Management | React Context / Redux Toolkit (opsional) |
| Database | Expo SQLite |
| Navigation | Expo Router / React Navigation |
| UI Library | React Native Paper / NativeBase / Custom |
| Chart/Graph | react-native-chart-kit / victory-native |
| API | Fetch / Axios (untuk real-time price API) |
| Local Storage | Expo SecureStore / AsyncStorage |

## API Real-time (Investing)
- **Komoditas:** Emas, Crypto, Saham
- **Rekomendasi API Gratis:**
  - Crypto: CoinGecko API / Binance API
  - Emas: GoldAPI.io (free tier) / Exir
  - Saham: Alpha Vantage (free tier) / Finnhub (free tier)

## Library Rekomendasi
- `expo-sqlite` - Database lokal
- `react-native-chart-kit` - Grafik keuangan
- `expo-notifications` - Alarm/reminder
- `expo-local-authentication` - Biometric auth (opsional)
- `expo-file-system` + `expo-sharing` - Export file
- `@react-native-async-storage/async-storage` - Local storage
