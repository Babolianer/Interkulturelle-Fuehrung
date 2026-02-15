# Projekt zu GitHub pushen

Das lokale Git-Repository ist initialisiert und der erste Commit ist erstellt.

## 1. Neues Repository auf GitHub anlegen

1. Gehe zu **https://github.com/new**
2. **Repository name:** z. B. `Interkulturelle-Fuehrung`
3. **Public** auswählen (oder Private)
4. **Keine** README, .gitignore oder License hinzufügen (existieren bereits)
5. Auf **Create repository** klicken

## 2. Remote hinzufügen und pushen

Ersetze `DEIN-GITHUB-USERNAME` und `Interkulturelle-Fuehrung` (falls du einen anderen Repo-Namen gewählt hast):

```powershell
cd "c:\Users\aaron\Desktop\Entwicklung\Interkulturelle-Fuehrung"
git remote add origin https://github.com/DEIN-GITHUB-USERNAME/Interkulturelle-Fuehrung.git
git branch -M main
git push -u origin main
```

Falls GitHub dich nach Anmeldedaten fragt: Zugriff über **Personal Access Token** (Password durch Token ersetzen) oder **Git Credential Manager** nutzen.

## Hinweis

Die Dateien `.env` (Backend und Frontend) sind in der `.gitignore` und werden **nicht** mitgepusht – das ist gewollt (Secrets gehören nicht ins Repo). Für andere Rechner/Deployment die Umgebungsvariablen aus den `.env.example`-Dateien übernehmen und anpassen.
