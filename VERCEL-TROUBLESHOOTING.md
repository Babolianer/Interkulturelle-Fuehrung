# Vercel: Login/Register funktioniert nicht (404 / "page not found")

## Ursache

Wenn **Root Directory** im Vercel-Projekt auf **`frontend`** steht:

- Es wird **nur** das Frontend gebaut (Vite).
- Der Ordner **`api/`** und die Datei **`vercel.json`** im Repo-Root werden **nicht** verwendet.
- Unter `https://deine-app.vercel.app/api/auth/login` und `/api/auth/register` gibt es **keine** Serverless Function → Vercel antwortet mit **404** ("The page could not be found").

Lokal funktioniert es, weil dort das Backend (Express) auf Port 3000 läuft und das Frontend per Proxy dorthin geht.

## Lösung

1. **Vercel Dashboard** → dein Projekt **Interkulturelle-Fuehrung** → **Settings** → **General**.
2. **Root Directory:** Feld **leer** lassen (oder **`.`** eintragen).  
   Es darf **nicht** `frontend` stehen.
3. **Save** klicken.
4. **Redeploy** auslösen: **Deployments** → beim letzten Deployment **⋯** → **Redeploy**.

Dann baut Vercel aus dem **Repository-Root**:

- `npm install` (Root) und `npm run build` (Prisma + Frontend).
- Die API-Function **`api/index.js`** wird für `/api` bereitgestellt; ein **Rewrite** in `vercel.json` leitet alle `/api/:path*`-Anfragen dorthin weiter. So werden Login, Register usw. an die Express-App durchgereicht.

## Umgebungsvariablen (Vercel)

Unter **Settings** → **Environment Variables** müssen gesetzt sein:

- **`DATABASE_URL`** – PostgreSQL-Verbindungsstring (z. B. von Supabase: **Project Settings → Database → Connection string**, z. B. `postgresql://postgres.[REF]:[PASS]@...pooler.supabase.com:6543/postgres`).  
  Wichtig: Der Backend-Code (Prisma) erwartet **`DATABASE_URL`**, nicht `SUPABASE_URL`. Wenn du bisher nur `SUPABASE_URL` mit der DB-URL gesetzt hast, zusätzlich **`DATABASE_URL`** mit dem gleichen Wert anlegen.
- **`JWT_SECRET`** – geheimer Schlüssel für JWT.

**`VITE_API_URL`** bitte **nicht** setzen (leer lassen), damit das Frontend die gleiche Domain nutzt (`/api/...`).

## Prüfen im Browser

1. **Developer Tools** (F12) → **Network**.
2. Auf **Registrieren** oder **Anmelden** klicken.
3. Prüfen:
   - **Welche URL** wird aufgerufen? Sollte z. B. `https://deine-app.vercel.app/api/auth/register` sein.
   - **Status:** 404 = API wird nicht gefunden (meist Root Directory = `frontend`). 500 = Fehler in der API (oft fehlende oder falsche `DATABASE_URL` / `JWT_SECRET`).
