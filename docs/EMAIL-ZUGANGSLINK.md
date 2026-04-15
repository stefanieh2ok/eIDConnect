# E-Mail mit Zugangslink kommt nicht an

Wenn du eine Zugangsanfrage freigibst, wird der Link per E-Mail verschickt. Kommt die E-Mail nicht an, helfen diese Punkte.

## 1. Link trotzdem nutzen (sofort)

- Im **Admin** unter **Zugangsanfragen** nach dem Klick auf **Freigeben** erscheint der **Zugangslink** in einem blauen Kasten.
- Link markieren, kopieren und der Person per Chat/Mail schicken – der Link funktioniert sofort.

Bei Status **Freigegeben** kannst du **„E-Mail erneut senden“** klicken; wenn es wieder fehlschlägt, wird der Link erneut angezeigt.

## 2. Damit die Freigabe automatisch funktioniert (Link per E-Mail an jede Person)

Damit nach dem Klick auf **Freigeben** der Zugangslink **automatisch per E-Mail** an die anfragende Person geht und bei ihr ankommt:

1. **Domain bei Resend verifizieren:** [resend.com/domains](https://resend.com/domains) → Domain hinzufügen (z. B. hookai.eu) → angezeigte DNS-Einträge beim Domain-Anbieter eintragen → in Resend verifizieren.
2. **Absender setzen:** In `.env.local` und in Vercel die Variable **SEND_ACCESS_EMAIL_FROM** setzen, z. B.  
   `SEND_ACCESS_EMAIL_FROM=eID Demo Connect <noreply@deine-domain.de>`  
   (E-Mail-Adresse muss zu der in Resend verifizierten Domain gehören.)
3. **Server neu starten** (lokal: `npm run dev`; Vercel: Redeploy).

Danach wird bei jeder Freigabe die E-Mail mit Zugangslink an die eingetragene Nutzer-E-Mail gesendet und von Resend zugestellt.

## 3. Warum die E-Mail ohne Domain nicht ankommt (Resend)

Der Versand läuft über **Resend** (`RESEND_API_KEY` in Vercel bzw. `.env.local`).

- **Absender „onboarding@resend.dev“ (Standard):**  
  Im Resend-Testmodus kannst du **nur an die E-Mail-Adresse senden, mit der du den Resend-Account angelegt hast**.  
  Andere Adressen erhalten dann keine E-Mail – das ist eine Resend-Einschränkung.

- **Eigene Domain (siehe Abschnitt 2):**  
  Mit verifizierter Domain und `SEND_ACCESS_EMAIL_FROM` kannst du an **beliebige Empfänger** senden; die automatische Freigabe-E-Mail funktioniert dann wie gewünscht.

- **Spam:**  
  E-Mails können im Spam-Ordner landen. Dort und in „Alle Nachrichten“ prüfen.

- **Vercel:**  
  Wenn die App auf Vercel läuft: `RESEND_API_KEY` (und ggf. `SEND_ACCESS_EMAIL_FROM`) in den **Environment Variables** eintragen und **Redeploy** ausführen.

## 4. Nichts ändern, nur Link schicken

Du kannst dauerhaft ohne E-Mail-Versand arbeiten: Nach jeder Freigabe den im Admin angezeigten Link kopieren und der Person manuell schicken (z. B. per E-Mail, Messenger, Link-Sharing).
