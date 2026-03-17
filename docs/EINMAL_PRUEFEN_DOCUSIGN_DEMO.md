# Einmal prüfen: Nach Unterschrift in die Demo + E-Mail

**Wenn nach DocuSign „Finish“ nichts passiert oder du auf der Startseite landest – genau diese eine Sache prüfen.**

---

## Ursache: Falsche DocuSign Redirect-URI

**Symptom:** Nach der Unterschrift in DocuSign und Klick auf **„Finish“**:
- du landest auf der **Startseite** („Ihre Anfrage wurde gespeichert …“) **oder**
- du landest **nicht** in der Demo (**/demo/eidconnect-v1**) **und**
- du bekommst **keine** E-Mail von uns („Unterzeichnung abgeschlossen – so gelangen Sie in die Demo“).

**Grund:** DocuSign leitet nach „Finish“ an eine **falsche Adresse** weiter. Dann wird unsere Rücklauf-URL (**/api/docusign/return**) nie aufgerufen → keine Session, keine E-Mail, keine Weiterleitung in die Demo.

---

## Fix (nur diese eine Einstellung)

1. **DocuSign** einloggen → **Admin** (oder **Settings** / **Apps and Keys**).
2. Deine **Integration / App** auswählen (die mit Integration Key, die für NDA genutzt wird).
3. **„Redirect URI“** (oder **„Callback URL“** / **„Return URL“**) suchen.
4. Dort **genau** eintragen (per Copy & Paste, ohne Leerzeichen):

   ```
   https://e-id-connect-lr65.vercel.app/api/docusign/return
   ```

5. **Kein** `/` am Ende, **keine** weiteren Parameter. Speichern.

**Wichtig:** Steht dort nur die Domain (z. B. `https://e-id-connect-lr65.vercel.app`) **ohne** `/api/docusign/return`, leitet DocuSign auf die Startseite weiter – dann passiert genau das, was du siehst.

---

## Danach testen (einmal durchlaufen)

1. **Inkognito-Fenster** öffnen.
2. Im **Admin** (mit Login) einen **neuen Zugangs-Link (mit NDA / DocuSign)** erstellen (Vorname, Nachname, deine E-Mail) → Link kopieren.
3. Link im Inkognito-Tab öffnen → **„Unterzeichnen Sie mit DocuSign und öffnen Sie die Demo“** klicken.
4. In DocuSign unterschreiben → **„Finish“** klicken.

**Erwartung:**
- Du wirst **in die Demo** weitergeleitet (URL enthält **/demo/eidconnect-v1**).
- Du erhältst eine E-Mail mit dem Betreff **„Unterzeichnung abgeschlossen – so gelangen Sie in die Demo“**.

Wenn beides so eintritt, ist die Redirect-URI korrekt und der Ablauf in Ordnung.

---

## Falls es dann noch nicht klappt (Rest-Check, nur einmal)

| Was | Wo | Erledigt? |
|-----|-----|-----------|
| **Supabase:** Tabelle `demo_docusign_envelopes` | Supabase → Table Editor (oder SQL aus `docs/SUPABASE_ALLES_AUSFUEHREN.sql` ausführen) | ☐ |
| **Supabase:** Tabelle `demo_one_time_entry` | wie oben | ☐ |
| **Vercel:** `RESEND_API_KEY` gesetzt | Vercel → Settings → Environment Variables | ☐ |
| **Vercel:** Nach Änderungen **Redeploy** | Deployments → Redeploy | ☐ |

**Tab-Titel:** Im Code steht jetzt nur noch **„eIDConnect“** (kein langer Text mehr im Tab).

---

## Kurz

- **Landung auf Startseite / keine Demo / keine E-Mail** → DocuSign **Redirect URI** auf  
  `https://e-id-connect-lr65.vercel.app/api/docusign/return` setzen, speichern, Test wie oben.
- Keine doppelte Arbeit: **Zuerst** Redirect-URI prüfen und testen. **Nur wenn** es dann noch fehlt, die Tabelle/Env-Checks in der Tabelle durchgehen.
