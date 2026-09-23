# Elara — Hospital Information Management System

Cloud HIMS with EHR for **Elara Medical Centre**. MERN stack. Built as a postgraduate mini project with a real outpatient workflow, not a generic CRUD dashboard.

## What it covers

- Role-based access: Admin, Doctor, Nurse, Pharmacy, Billing, Patient
- OP registration, waiting queue, consultation, lab, pharmacy, billing
- Electronic health records (visits, prescriptions, reports, bills)
- Appointment booking, invoices, and prescription PDFs

## Stack

| Layer | Tech |
| --- | --- |
| Client | React 18, Vite, Tailwind, Framer Motion, React Query, Zustand |
| API | Express, Mongoose, JWT, Socket.IO |
| Data | MongoDB |

## Quick start

1. Start MongoDB locally **or** `docker compose up -d`
2. API:

```bash
cd server
copy .env.example .env
npm install
npm run seed
npm run dev
```

3. Client:

```bash
cd client
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

## Demo accounts

Password for all seeded staff/patients: `Elara@2026`

| Role | Email |
| --- | --- |
| Admin | `maya.rao@elara.care` |
| Doctor (Cardiology) | `arjun.mehta@elara.care` |
| Nurse | `nina.das@elara.care` |
| Pharmacy | `kabir.shaw@elara.care` |
| Billing | `leena.ibrahim@elara.care` |
| Patient | `priya.nair@mail.test` |

## Scripts

- `server`: `npm run dev` · `npm run seed`
- `client`: `npm run dev` · `npm run build`
