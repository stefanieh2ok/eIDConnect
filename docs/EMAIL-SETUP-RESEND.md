# E-Mail-Versand für HookAI Demo (Resend) – Runbook

Solange `SEND_ACCESS_EMAIL_FROM` nicht auf eine in **Resend verifizierte Domain** zeigt, liefert Resend nur an die im Resend-Account verifizierte Adresse (z. B. `stefanie.h2ok@gmail.com`). Tester erhalten dann **gar nichts**.

Die Admin-Oberfläche zeigt das oben in `Admin → Access Requests` als gelben Banner an. Diagnose:

```
GET /api/admin/email-config   (Basic Auth = ADMIN_BASIC_USER / ADMIN_BASIC_PASS)
```

---

## Schritt 1 – Domain in Resend verifizieren (einmalig, ca. 5 Min)

1. https://resend.com/domains öffnen → **Add Domain**.
2. Eigene Domain eintragen, z. B. `hookai.de`. (Eine Subdomain wie `mail.hookai.de` reicht und ist sauberer.)
3. Resend zeigt eine Liste DNS-Records (in der Regel: 1× MX, 1–2× TXT/SPF, 2–3× DKIM, optional 1× DMARC).
4. Diese Records 1:1 im DNS-Provider der Domain (z. B. IONOS, Hetzner, Cloudflare, Route53) anlegen.
5. In Resend auf **Verify** klicken bis Status auf **Verified** wechselt (DNS-TTL kann ein paar Minuten dauern).

> Freemail-Domains (`gmail.com`, `gmx.de`, `web.de`, `yahoo.com`, `t-online.de` …) lassen sich bei Resend **nicht** verifizieren – dafür muss eine eigene Domain her. Falls keine vorhanden ist, kann der Mailto-Notausgang im Admin-UI als Workaround genutzt werden (siehe Schritt 4).

## Schritt 2 – Vercel Environment Variable setzen

In **Vercel → Project → Settings → Environment Variables** für `Production` (und ggf. `Preview`):

| Name | Wert | Beispiel |
|------|------|----------|
| `RESEND_API_KEY` | API-Key aus resend.com → API Keys | `re_xxx…` |
| `SEND_ACCESS_EMAIL_FROM` | Anzeigename + verifizierte Absenderadresse | `HookAI Demo <noreply@hookai.de>` |
| `NEXT_PUBLIC_APP_URL` | Live-URL der App, **ohne** trailing Slash | `https://hookai-two.vercel.app` |
| `ACCESS_LINK_BASE_URL` *(optional)* | Falls Zugangslinks auf eine andere Live-Domain zeigen sollen als die Vercel-Default | `https://demo.hookai.de` |

Speichern → Vercel sagt „Set in Production“.

## Schritt 3 – Redeploy

Vercel → **Deployments** → letzter Deploy → **⋯ → Redeploy** (ohne „Use existing build cache“). Alternativ: einen leeren Commit pushen.

## Schritt 4 – Test im Admin

1. `https://<deine-vercel-url>/admin/access-requests` öffnen (Basic Auth).
2. Oben sollte der grüne Banner erscheinen: **„Mail-Versand bereit. Absender: HookAI Demo <noreply@…>“**.
3. Eine offene Anfrage (oder eine Test-Anfrage über die Startseite) **freigeben** → Status muss auf **„E-Mail gesendet“** wechseln.
4. Wenn der gelbe Banner stattdessen sagt **„Resend-Sandbox-Domain“** oder **„Tester erhalten nichts“** → Schritt 1/2 erneut prüfen, dann „Status erneut prüfen“.

## Notausgang ohne Domain (Übergang)

Im Admin-UI gibt es jetzt pro freigegebener Anfrage:

- **Link kopieren** → Zugangs-URL in die Zwischenablage.
- **Mail-Entwurf öffnen** → öffnet das lokale Mailprogramm mit fertigem Text und korrekter Empfänger-Adresse.

Damit kommt jeder Tester sofort an seinen personalisierten Link, auch bevor die Resend-Domain verifiziert ist.

## Troubleshooting

| Symptom | Ursache | Lösung |
|---------|---------|--------|
| Tester bekommen nichts, du selbst schon | Sandbox-Modus (`onboarding@resend.dev`) | Schritt 1 + 2 |
| `403 only send testing emails to your own email` | Sandbox-Modus | Schritt 1 + 2 |
| Status „E-Mail gesendet“, Tester sieht nichts | Spam-Ordner / SPF/DKIM noch nicht propagiert | DNS-Records prüfen, Domain in Resend „Verified“? |
| Link öffnet `localhost:3000` | `NEXT_PUBLIC_APP_URL` nicht gesetzt oder falsch | Schritt 2 |
| `RESEND_API_KEY ist nicht gesetzt` | Variable fehlt im Production-Environment | Schritt 2 + Redeploy |

## Für Governikus

Sobald Schritt 1–3 einmalig erledigt sind, läuft jede neue freigegebene Anfrage automatisch an die richtige Empfängeradresse – auch an `@governikus.de`. Empfohlene Absenderadresse für Behörden-/Konzernmail-Filter: feste Subdomain (z. B. `noreply@mail.hookai.de`) mit DKIM **und** DMARC `p=quarantine; rua=…`.
