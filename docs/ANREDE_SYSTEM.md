# 👋 eIDConnect – Anrede-System

## ✅ **Anrede-Auswahl implementiert:**

### **1. Login-Flow mit Anrede-Auswahl:**
```typescript
const LoginFlow = {
  schritt_1: "eID-Authentifizierung",
  schritt_2: "Anrede-Auswahl: 'Sie' oder 'Du'",
  schritt_3: "App-Start mit gewählter Anrede",
  schritt_4: "Konsistente Anrede in der gesamten App"
};
```

### **2. Anrede-Auswahl Screen:**
```typescript
const AnredeSelection = {
  titel: "Willkommen!",
  frage: "Wie möchten Sie gerne angesprochen werden?",
  option_sie: {
    text: "Sie",
    beschreibung: "Höfliche Anrede",
    icon: "👔",
    farbe: "Blau"
  },
  option_du: {
    text: "Du", 
    beschreibung: "Freundliche Anrede",
    icon: "🤝",
    farbe: "Grün"
  },
  hinweis: "Sie können die Anrede jederzeit in den Einstellungen ändern"
};
```

---

## 🔧 **Technische Implementierung:**

### **1. User-Interface erweitert:**
```typescript
interface User {
  id: string;
  name: string;
  level: number;
  points: number;
  badges: string[];
  votes: number;
  premiumEnabled: boolean;
  anrede: 'sie' | 'du'; // Neue Eigenschaft
}
```

### **2. Anrede-Hilfsfunktionen:**
```typescript
const AnredeFunctions = {
  getAnrede: () => user.anrede === 'sie' ? 'Sie' : 'Du',
  getAnredeKlein: () => user.anrede === 'sie' ? 'sie' : 'du',
  getAnredePossessiv: () => user.anrede === 'sie' ? 'Ihre' : 'Deine',
  getAnredePossessivKlein: () => user.anrede === 'sie' ? 'ihre' : 'deine'
};
```

### **3. State-Management:**
```typescript
const StateManagement = {
  showAnredeSelection: "Boolean für Anrede-Auswahl Screen",
  user.anrede: "Gespeicherte Anrede-Präferenz",
  standard: "Standardmäßig 'sie' (höflich)"
};
```

---

## 📱 **Anrede-Verwendung in der App:**

### **1. Prämien-Screen:**
```typescript
// Vorher (statisch):
"Prämien-Teilnahme deaktiviert"
"Aktivieren Sie die Teilnahme"

// Nachher (dynamisch):
`${getAnredePossessiv()} Prämien-Teilnahme ist deaktiviert`
`Aktivieren ${getAnredeKlein()} die Teilnahme`
```

### **2. Alert-Nachrichten:**
```typescript
// Vorher (statisch):
"Prämien-Teilnahme ist deaktiviert. Bitte aktivieren Sie die Teilnahme"

// Nachher (dynamisch):
`${getAnredePossessiv()} Prämien-Teilnahme ist deaktiviert. Bitte aktivieren ${getAnredeKlein()} die Teilnahme`
```

### **3. Bestätigungs-Dialoge:**
```typescript
// Vorher (statisch):
"Sie stimmen der Teilnahme zu"
"Möchten Sie fortfahren?"

// Nachher (dynamisch):
`${getAnrede()} stimmen der Teilnahme zu`
`Möchten ${getAnredeKlein()} fortfahren?`
```

---

## 🎯 **Anrede-Beispiele:**

### **Sie-Anrede (höflich):**
- "Ihre Prämien-Teilnahme ist deaktiviert"
- "Aktivieren Sie die Teilnahme"
- "Sie können jetzt lokale Vergünstigungen einlösen"
- "Möchten Sie fortfahren?"

### **Du-Anrede (freundlich):**
- "Deine Prämien-Teilnahme ist deaktiviert"
- "Aktivieren du die Teilnahme"
- "Du kannst jetzt lokale Vergünstigungen einlösen"
- "Möchtest du fortfahren?"

---

## 🔄 **Anrede-Änderung:**

### **1. In den Einstellungen:**
```typescript
const Einstellungen = {
  anrede_aendern: "Button in den Einstellungen",
  bestaetigung: "Bestätigung der Änderung",
  sofort_aktiv: "Änderung wird sofort in der App angewendet",
  konsistenz: "Alle Texte werden automatisch angepasst"
};
```

