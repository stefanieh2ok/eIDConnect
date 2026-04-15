# Clara API Setup - Echte KI-Integration

## 📋 Was du brauchst für echte Clara API

Für die **echte Clara KI-Integration** benötigst du:

### 1. **OpenAI API Key** (Hauptanbieter)
- **Was:** API-Schlüssel von OpenAI
- **Warum:** Clara nutzt aktuell GPT-4 für politische Beratung
- **Wo bekommen:**
  1. Gehe zu [OpenAI Platform](https://platform.openai.com/)
  2. Erstelle ein Konto oder melde dich an
  3. Navigiere zu **"API Keys"** im Dashboard
  4. Klicke auf **"Create new secret key"**
  5. Kopiere den Schlüssel (wird nur einmal angezeigt!)

### 2. **Aleph Alpha API Key** (Optional - Deutsche Alternative)
- **Was:** API-Schlüssel von Aleph Alpha (deutscher KI-Anbieter)
- **Warum:** Bessere deutsche Sprachmodelle, DSGVO-konform
- **Wo bekommen:**
  1. Gehe zu [Aleph Alpha](https://aleph-alpha.com/)
  2. Erstelle ein Konto
  3. Generiere einen API-Schlüssel im Dashboard
  4. Hinweis: Bessere deutsche Sprachmodelle, evtl. teurer

### 3. **Umgebungsvariablen konfigurieren**

Erstelle eine `.env.local` Datei im Root-Verzeichnis:

```bash
# Required: OpenAI API Key
OPENAI_API_KEY=sk-proj-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# Optional: Aleph Alpha (deutsche KI)
ALEPH_ALPHA_API_KEY=your_aleph_alpha_key_here

# Optional: Stackit (andere Alternative)
STACKIT_API_KEY=your_stackit_key_here
```

### 4. **Kostenübersicht**

| Provider | Model | Kosten (ca.) | Deutsch-Qualität |
|----------|-------|--------------|------------------|
| **OpenAI** | GPT-4 | ~$0.03 pro 1K Tokens | ⭐⭐⭐⭐ |
| **OpenAI** | GPT-3.5-turbo | ~$0.001 pro 1K Tokens | ⭐⭐⭐ |
| **Aleph Alpha** | Luminous | Auf Anfrage | ⭐⭐⭐⭐⭐ |

**Empfehlung:** 
- **Entwicklung:** GPT-3.5-turbo (günstiger)
- **Production:** GPT-4 oder Aleph Alpha (bessere Qualität)

### 5. **Aktueller API-Endpoint**

Die Clara API nutzt bereits die echte Integration:

**Route:** `/api/clara/chat`  
**Methode:** POST  
**Request Body:**
```json
{
  "message": "Was sagt die SPD zum Thema Wohnen?",
  "context": "Bundestagswahl 2025",
  "preferences": {
    "umwelt": 85,
    "finanzen": 60,
    "bildung": 70
  }
}
```

**Response:**
```json
{
  "response": "Die SPD will die Mietpreisbremse verschärfen...",
  "timestamp": "2025-01-15T10:30:00.000Z"
}
```

### 6. **System Prompt (Clara's Persönlichkeit)**

Der System-Prompt wird automatisch gesetzt:

```
Du bist Clara, eine freundliche und kompetente KI-Assistentin für eID Demo Connect.
Du hilfst Nutzer:innen bei politischen Entscheidungen.

Deine Persönlichkeit:
- Freundlich, aber professionell
- Analytisch und faktenbasiert
- Neutral, aber hilfreich
- Spricht immer auf Deutsch
- Basiert Empfehlungen auf den Nutzerpräferenzen
```

### 7. **Fallback-Verhalten**

**Ohne API-Key:** Clara nutzt einen intelligenten Fallback mit:
- Vordefinierten Antworten für häufige Fragen
- Lokale Logik basierend auf Nutzerpräferenzen
- Funktioniert auch offline

**Mit API-Key:** Clara nutzt echte KI für:
- Kontextbezogene Antworten
- Individuelle Empfehlungen
- Natürliche Gespräche

## 🚀 Setup-Anleitung

### Schritt 1: `.env.local` erstellen

Im Projekt-Root:

```bash
# Windows (PowerShell)
New-Item .env.local

# Mac/Linux
touch .env.local
```

### Schritt 2: API-Key eintragen

```bash
OPENAI_API_KEY=sk-proj-dein-key-hier
```

### Schritt 3: Server neu starten

```bash
npm run dev
```

### Schritt 4: Testen

1. Öffne die App
2. Gehe zu Clara Chat
3. Frage: "Was sagt die SPD zum Thema Wohnen?"
4. **Mit API-Key:** Echte KI-Antwort  
   **Ohne API-Key:** Fallback-Antwort

## 🔒 Sicherheit

⚠️ **WICHTIG:**
- `.env.local` ist in `.gitignore` (wird nicht committed)
- API-Keys niemals öffentlich teilen
- Unterschiedliche Keys für Development/Production
- Rate Limits beachten (60 Requests/Minute für OpenAI)

## 💡 Erweiterte Konfiguration

### Model wechseln (GPT-4 → GPT-3.5)

In `lib/api-config.ts`:

```typescript
openai: {
  apiKey: openaiApiKey,
  baseURL: 'https://api.openai.com/v1',
  model: 'gpt-3.5-turbo' // Statt 'gpt-4'
}
```

### Aleph Alpha als Hauptanbieter

In `app/api/clara/chat/route.ts`:

```typescript
// Statt OpenAI
const config = getAPIConfig();
const headers = createAPIHeaders(config.alephAlpha?.apiKey);

const response = await fetch(`${config.alephAlpha?.baseURL}/complete`, {
  // Aleph Alpha API Format
});
```

## 📊 Monitoring

**API-Nutzung überwachen:**
- OpenAI Dashboard: [platform.openai.com/usage](https://platform.openai.com/usage)
- Aleph Alpha Dashboard: Im Account-Bereich

## ❓ Troubleshooting

### "OPENAI_API_KEY ist nicht definiert"
- Prüfe `.env.local` existiert
- Prüfe Key ist korrekt eingetragen (ohne Leerzeichen)
- Server neu starten nach `.env.local` Änderung

### "API-Fehler: 401"
- API-Key ist ungültig oder abgelaufen
- Neuen Key generieren

### "API-Fehler: 429"
- Rate Limit erreicht
- Warte 1 Minute oder reduziere Requests

### Clara antwortet nicht mit KI
- Prüfe Browser Console für Fehler
- Prüfe Server-Logs (`npm run dev` Terminal)
- Fallback wird verwendet → API-Key fehlt oder ist falsch

## ✅ Checkliste

- [ ] `.env.local` erstellt
- [ ] `OPENAI_API_KEY` eingetragen
- [ ] Server neu gestartet
- [ ] Clara Chat getestet
- [ ] Echte KI-Antworten erhalten ✅

---

**Fragen?** Schaue in die API-Routes:
- `/app/api/clara/chat/route.ts` - Chat-Endpoint
- `/app/api/clara/analyze/route.ts` - Analyse-Endpoint
- `/lib/api-config.ts` - Konfiguration




