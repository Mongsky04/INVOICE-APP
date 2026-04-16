# Invoice App — Fleetify Technical Test

Aplikasi web berbasis wizard (multi-step) untuk mencatat pembuatan Resi Pengiriman dan men-generate Invoice untuk kebutuhan fleet & logistics.

## Tech Stack

| Layer    | Technology                                                                     |
| -------- | ------------------------------------------------------------------------------ |
| Frontend | Next.js 14 (Pages Router), TypeScript, Zustand, TanStack Query v5, TailwindCSS |
| Backend  | Golang, Go Fiber, GORM                                                         |
| Database | PostgreSQL 15                                                                  |
| Infra    | Docker, docker-compose                                                         |

## Fitur

- **Authentication** — Login dengan JWT, role-based (Admin / Kerani)
- **Multi-Step Wizard** — Step 1: Data Pengirim & Penerima → Step 2: Tambah Barang (debounce + race condition safe) → Step 3: Review & Cetak
- **State Persistence** — Data form tidak hilang saat refresh (Zustand persist)
- **Zero-Trust Backend** — Harga tidak dipercaya dari frontend; backend query ulang dari DB
- **ACID Transaction** — Insert invoice header + detail atomik dengan `db.Transaction()`
- **Auto Seeding** — Data master item dan user langsung tersedia saat pertama run

## Cara Menjalankan

### Prerequisites

- Docker & Docker Compose terinstall

### Steps

1. Clone repo:

```bash
git clone https://github.com/Mongsky04/invoice-app.git
cd invoice-app
```

2. Copy file environment:

```bash
cp .env.example .env
```

3. Jalankan semua service:

```bash
docker compose up --build
```

4. Akses aplikasi:
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8080

> Database akan otomatis terbuat dan ter-seed saat pertama kali dijalankan.

## API Endpoints

| Method | Endpoint          | Auth   | Deskripsi                    |
| ------ | ----------------- | ------ | ---------------------------- |
| POST   | /api/login        | Public | Login, mendapatkan JWT token |
| GET    | /api/items        | Public | Cari master item (?code=BRG) |
| GET    | /api/items/:id    | Public | Detail item by ID            |
| GET    | /api/invoices     | JWT    | List semua invoice           |
| GET    | /api/invoices/:id | JWT    | Detail invoice               |
| POST   | /api/invoices     | JWT    | Buat invoice baru            |
| DELETE | /api/invoices/:id | JWT    | Hapus invoice                |

## Default Credentials

| Role   | Username | Password  |
| ------ | -------- | --------- |
| Admin  | admin    | admin123  |
| Kerani | kerani   | kerani123 |

## Struktur Project

```
invoice-app/
├── backend/
│   ├── cmd/            # Entrypoint
│   ├── config/         # Env config loader
│   ├── database/       # DB connection & auto-migrate
│   ├── handlers/       # HTTP handlers (Fiber)
│   ├── middleware/     # JWT middleware
│   ├── models/         # GORM models
│   ├── repositories/   # DB query layer
│   ├── seeders/        # Auto-seeder
│   ├── services/       # Business logic
│   └── Dockerfile
├── frontend/
│   └── ...             # Next.js 14 app
├── docker-compose.yml
├── .env.example
└── README.md
```
