# eIDConnect – Swipe. Vote. Change.

Moderne Bürgerbeteiligungs-App mit KI-Unterstützung, optimiert für Next.js 14.

## Features

- 🗳️ **Swipe-to-Vote**: Intuitive Abstimmungen mit Drag & Drop; Stimmabgabe wird lokal gespeichert (Demo)
- 🪪 **eID-Intro**: Erklärung Personalienprüfung, anonymer Stimmcode, Krypto für Dummies (Blindensignatur, Zero-Knowledge)
- 🤖 **KI-Analyse**: Clara-KI mit personalisierten Empfehlungen
- 📱 **Responsive Design**: Optimiert für Mobile und Desktop
- 🏛️ **Multi-Level**: Deutschland, Saarland, Kreis, Kirkel – Abstimmungen und Wahlen
- 📰 **News**: Aktuelle Berichterstattung
- 📅 **Kalender**: Kommende Abstimmungen, prioritätsbasiert
- 🗳️ **Wahlen**: Stimmzettel (Bund/Land/Kommune), Stimmabgabe mit Feedback und Persistenz
- 📍 **Melden**: Mängelmelder MVP (Kategorien, Beschreibung, Anti-Spam, „Meine Meldungen“)
- 🎁 **Prämien**: Lokale Anreize (Kino, Theater, etc.) mit Einwilligung

## Tech Stack

- **Next.js 14** mit App Router
- **TypeScript** für Type Safety
- **Tailwind CSS** für Styling
- **Lucide React** für Icons
- **Framer Motion** für Animationen
- **React Context** für State Management

## Installation

1. **Dependencies installieren:**
```bash
npm install
```

2. **Environment Setup:**
```bash
# Kopiere die Beispiel-Konfiguration
cp config/env.example .env.local

# Bearbeite die .env.local Datei und füge deinen OpenAI API-Schlüssel hinzu
# OPENAI_API_KEY=dein_openai_api_schlüssel_hier
```

3. **Development Server starten:**
```bash
npm run dev
```

4. **App öffnen:**
Öffne [http://localhost:3002](http://localhost:3002) in deinem Browser.

**Port 3002:** Die App läuft lokal immer auf Port **3002** (`next dev -p 3002` in `package.json`). DocuSign Redirect URI, `NEXT_PUBLIC_APP_URL` und alle Docs verwenden deshalb `http://localhost:3002`. Bei künftigen Änderungen nur diese Adresse nutzen, damit nichts durcheinandergerät.

**Tipp:** Den Projektordner am besten **eIDConnect** oder **eidconnect** nennen (ohne Umlaute). So vermeidest du Pfadprobleme in einigen Terminals und Tools (z. B. bei `cd` oder CI).

## API-Schlüssel konfigurieren

### OpenAI API-Schlüssel (erforderlich)
1. Gehen Sie zu [OpenAI Platform](https://platform.openai.com/)
2. Erstellen Sie einen API-Schlüssel
3. Fügen Sie ihn in die `.env.local` Datei ein:
```bash
OPENAI_API_KEY=sk-your-api-key-here
```

### Alternative KI-Services (optional)
- **Aleph Alpha**: Für erweiterte KI-Funktionen
- **Stackit**: Für zusätzliche Services

### DocuSign (NDA-Signatur)
Für die Funktion **„Mit DocuSign unterzeichnen und Demo öffnen“** wird ein **DocuSign-Account** benötigt. Ohne Account und Konfiguration erscheint „DocuSign config missing …“. Anleitung: [docs/DOCUSIGN_SETUP.md](docs/DOCUSIGN_SETUP.md).

Detaillierte Anweisungen finden Sie in [docs/ENVIRONMENT_SETUP.md](docs/ENVIRONMENT_SETUP.md).

## Projektstruktur

```
├── app/                    # Next.js App Router
│   ├── globals.css        # Global Styles
│   ├── layout.tsx         # Root Layout
│   └── page.tsx           # Home Page
├── components/            # React Komponenten
│   ├── BuergerApp.tsx     # Haupt-App (eIDConnect)
│   ├── Calendar/          # Kalender Komponenten
│   ├── Elections/         # Wahl Komponenten
│   ├── Footer/            # Footer Komponenten
│   ├── Header/            # Header Komponenten
│   ├── Login/             # Login Komponenten
│   ├── Modals/            # Modal Komponenten
│   ├── Navigation/        # Navigation Komponenten
│   ├── News/              # News Komponenten
│   └── Voting/            # Abstimmungs Komponenten
├── context/               # React Context
│   └── AppContext.tsx     # Global State Management
├── data/                  # Statische Daten
│   └── constants.ts       # App Konstanten
├── types/                 # TypeScript Types
│   └── index.ts           # Type Definitionen
└── public/                # Statische Assets
```

## Optimierungen

### Performance
- **Code Splitting**: Automatisch durch Next.js
- **Memoization**: React.memo für teure Komponenten
- **Lazy Loading**: Dynamische Imports wo sinnvoll
- **Image Optimization**: Next.js Image Component

### SEO & Accessibility
- **Semantic HTML**: Korrekte HTML-Struktur
- **ARIA Labels**: Screen Reader Support
- **Focus Management**: Keyboard Navigation
- **Meta Tags**: Optimierte Meta-Daten

### Developer Experience
- **TypeScript**: Vollständige Type Safety
- **ESLint**: Code Quality Checks
- **Prettier**: Code Formatting
- **Hot Reload**: Schnelle Entwicklung

## Konfiguration

### Tailwind CSS
Die App verwendet Tailwind CSS mit benutzerdefinierten Farben und Animationen. Konfiguration in `tailwind.config.js`.

### TypeScript
Strict TypeScript Konfiguration in `tsconfig.json` mit Path Mapping für bessere Imports.

### Next.js
Optimiert für Next.js 14 mit App Router. Konfiguration in `next.config.js`.

## Deployment

### Vercel (Empfohlen)
```bash
npm run build
vercel --prod
```

### Docker
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
```

## Browser Support

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## Lizenz

MIT License - siehe LICENSE Datei für Details.

## Contributing

1. Fork das Repository
2. Erstelle einen Feature Branch
3. Committe deine Änderungen
4. Push zum Branch
5. Erstelle einen Pull Request

## Support

Bei Fragen oder Problemen, erstelle ein Issue im GitHub Repository.
