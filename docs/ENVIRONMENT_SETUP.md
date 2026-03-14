# Environment Setup für eIDConnect

## .env.local Datei erstellen

Erstellen Sie eine `.env.local` Datei im Root-Verzeichnis des Projekts mit folgendem Inhalt:

```bash
# OpenAI API Configuration
OPENAI_API_KEY=your_openai_api_key_here

# Alternative AI Services (if needed)
# ALEPH_ALPHA_API_KEY=your_aleph_alpha_api_key_here
# STACKIT_API_KEY=your_stackit_api_key_here

# App Configuration
NEXT_PUBLIC_APP_NAME=eIDConnect
NEXT_PUBLIC_APP_VERSION=1.0.0

# Development Settings
NODE_ENV=development
```

## API-Schlüssel konfigurieren

### 1. OpenAI API-Schlüssel
1. Gehen Sie zu [OpenAI Platform](https://platform.openai.com/)
2. Melden Sie sich an oder erstellen Sie ein Konto
3. Navigieren Sie zu "API Keys" im Dashboard
4. Erstellen Sie einen neuen API-Schlüssel
5. Kopieren Sie den Schlüssel und ersetzen Sie `your_openai_api_key_here` in der `.env.local` Datei

### 2. Alternative AI-Services (optional)
Falls Sie andere KI-Services verwenden möchten:

#### Aleph Alpha
1. Gehen Sie zu [Aleph Alpha](https://aleph-alpha.com/)
2. Erstellen Sie ein Konto
3. Generieren Sie einen API-Schlüssel
4. Fügen Sie ihn zur `.env.local` Datei hinzu

#### Stackit
1. Gehen Sie zu [Stackit](https://stackit.de/)
2. Erstellen Sie ein Konto
3. Generieren Sie einen API-Schlüssel
4. Fügen Sie ihn zur `.env.local` Datei hinzu

## Sicherheitshinweise

⚠️ **Wichtig:**
- Fügen Sie `.env.local` zu Ihrer `.gitignore` Datei hinzu
- Teilen Sie niemals Ihre API-Schlüssel öffentlich
- Verwenden Sie unterschiedliche Schlüssel für Development und Production

## Verwendung in der App

Die Umgebungsvariablen können in der App wie folgt verwendet werden:

```typescript
// Server-side (API Routes)
const apiKey = process.env.OPENAI_API_KEY;

// Client-side (nur mit NEXT_PUBLIC_ Präfix)
const appName = process.env.NEXT_PUBLIC_APP_NAME;
```

## Troubleshooting

### Häufige Probleme:

1. **API-Schlüssel wird nicht erkannt**
   - Stellen Sie sicher, dass die `.env.local` Datei im Root-Verzeichnis liegt
   - Starten Sie den Development-Server neu: `npm run dev`

2. **CORS-Fehler**
   - Überprüfen Sie, ob der API-Schlüssel korrekt ist
   - Stellen Sie sicher, dass die Domain in den API-Einstellungen erlaubt ist

3. **Rate Limiting**
   - Überprüfen Sie Ihre API-Nutzung im OpenAI Dashboard
   - Implementieren Sie Rate Limiting in der App

## Beispiel-Konfiguration

```bash
# .env.local
OPENAI_API_KEY=sk-1234567890abcdef1234567890abcdef1234567890abcdef
NEXT_PUBLIC_APP_NAME=eIDConnect
NODE_ENV=development
```

Nach dem Erstellen der `.env.local` Datei starten Sie die App mit:

```bash
npm run dev
```
