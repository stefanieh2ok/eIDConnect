# Check: Ob der Rest funktioniert

Kurze Checkliste – alles der Reihe nach durchgehen und abhaken.

---

## 1. Voraussetzungen (einmalig prüfen)

| # | Prüfung | Wo / Aktion | OK? |
|---|--------|--------------|-----|
| 1.1 | **Supabase:** Beide Tabellen vorhanden? | Supabase Dashboard → **Table Editor** → prüfen, ob `demo_one_time_entry` und `demo_docusign_envelopes` existieren. Wenn nicht: SQL aus `docs/SUPABASE_ALLES_AUSFUEHREN.sql` im SQL Editor ausführen. | ☐ |
| 1.2 | **DocuSign:** Redirect-URI gesetzt? | DocuSign → Apps and Keys → deine Integration → **Redirect URI** = `https://e-id-connect-lr65.vercel.app/api/docusign/return` (ohne / am Ende) | ☐ |
| 1.3 | **Vercel:** RESEND_API_KEY gesetzt? (für E-Mail nach Unterschrift) | Vercel → Settings → Environment Variables → `RESEND_API_KEY` vorhanden? Nach Änderung: Redeploy. | ☐ |
| 1.4 | **Vercel:** Neuester Build grün? | Vercel → Deployments → letztes Deployment mit grünem Haken. Sonst: Redeploy oder Push. | ☐ |

---

## 2. Test: Kompletter Ablauf (DocuSign → Demo + E-Mail)

**In einem Inkognito-Fenster durchspielen.**

| Schritt | Was du tust | Erwartung | OK? |
|--------|-------------|-----------|-----|
| 2.1 | **Admin** öffnen: https://e-id-connect-lr65.vercel.app/admin | Login-Dialog erscheint | ☐ |
| 2.2 | Mit **admin** + deinem Passwort einloggen | Admin-Seite mit Tabs (Demo-Links, …) | ☐ |
| 2.3 | Tab **„Demo-Links“** → Block **„Neuer Zugangs-Link (mit NDA / DocuSign)“**: Vorname, Nachname, **deine echte E-Mail**, optional Organisation → **„Link erstellen“** | Grüner Kasten mit Zugangs-Link erscheint | ☐ |
| 2.4 | **Link kopieren**, neues Tab (weiter Inkognito) öffnen, Link einfügen, Enter | NDA-Zugangsseite (Kurzfassung, Button „Unterzeichnen mit DocuSign …“) | ☐ |
| 2.5 | Auf **„Unterzeichnen Sie mit DocuSign und öffnen Sie die Demo“** klicken | DocuSign öffnet sich (Login falls nötig), NDA-Dokument zum Unterschreiben | ☐ |
| 2.6 | In DocuSign **unterschreiben** und auf **„Finish“** klicken | Weiterleitung **in die Demo** (URL enthält `/demo/eidconnect-v1` o. ä.) – **nicht** zurück auf die NDA-Seite mit Fehler | ☐ |
| 2.7 | E-Mail-Postfach prüfen (die Adresse aus 2.3) | E-Mail mit Betreff **„Unterzeichnung abgeschlossen – so gelangen Sie in die Demo“** (kann 1–2 Min. dauern; Spam prüfen) | ☐ |

---

## 3. Wenn etwas nicht klappt

- **2.6 – Du landest wieder auf der NDA-Seite (roter Fehler):**  
  → 1.1 und 1.2 prüfen (Tabellen + DocuSign Redirect-URI). Vercel → **Logs** (Functions) nach „docusign“ oder „return“ durchsuchen.

- **2.6 – Du landest auf „Zugang verweigert“:**  
  → Token abgelaufen oder max_views erreicht? Neuen Link (2.3) erzeugen und nochmal testen.

- **2.7 – Keine E-Mail:**  
  → 1.3 prüfen (`RESEND_API_KEY`). In Vercel **Logs** nach „Post-sign email“ oder „RESEND“ suchen. Resend-Absender/Domain ggf. verifizieren.

- **2.1 – Kein Login-Dialog:**  
  → Siehe `docs/SCHRITT_FUER_SCHRITT_APP_UND_ADMIN.md` Teil A (ADMIN_BASIC_USER / ADMIN_BASIC_PASS + Redeploy).

---

## Kurz: Alles OK, wenn …

- Admin nur mit Login (Inkognito getestet) erreichbar ist,  
- du nach DocuSign-**Finish** **direkt in der Demo** landest und  
- die E-Mail **„Unterzeichnung abgeschlossen …“** ankommt.

Dann funktioniert der Rest.
