/**
 * Scene Manifest — geführter Civic-Produktfilm / Tutorial.
 * Single source für Coachmarks, Compliance und Orchestration-Metadaten.
 */
import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';
import type { Section } from '@/types';

export type WalkthroughActionType =
  | 'tap'
  | 'select'
  | 'upload'
  | 'open'
  | 'confirm'
  | 'scroll'
  | 'none';

export type WalkthroughSceneManifestEntry = {
  sceneId: IntroOverlayStepId;
  title: string;
  subtitle: string;
  realSection: Section | 'navigation' | 'trust';
  targetSelector?: string;
  focusElement?: string;
  actionLabel: string;
  actionType: WalkthroughActionType;
  beforeState: string;
  afterState: string;
  coachmarkTextDu: string;
  coachmarkTextSie: string;
  claraTextDu: string;
  claraTextSie: string;
  durationMs: number;
  complianceNote?: string;
  nextEnabledWhen: string;
  screenshotState: string;
};

export const WALKTHROUGH_SCENE_MANIFEST: WalkthroughSceneManifestEntry[] = [
  {
    sceneId: 'intro',
    title: 'Navigation verstehen',
    subtitle: 'Header, Bottom Nav und Clara',
    realSection: 'navigation',
    focusElement: 'app-chrome',
    actionLabel: 'Überblick',
    actionType: 'none',
    beforeState: 'Neuer Nutzer sieht die App-Oberfläche.',
    afterState: 'Vier Hauptwege unten, Werkzeuge oben, Clara jederzeit erreichbar.',
    coachmarkTextDu: 'Unten: deine Hauptwege · Oben: Postfach, Kalender, Prämien, Einstellungen · Clara hilft jederzeit',
    coachmarkTextSie: 'Unten: Ihre Hauptwege · Oben: Postfach, Kalender, Prämien, Einstellungen · Clara hilft jederzeit',
    claraTextDu:
      'Willkommen bei HookAI Civic. Unten findest du die vier Hauptwege: Wegweiser, Melden, Beteiligen und Wählen. Oben liegen Postfach, Kalender, Prämien und Einstellungen.',
    claraTextSie:
      'Willkommen bei HookAI Civic. Unten finden Sie die vier Hauptwege: Wegweiser, Melden, Beteiligen und Wählen. Oben liegen Postfach, Kalender, Prämien und Einstellungen.',
    durationMs: 9000,
    complianceNote: 'Demo/Vorschau — keine echte Behördenanbindung.',
    nextEnabledWhen: 'Nach Navigations-Highlight',
    screenshotState: 'nav-chrome-highlight',
  },
  {
    sceneId: 'wegweiser',
    title: 'Wegweiser',
    subtitle: 'Lebenslage wählen',
    realSection: 'fuermich',
    focusElement: 'life-event-baby',
    actionLabel: 'Lebenslage antippen',
    actionType: 'tap',
    beforeState: 'Liste „Was steht an?“',
    afterState: 'Dein Behördenweg: Baby kommt',
    coachmarkTextDu: 'Tippe auf eine Lebenslage.',
    coachmarkTextSie: 'Tippen Sie auf eine Lebenslage.',
    claraTextDu:
      'Nehmen wir ein echtes Beispiel: Du bekommst ein Baby. Tippe auf die Lebenslage — HookAI Civic macht daraus einen verständlichen Behördenweg.',
    claraTextSie:
      'Nehmen wir ein echtes Beispiel: Sie bekommen ein Baby. Tippen Sie auf die Lebenslage — HookAI Civic macht daraus einen verständlichen Behördenweg.',
    durationMs: 10000,
    complianceNote: 'Orientierung — keine Anspruchsprüfung.',
    nextEnabledWhen: 'Nach Tap-Animation',
    screenshotState: 'wegweiser-baby-selected',
  },
  {
    sceneId: 'profil',
    title: 'Profil',
    subtitle: 'Freiwillige Angaben',
    realSection: 'fuermich',
    actionLabel: 'Profil ergänzen',
    actionType: 'none',
    beforeState: 'Leer oder minimal.',
    afterState: 'Kurzprofil Kirkel · Baby kommt · Postfach',
    coachmarkTextDu: 'Freiwillig. Änderbar. Keine Bewertung.',
    coachmarkTextSie: 'Freiwillig. Änderbar. Keine Bewertung.',
    claraTextDu:
      'Wenn du möchtest, ergänzt du freiwillig ein Kurzprofil. Es hilft nur beim Sortieren deiner Hinweise — es bewertet dich nicht und trifft keine Entscheidung.',
    claraTextSie:
      'Wenn Sie möchten, ergänzen Sie freiwillig ein Kurzprofil. Es hilft nur beim Sortieren Ihrer Hinweise — es bewertet Sie nicht und trifft keine Entscheidung.',
    durationMs: 8000,
    nextEnabledWhen: 'Sofort nach Anzeige',
    screenshotState: 'profil-preview',
  },
  {
    sceneId: 'behoerdenweg',
    title: 'Behördenweg',
    subtitle: 'Checkliste',
    realSection: 'fuermich',
    actionLabel: 'Checkliste öffnen',
    actionType: 'open',
    beforeState: 'Lebenslage gewählt.',
    afterState: '6 Schritte mit Frist und Postfach.',
    coachmarkTextDu: 'Checkliste öffnen',
    coachmarkTextSie: 'Checkliste öffnen',
    claraTextDu:
      'Jetzt siehst du die nächsten Schritte. Welche Stelle, welche Unterlagen, welche Frist — alles wird als Orientierung vorbereitet.',
    claraTextSie:
      'Jetzt sehen Sie die nächsten Schritte. Welche Stelle, welche Unterlagen, welche Frist — alles wird als Orientierung vorbereitet.',
    durationMs: 10000,
    complianceNote: 'Beispielhafte Orientierung — keine Anspruchsprüfung.',
    nextEnabledWhen: 'Nach Checklisten-Animation',
    screenshotState: 'behoerdenweg-checklist',
  },
  {
    sceneId: 'meldungen',
    title: 'Meldungen',
    subtitle: 'Rattenplage Drachenspielplatz',
    realSection: 'meldungen',
    focusElement: 'meldung-form',
    actionLabel: 'Meldung absenden',
    actionType: 'upload',
    beforeState: 'Leeres Meldeformular.',
    afterState: 'Meldung eingegangen',
    coachmarkTextDu: 'Kategorie wählen · Foto hinzufügen · Meldung absenden',
    coachmarkTextSie: 'Kategorie wählen · Foto hinzufügen · Meldung absenden',
    claraTextDu:
      'Wenn vor Ort etwas nicht stimmt, meldest du es strukturiert. Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    claraTextSie:
      'Wenn vor Ort etwas nicht stimmt, melden Sie es strukturiert. Zum Beispiel eine Rattenplage auf dem Drachenspielplatz — mit Foto, Ort und Kategorie.',
    durationMs: 11000,
    complianceNote: 'Demo — keine echte Übermittlung an die Kommune.',
    nextEnabledWhen: 'Nach Demo-Sequenz (valid state)',
    screenshotState: 'meldung-drachenspielplatz',
  },
  {
    sceneId: 'abstimmen',
    title: 'Beteiligen',
    subtitle: 'Mitwirkung mit Daumen-Feedback',
    realSection: 'live',
    focusElement: 'vote-confirm',
    actionLabel: 'Option wählen',
    actionType: 'confirm',
    beforeState: 'Pro/Contra sichtbar.',
    afterState: 'Teilnahme erfasst · Punkte für Mitwirkung',
    coachmarkTextDu: 'Wähle eine Option.',
    coachmarkTextSie: 'Wählen Sie eine Option.',
    claraTextDu:
      'Du kannst Pro und Contra prüfen und bewusst teilnehmen. Der Daumen bestätigt nur die Mitwirkung — die Punkte hängen nicht von deiner Meinung ab.',
    claraTextSie:
      'Sie können Pro und Contra prüfen und bewusst teilnehmen. Der Daumen bestätigt nur die Mitwirkung — die Punkte hängen nicht von Ihrer Meinung ab.',
    durationMs: 9500,
    complianceNote: 'Keine Punkte für Ja/Nein/Enthaltung als Meinung.',
    nextEnabledWhen: 'Nach Daumen-Animation',
    screenshotState: 'abstimmung-thumb',
  },
  {
    sceneId: 'wahlen',
    title: 'Wahlvorschau',
    subtitle: 'Musterstimmzettel',
    realSection: 'wahlen',
    actionLabel: 'Information öffnen',
    actionType: 'open',
    beforeState: 'Neutraler Musterstimmzettel.',
    afterState: 'Demo-Beispiel verstanden',
    coachmarkTextDu: 'Information öffnen, nicht abstimmen.',
    coachmarkTextSie: 'Information öffnen, nicht abstimmen.',
    claraTextDu:
      'Hier geht es nicht ums Wählen, sondern ums Verstehen. Du siehst, wie ein Stimmzettel aufgebaut ist und wo du Informationen öffnen würdest.',
    claraTextSie:
      'Hier geht es nicht ums Wählen, sondern ums Verstehen. Sie sehen, wie ein Stimmzettel aufgebaut ist und wo Sie Informationen öffnen würden.',
    durationMs: 10000,
    complianceNote: 'Demo-Beispiel · Keine echte Stimmabgabe · Keine Empfehlung.',
    nextEnabledWhen: 'Nach Ballot-Animation',
    screenshotState: 'wahlen-neutral-ballot',
  },
  {
    sceneId: 'kalender',
    title: 'Kalender',
    subtitle: 'Fristen bündeln',
    realSection: 'kalender',
    focusElement: 'calendar-june-30',
    actionLabel: 'Frist merken',
    actionType: 'none',
    beforeState: 'Kalender Monatsansicht.',
    afterState: '30.06.2026 hervorgehoben',
    coachmarkTextDu: 'Frist merken',
    coachmarkTextSie: 'Frist merken',
    claraTextDu:
      'Im Kalender laufen deine wichtigen Termine zusammen: Fristen aus dem Wegweiser, Beteiligungen, Wahltermine und Rückfragen aus dem Postfach.',
    claraTextSie:
      'Im Kalender laufen Ihre wichtigen Termine zusammen: Fristen aus dem Wegweiser, Beteiligungen, Wahltermine und Rückfragen aus dem Postfach.',
    durationMs: 8000,
    nextEnabledWhen: 'Sofort',
    screenshotState: 'kalender-june-2026',
  },
  {
    sceneId: 'postfach',
    title: 'Postfach',
    subtitle: 'Status nachverfolgen',
    realSection: 'postfach',
    focusElement: 'header-postfach-icon',
    actionLabel: 'Status ansehen',
    actionType: 'open',
    beforeState: 'Brief-Icon im Header.',
    afterState: 'Meldung eingegangen · verifiziert',
    coachmarkTextDu: 'Status ansehen',
    coachmarkTextSie: 'Status ansehen',
    claraTextDu:
      'Im Postfach siehst du Rückmeldungen und Hinweise an einem Ort. In dieser Demo ist das eine Vorschau — keine echte Behördenzustellung.',
    claraTextSie:
      'Im Postfach sehen Sie Rückmeldungen und Hinweise an einem Ort. In dieser Demo ist das eine Vorschau — keine echte Behördenzustellung.',
    durationMs: 9000,
    complianceNote: 'Beispielhafte Vorschau — keine echte Zustellung.',
    nextEnabledWhen: 'Sofort',
    screenshotState: 'postfach-status',
  },
  {
    sceneId: 'praemien',
    title: 'Prämien',
    subtitle: 'Naturfreibad Kirkel',
    realSection: 'leaderboard',
    focusElement: 'header-gift-icon',
    actionLabel: 'Gutschein anzeigen',
    actionType: 'tap',
    beforeState: 'Prämien-Liste.',
    afterState: 'Naturfreibad-Karte fokussiert',
    coachmarkTextDu: 'Gutschein anzeigen',
    coachmarkTextSie: 'Gutschein anzeigen',
    claraTextDu:
      'Wenn eine Kommune Mitwirkung anerkennen möchte, kann eine lokale Prämie erscheinen. Zum Beispiel ein Gutschein fürs Naturfreibad — unabhängig von deiner Entscheidung.',
    claraTextSie:
      'Wenn eine Kommune Mitwirkung anerkennen möchte, kann eine lokale Prämie erscheinen. Zum Beispiel ein Gutschein fürs Naturfreibad — unabhängig von Ihrer Entscheidung.',
    durationMs: 10000,
    complianceNote: 'Freiwillige lokale Anerkennung — nicht an Stimme/Partei gekoppelt.',
    nextEnabledWhen: 'Nach Gutschein-Highlight',
    screenshotState: 'praemien-naturfreibad',
  },
  {
    sceneId: 'praemien_wallet',
    title: 'Prämien',
    subtitle: 'QR & Wallet',
    realSection: 'leaderboard',
    actionLabel: 'Wallet-Pass vorbereitet',
    actionType: 'confirm',
    beforeState: 'Gutschein ausgewählt.',
    afterState: 'Zum Wallet hinzugefügt (Vorschau)',
    coachmarkTextDu: 'Wallet-Pass vorbereitet',
    coachmarkTextSie: 'Wallet-Pass vorbereitet',
    claraTextDu:
      'Der Gutschein kann als QR-Code oder Wallet-Pass vorbereitet werden. Auch das bleibt eine Vorschau — lokal, freiwillig und datenschutzbewusst.',
    claraTextSie:
      'Der Gutschein kann als QR-Code oder Wallet-Pass vorbereitet werden. Auch das bleibt eine Vorschau — lokal, freiwillig und datenschutzbewusst.',
    durationMs: 9000,
    complianceNote: 'Vorschau — kein echter Wallet-Provider.',
    nextEnabledWhen: 'Nach QR/Wallet-Animation',
    screenshotState: 'praemien-wallet-qr',
  },
  {
    sceneId: 'oekosystem',
    title: 'Ökosystem',
    subtitle: 'Alles hängt zusammen',
    realSection: 'fuermich',
    actionLabel: 'App starten',
    actionType: 'none',
    beforeState: 'Einzelne Module gesehen.',
    afterState: 'Civic-Ökosystem verstanden',
    coachmarkTextDu: 'Wegweiser · Melden · Beteiligen · Wählen · Kalender · Postfach · Prämien · Clara',
    coachmarkTextSie: 'Wegweiser · Melden · Beteiligen · Wählen · Kalender · Postfach · Prämien · Clara',
    claraTextDu:
      'So wird aus vielen einzelnen Wegen ein Civic-Ökosystem: Orientierung, Meldungen, Beteiligung, Wahlvorschau, Postfach, Kalender, Prämien und Clara als Begleitung.',
    claraTextSie:
      'So wird aus vielen einzelnen Wegen ein Civic-Ökosystem: Orientierung, Meldungen, Beteiligung, Wahlvorschau, Postfach, Kalender, Prämien und Clara als Begleitung.',
    durationMs: 9000,
    nextEnabledWhen: 'Nach Ökosystem-Übersicht',
    screenshotState: 'oekosystem-finale',
  },
];

export function sceneManifestFor(id: IntroOverlayStepId): WalkthroughSceneManifestEntry {
  return WALKTHROUGH_SCENE_MANIFEST.find((s) => s.sceneId === id)!;
}

export const WALKTHROUGH_HEADER_NAV = [
  { id: 'brand', label: 'HookAI Civic', hint: 'Marke / Start' },
  { id: 'postfach', label: 'Postfach', hint: 'Rückmeldungen & Status' },
  { id: 'kalender', label: 'Kalender', hint: 'Fristen & Termine' },
  { id: 'praemien', label: 'Prämien', hint: 'Lokale Anerkennung' },
  { id: 'settings', label: 'Einstellungen', hint: 'Trust Center & Profil' },
] as const;

export const WALKTHROUGH_BOTTOM_NAV = [
  { id: 'wegweiser', label: 'Wegweiser', hint: 'Lebenslagen & Behördenwege' },
  { id: 'meldungen', label: 'Melden', hint: 'Anliegen vorbereiten' },
  { id: 'live', label: 'Beteiligen', hint: 'Abstimmungen' },
  { id: 'wahlen', label: 'Wählen', hint: 'Wahlvorschau' },
] as const;
