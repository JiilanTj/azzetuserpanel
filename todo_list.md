# Daftar Pekerjaan Frontend (Azzet User Panel)

Berdasarkan perbandingan antara **USER_FLOW.md** dengan status implementasi *codebase* saat ini (pada routes dan API services), berikut adalah daftar fitur dan modul yang harus kita kerjakan:

---

## 📋 Ringkasan Modul & Status Pekerjaan

| Modul | Kategori Pekerjaan | Status |
| :--- | :--- | :--- |
| **1. Billing & Payment** | Tambahan API + Pembaruan Halaman Billing | 🟢 Selesai |
| **2. Entities Management** | API Services Baru + Halaman Pengaturan Profil | 🟢 Selesai |
| **3. Roles & Invites** | API Services Baru + Halaman Kelola Role & Undangan | 🟢 Selesai |
| **4. Workspace Counterparties** | API Services Baru + Halaman Daftar Pihak Ketiga | 🔴 Belum Ada |
| **5. Subscription Management** | API Services Baru + Halaman Riwayat & Penggunaan | 🔴 Belum Ada |
| **6. Accounting (Phase 7)** | **Modul Utama Baru** (Akun, Barang/Jasa, Transaksi, Laporan Keuangan) | 🔴 Belum Ada |

---

## 🛠️ Rincian Pekerjaan per Bagian

### 1. Billing & Payment (Pembaruan)
Melengkapi fungsionalitas detail penagihan pada rute `/billing`.
- [x] **API Service (`subscription.service.ts`):**
  - [x] Implementasikan `GET /billing/invoices/{id}` (detail invoice).
  - [x] Implementasikan `GET /billing/payments` (riwayat percobaan pembayaran).
- [x] **Halaman UI (`/billing`):**
  - [x] Integrasikan daftar riwayat pembayaran dan detail invoice untuk ditampilkan ke pengguna.

### 2. Entities Management
Mengatur profil entitas bisnis (PT, CV, Personal) setelah workspace aktif.
- [x] **API Service (`workspace.service.ts`):**
  - [x] Implementasikan `GET /entities` (list entitas user).
  - [x] Implementasikan `GET /entities/search` (cari entitas berdasarkan nama untuk counterparty).
  - [x] Implementasikan `GET /entities/{id}` (detail entitas tunggal).
  - [x] Implementasikan `PATCH /entities/{id}` (edit profil utama entitas).
  - [x] Implementasikan `PATCH /entities/{id}/meta` (update NPWP, alamat, logo, bidang usaha).
- [x] **Halaman UI (`/settings`):**
  - [x] Integrasikan form pembaruan profil bisnis dan metadata compliance (NPWP, Bidang Usaha, Alamat Lengkap).

### 3. Roles & Invites
Fitur kolaborasi tim yang mendalam (mengundang anggota & menentukan wewenang/role).
- [x] **API Service (`workspace.service.ts`):**
  - [x] Implementasikan `GET /workspaces/invites` (list undangan menggantung).
  - [x] Implementasikan `POST /workspaces/invites` (kirim undangan baru via email).
  - [x] Implementasikan `DELETE /workspaces/invites/{id}` (batalkan/revoke undangan).
  - [x] Implementasikan `GET /workspaces/roles` (list semua role workspace).
  - [x] Implementasikan `POST /workspaces/roles` (buat role baru kustom).
  - [x] Implementasikan `POST /workspaces/roles/assign` (pasang role ke anggota).
  - [x] Implementasikan `POST /workspaces/roles/unassign` (lepas role dari anggota).
  - [x] Implementasikan `DELETE /workspaces/roles/{id}` (hapus role kustom).
  - [x] Implementasikan `PATCH /workspaces/roles/{id}` (update wewenang/hak akses role).
- [x] **Halaman UI:**
  - [x] Integrasikan form kirim undangan & daftar undangan pending di `/users` atau buat tab terpisah.
  - [x] Buat halaman/tab **Roles Management** untuk kelola hak akses kustom tim.