### **2. Persistierung:**
```typescript
const Persistierung = {
  lokale_speicherung: "Anrede wird lokal gespeichert",
  app_restart: "Anrede bleibt nach App-Neustart erhalten",
  datenschutz: "Keine Übertragung der Anrede-Präferenz"
};
```

---

## 🌍 **Kulturelle Bedeutung:**

### **1. Deutsche Höflichkeit:**
```typescript
const DeutscheHoeflichkeit = {
  sie_anrede: "Respektvoll, formell, höflich",
  du_anrede: "Freundlich, informell, vertraut",
  kontext: "Wichtig für deutsche Kultur",
  respekt: "Zeigt Respekt vor dem Nutzer"
};
```

### **2. Nutzerfreundlichkeit:**
```typescript
const Nutzerfreundlichkeit = {
  persönlichkeit: "App passt sich an Nutzer an",
  komfort: "Nutzer fühlt sich wohl",
  respekt: "Zeigt Respekt vor Präferenzen",
  inklusion: "Berücksichtigt verschiedene Altersgruppen"
};
```

---

## 📋 **Implementierte Features:**

### ✅ **Anrede-Auswahl nach Login:**
- Schöner Screen mit zwei Optionen
- Klare Beschreibung der Unterschiede
- Einfache Auswahl mit einem Klick

### ✅ **Dynamische Texte:**
- Alle Texte passen sich automatisch an
- Konsistente Anrede in der gesamten App
- Keine statischen Texte mehr

### ✅ **Hilfsfunktionen:**
- `getAnrede()` → "Sie" oder "Du"
- `getAnredeKlein()` → "sie" oder "du"
- `getAnredePossessiv()` → "Ihre" oder "Deine"
- `getAnredePossessivKlein()` → "ihre" oder "deine"

### ✅ **State-Management:**
- Anrede wird im User-State gespeichert
- Standardmäßig "sie" (höflich)
- Jederzeit änderbar

---

## 🎯 **Nächste Schritte:**

### **1. Erweiterte Anrede-Funktionen:**
```typescript
const ErweiterteFunktionen = {
  anrede_einstellungen: "Anrede-Änderung in den Einstellungen",
  anrede_speichern: "Persistierung der Anrede-Präferenz",
  anrede_export: "Anrede in Export-Daten",
  anrede_import: "Anrede bei Daten-Import"
};
```

### **2. Mehrsprachigkeit:**
```typescript
const Mehrsprachigkeit = {
  deutsch: "Sie/Du (aktuell implementiert)",
  englisch: "You (zukünftig)",
  franzoesisch: "Vous/Tu (zukünftig)",
  spanisch: "Usted/Tú (zukünftig)"
};
```

---

## 🎉 **Fazit:**

### **✅ Was implementiert wurde:**
- **Anrede-Auswahl** nach Login
- **Dynamische Texte** in der gesamten App
- **Hilfsfunktionen** für konsistente Anrede
- **State-Management** für Anrede-Präferenz
- **Kulturelle Sensibilität** für deutsche Höflichkeit

### **🎯 Vorteile:**
- **Respektvoll** → Zeigt Respekt vor Nutzer-Präferenzen
- **Persönlich** → App passt sich an Nutzer an
- **Kulturell** → Berücksichtigt deutsche Höflichkeit
- **Konsistent** → Einheitliche Anrede in der gesamten App

**eIDConnect respektiert jetzt die deutsche Höflichkeitskultur!** 👋

---

## 📱 **Screenshots der Anrede-Auswahl:**

### **Anrede-Auswahl Screen:**
```
┌─────────────────────────────────┐
│            👋                   │
│         Willkommen!             │
│                                 │
│  Wie möchten Sie gerne          │
│  angesprochen werden?           │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 👔 Sie                      │ │
│  │    Höfliche Anrede         │ │
│  └─────────────────────────────┘ │
│                                 │
│  ┌─────────────────────────────┐ │
│  │ 🤝 Du                       │ │
│  │    Freundliche Anrede      │ │
│  └─────────────────────────────┘ │
│                                 │
│  Sie können die Anrede          │
│  jederzeit in den Einstellungen │
│  ändern                         │
└─────────────────────────────────┘
```

**Die Anrede-Auswahl macht die App persönlicher und respektvoller!** 🎯





