/**
 * Zentrale Walkthrough-Orchestrierung (Clara + UI-Schritte).
 * Eine State-Machine-Index-Reihe — unabhängig von lose gekoppelten Timern.
 */

export const WALKTHROUGH_MACHINE_STEPS = [
  'auth',
  'politikBarometer',
  'abstimmen',
  'wahlen',
  'kalender',
  'meldungen',
  'praemien',
  'outro',
] as const;

export type WalkthroughMachineStep = (typeof WALKTHROUGH_MACHINE_STEPS)[number];

/** Index in INTRO_OVERLAY_STEPS (politikbarometer … praemien), oder null für auth/outro. */
export function overlayIndexForMachineIndex(machineIndex: number): number | null {
  if (machineIndex <= 0 || machineIndex >= WALKTHROUGH_MACHINE_STEPS.length - 1) return null;
  return machineIndex - 1;
}

export function machineStepId(machineIndex: number): WalkthroughMachineStep {
  return WALKTHROUGH_MACHINE_STEPS[machineIndex] ?? 'outro';
}

type StepCopy = {
  title: string;
  shortDu: string;
  shortSie: string;
  speakPartsDu: string[];
  speakPartsSie: string[];
};

const STEPS: Record<WalkthroughMachineStep, StepCopy> = {
  auth: {
    title: 'Sicherer Zugang',
    shortDu:
      'Zuerst der sichere Zugang — perspektivisch per eID oder Wallet. Hier wird nichts Echtes ausgelöst; Identität und Entscheidung bleiben getrennt.',
    shortSie:
      'Zuerst der sichere Zugang — perspektivisch per eID oder Wallet. Hier wird nichts Echtes ausgelöst; Identität und Entscheidung bleiben getrennt.',
    speakPartsDu: [
      'Der erste Schritt ist der sichere Zugang.',
      'Perspektivisch kann geprüft werden, ob du für eine Kommune oder Beteiligung berechtigt bist – zum Beispiel über die eID oder künftig über eine europäische Wallet.',
      'Für diese Vorschau wird nichts Echtes ausgelöst. Wichtig ist nur das Prinzip: Identität und Entscheidung bleiben getrennt.',
    ],
    speakPartsSie: [
      'Der erste Schritt ist der sichere Zugang.',
      'Perspektivisch kann geprüft werden, ob Sie für eine Kommune oder Beteiligung berechtigt sind – zum Beispiel über die eID oder künftig über eine europäische Wallet.',
      'Für diese Vorschau wird nichts Echtes ausgelöst. Wichtig ist nur das Prinzip: Identität und Entscheidung bleiben getrennt.',
    ],
  },
  politikBarometer: {
    title: 'Politikbarometer',
    shortDu:
      'Themen-Schwerpunkte sortieren Inhalte neutral — ohne Profil. Passende Fristen und Termine werden im Kalender leichter erkennbar.',
    shortSie:
      'Themen-Schwerpunkte sortieren Inhalte neutral — ohne Profil. Passende Fristen und Termine werden im Kalender leichter erkennbar.',
    speakPartsDu: [
      'Wir beginnen mit deinen Themen.',
      'Du setzt Schwerpunkte – zum Beispiel bei Digitalisierung, Wirtschaft, Bildung oder Sicherheit. Die App nutzt diese Auswahl nicht, um dich politisch einzuordnen, sondern um Inhalte verständlicher zu sortieren.',
      'So können später passende Beteiligungen, Fristen oder Termine im Kalender schneller sichtbar werden. Es entsteht keine Empfehlung und kein Meinungsprofil.',
    ],
    speakPartsSie: [
      'Wir beginnen mit Ihren Themen.',
      'Sie setzen Schwerpunkte – zum Beispiel bei Digitalisierung, Wirtschaft, Bildung oder Sicherheit. Die App nutzt diese Auswahl nicht, um Sie politisch einzuordnen, sondern um Inhalte verständlicher zu sortieren.',
      'So können später passende Beteiligungen, Fristen oder Termine im Kalender schneller sichtbar werden. Es entsteht keine Empfehlung und kein Meinungsprofil.',
    ],
  },
  abstimmen: {
    title: 'Abstimmen',
    shortDu:
      'Orientierung wird zu Beteiligung: Pro und Contra zur Einordnung, dann bewusste Entscheidung. Sichtbar ist nur das Gesamtergebnis.',
    shortSie:
      'Orientierung wird zu Beteiligung: Pro und Contra zur Einordnung, dann bewusste Entscheidung. Sichtbar ist nur das Gesamtergebnis.',
    speakPartsDu: [
      'Jetzt wird aus Orientierung Beteiligung.',
      'Bei einer kommunalen Abstimmung findest du zuerst das Thema, die Frist und die wichtigsten Informationen.',
      'Pro und Contra helfen dir, beide Seiten einzuordnen.',
      'Entscheiden tust du anschließend bewusst über die Auswahlfelder darunter.',
      'Sichtbar ist später nur das Gesamtergebnis – nicht deine einzelne Entscheidung.',
    ],
    speakPartsSie: [
      'Jetzt wird aus Orientierung Beteiligung.',
      'Bei einer kommunalen Abstimmung finden Sie zuerst das Thema, die Frist und die wichtigsten Informationen.',
      'Pro und Contra helfen Ihnen, beide Seiten einzuordnen.',
      'Entscheiden tun Sie anschließend bewusst über die Auswahlfelder darunter.',
      'Sichtbar ist später nur das Gesamtergebnis – nicht Ihre einzelne Entscheidung.',
    ],
  },
  wahlen: {
    title: 'Wahlen',
    shortDu:
      'Wahlvorschau zur Vorbereitung — kein Wahlakt. Informationen gebündelt; die App empfiehlt keine politische Richtung.',
    shortSie:
      'Wahlvorschau zur Vorbereitung — kein Wahlakt. Informationen gebündelt; die App empfiehlt keine politische Richtung.',
    speakPartsDu: [
      'Die Wahlvorschau ist kein Wahlakt, sondern Vorbereitung.',
      'Du kannst Kandidierende, Parteien, Programme und verifizierte Quellen an einem Ort prüfen.',
      'So wird transparenter, worauf eine Entscheidung beruhen kann.',
      'Die Markierung im Stimmzettel zeigt nur, wie eine digitale Oberfläche funktionieren könnte.',
      'Die Entscheidung selbst bleibt geheim.',
      'Die App gibt keine politische Richtung vor.',
    ],
    speakPartsSie: [
      'Die Wahlvorschau ist kein Wahlakt, sondern Vorbereitung.',
      'Sie können Kandidierende, Parteien, Programme und verifizierte Quellen an einem Ort prüfen.',
      'So wird transparenter, worauf eine Entscheidung beruhen kann.',
      'Die Markierung im Stimmzettel zeigt nur, wie eine digitale Oberfläche funktionieren könnte.',
      'Die Entscheidung selbst bleibt geheim.',
      'Die App gibt keine politische Richtung vor.',
    ],
  },
  kalender: {
    title: 'Kalender',
    shortDu:
      'Fristen und Termine an einem Ort. Themen aus dem Politikbarometer können helfen, ohne politische Sortierung oder Empfehlung.',
    shortSie:
      'Fristen und Termine an einem Ort. Themen aus dem Politikbarometer können helfen, ohne politische Sortierung oder Empfehlung.',
    speakPartsDu: [
      'Im Kalender wird sichtbar, wann etwas wichtig wird.',
      'Hier laufen Fristen, Beteiligungen, Wahltermine und kommunale Ereignisse an einem Ort zusammen.',
      'Die Themen aus dem Politikbarometer können helfen, besonders passende Termine schneller zu erkennen – ohne politische Sortierung und ohne Empfehlung.',
    ],
    speakPartsSie: [
      'Im Kalender wird sichtbar, wann etwas wichtig wird.',
      'Hier laufen Fristen, Beteiligungen, Wahltermine und kommunale Ereignisse an einem Ort zusammen.',
      'Die Themen aus dem Politikbarometer können helfen, besonders passende Termine schneller zu erkennen – ohne politische Sortierung und ohne Empfehlung.',
    ],
  },
  meldungen: {
    title: 'Meldungen',
    shortDu:
      'Anliegen strukturiert an die Gemeinde — Kategorie, Text, Ort, Foto. Der Bearbeitungsstand bleibt nachvollziehbar.',
    shortSie:
      'Anliegen strukturiert an die Gemeinde — Kategorie, Text, Ort, Foto. Der Bearbeitungsstand bleibt nachvollziehbar.',
    speakPartsDu: [
      'Jetzt geht es in den Alltag.',
      'Mit Meldungen gibst du ein Anliegen strukturiert an die Gemeinde weiter – mit Kategorie, kurzer Beschreibung, Ort und Foto.',
      'Aus einer Beobachtung wird so ein nachvollziehbarer Vorgang, dessen Bearbeitungsstand später transparent bleibt.',
    ],
    speakPartsSie: [
      'Jetzt geht es in den Alltag.',
      'Mit Meldungen geben Sie ein Anliegen strukturiert an die Gemeinde weiter – mit Kategorie, kurzer Beschreibung, Ort und Foto.',
      'Aus einer Beobachtung wird so ein nachvollziehbarer Vorgang, dessen Bearbeitungsstand später transparent bleibt.',
    ],
  },
  praemien: {
    title: 'Prämien',
    shortDu:
      'Freiwillige Prämien nach Beteiligung; QR in der App, perspektivisch Wallet. Beteiligung zählt — nicht die Meinung.',
    shortSie:
      'Freiwillige Prämien nach Beteiligung; QR in der App, perspektivisch Wallet. Beteiligung zählt — nicht die Meinung.',
    speakPartsDu: [
      'Zum Schluss kommen die freiwilligen Prämien.',
      'Nach einer abgeschlossenen Beteiligung oder Rückmeldung kann zum Beispiel ein Gutschein fürs Naturfreibad verfügbar werden. Ein Tap öffnet den QR-Code direkt in der App.',
      'Perspektivisch lässt sich so ein Gutschein auch ins Wallet übernehmen. Entscheidend bleibt: Prämien belohnen Beteiligung, nicht Meinung – deine konkrete Entscheidung wird dafür nicht ausgewertet.',
    ],
    speakPartsSie: [
      'Zum Schluss kommen die freiwilligen Prämien.',
      'Nach einer abgeschlossenen Beteiligung oder Rückmeldung kann zum Beispiel ein Gutschein fürs Naturfreibad verfügbar werden. Ein Tap öffnet den QR-Code direkt in der App.',
      'Perspektivisch lässt sich so ein Gutschein auch ins Wallet übernehmen. Entscheidend bleibt: Prämien belohnen Beteiligung, nicht Meinung – Ihre konkrete Entscheidung wird dafür nicht ausgewertet.',
    ],
  },
  outro: {
    title: 'Rundgang abgeschlossen',
    shortDu:
      'Der Überblick ist fertig. Du kannst HookAI Civic jetzt selbst erkunden oder Clara gezielt Fragen stellen.',
    shortSie:
      'Der Überblick ist fertig. Sie können HookAI Civic jetzt selbst erkunden oder Clara gezielt Fragen stellen.',
    speakPartsDu: [
      'Damit ist der geführte Überblick abgeschlossen.',
      'Du kannst HookAI Civic jetzt selbst erkunden oder Clara gezielt Fragen stellen.',
      'Der Grundgedanke bleibt: Menschen sollen leichter verstehen, einfacher mitwirken und dabei die Kontrolle über ihre Entscheidungen behalten.',
    ],
    speakPartsSie: [
      'Damit ist der geführte Überblick abgeschlossen.',
      'Sie können HookAI Civic jetzt selbst erkunden oder Clara gezielt Fragen stellen.',
      'Der Grundgedanke bleibt: Menschen sollen leichter verstehen, einfacher mitwirken und dabei die Kontrolle über ihre Entscheidungen behalten.',
    ],
  },
};

export function machineTitle(machineIndex: number): string {
  const id = machineStepId(machineIndex);
  return STEPS[id].title;
}

export function machineShort(machineIndex: number, du: boolean): string {
  const id = machineStepId(machineIndex);
  return du ? STEPS[id].shortDu : STEPS[id].shortSie;
}

export function machineSpeakParts(machineIndex: number, du: boolean): string[] {
  const id = machineStepId(machineIndex);
  return du ? [...STEPS[id].speakPartsDu] : [...STEPS[id].speakPartsSie];
}

export function machineContinueLabel(machineIndex: number): string {
  switch (machineStepId(machineIndex)) {
    case 'auth':
      return 'Weiter';
    case 'outro':
    default:
      return 'App starten';
    case 'politikBarometer':
    case 'abstimmen':
    case 'wahlen':
    case 'kalender':
    case 'meldungen':
    case 'praemien':
      return 'Weiter';
  }
}

/** Sichtbarer Clara-Fließtext (Banner) — immer mindestens dieser Text, auch ohne Audio. */
export function machineNarrationPlain(machineIndex: number, du: boolean): string {
  return machineSpeakParts(machineIndex, du).join('\n\n');
}
