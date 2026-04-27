import { APP_DISPLAY_NAME } from '@/lib/branding';

/**
 * Merkmalsliste für die HookAI Civic Demo – für ein späteres Onboarding / Hilfe-Screen vorgesehen.
 * (Nicht mehr im Login-Assistenten, um Dopplungen mit der Markenzeile zu vermeiden.)
 */
export const APP_HIGHLIGHTS_FOR_LATER = [
  {
    emoji: '📋',
    title: 'Meldungen direkt an die Kommune',
    body: (du: boolean) =>
      du
        ? 'Schick Hinweise, Anliegen oder Probleme digital an die zuständige Stelle.'
        : 'Hinweise, Anliegen oder Probleme können digital erfasst und weitergeleitet werden.',
  },
  {
    emoji: '🗳️',
    title: 'Beteiligung auf allen Ebenen',
    body: (du: boolean) =>
      du
        ? 'Sieh relevante Themen auf Ebene von Kommune, Kreis, Land und Bund.'
        : `${APP_DISPLAY_NAME} zeigt relevante Themen auf allen föderalen Ebenen.`,
  },
  {
    emoji: '📊',
    title: 'Wahlen verständlich vorbereiten',
    body: () =>
      'Stimmzettel, Parteiprogramme, Kandidatenprofile und Wahlinformationen übersichtlich aufbereitet.',
  },
  {
    emoji: 'ℹ️',
    title: 'Politische Informationen klar & neutral',
    body: () =>
      'Neutral, strukturiert und auf Basis nachvollziehbarer Quellen – ohne Empfehlungen.',
  },
  {
    emoji: '📅',
    title: 'Alle Termine in einem Kalender',
    body: () =>
      'Fristen, Veranstaltungen und politische Termine auf einen Blick.',
  },
  {
    emoji: '🧾',
    title: 'Prämien & Status',
    body: (du: boolean) =>
      du
        ? 'Du siehst Prämien nach Einwilligung sowie den nachvollziehbaren Status deiner Beteiligungen.'
        : 'Sie sehen Prämien nach Einwilligung sowie den nachvollziehbaren Status Ihrer Beteiligungen.',
  },
  {
    emoji: '🤖',
    title: 'KI-Unterstützung – ohne Beeinflussung',
    body: (du: boolean) =>
      du
        ? 'Clara hilft dir, Inhalte zu verstehen und einzuordnen – neutral und transparent.'
        : 'Clara hilft, Inhalte zu verstehen und einzuordnen – neutral und transparent.',
  },
  {
    emoji: '🔒',
    title: 'Datenschutz & sichere Übertragung',
    body: (du: boolean) =>
      du
        ? 'Deine Daten werden geschützt übertragen und nicht zum KI-Training verwendet.'
        : 'Alle Eingaben werden geschützt übertragen. Keine KI-Trainingsdaten.',
  },
] as const;