### 4. Workspace Counterparties
Daftar pelanggan (customers) atau pemasok (vendors) untuk pencatatan transaksi.
- [ ] **API Service (`workspace.service.ts`):**
  - Implementasikan `GET /workspaces/counterparties` (list pihak ketiga).
  - Implementasikan `POST /workspaces/counterparties` (tambah pihak ketiga).
- [ ] **Halaman UI (`/workspace/counterparties`):**
  - Buat halaman daftar *counterparties* dengan filter tipe relasi (`PELANGGAN` / `PEMASOK`).
  - Form tambah counterparty (dilengkapi opsi pencarian entitas via `/entities/search`).

### 5. Subscription Management
Mengelola pembatalan atau pergantian paket langganan secara mandiri.
- [ ] **API Service (`subscription.service.ts`):**
  - Implementasikan `POST /subscription/cancel` (batalkan langganan otomatis).
  - Implementasikan `POST /subscription/change` (upgrade atau downgrade paket).
  - Implementasikan `GET /subscription/history` (riwayat mutasi langganan).
  - Implementasikan `GET /subscription/usage` (kuota pemakaian fitur, e.g., sisa limit transaksi/OCR).
- [ ] **Halaman UI (`/plans` & `/settings`):**
  - Integrasikan UI untuk membatalkan paket, mengganti plan aktif, dan memantau riwayat & penggunaan kuota workspace.

### 6. Accounting Module (Phase 7 - Modul Utama)
Ini adalah porsi pekerjaan terbesar yang belum disentuh sama sekali di frontend.
- [ ] **API Service Baru (`accounting.service.ts`):**
  - **Chart of Accounts (COA):**
    - `GET /api/v1/accounts` (Ambil daftar akun).
    - `POST /api/v1/accounts` (Tambah akun custom).
    - `GET /api/v1/accounts/{id}` (Detail akun).
    - `PATCH /api/v1/accounts/{id}` (Ubah nama/nomor akun custom).
  - **Barang & Jasa (Items):**
    - `GET /api/v1/items` (Ambil daftar barang/jasa).
    - `POST /api/v1/items` (Buat barang/jasa baru).
    - `GET /api/v1/items/{id}` (Detail barang/jasa).
    - `PATCH /api/v1/items/{id}` (Edit barang/jasa).
    - `DELETE /api/v1/items/{id}` (Soft-delete barang/jasa).
  - **Transaksi (Transactions):**
    - `GET /api/v1/transactions` (List transaksi).
    - `POST /api/v1/transactions` (Buat transaksi baru).
    - `POST /api/v1/transactions/categorize` (AI suggestion kategori).
    - `GET /api/v1/transactions/{id}` (Detail transaksi & jurnalnya).
    - `POST /api/v1/transactions/{id}/void` (Proses Void / Jurnal Pembalik).
  - **Laporan Keuangan (Reports):**
    - `GET /api/v1/reports/trial-balance` (Neraca Saldo).
    - `GET /api/v1/reports/balance-sheet` (Neraca).
    - `GET /api/v1/reports/income-statement` (Laba Rugi).
    - `GET /api/v1/reports/cash-flow` (Arus Kas).
    - `GET /api/v1/reports/ledger/{account_id}` (Buku Besar per akun).

- [ ] **Halaman UI Baru:**
  - `/accounts`: Halaman Chart of Accounts (COA) / Daftar Akun.
  - `/items`: Halaman katalog produk & jasa (Barang, Jasa, Proyek, dll).
  - `/transactions`: Halaman jurnal & riwayat transaksi bisnis.
  - `/transactions/new`: Form pencatatan transaksi dual-mode (Mode **SIMPLE** untuk Kasir, Mode **ADVANCED** untuk Akuntan), terintegrasi dengan tombol bantuan AI Categorization.
  - `/transactions/{id}`: Halaman detail transaksi untuk melihat entri jurnal debit/kredit dan tombol **Void** (jurnal pembalik).
  - `/reports`: Halaman laporan keuangan interaktif dengan tab Neraca, Laba Rugi, Neraca Saldo, Arus Kas, dan Buku Besar.
