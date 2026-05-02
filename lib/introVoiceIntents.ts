/**
 * Leichte Intent-Erkennung für die Einführung (Mikro / freie Eingabe).
 * Kein LLM – nur Stichwörter, damit Claras Gegenäußerung im aktuellen Schritt bleibt.
 */

const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

/**
 * Nur Kleinbuchstaben + Whitespace (kein diakritik-Stripping — „förmlich“ muss matchen).
 */
export const normalizeVoiceTranscript = (s: string) =>
  s
    .toLowerCase()
    .replace(/[.,!?]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

/**
 * Wählt anhand freier Deutscher Sprachweise „Du“ oder „Sie“ (eID Anrede-Screen).
 * Heuristik absichtlich konservativ: bei widersprüchlichen Signalen `null` → Nutzer:innen wählt per Tippen.
 */
export function matchAnredeFromSpeech(input: string): 'du' | 'sie' | null {
  const t = normalizeVoiceTranscript(input);
  if (!t) return null;

  const padded = ` ${t} `;
  // Includes-basierte Trigger mit Wortgrenzen via Padding.
  const isDu =
    ['du', 'per du', 'du bitte', 'bitte du', 'duzen'].some((v) => padded.includes(` ${v} `));
  const isSie =
    ['sie', 'per sie', 'sie bitte', 'bitte sie', 'siezen', 'formell', 'förmlich', 'foermlich'].some((v) =>
      padded.includes(` ${v} `),
    );

  if (isDu && !isSie) return 'du';
  if (isSie && !isDu) return 'sie';
  return null;
}

/** Spoken, kurz, segmentiert (TTS). */
export function anredeVoiceUnrecognizedParts(): string[] {
  return [
    'Ich habe das nicht sicher verstanden.',
    'Möchtest du per Du oder per Sie angesprochen werden?',
  ];
}

export function anredeVoiceUnrecognizedLine(): string {
  return anredeVoiceUnrecognizedParts().join(' ');
}

export type IntroEntryVoiceChoice = 'start' | 'direct';

/**
 * Einstiegs-Screen „Einführung starten“ vs „Direkt zur App“ (ohne LLM).
 */
export function matchIntroEntryBranchFromSpeech(input: string): IntroEntryVoiceChoice | null {
  const t = normalizeVoiceTranscript(input);
  if (!t) return null;

  const directHints =
    /\b(direkt(\s+zur)?\s*app|nur\s+die?\s*app|ohne\s+einf(ü|u)hrung|überspring|skip|schnell)\b/.test(t) ||
    /^(direkt|app|nur\s+app)$/i.test(t);
  const startHints =
    /\b(einf(ü|u)hrung(\s+starten)?|überblick|start(en)?|los|zeig(\s+mir)?|anfang|weiter)\b/.test(t) ||
    /^(ja|ok|okay|gern|bitte)!?$/i.test(t) ||
    /\b(ja|jawohl|jep|jo)\b/.test(t) ||
    /\b(ich\s+)?bin\s+bereit\b/.test(t) ||
    /\b(na klar|na\s+klar|alles klar)\b/.test(t);

  if (directHints && startHints) return null;
  if (directHints) return 'direct';
  if (startHints) return 'start';
  return null;
}

export function introEntryVoiceUnrecognizedLine(du: boolean): string {
  return du
    ? 'Sag zum Beispiel: Ja — oder: Einführung starten — oder: direkt zur App. Oder nutz die Tasten.'
    : 'Sagen Sie zum Beispiel: Ja — oder: Einführung starten — oder: direkt zur App. Oder nutzen Sie die Tasten.';
}

export type IntroVoiceIntent =
  | { type: 'back' }
  | { type: 'more_info' }
  | { type: 'what_means' }
  | { type: 'help' }
  | { type: 'repeat' }
  | { type: 'unknown' };

/**
 * Liefert bestes passendes Intent; bei Konflikten: Zurück / mehr Infos zuerst.
 */
export function matchIntroVoiceIntent(input: string): IntroVoiceIntent {
  const t = normalize(input).trim();
  if (!t) return { type: 'unknown' };

  if (/\b(zurück|zurueck|zuruck|back|vorher|undo)\b/.test(t)) {
    return { type: 'back' };
  }
  if (/\b(mehr|erkläre|erklar|details|vertief|hintergrund|ausführ|ausfuhr|infos?)\b/.test(t)) {
    return { type: 'more_info' };
  }
  if (/\b(bedeutet|heisst|heisst das|was (ist|sind)|was heisst|warum|wieso|wieso|woran)\b/.test(t)) {
    return { type: 'what_means' };
  }
  if (/\b(hilfe|help|stopp|anhalten|lauter|leiser)\b/.test(t)) {
    return { type: 'help' };
  }
  if (/\b(wiederhol|noch ?mal|encore|repeat)\b/.test(t)) {
    return { type: 'repeat' };
  }
  return { type: 'unknown' };
}

/**
 * Rückmeldungen zum Walkthrough: kurze Sätze, für `speakIntroParts` (Pausen zwischen den Teilen).
 */
export function introVoiceFollowupParts(intent: IntroVoiceIntent, du: boolean): string[] {
  if (du) {
    switch (intent.type) {
      case 'back':
        return ['Gern. Nutz die Taste „Zurück“ in der Leiste. Dann bist du einen Schritt eher.'];
      case 'more_info':
        return [
          'Mehr dazu findest du unter dem Kurztext.',
          'Tippe „Mehr anzeigen“. Dort steht der längere Text zu diesem Bild.',
        ];
      case 'what_means':
        return [
          'Kurz gesagt: Es ist eine Vorschau.',
          'Echte Aktionen laufen in der Führung nicht. Der längere Text fasst es zusammen.',
        ];
      case 'help':
        return [
          'Die Lautstärke stellst du am Gerät ein.',
          'Zum Pausieren: in der Leiste oben die Sprachausgabe aus.',
        ];
      case 'repeat':
        return [
          'Den Schritt habe ich oben im Kurztext stehen.',
          'Den kannst du in Ruhe lesen, wenn du willst.',
        ];
      default:
        return [
          'Hier antworte ich nur mit kurzen Stichworten.',
          'Ausführlicher geht’s später über mich, sobald du das lila Symbol siehst.',
        ];
    }
  }
  switch (intent.type) {
    case 'back':
      return ['Gern. Nutzen Sie die Taste „Zurück“ in der Leiste. Dann sind Sie einen Schritt eher.'];
    case 'more_info':
      return [
        'Mehr dazu finden Sie unter dem Kurztext.',
        'Öffnen Sie „Mehr anzeigen“. Dort steht der längere Text zu diesem Bild.',
      ];
    case 'what_means':
      return [
        'Kurz gesagt: Es handelt sich um eine Vorschau.',
        'Echte Amtshandlungen laufen in der Führung nicht. Den längeren Text öffnen Sie oben.',
      ];
    case 'help':
      return [
        'Die Lautstärke steuern Sie am Gerät.',
        'Zum Pausieren: in der Leiste oben die Sprachausgabe ausschalten.',
      ];
    case 'repeat':
      return [
        'Den Schritt fasse ich oben im Kurztext zusammen.',
        'Den können Sie in Ruhe lesen.',
      ];
    default:
      return [
        'Hier antworte ich nur knapp, damit die Führung im Mittelpunkt bleibt.',
        'Ausführliche Fragen klären wir später, wenn mein Symbol sichtbar ist.',
      ];
  }
}

export function introVoiceFollowupLine(intent: IntroVoiceIntent, du: boolean): string {
  return introVoiceFollowupParts(intent, du).join(' ');
}
