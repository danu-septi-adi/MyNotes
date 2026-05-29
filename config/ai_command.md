---
name: ai_command
description: Log command terminal/CLI yang pernah dijalankan
metadata:
  type: reference
---

## Command Log

### Project Init & Setup
```bash
# 1. Create Expo project (28 Mei 2026)
npx create-expo-app@latest mynotes --template blank-typescript

# 2. Masuk folder project
cd mynotes

# 3. Install dependencies inti
npx expo install expo-sqlite expo-notifications expo-local-authentication
npx expo install expo-file-system expo-sharing expo-secure-store
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-paper react-native-svg react-native-chart-kit
npx expo install @react-native-async-storage/async-storage react-native-safe-area-context react-native-screens

# 4. Install Expo Router (file-based routing)
npx expo install expo-router expo-linking

# 5. Install vector icons
npm install @expo/vector-icons --legacy-peer-deps

# 6. Buat folder struktur
mkdir -p app/\(tabs\) components contexts constants hooks services database

# 7. Install color picker
npm install react-native-wheel-color-picker --legacy-peer-deps

# 8. Download UI/UX Pro Max Skill
git clone --depth 1 https://github.com/nextlevelbuilder/ui-ux-pro-max-skill.git /tmp/ui-ux-skill
cp -r /tmp/ui-ux-skill/.claude/skills/ui-ux-pro-max/* .claude/skills/ui-ux-pro-max/
```

### Development
```bash
# Run development build (Android fisik, sekali saja)
npx expo run:android

# Run after build (Metro bundler)
npx expo start
npx expo start -c         # clear cache + restart

# Shortcut di Metro:
# a = open Android
# r = reload
# Shift+R = clear cache + reload
```

### Build Release APK (Signed)
```bash
# 1. Buat keystore (sekali saja)
cd android
keytool -genkey -v -keystore mynotes-release.keystore -alias mynotes -keyalg RSA -keysize 2048 -validity 10000 -storepass mynotes123 -keypass mynotes123 -dname "CN=Mynotes, OU=Dev, O=MynotesApp, L=Jakarta, ST=Jakarta, C=ID"

# 2. Copy keystore ke folder app/
cp mynotes-release.keystore app/mynotes-release.keystore

# 3. Konfigurasi signing di android/app/build.gradle:
#    signingConfigs { release { ... } }
#    buildTypes { release { signingConfig signingConfigs.release } }

# 4. Build release APK (arm64-v8a ONLY - cepat, ukuran 47MB)
cd android
./gradlew app:assembleRelease -x lint -x test -PreactNativeArchitectures=arm64-v8a

# 5. Build release APK (SEMUA arsitektur - lambat, ukuran besar)
cd android
./gradlew app:assembleRelease -x lint -x test

# 6. Atau via Expo CLI langsung (preferred - best practice)
npx expo run:android --variant release

# 7. Lokasi hasil build:
#    mynotes/android/app/build/outputs/apk/release/app-release.apk
```

### Build Debug APK
```bash
# Build debug APK
npx expo run:android --variant debug

# Atau via Gradle
cd android
./gradlew app:assembleDebug -x lint -x test

# Lokasi: mynotes/android/app/build/outputs/apk/debug/app-debug.apk
```

### EAS Build (Expo Cloud / Local)
```bash
# Install EAS CLI
npm install -g eas-cli

# Login Expo (wajib untuk EAS)
npx eas login

# Build production via EAS Cloud
npx eas build --platform android --profile production

# Build production LOKAL (hanya macOS/Linux)
npx eas build --platform android --profile production --local

# Note: --local TIDAK support di Windows
```

### Troubleshooting Build
```bash
# Bersihkan semua cache Gradle
rm -rf "C:\Users\<user>\.gradle\caches"

# Hentikan Gradle daemon
cd android && ./gradlew --stop

# Regenerate native folder
npx expo prebuild --clean

# Cek error lengkap
cd android && ./gradlew app:assembleRelease --stacktrace

# Cek file APK
find android -name "*.apk" -type f
```

### Struktur Folder Final (28 Mei 2026)
```
mynotes/
├── app/
│   ├── _layout.tsx         # Root layout (Stack + SettingsProvider)
│   ├── settings.tsx        # Pengaturan currency, tema, warna aksen
│   ├── categories.tsx      # Manajemen kategori
│   └── (tabs)/
│       ├── _layout.tsx     # Bottom tab navigator
│       ├── index.tsx       # Dashboard
│       ├── finance.tsx     # Catatan Keuangan
│       ├── activities.tsx  # Todo + Journal
│       ├── wishlist.tsx    # Wishlist
│       └── profile.tsx     # Profile + menu
├── components/
│   ├── Button.tsx          # Reusable button (primary/sec/outline/danger)
│   ├── Card.tsx            # Card, StatCard, EmptyState
│   ├── Input.tsx           # Input dengan label + icon + error
│   └── ModalForm.tsx       # Bottom sheet modal dengan animasi spring
├── constants/
│   ├── theme.ts            # LightColors, DarkColors, Spacing, Typography, Shadow
│   └── currencies.ts       # Daftar mata uang + formatter
├── contexts/
│   └── SettingsContext.tsx  # Global state: currency, theme, tabColor (persist AsyncStorage)
├── hooks/
│   ├── useColors.ts        # Dynamic colors berdasarkan theme + tabColor
│   └── useCurrency.ts      # Format currency berdasarkan settings
├── database/
│   └── index.ts            # SQLite init + 10 tabel + seed categories
└── services/               # (siap untuk API investing)
```

### Database Tables
```sql
-- 10 tabel sudah dibuat:
categories, transactions, budgets, debts, todos,
journals, wishlists, tradings, investings

-- Seed data: 8 kategori default (Makanan, Transport, Belanja, dll)
```

### Fitur Selesai
✅ CRUD Transaksi (Finance)
✅ CRUD Todo + Daily Journal (Activities)
✅ CRUD Wishlist
✅ CRUD Kategori (Pengeluaran/Pemasukan + warna)
✅ Dashboard (saldo, stat, todo overview)
✅ Settings (mata uang, tema light/dark/system, warna aksen color picker)
✅ Bottom Nav 5 tab (dynamic colors + safe area)
✅ Dark Mode penuh (semua screen)
✅ Format currency dinamis (IDR/USD/EUR/dll)
✅ Design system reusable (theme constants + components)
