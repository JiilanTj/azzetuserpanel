# Unimplemented APIs List

Berikut adalah daftar API dari `swagger.json` yang belum diimplementasikan di dalam frontend panel pengguna (`azzetuserpanel`). API admin (`/admin/**`) dan webhook pihak ketiga (`/webhooks/**`) telah diabaikan dari daftar ini.

---

## 1. Accounting (Akuntansi)
Seluruh API di bawah ini menangani modul akuntansi/pembukuan pada level workspace.

| Domain/Bagian/Section | Scope | API Endpoint & Deskripsi |
| :--- | :--- | :--- |
| **Accounting - Accounts** | Workspace | `GET /api/v1/accounts` (List chart of accounts) |
| **Accounting - Accounts** | Workspace | `POST /api/v1/accounts` (Create a custom account) |
| **Accounting - Accounts** | Workspace | `GET /api/v1/accounts/{id}` (Get account by ID) |
| **Accounting - Accounts** | Workspace | `PATCH /api/v1/accounts/{id}` (Update a custom account) |
| **Accounting - Items** | Workspace | `GET /api/v1/items` (List items / barang & jasa) |
| **Accounting - Items** | Workspace | `POST /api/v1/items` (Create an item) |
| **Accounting - Items** | Workspace | `GET /api/v1/items/{id}` (Get item by ID) |
| **Accounting - Items** | Workspace | `PATCH /api/v1/items/{id}` (Update an item) |
| **Accounting - Items** | Workspace | `DELETE /api/v1/items/{id}` (Soft-delete an item) |
| **Accounting - Transactions** | Workspace | `GET /api/v1/transactions` (List transactions) |
| **Accounting - Transactions** | Workspace | `POST /api/v1/transactions` (Create a transaction) |
| **Accounting - Transactions** | Workspace | `POST /api/v1/transactions/categorize` (AI-powered categorization) |
| **Accounting - Transactions** | Workspace | `GET /api/v1/transactions/{id}` (Get transaction by ID) |
| **Accounting - Transactions** | Workspace | `POST /api/v1/transactions/{id}/void` (Void / Jurnal Pembalik) |

---

## 2. Reports (Laporan Keuangan)
Digunakan untuk menarik laporan neraca, arus kas, laba rugi, dan buku besar workspace.

| Domain/Bagian/Section | Scope | API Endpoint & Deskripsi |
| :--- | :--- | :--- |
| **Reports** | Workspace | `GET /api/v1/reports/balance-sheet` (Get Balance Sheet / Neraca) |
| **Reports** | Workspace | `GET /api/v1/reports/cash-flow` (Get Cash Flow / Arus Kas) |
| **Reports** | Workspace | `GET /api/v1/reports/income-statement` (Get Income Statement / Laba Rugi) |
| **Reports** | Workspace | `GET /api/v1/reports/ledger/{account_id}` (Get General Ledger / Buku Besar) |
| **Reports** | Workspace | `GET /api/v1/reports/trial-balance` (Get Trial Balance / Neraca Saldo) |

---

## 3. Entities (Entitas Bisnis)
Mengatur pembuatan entitas bisnis (BADAN_USAHA) atau personal. Dipakai baik **sebelum** pembuatan workspace (alur: *create entity* -> *create workspace* dari entitas tersebut) maupun **setelah** workspace aktif untuk kebutuhan pembaruan profil bisnis, metadata compliance (NPWP, dll), dan pencarian entitas lain (*counterparty matching*).

| Domain/Bagian/Section | Scope | API Endpoint | Kapan Dipakai |
| :--- | :--- | :--- | :--- |
| **Entities** | User | `GET /entities` | List semua entity milik user (personal + bisnis). Dipakai di halaman "Pilih Entity" sebelum buat workspace, atau di settings. |
| **Entities** | User | `GET /entities/search` | Search entity by nama. Dipakai saat user mau add counterparty — cari apakah entity sudah ada di platform. |
| **Entities** | User | `GET /entities/{id}` | Get detail satu entity. Dipakai di halaman profil/settings workspace. |
| **Entities** | User | `PATCH /entities/{id}` | Update nama, tipe entity. Dipakai di settings. |
| **Entities** | User | `PATCH /entities/{id}/meta` | Update metadata (NPWP, bidang usaha, logo, alamat). Dipakai di settings/compliance. |

> [!NOTE]
> Modul ini **tidak blocking** untuk modul akuntansi (accounting) karena personal entity otomatis dibuat saat registrasi, workspace bisa dibuat via `POST /entities` + `POST /workspaces` (sudah diimplementasi), dan counterparty bisa ditambahkan via `POST /workspaces/counterparties` (sudah ada). Namun, endpoint di atas diperlukan untuk melengkapi UX settings dan profil.


---

## 4. Subscription & Billing (Langganan & Pembayaran)
Menangani siklus penagihan tambahan serta pembatalan/pergantian paket.

| Domain/Bagian/Section | Scope | API Endpoint & Deskripsi |
| :--- | :--- | :--- |
| **Billing** | Workspace | `GET /billing/invoices/{id}` (Get invoice detail) |
| **Billing** | Workspace | `GET /billing/payments` (List payment attempts) |
| **Subscription** | Workspace | `POST /subscription/cancel` (Cancel subscription) |
| **Subscription** | Workspace | `POST /subscription/change` (Change plan / upgrade-downgrade) |
| **Subscription** | Workspace | `GET /subscription/history` (List subscription history) |
| **Subscription** | Workspace | `GET /subscription/usage` (Get usage summary) |

---

## 5. Workspace Management (Manajemen Workspace & Kolaborasi)
Digunakan untuk mengundang tim, melacak undangannya, serta menetapkan peran custom.

| Domain/Bagian/Section | Scope | API Endpoint & Deskripsi |
| :--- | :--- | :--- |
| **Workspace Counterparties** | Workspace | `GET /workspaces/counterparties` (List counterparties) |
| **Workspace Counterparties** | Workspace | `POST /workspaces/counterparties` (Add counterparty) |
| **Workspace Invites** | Workspace | `GET /workspaces/invites` (List pending invites) |
| **Workspace Invites** | Workspace | `POST /workspaces/invites` (Invite a user to workspace) |
| **Workspace Invites** | Workspace | `DELETE /workspaces/invites/{id}` (Revoke an invite) |
| **Workspaces** | Workspace | `GET /workspaces/roles` (List workspace roles) |
| **Workspace Roles** | Workspace | `POST /workspaces/roles` (Create a custom workspace role) |
| **Workspace Roles** | Workspace | `POST /workspaces/roles/assign` (Assign a role to a member) |
| **Workspace Roles** | Workspace | `POST /workspaces/roles/unassign` (Remove a role from a member) |
| **Workspace Roles** | Workspace | `DELETE /workspaces/roles/{id}` (Delete a workspace role) |
| **Workspace Roles** | Workspace | `PATCH /workspaces/roles/{id}` (Update a workspace role) |
