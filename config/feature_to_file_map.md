---
name: feature_to_file_map
description: Pemetaan fitur ke file kode
metadata:
  type: reference
---

## Feature to File Map

| Feature | File/Folder |
|---------|-------------|
| **1. Catatan Keuangan** | `src/features/finance/` |
| - Transaksi | `src/features/finance/transactions/` |
| - Kategori | `src/features/finance/categories/` |
| - Budget | `src/features/finance/budget/` |
| - Laporan | `src/features/finance/reports/` |
| - Hutang/Piutang | `src/features/finance/debts/` |
| **2. Aktifitas Harian** | `src/features/activities/` |
| - Todo List | `src/features/activities/todos/` |
| - Daily Journal | `src/features/activities/journal/` |
| **3. Wishlist** | `src/features/wishlist/` |
| **4. Jurnal Trading** | `src/features/trading/` |
| **5. Jurnal Investing** | `src/features/investing/` |
| **6. Navigasi** | `src/navigation/` |
| - Bottom Nav | `src/navigation/BottomTabNavigator.tsx` |
| - Stack Nav | `src/navigation/StackNavigator.tsx` |
| **7. Dashboard** | `src/screens/DashboardScreen.tsx` |
| **8. Profil** | `src/features/profile/` |
| **9. Auth (Opsional)** | `src/features/auth/` |
| **10. Settings** | `src/features/settings/` |

## Database Schema Files
- `src/database/schemas/` - SQLite/WatermelonDB schemas
- `src/database/migrations/` - Database migrations

## API Service Files
- `src/services/api/` - API clients
- `src/services/api/crypto.js` - CoinGecko/Binance
- `src/services/api/gold.js` - Gold API
- `src/services/api/stocks.js` - Stock API
