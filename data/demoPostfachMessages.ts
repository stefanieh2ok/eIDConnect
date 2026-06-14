export type PostfachBadgeKind = 'verifiziert' | 'demo' | 'orientierung';

export type PostfachMessageAction =
  | { type: 'section'; section: 'meldungen' | 'fuermich' | 'kalender'; label: string }
  | { type: 'none'; label: string };

export type DemoPostfachMessage = {
  id: string;
  sender: string;
  title: string;
  body: string;
  status: string;
  badge: PostfachBadgeKind;
  badgeLabel: string;
  action: PostfachMessageAction;
  receivedAt: string;
};

export const DEMO_POSTFACH_MESSAGES: DemoPostfachMessage[] = [
  {
    id: 'kirkel-meldung-eingegangen',
    sender: 'Gemeinde Kirkel',
    title: 'Meldung eingegangen',
    body: 'Ihre Meldung zur Rattenplage auf dem Drachenspielplatz wurde aufgenommen.',
    status: 'Eingegangen',
    badge: 'verifiziert',
    badgeLabel: 'Verifiziert',
    action: { type: 'section', section: 'meldungen', label: 'Status ansehen' },
    receivedAt: '12.06.2026',
  },
  {
    id: 'wegweiser-checkliste-baby',
    sender: 'Wegweiser',
    title: 'Checkliste vorbereitet',
    body: 'Ihre Orientierung zur Lebenslage ‚Baby kommt‘ wurde vorbereitet.',
    status: 'Bereit',
    badge: 'demo',
    badgeLabel: 'Demo',
    action: { type: 'section', section: 'fuermich', label: 'Checkliste öffnen' },
    receivedAt: '10.06.2026',
  },
  {
    id: 'civic-kalender-hinweis',
    sender: 'HookAI Civic',
    title: 'Frist im Kalender merken',
    body: 'Sie können wichtige Schritte aus dem Wegweiser im Kalender vormerken.',
    status: 'Hinweis',
    badge: 'orientierung',
    badgeLabel: 'Orientierung',
    action: { type: 'section', section: 'kalender', label: 'Kalender öffnen' },
    receivedAt: '08.06.2026',
  },
];

export const POSTFACH_UI_CAPTION =
  'Verifizierte Hinweise, Rückfragen und Statusmeldungen an einem Ort.';

export const POSTFACH_DEMO_DISCLAIMER =
  'Beispielhafte Vorschau — keine echte Zustellung oder Behördenanbindung.';
