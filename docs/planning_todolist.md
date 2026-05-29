# Planning Todo List

> Status: **IN PROGRESS**
> Expo SDK 56 | Local Database (SQLite)

---

## Progress: 30/34 Task Selesai (88%)

---

## Phase 1: Project Setup ✅

| # | Task | Status | Output | Validation |
|---|------|--------|--------|------------|
| 1 | Init Expo project | [x] Done | Folder project dengan Expo SDK 56 | `npx create-expo-app@latest` sukses ✅ |
| 2 | Setup folder structure | [x] Done | Folder `app/`, `components/`, `database/`, `constants/`, `hooks/`, `contexts/`, `services/` | Struktur rapi ✅ |
| 3 | Install dependencies | [x] Done | expo-sqlite, expo-router, react-native-paper, expo-notifications, dll | `npx expo install` semua sukses ✅ |
| 4 | Setup Expo Router | [x] Done | File-based routing: `app/(tabs)/`, `app/settings.tsx`, `app/categories.tsx`, dll | Navigasi antar halaman ✅ |

---

## Phase 2: Database Setup ✅

| # | Task | Status | Output | Validation |
|---|------|--------|--------|------------|
| 1 | Setup Expo SQLite | [x] Done | Database `mynotes.db` bisa diakses sync | `openDatabaseSync()` sukses ✅ |
| 2 | Buat schema transaksi | [x] Done | Tabel `transactions` ✅ | ✅ |
| 3 | Buat schema kategori | [x] Done | Tabel `categories` + seed data ✅ | ✅ |
| 4 | Buat schema budget | [x] Done | Tabel `budgets` ✅ | ✅ |
| 5 | Buat schema hutang/piutang | [x] Done | Tabel `debts` ✅ | ✅ |
| 6 | Buat schema todo | [x] Done | Tabel `todos` ✅ | ✅ |
| 7 | Buat schema journal | [x] Done | Tabel `journals` ✅ | ✅ |
| 8 | Buat schema wishlist | [x] Done | Tabel `wishlists` ✅ | ✅ |
| 9 | Buat schema trading | [x] Done | Tabel `tradings` ✅ | ✅ |
| 10 | Buat schema investing | [x] Done | Tabel `investings` ✅ | ✅ |

---

## Phase 3: Navigation & UI ✅

| # | Task | Status | Output | Validation |
|---|------|--------|--------|------------|
| 1 | Setup Bottom Tab Navigation | [x] Done | 5 tab: Home, Finance, Aktifitas, Wishlist, Profil | Semua tab navigasi ✅ |
| 2 | Buat reusable components | [x] Done | Button, Card, Input, ModalForm (scrollable + keyboard avoid) | Komponen reusable ✅ |
| 3 | Design System (theme) | [x] Done | constants/theme.ts: LightColors, DarkColors, Spacing, Typography, Shadow | Konsisten semua screen ✅ |
| 4 | Dashboard Screen | [x] Done | Balance hero, quick actions, ringkasan semua modul, aktifitas | Tampil ✅ |
| 5 | Finance Screen | [x] Done | CRUD transaksi + kategori, summary income/expense | CRUD berfungsi ✅ |
| 6 | Activities Screen | [x] Done | Todo List + Daily Journal dengan tab, priority, status | CRUD berfungsi ✅ |
| 7 | Wishlist Screen | [x] Done | CRUD wishlist dengan progress bar, prioritas | CRUD berfungsi ✅ |
| 8 | Profile Screen | [x] Done | Menu navigasi ke Settings, Categories, Reports, Budget, dll | ✅ |
| 9 | Dark Mode | [x] Done | Light/Dark/System + warna aksen custom (color picker) | Ganti tema real-time ✅ |
| 10 | Settings Screen | [x] Done | Pengaturan mata uang, tema, warna aksen dengan color picker | ✅ |
| 11 | Manajemen Kategori | [x] Done | CRUD kategori expense/income + pilih warna bebas 20 warna | ✅ |

---

## Phase 4: Feature Implementation ✅

| # | Task | Status | Output | Validation |
|---|------|--------|--------|------------|
| 1 | Budget Management | [x] Done | Set budget per kategori per bulan, progress bar, sisa/over | Budget screen ✅ |
| 2 | Laporan & Grafik | [x] Done | Bar chart income/expense, Pie chart per kategori, filter bulan/minggu/kustom | Pilih bulan & minggu ✅ |
| 3 | Hutang/Piutang | [x] Done | CRUD hutang/piutang, status aktif/lunas, overdue indicator | Debt screen ✅ |
| 4 | CRUD Trading | [x] Done | Pair, entry, SL/TP, P/L summary, win rate | Trading screen ✅ |
| 5 | CRUD Investing | [x] Done | Aset crypto/gold/stock, total invest vs nilai kini, P/L | Investing screen ✅ |
| 6 | Export/Import Data | [x] Done | Export JSON/CSV via Share, Import JSON via DocumentPicker | Data screen ✅ |
| 7 | Reset All Data | [x] Done | Hapus permanen semua data dengan double konfirmasi | ✅ |

---

## Phase 5: Testing & Polish

| # | Task | Status | Output | Validation |
|---|------|--------|--------|------------|
| 1 | Alarm/Reminder | [ ] Not Started | Notifikasi todo reminder | Belum diimplementasi |
| 2 | Auth (Opsional) | [ ] Not Started | Pin/biometric lock | Belum diimplementasi |
| 3 | UI Polish (nominal besar) | [x] Done | adjustsFontSizeToFit + numberOfLines di semua fmt() | ✅ |
| 4 | Testing | [ ] Not Started | Semua fitur jalan | Manual test sukses |

---

**Last Updated:** 2026-05-28 (23:00)
