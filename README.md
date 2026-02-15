# Interkulturelle Führung

**„Interkulturell kompetente Führung – bei uns eine Selbstverständlichkeit?“**

Fullstack-Umfrage-App auf Basis der Hofstede-Dimensionen. Teilnahme ausschließlich mit Account; jede Umfrage ist einem Nutzer eindeutig zugeordnet.

## Tech-Stack

- **Frontend:** Vue 3, Vite, Vue Router, Pinia, Axios, Chart.js, TailwindCSS
- **Backend:** Node.js, Express, **Supabase** (PostgreSQL), Prisma ORM, JWT, Bcrypt

## Voraussetzungen

- **Node.js** (LTS, z. B. 20.x)
- **Supabase**-Account (kostenloser Tier reicht)
- **npm**

## Projektstruktur

```
Interkulturelle-Fuehrung/
├── frontend/     # Vue 3 + Vite
├── backend/      # Express + Prisma
└── README.md
```

## Setup

### 1. Supabase-Datenbank

1. **Projekt anlegen:** [supabase.com](https://supabase.com) → New Project → Region und Datenbank-Passwort festlegen (Passwort aufbewahren).
2. **Schema anlegen:** Im Supabase Dashboard **SQL Editor** öffnen → New query. Den Inhalt der Datei `backend/prisma/supabase-schema.sql` einfügen und **Run** ausführen. Damit werden die Tabellen `users`, `surveys`, `questions`, `survey_answers` und der Enum `Role` angelegt.
3. **Connection string holen:** Unter **Project Settings** → **Database** den Abschnitt **Connection string** öffnen. **URI** wählen und das Passwort in `[YOUR-PASSWORD]` ersetzen. Für die laufende App den **Transaction**-Pooler (Port 6543) nutzen; für Prisma Studio oder Migrations ggf. die Direktverbindung (Port 5432) verwenden.

### 2. Backend

```bash
cd backend
cp .env.example .env
```

In `.env` anpassen:

- `DATABASE_URL` – den Supabase-Connection-String (URI) einfügen (siehe Schritt 1.3).
- `JWT_SECRET` – beliebiger sicherer String für Produktion.

Dann:

```bash
npm install
npx prisma generate
npx prisma db seed
npm run dev
```

**Hinweis:** Die Tabellen wurden bereits per SQL in Supabase angelegt. Es wird daher **kein** `prisma migrate deploy` ausgeführt. Bei Bedarf kann später mit Prisma-Migrationen weitergearbeitet werden (dann zuerst Schema in Supabase anlegen und danach z. B. `prisma migrate resolve` nutzen).

Server läuft standardmäßig auf **http://localhost:3000**.

**Admin-Login nach Seed:**  
E-Mail und Passwort aus `.env` (Standard: `admin@interkulturelle-fuehrung.de` / `Admin123!`).

### 3. Frontend

```bash
cd frontend
cp .env.example .env
```

Für lokale Entwicklung reicht eine leere `VITE_API_URL` (Vite-Proxy leitet `/api` an das Backend weiter). Für Produktion in `.env` z. B.:

```
VITE_API_URL=http://localhost:3000
```

Dann:

```bash
npm install
npm run dev
```

Frontend läuft auf **http://localhost:5173**.

## Startbefehle (Kurzfassung)

| Ort      | Befehl           | Beschreibung              |
| -------- | ----------------- | ------------------------- |
| Backend  | `npm run dev`     | Express mit Watch-Mode     |
| Backend  | `npm start`       | Express (Production)      |
| Backend  | Schema in Supabase          | `backend/prisma/supabase-schema.sql` im SQL Editor ausführen |
| Backend  | `npx prisma generate`      | Prisma Client nach Schema-Änderung neu erzeugen |
| Backend  | `npx prisma db seed`       | Seed (Fragen + Admin) |
| Frontend | `npm run dev`     | Vite Dev-Server            |
| Frontend | `npm run build`   | Build für Produktion      |

## Ablauf für Nutzer

1. **Startseite** – Titel, Beschreibung, Button „Jetzt teilnehmen“ → Login/Registrierung
2. **Registrierung** – Vorname, Nachname, Alter, Kursnummer, E-Mail, Passwort
3. **Login** – E-Mail, Passwort → JWT, Redirect ins Dashboard
4. **Umfrage** – Fragen nach Hofstede-Dimensionen, Skala 0–100; mehrere Umfragen pro User möglich
5. **Dashboard** – Liste eigener Umfragen, Detail mit Pie-Charts (eigener vs. Gesamtdurchschnitt), Verlauf

## Admin

Nach Login als Admin (Rolle `ADMIN`):

- **Statistiken** – Gesamtanzahl Umfragen/Nutzer, Durchschnitt je Dimension, Durchschnitt pro Kursnummer
- **Nutzer** – Liste, Rolle ändern (USER/ADMIN), Nutzer löschen
- **Umfragen** – Alle Umfragen mit Nutzer und Kurs

## Lizenz / Hinweise

Projekt für Ausbildungs- oder interne Zwecke. Passwörter und JWT-Secret in Produktion sicher setzen.
