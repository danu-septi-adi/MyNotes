# Feature Elaboration

> Status: **ITERASI** (Menunggu jawaban user)
> Expo SDK 52+ | Local Database (SQLite)

---

## 1. Catatan Keuangan

### 1.1 Database Model
- **Field transaksi:** jumlah, kategori, tanggal, tipe (income/expense), catatan
  - ( [.] Sudah sesuai / [ ] Butuh tambahan field: ... )

### 1.2 Budget
- **Cara kerja budget:** 
  - ( [ ] Budget per kategori per bulan / [ ] Total budget bulanan / [.] Keduanya )

### 1.3 Laporan & Grafik
- **Jenis grafik:**
  - ( [ ] Pie chart (kategori) / [ ] Bar chart (per hari/minggu/bulan) / [.] Keduanya )

### 1.4 Hutang/Piutang
- **Perlu tracking tanggal jatuh tempo?**
  - ( [.] Ya / [ ] Tidak )

---

## 2. Catatan Aktifitas Harian

### 2.1 Alarm/Reminder
- **Sistem alarm:**
  - ( [ ] Push notification / [ ] Notifikasi in-app / [.] Keduanya )

### 2.2 Daily Journal
- **Journal terpisah atau satu halaman dengan todo?**
  - ( [ ] Terpisah / [ ] Satu halaman / [.] Satu halaman dengan tab )

---

## 3. Wishlist

### 3.1 Link ke Tabungan
- **Cara kerja link tabungan:**
  - ( [ ] Input nominal target, progress otomatis dari catatan keuangan / [ ] Manual update progress / [.] Keduanya )

---

## 4. Database & Data

### 4.1 Export
- **Format export:**
  - ( [ ] CSV / [ ] JSON / [.] Keduanya )
  ada import juga

---

## 5. Navigasi & UI/UX

### 5.1 Bottom Nav & Dashboard
- **Menu bottom nav:**
  - ( [.] 5 menu: Home, Finance (investing masuk sini), Aktifitas, Wishlist, Profil / [ ] 6 menu: + Trading )
  - **Catatan:** Jika 5 atau 6 menu, navigasi Trading & Investing di taruh di menu Profil/Lainnya?

### 5.2 Dashboard
- **Widget dashboard:**
  - ( [.] Saldo, Pengeluaran hari ini, Todo hari ini / [ ] Semua termasuk wishlist mendesak )

---

## 6. Jurnal Trading

### 6.1 Field Pencatatan
- **Field sudah sesuai (pair, volume, entry, SL, TP, alasan, hasil)?**
  - ( [.] Ya / [ ] Butuh tambahan: ... )

### 6.2 Ringkasan P/L
- **Ringkasan profit/loss:**
  - ( [ ] Per trading / [ ] Per pair / [ ] Per bulan / [.] Semua )

---

## 7. Jurnal Investing

### 7.1 Real-time Price
- **API gratis untuk real-time:**
  - ( [ ] CoinGecko (crypto) / [ ] GoldAPI / [ ] Alpha Vantage (saham) / [.] Semua )

### 7.2 Data Investing
- **Field yang dicatat:**
  - ( [.] Nama aset, jumlah unit, harga beli, total invest / [ ] + target harga jual / [.] + catatan )

---

Silakan jawab. Setelah ACC, lanjut ke **detailfeature.md** (blueprint final).
