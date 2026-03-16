# DocuSign einrichten (NDA mit rechtsverbindlicher Signatur)

**Wichtig:** Für die Funktion „Mit DocuSign unterzeichnen und Demo öffnen“ brauchst du einen **DocuSign-Account**. Ohne Account und die zugehörigen Zugangsdaten erscheint die Meldung „DocuSign config missing …“.

---

## 1. DocuSign-Account anlegen

- **Produktion:** https://www.docusign.com → „Get started“ / Konto erstellen.
- **Kostenlose Sandbox (zum Testen):** https://developers.docusign.com → „Get a free account“ (Developer Sandbox). Damit kannst du alles testen, ohne einen bezahlten Account.

---

## 2. App mit JWT in DocuSign anlegen

1. Im DocuSign Dashboard: **Settings** (Zahnrad) → **Apps and Keys**.
2. **Add App and Integration Key** (oder „Create App“).
3. **Integration Key** vergeben (Name z. B. „BürgerApp NDA“) → **Create**.
4. Unter der neuen App:
   - **Integration Key** kopieren → das ist `DOCUSIGN_INTEGRATION_KEY`.
   - **API User ID** (GUID) kopieren → das ist `DOCUSIGN_USER_ID`.
   - **RSA Keypair** erzeugen: **Add RSA Keypair** → Key wird erzeugt, **Private Key** sofort herunterladen und sicher aufbewahren (nur einmal sichtbar). Inhalt dieser Datei (PEM) = `DOCUSIGN_PRIVATE_KEY`.
5. **Account ID:** DocuSign Dashboard → **Settings** → **Account** (oder in der URL), dort die **Account ID** (GUID) kopieren → `DOCUSIGN_ACCOUNT_ID`.

---

## 3. JWT „Consent“ einmal ausführen

Beim ersten Einsatz mit JWT muss einmal die Einwilligung erteilt werden:

1. Unter **Apps and Keys** bei deiner App den Link **Grant Consent** (oder „Authorize“) öffnen.
2. Mit dem DocuSign-Nutzer einloggen, der als „API User“ genutzt wird.
3. Zugriff bestätigen. Danach funktioniert der JWT-Zugriff.

---

## 4. Umgebungsvariablen setzen

### Lokal (.env.local)

```env
DOCUSIGN_INTEGRATION_KEY=dein-integration-key
DOCUSIGN_USER_ID=deine-user-id-guid
DOCUSIGN_ACCOUNT_ID=deine-account-id-guid
DOCUSIGN_PRIVATE_KEY="-----BEGIN RSA PRIVATE KEY-----
MIIE...
-----END RSA PRIVATE KEY-----"
# Optional: Sandbox nutzen
DOCUSIGN_USE_DEMO=true
# Basis-URL der App (für Return-URL nach dem Signieren)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

Bei `DOCUSIGN_PRIVATE_KEY`: Entweder den kompletten PEM-Text mit echten Zeilenumbrüchen einfügen, oder alles in einer Zeile mit `\n` für Umbrüche.

### Vercel (Live-App)

Unter **Settings** → **Environment Variables** dieselben Variablen anlegen (gleiche Namen, gleiche Werte). Nach dem Anlegen oder Ändern einen **Redeploy** ausführen.

**DOCUSIGN_PRIVATE_KEY auf Vercel:** Vercel speichert Umgebungsvariablen oft ohne echte Zeilenumbrüche. Damit der Key für RS256/JWT funktioniert, **eine Zeile** verwenden und Zeilenumbrüche als `\n` (Backslash + n) eintragen, z. B.:

`-----BEGIN RSA PRIVATE KEY-----\nMIIE...\n-----END RSA PRIVATE KEY-----`

Ohne Anführungszeichen um den gesamten Wert. Die App stellt fehlende Zeilenumbrüche automatisch wieder her; wenn trotzdem „secretOrPrivateKey must be an asymmetric key“ erscheint, den Key prüfen (vollständig, keine doppelten Anführungszeichen, `\n` genau so).

---

## 5. Return-URL in DocuSign (falls nötig)

Wenn du „Embedded Signing“ nutzt, kann DocuSign verlangen, dass Redirect-URLs erlaubt sind. Im DocuSign Dashboard unter der App ggf. **Redirect URIs** prüfen und z. B. hinzufügen:

- `https://e-id-connect-lr65.vercel.app/api/docusign/return`
- `http://localhost:3000/api/docusign/return`

---

## Kurzüberblick

| Was du brauchst | Wo in DocuSign |
|-----------------|----------------|
| Integration Key | Apps and Keys → deine App |
| User ID (GUID) | Apps and Keys → API User ID |
| Account ID (GUID) | Settings → Account |
| Private Key (PEM) | Apps and Keys → RSA Keypair erzeugen, Private Key herunterladen |

Ohne DocuSign-Account und diese vier Werte (plus optional USE_DEMO und NEXT_PUBLIC_APP_URL) kann die NDA-Signatur in der App nicht genutzt werden.
