# Schriftgrößen-Vergrößerungsvorschlag für optimale Lesbarkeit

## Übersicht: Aktuell vs. Empfohlen

### 1. HEADER (App-Titel & Werte)

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| App-Titel „eID Demo Connect“ | `text-4xl` (36px) | `text-5xl` | **48px** | Hauptbranding muss besonders groß sein |
| Punkte/Stimmen Zahlen | `text-3xl` (30px) | `text-5xl` | **48px** | Wichtige Zahlen müssen sofort erkennbar sein |
| Punkte/Stimmen Labels | `text-base` (16px) | `text-xl` | **20px** | Klare Zuordnung zu den Zahlen |

### 2. MENUBAR (Location-Tabs)

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| Location-Buttons | `text-base` (16px) | `text-xl` | **20px** | Wichtige Navigation, muss gut lesbar sein |

### 3. FOOTER (Navigation)

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| Footer-Tabs | `text-base` (16px) | `text-xl` | **20px** | Primäre Navigation muss sehr gut lesbar sein |

### 4. "POWERED BY" (Info-Bar)

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| Powered by Text | `text-base` (16px) | `text-lg` | **18px** | Sekundäre Info, aber lesbar halten |

### 5. CONTENT-BEREICHE

#### 5.1 Subheader (Sektions-Titel)

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| "News", "Ergebnisse" | `text-2xl` (24px) | `text-4xl` | **36px** | Klare Sektionsabgrenzung |

#### 5.2 News-Items

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| News-Titel | `text-base` (16px) | `text-2xl` | **24px** | Überschriften müssen scannbar sein |
| News-Zeitstempel | `text-sm` (14px) | `text-base` | **16px** | Kontextinfo, aber lesbar |
| News-Beschreibung | `text-base` (16px) | `text-xl` | **20px** | Hauptinhalt muss sehr gut lesbar sein |
| News-Level (Bundesebene) | `text-sm` (14px) | `text-base` | **16px** | Kategorisierung, ausreichend |

#### 5.3 Abstimmungs-Cards (Voting Tab)

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| Card-Titel | `text-2xl` (24px) | `text-4xl` | **36px** | Wichtigste Info, muss groß sein |
| Card-Beschreibung | `text-base` (16px) | `text-xl` | **20px** | Hauptinhalt |
| "DRINGEND" Badge | `text-sm` (14px) | `text-lg` | **18px** | Wichtige Warnung, muss auffallen |
| Clara Pro/Con | `text-sm` (14px) | `text-base` | **16px** | Sekundäre Analyse-Info |
| Prozentangaben | `text-sm` (14px) | `text-lg` | **18px** | Wichtige Zahlen müssen klar sein |
| Quellen, Metadaten | `text-sm` (14px) | `text-base` | **16px** | Tertiäre Info, aber lesbar |
| "Ja/Nein/Enthalten" Labels | `text-sm` (14px) | `text-lg` | **18px** | Wichtige Aktions-Labels |

#### 5.4 Ergebnisse-Tab

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| Ergebnis-Titel | `text-base` (16px) | `text-2xl` | **24px** | Überschrift muss hervortreten |
| Ergebnis-Metadaten | `text-sm` (14px) | `text-base` | **16px** | Info ausreichend |
| Prozentanzeige | `text-sm` (14px) | `text-lg` | **18px** | Zahlen müssen klar sein |

#### 5.5 Prämien-Tab

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| Prämien-Titel | `text-base` (16px) | `text-2xl` | **24px** | Überschriften groß machen |
| Prämien-Punkte | `text-xs` (12px) | `text-base` | **16px** | Zahlen müssen lesbar sein |
| Prämien-Beschreibung | `text-xs` (12px) | `text-sm` | **14px** | Info ausreichend |

### 6. HINWEISE & WARNUNGEN

| Element | Aktuell | Empfohlen | Pixel | Begründung |
|---------|---------|-----------|-------|------------|
| "Nur ansehen" Hinweis | `text-base` (16px) | `text-lg` | **18px** | Wichtiger Hinweis muss auffallen |
| Toast-Nachrichten | `text-xs` (12px) | `text-base` | **16px** | Feedback muss lesbar sein |

---

## Zusammenfassung der Änderungen

**Größte Vergrößerungen:**
- App-Titel: 36px → **48px** (+12px)
- Zahlen (Punkte/Stimmen): 30px → **48px** (+18px)
- Card-Titel: 24px → **36px** (+12px)
- Subheader: 24px → **36px** (+12px)
- News-Titel: 16px → **24px** (+8px)

**Moderate Vergrößerungen:**
- Body-Text: 16px → **20px** (+4px)
- Navigation: 16px → **20px** (+4px)
- Prozentangaben: 14px → **18px** (+4px)

**Minimale Vergrößerungen:**
- Kleine Labels: 14px → **16px** (+2px)
- Metadaten: 12px → **14-16px** (+2-4px)

---

## Begründung für die Größen

Die App ist **786px breit** (doppelte iPhone-Größe). Die Schriftgrößen sollten proportional größer sein als bei normalen mobilen Apps:

- **Normale Mobile Apps:** Body-Text 14-16px
- **Diese App (2x Größe):** Body-Text sollte **18-20px** sein
- **Header/Branding:** Sollte bei 2x Größe **48px** statt 24-36px haben
- **Navigation:** Muss gut tappbar und lesbar sein → **20px** statt 16px




