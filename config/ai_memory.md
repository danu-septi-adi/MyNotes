---
name: ai_memory
description: Memory "otak" AI - aturan, keputusan, state terakhir
metadata:
  type: user
---

## Project Context

**Project:** Aplikasi Catatan Keuangan & Aktifitas Harian + Wishlist + Trading + Investing  
**Platform:** Expo SDK 52+  
**Database:** Local (Expo SQLite) - no backend  
**Date:** 2026-05-28

## Keputusan Arsitektur

1. **Database Lokal** - Tidak pakai backend API, data tersimpan lokal di device
2. **Real-time API** - Untuk investing, gunakan API gratis (CoinGecko, GoldAPI, Alpha Vantage)
3. **No Auth Wajib** - Autentikasi bersifat opsional (pin/biometric lock)
4. **Framework Expo** - Mobile apps menggunakan Expo SDK 52+, bukan bare React Native. Build via EAS.

## Expo-specific Libraries
- `expo-sqlite` → Database lokal (pengganti `react-native-sqlite-storage`)
- `expo-notifications` → Alarm/reminder (pengganti `react-native-push-notification`)
- `expo-local-authentication` → Biometric auth (pengganti `react-native-biometrics`)
- `expo-file-system` + `expo-sharing` → Export file (pengganti `react-native-file-viewer`)

## Fitur Prioritas

| Modul | Status |
|-------|--------|
| Catatan Keuangan | Core |
| Aktifitas Harian | Core |
| Wishlist | Core |
| Jurnal Trading | Core |
| Jurnal Investing | Core |
| Dashboard | Core |
| Bottom Navigation | Core |
| Dark Mode | Core |

## State Terakhir

- **Phase:** 4 - Setup & Context Management (Refactor to Expo)
- **Refactor Status:** Semua dokumentasi sudah diupdate dari React Native → Expo SDK 52+
- **Next Step:** Setup project Expo & mulai coding

## Aturan Khusus

1. Dokumentasi to the point, hindari over-explain
2. Kode clean, minimal, tanpa comment berlebihan
3. Folder rapi, terstruktur sesuai feature
4. Gunakan Expo SQLite untuk database lokal
5. Gunakan API gratis untuk real-time price
6. Install packages via `npx expo install` (bukan npm) agar versi compatible dengan Expo
7. Import path: layout di `app/(tabs)/*.tsx` → `../../` naik 2 level ke root mynotes. FILE DI `app/(tabs)/*` PAKAI `../../`. FILE DI `app/*` (langsung) PAKAI `../`. JANGAN GUNAKAN `../` UNTUK FILE DI `app/(tabs)/` — SUDAH BERULANG KALI ERROR.
8. UI/UX skill di `.claude/skills/ui-ux-pro-max/` — aplikasikan prinsip: color-semantic, font-scale 12-32, spacing 8pt system, touch target 44×44pt, bottom-nav max 5, empty-states, chart-type sesuai data, platform-adaptive (safe area), dark-mode pairing
