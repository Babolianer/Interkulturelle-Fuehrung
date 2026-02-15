# Vercel Deployment (Frontend + API)

Das Projekt ist so eingerichtet, dass **Frontend und API** gemeinsam auf Vercel laufen.

## Vercel-Projekt einstellen

1. **Root Directory:** Auf **leer** setzen (oder `.`) – also **nicht** `frontend`. So werden `vercel.json`, `package.json` im Root und der Ordner `api/` verwendet.

2. **Umgebungsvariablen** (Settings → Environment Variables) eintragen:
   - `DATABASE_URL` – deine PostgreSQL-URL (z. B. Supabase)
   - `JWT_SECRET` – geheimer Schlüssel für JWT (z. B. langer Zufallsstring)
   - `JWT_EXPIRES` – optional, z. B. `24h`

3. **Nicht** setzen: `VITE_API_URL` (leer lassen). Dann nutzt das Frontend die gleiche Domain und die API unter `/api/*`.

## Ablauf beim Build

- `npm install` (im Root) – installiert Prisma, bcrypt, jsonwebtoken für die API.
- `npm run build` – führt aus:
  - `prisma generate` (Schema: `backend/prisma/schema.prisma`)
  - `cd frontend && npm ci && npm run build` – baut das Frontend.

Die API-Routen liegen unter `api/` und werden von Vercel automatisch unter `/api/*` bereitgestellt.
