import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';

/**
 * Pro Walkthrough-Screen: UI (short/long) und **Spoken** (`speakSegments*`) getrennt.
 * TTS nutzt nur `speakSegments*` — kurze Sätze, 2–3 pro Szene.
 */
export type WalkthroughClaraBlock = {
  label: string;
  line10sDu: string;
  line10sSie: string;
  shortDu: string;
  shortSie: string;
  longDu: string;
  longSie: string;
  speakSegmentsDu: readonly string[];
  speakSegmentsSie: readonly string[];
};

export const INTRO_WALKTHROUGH_CLARA: Record<IntroOverlayStepId, WalkthroughClaraBlock> = {
  intro: {
    label: 'HookAI Civic',
    line10sDu: 'Unten: Hauptwege. Oben: Postfach, Kalender, Prämien, Einstellungen.',
    line10sSie: 'Unten: Hauptwege. Oben: Postfach, Kalender, Prämien, Einstellungen.',
    shortDu: 'Vier Hauptwege unten — Werkzeuge oben — Clara jederzeit.',
    shortSie: 'Vier Hauptwege unten — Werkzeuge oben — Clara jederzeit.',
    longDu:
      'Willkommen bei HookAI Civic. Unten findest du die vier Hauptwege: Wegweiser, Melden, Beteiligen und Wählen. Oben liegen Postfach, Kalender, Prämien und Einstellungen.',
    longSie:
      'Willkommen bei HookAI Civic. Unten finden Sie die vier Hauptwege: Wegweiser, Melden, Beteiligen und Wählen. Oben liegen Postfach, Kalender, Prämien und Einstellungen.',
    speakSegmentsDu: [
      'Willkommen bei HookAI Civic.',
      'Unten findest du die vier Hauptwege: Wegweiser, Melden, Beteiligen und Wählen.',
      'Oben liegen Postfach, Kalender, Prämien und Einstellungen.',
    ],
    speakSegmentsSie: [
      'Willkommen bei HookAI Civic.',
      'Unten finden Sie die vier Hauptwege: Wegweiser, Melden, Beteiligen und Wählen.',
      'Oben liegen Postfach, Kalender, Prämien und Einstellungen.',
    ],
  },
  wegweiser: {
    label: 'Wegweiser',
    line10sDu: 'Aus einer Lebenslage wird ein klarer nächster Schritt.',
    line10sSie: 'Aus einer Lebenslage wird ein klarer nächster Schritt.',
    shortDu: 'Tippe auf „Ich bekomme ein Baby“ — daraus entsteht dein Behördenweg.',
    shortSie: 'Tippen Sie auf „Ich bekomme ein Baby“ — daraus entsteht Ihr Behördenweg.',
    longDu:
      'Nehmen wir ein echtes Beispiel: Du bekommst ein Baby. Tippe auf die Lebenslage — HookAI Civic macht daraus einen verständlichen Behördenweg.',
    longSie:
      'Nehmen wir ein echtes Beispiel: Sie bekommen ein Baby. Tippen Sie auf die Lebenslage — HookAI Civic macht daraus einen verständlichen Behördenweg.',
    speakSegmentsDu: [
      'Nehmen wir ein echtes Beispiel: Du bekommst ein Baby.',
      'Tippe auf die Lebenslage — HookAI Civic macht daraus einen verständlichen Behördenweg.',
    ],
    speakSegmentsSie: [
      'Nehmen wir ein echtes Beispiel: Sie bekommen ein Baby.',
      'Tippen Sie auf die Lebenslage — HookAI Civic macht daraus einen verständlichen Behördenweg.',
    ],
  },
  profil: {
    label: 'Profil',
    line10sDu: 'Freiwillige Angaben. Keine Bewertung. Keine automatische Entscheidung.',
    line10sSie: 'Freiwillige Angaben. Keine Bewertung. Keine automatische Entscheidung.',
    shortDu: 'Freiwillig. Änderbar. Keine Bewertung.',
    shortSie: 'Freiwillig. Änderbar. Keine Bewertung.',
    longDu:
      'Wenn du möchtest, ergänzt du freiwillig ein Kurzprofil. Es hilft nur beim Sortieren deiner Hinweise — es bewertet dich nicht und trifft keine Entscheidung.',
    longSie:
      'Wenn Sie möchten, ergänzen Sie freiwillig ein Kurzprofil. Es hilft nur beim Sortieren Ihrer Hinweise — es bewertet Sie nicht und trifft keine Entscheidung.',
    speakSegmentsDu: [
      'Wenn du möchtest, ergänzt du freiwillig ein Kurzprofil.',
      'Es hilft nur beim Sortieren deiner Hinweise — es bewertet dich nicht und trifft keine Entscheidung.',
    ],
    speakSegmentsSie: [
      'Wenn Sie möchten, ergänzen Sie freiwillig ein Kurzprofil.',
      'Es hilft nur beim Sortieren Ihrer Hinweise — es bewertet Sie nicht und trifft keine Entscheidung.',
    ],
  },
  behoerdenweg: {
    label: 'Behördenweg',
    line10sDu: 'Welche Stelle? Welche Unterlagen? Welcher nächste Schritt?',
    line10sSie: 'Welche Stelle? Welche Unterlagen? Welcher nächste Schritt?',
    shortDu: 'Checkliste: Stelle, Unterlagen, Frist — als Orientierung.',
    shortSie: 'Checkliste: Stelle, Unterlagen, Frist — als Orientierung.',
    longDu:
      'Jetzt siehst du die nächsten Schritte. Welche Stelle, welche Unterlagen, welche Frist — alles wird als Orientierung vorbereitet.',
    longSie:
      'Jetzt sehen Sie die nächsten Schritte. Welche Stelle, welche Unterlagen, welche Frist — alles wird als Orientierung vorbereitet.',
    speakSegmentsDu: [
      'Jetzt siehst du die nächsten Schritte.',
      'Welche Stelle, welche Unterlagen, welche Frist — alles wird als Orientierung vorbereitet.',
    ],
    speakSegmentsSie: [
      'Jetzt sehen Sie die nächsten Schritte.',
      'Welche Stelle, welche Unterlagen, welche Frist — alles wird als Orientierung vorbereitet.',
    ],
  },
  meldungen: {
    label: 'Meldungen',
    line10sDu: 'Aus einem Foto wird eine nachvollziehbare Meldung.',
    line10sSie: 'Aus einem Foto wird eine nachvollziehbare Meldung.',
    shortDu: 'Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    shortSie: 'Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    longDu:
      'Wenn vor Ort etwas nicht stimmt, meldest du es strukturiert. Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    longSie:
      'Wenn vor Ort etwas nicht stimmt, melden Sie es strukturiert. Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    speakSegmentsDu: [
      'Wenn vor Ort etwas nicht stimmt, meldest du es strukturiert.',
      'Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    ],
    speakSegmentsSie: [
      'Wenn vor Ort etwas nicht stimmt, melden Sie es strukturiert.',
      'Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    ],
  },
  abstimmen: {
    label: 'Abstimmungen',
    line10sDu: 'Punkte für Mitwirkung — nicht für eine bestimmte Meinung.',
    line10sSie: 'Punkte für Mitwirkung — nicht für eine bestimmte Meinung.',
    shortDu: 'Daumen bestätigt Mitwirkung — nicht deine Meinung.',
    shortSie: 'Daumen bestätigt Mitwirkung — nicht Ihre Meinung.',
    longDu:
      'Du kannst Pro und Contra prüfen und bewusst teilnehmen. Der Daumen bestätigt nur die Mitwirkung — die Punkte hängen nicht von deiner Meinung ab.',
    longSie:
      'Sie können Pro und Contra prüfen und bewusst teilnehmen. Der Daumen bestätigt nur die Mitwirkung — die Punkte hängen nicht von Ihrer Meinung ab.',
    speakSegmentsDu: [
      'Du kannst Pro und Contra prüfen und bewusst teilnehmen.',
      'Der Daumen bestätigt nur die Mitwirkung — die Punkte hängen nicht von deiner Meinung ab.',
    ],
    speakSegmentsSie: [
      'Sie können Pro und Contra prüfen und bewusst teilnehmen.',
      'Der Daumen bestätigt nur die Mitwirkung — die Punkte hängen nicht von Ihrer Meinung ab.',
    ],
  },
  wahlen: {
    label: 'Wahlen',
    line10sDu: 'Wahlvorschau — keine echte Stimmabgabe. Keine Empfehlung.',
    line10sSie: 'Wahlvorschau — keine echte Stimmabgabe. Keine Empfehlung.',
    shortDu: 'Stimmzettel verstehen — Information öffnen, nicht abstimmen.',
    shortSie: 'Stimmzettel verstehen — Information öffnen, nicht abstimmen.',
    longDu:
      'Hier geht es nicht ums Wählen, sondern ums Verstehen. Du siehst, wie ein Stimmzettel aufgebaut ist und wo du Informationen öffnen würdest.',
    longSie:
      'Hier geht es nicht ums Wählen, sondern ums Verstehen. Sie sehen, wie ein Stimmzettel aufgebaut ist und wo Sie Informationen öffnen würden.',
    speakSegmentsDu: [
      'Hier geht es nicht ums Wählen, sondern ums Verstehen.',
      'Du siehst, wie ein Stimmzettel aufgebaut ist und wo du Informationen öffnen würdest.',
    ],
    speakSegmentsSie: [
      'Hier geht es nicht ums Wählen, sondern ums Verstehen.',
      'Sie sehen, wie ein Stimmzettel aufgebaut ist und wo Sie Informationen öffnen würden.',
    ],
  },
  kalender: {
    label: 'Kalender',
    line10sDu: 'Fristen und Beteiligungen an einem Ort.',
    line10sSie: 'Fristen und Beteiligungen an einem Ort.',
    shortDu: 'Fristen aus Wegweiser, Beteiligung, Wahl und Postfach — gebündelt.',
    shortSie: 'Fristen aus Wegweiser, Beteiligung, Wahl und Postfach — gebündelt.',
    longDu:
      'Im Kalender laufen deine wichtigen Termine zusammen: Fristen aus dem Wegweiser, Beteiligungen, Wahltermine und Rückfragen aus dem Postfach.',
    longSie:
      'Im Kalender laufen Ihre wichtigen Termine zusammen: Fristen aus dem Wegweiser, Beteiligungen, Wahltermine und Rückfragen aus dem Postfach.',
    speakSegmentsDu: [
      'Im Kalender laufen deine wichtigen Termine zusammen.',
      'Fristen aus dem Wegweiser, Beteiligungen, Wahltermine und Rückfragen aus dem Postfach.',
    ],
    speakSegmentsSie: [
      'Im Kalender laufen Ihre wichtigen Termine zusammen.',
      'Fristen aus dem Wegweiser, Beteiligungen, Wahltermine und Rückfragen aus dem Postfach.',
    ],
  },
  postfach: {
    label: 'Postfach',
    line10sDu: 'Beispielhafte Vorschau — keine echte Zustellung.',
    line10sSie: 'Beispielhafte Vorschau — keine echte Zustellung.',
    shortDu: 'Status ansehen — verifizierte Demo-Kommunikation.',
    shortSie: 'Status ansehen — verifizierte Demo-Kommunikation.',
    longDu:
      'Im Postfach siehst du Rückmeldungen und Hinweise an einem Ort. In dieser Demo ist das eine Vorschau — keine echte Behördenzustellung.',
    longSie:
      'Im Postfach sehen Sie Rückmeldungen und Hinweise an einem Ort. In dieser Demo ist das eine Vorschau — keine echte Behördenzustellung.',
    speakSegmentsDu: [
      'Im Postfach siehst du Rückmeldungen und Hinweise an einem Ort.',
      'In dieser Demo ist das eine Vorschau — keine echte Behördenzustellung.',
    ],
    speakSegmentsSie: [
      'Im Postfach sehen Sie Rückmeldungen und Hinweise an einem Ort.',
      'In dieser Demo ist das eine Vorschau — keine echte Behördenzustellung.',
    ],
  },
  praemien: {
    label: 'Prämien',
    line10sDu: 'Lokale Anerkennung — unabhängig von deiner Entscheidung.',
    line10sSie: 'Lokale Anerkennung — unabhängig von Ihrer Entscheidung.',
    shortDu: 'Naturfreibad Kirkel — Gutschein anzeigen.',
    shortSie: 'Naturfreibad Kirkel — Gutschein anzeigen.',
    longDu:
      'Wenn eine Kommune Mitwirkung anerkennen möchte, kann eine lokale Prämie erscheinen. Zum Beispiel ein Gutschein fürs Naturfreibad — unabhängig von deiner Entscheidung.',
    longSie:
      'Wenn eine Kommune Mitwirkung anerkennen möchte, kann eine lokale Prämie erscheinen. Zum Beispiel ein Gutschein fürs Naturfreibad — unabhängig von Ihrer Entscheidung.',
    speakSegmentsDu: [
      'Wenn eine Kommune Mitwirkung anerkennen möchte, kann eine lokale Prämie erscheinen.',
      'Zum Beispiel ein Gutschein fürs Naturfreibad — unabhängig von deiner Entscheidung.',
    ],
    speakSegmentsSie: [
      'Wenn eine Kommune Mitwirkung anerkennen möchte, kann eine lokale Prämie erscheinen.',
      'Zum Beispiel ein Gutschein fürs Naturfreibad — unabhängig von Ihrer Entscheidung.',
    ],
  },
  praemien_wallet: {
    label: 'Prämien',
    line10sDu: 'QR und Wallet — Vorschau, lokal und datenschutzbewusst.',
    line10sSie: 'QR und Wallet — Vorschau, lokal und datenschutzbewusst.',
    shortDu: 'Wallet-Pass vorbereitet — Demo-Vorschau.',
    shortSie: 'Wallet-Pass vorbereitet — Demo-Vorschau.',
    longDu:
      'Der Gutschein kann als QR-Code oder Wallet-Pass vorbereitet werden. Auch das bleibt eine Vorschau — lokal, freiwillig und datenschutzbewusst.',
    longSie:
      'Der Gutschein kann als QR-Code oder Wallet-Pass vorbereitet werden. Auch das bleibt eine Vorschau — lokal, freiwillig und datenschutzbewusst.',
    speakSegmentsDu: [
      'Der Gutschein kann als QR-Code oder Wallet-Pass vorbereitet werden.',
      'Auch das bleibt eine Vorschau — lokal, freiwillig und datenschutzbewusst.',
    ],
    speakSegmentsSie: [
      'Der Gutschein kann als QR-Code oder Wallet-Pass vorbereitet werden.',
      'Auch das bleibt eine Vorschau — lokal, freiwillig und datenschutzbewusst.',
    ],
  },
  oekosystem: {
    label: 'Ökosystem',
    line10sDu: 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.',
    line10sSie: 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.',
    shortDu: 'Wegweiser, Melden, Beteiligen, Wählen — plus Kalender, Postfach, Prämien, Clara.',
    shortSie: 'Wegweiser, Melden, Beteiligen, Wählen — plus Kalender, Postfach, Prämien, Clara.',
    longDu:
      'So wird aus vielen einzelnen Wegen ein Civic-Ökosystem: Orientierung, Meldungen, Beteiligung, Wahlvorschau, Postfach, Kalender, Prämien und Clara als Begleitung.',
    longSie:
      'So wird aus vielen einzelnen Wegen ein Civic-Ökosystem: Orientierung, Meldungen, Beteiligung, Wahlvorschau, Postfach, Kalender, Prämien und Clara als Begleitung.',
    speakSegmentsDu: [
      'So wird aus vielen einzelnen Wegen ein Civic-Ökosystem.',
      'Orientierung, Meldungen, Beteiligung, Wahlvorschau, Postfach, Kalender, Prämien und Clara als Begleitung.',
    ],
    speakSegmentsSie: [
      'So wird aus vielen einzelnen Wegen ein Civic-Ökosystem.',
      'Orientierung, Meldungen, Beteiligung, Wahlvorschau, Postfach, Kalender, Prämien und Clara als Begleitung.',
    ],
  },
};

export function claraBlockForStep(
  id: IntroOverlayStepId,
  du: boolean,
): {
  label: string;
  line10s: string;
  short: string;
  long: string;
  speak: string;
  speakSegments: string[];
} {
  const b = INTRO_WALKTHROUGH_CLARA[id];
  const body = du ? b.longDu : b.longSie;
  const speakSegments = du ? [...b.speakSegmentsDu] : [...b.speakSegmentsSie];
  const line10s = du ? b.line10sDu : b.line10sSie;
  return {
    label: b.label,
    line10s,
    short: du ? b.shortDu : b.shortSie,
    long: body,
    speak: speakSegments.join(' '),
    speakSegments,
  };
}
