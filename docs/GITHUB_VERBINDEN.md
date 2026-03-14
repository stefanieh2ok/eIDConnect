# eIDConnect mit GitHub verbinden

Das Projekt ist lokal bereits mit Git eingerichtet (erster Commit ist erstellt). Du musst nur noch das Repo auf GitHub anlegen und den Code hochladen.

## Schritt 1: Neues Repository auf GitHub erstellen

1. Gehe zu **https://github.com/new**
2. **Repository name:** z. B. `eidconnect` (für die eIDConnect-App)
3. **Public** auswählen
4. **NICHT** "Add a README" oder ".gitignore" ankreuzen – das Repo soll **leer** bleiben
5. Auf **"Create repository"** klicken

## Schritt 2: Lokales Projekt mit GitHub verbinden

GitHub zeigt dir danach Befehle an. Du kannst stattdessen diese hier im **Projektordner** in der Konsole (Cursor-Terminal oder PowerShell) ausführen.

**Ersetze `DEIN-GITHUB-USERNAME` durch deinen echten GitHub-Benutzernamen** (z. B. `stefanienzok` oder wie du auf GitHub heißt).

```powershell
cd "C:\Users\Stefanie Hook\bürgerapp"
git remote add origin https://github.com/DEIN-GITHUB-USERNAME/eidconnect.git
git branch -M main
git push -u origin main
```

Beispiel, wenn dein GitHub-User **stefanienzok** ist:

```powershell
git remote add origin https://github.com/stefanienzok/eidconnect.git
git branch -M main
git push -u origin main
```

Beim ersten `git push` wirst du nach deinem **GitHub-Benutzernamen** und **Passwort** gefragt.  
Als Passwort verwendest du ein **Personal Access Token** (GitHub akzeptiert seit einiger Zeit keine normalen Passwörter mehr):

- GitHub → Einstellungen → Developer settings → Personal access tokens → Token erzeugen
- Oder direkt: https://github.com/settings/tokens → "Generate new token (classic)"
- Mindestens Berechtigung **repo** anhaken, Token kopieren und beim `git push` als Passwort eingeben

## Schritt 3: In Vercel importieren

1. Gehe zu **https://vercel.com** → **Add New…** → **Project**
2. Das Repo **eidconnect** (oder wie du es genannt hast) sollte jetzt in der Liste erscheinen
3. **Import** klicken → **Deploy**

Fertig. Die eIDConnect-App hat dann eine URL wie `https://eidconnect-xxx.vercel.app`.
