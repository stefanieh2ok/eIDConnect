import type { AddressMode } from '@/lib/clara-system-prompt';
import type { AgeGroup, FuerMichProfileState, LifeEventId } from '@/types/fuerMich';
import type { LeistungEintrag } from '@/lib/fuerMichMatch';
import { FUER_MICH_LIFE_EVENTS } from '@/data/fuerMichLifeEvents';
import {
  ALTERSGRUPPE_OPTIONS,
  BUNDESLAENDER_OPTIONS,
  ERWERBSSTATUS_OPTIONS,
  NUTZUNGSROLLE_OPTIONS,
  ROLLE_OPTIONS,
  SPRACHE_OPTIONS,
  WOHNSITUATION_OPTIONS,
} from '@/data/fuerMichProfileOptions';

/** Pflicht-Einstieg jeder Clara-Light-Antwort im Wegweiser (Sie / Du). */
export const FUER_MICH_CLARA_OPENING =
  'Für Ihre Situation könnten folgende Themen relevant sein …';
export const FUER_MICH_CLARA_OPENING_DU =
  'Für deine Situation könnten folgende Themen relevant sein …';

/** Pflicht-Abschluss jeder Clara-Light-Antwort im Wegweiser (Sie / Du). */
export const FUER_MICH_CLARA_CLOSING =
  'Diese Übersicht informiert über mögliche Themen. Sie ist keine Prüfung Ihres individuellen Anspruchs. Verbindlich entscheidet die zuständige Stelle.';
export const FUER_MICH_CLARA_CLOSING_DU =
  'Diese Übersicht informiert über mögliche Themen. Sie ist keine Prüfung deines individuellen Anspruchs. Verbindlich entscheidet die zuständige Stelle.';

/** Antwort, wenn etwas nicht im Demo-Resolver/-Katalog steht (Sie / Du). */
export const FUER_MICH_CLARA_NO_INFO =
  'Dazu liegt mir in dieser Demo keine geprüfte Information vor. Bitte nutzen Sie die angezeigte zuständige Stelle oder den allgemeinen Zuständigkeitsfinder.';
export const FUER_MICH_CLARA_NO_INFO_DU =
  'Dazu liegt mir in dieser Demo keine geprüfte Information vor. Bitte nutze die angezeigte zuständige Stelle oder den allgemeinen Zuständigkeitsfinder.';

/** Fallback, wenn der KI-Dienst nicht erreichbar ist (adressneutral, App darf nicht crashen). */
export const FUER_MICH_CLARA_API_FALLBACK =
  'Clara ist in dieser Demo gerade nicht mit dem KI-Dienst verbunden. Die Wegweiser-Ergebnisse bleiben sichtbar und können ohne Clara genutzt werden.';

/** Demo-Region des Wegweisers — reiner UI-/Demo-Kontext, KEINE personenbezogene Angabe. */
export const FUER_MICH_REGION_DEMO = 'Kirkel/Saarland';

/** Alterslogik-Hinweise (adressneutral). Keine Alters- oder Berechtigungsprüfung. */
export const FUER_MICH_AGE_HINT_UNDER_16 =
  'Viele digitale Leistungen werden hier aus Sicht der Sorgeberechtigten vorbereitet. HookAI Civic fragt keine Namen von Kindern und speichert keine Geburtsdaten.';
export const FUER_MICH_AGE_HINT_16_17 =
  'Einige Leistungen können eine Zustimmung der Sorgeberechtigten erfordern. Verbindlich entscheidet die zuständige Stelle.';
export const FUER_MICH_AGE_HINT_18_PLUS =
  'Viele Leistungen können grundsätzlich selbst vorbereitet werden. Verbindlich entscheidet die zuständige Stelle.';

/** Empathischer Einstieg im sensiblen Modus (Sie / Du). */
export const FUER_MICH_SENSITIVE_OPENER =
  'Es tut mir leid, dass Sie sich mit dieser Situation beschäftigen müssen. Ich kann Ihnen allgemeine Orientierung geben, welche Stellen und Themen häufig relevant sind.';
export const FUER_MICH_SENSITIVE_OPENER_DU =
  'Es tut mir leid, dass du dich mit dieser Situation beschäftigen musst. Ich kann dir allgemeine Orientierung geben, welche Stellen und Themen häufig relevant sind.';

export function fuerMichClaraOpening(mode: AddressMode): string {
  return mode === 'du' ? FUER_MICH_CLARA_OPENING_DU : FUER_MICH_CLARA_OPENING;
}
export function fuerMichClaraClosing(mode: AddressMode): string {
  return mode === 'du' ? FUER_MICH_CLARA_CLOSING_DU : FUER_MICH_CLARA_CLOSING;
}
export function fuerMichClaraNoInfo(mode: AddressMode): string {
  return mode === 'du' ? FUER_MICH_CLARA_NO_INFO_DU : FUER_MICH_CLARA_NO_INFO;
}
export function fuerMichClaraApiFallback(_mode: AddressMode): string {
  return FUER_MICH_CLARA_API_FALLBACK;
}

/** Liefert den exakten Alterslogik-Hinweis zur groben Altersgruppe (oder null). */
export function getFuerMichAgeHint(ageGroup: AgeGroup | '' | undefined): string | null {
  switch (ageGroup) {
    case 'under_16':
      return FUER_MICH_AGE_HINT_UNDER_16;
    case '16_17':
      return FUER_MICH_AGE_HINT_16_17;
    case '18_plus':
      return FUER_MICH_AGE_HINT_18_PLUS;
    default:
      return null;
  }
}

function labelFor(
  options: readonly { value: string; label: string }[],
  value: string,
): string | null {
  if (!value) return null;
  return options.find((o) => o.value === value)?.label ?? null;
}

/**
 * Nur grobe, enum-basierte Profilkategorien — bewusst KEINE Freitextfelder
 * (PLZ/Wohnort), keine Gesundheits-, Kinder-, Geburts- oder Einkommensdaten.
 */
function buildProfileFacts(profile: FuerMichProfileState): string[] {
  const facts: string[] = [];

  const nutzungsrolle = labelFor(NUTZUNGSROLLE_OPTIONS, profile.nutzungsrolle);
  if (nutzungsrolle) facts.push(`Nutzungsrolle: ${nutzungsrolle}`);

  const altersgruppe = labelFor(ALTERSGRUPPE_OPTIONS, profile.altersgruppe);
  if (altersgruppe) facts.push(`Altersgruppe (grob): ${altersgruppe}`);

  const bundesland = labelFor(BUNDESLAENDER_OPTIONS, profile.bundesland);
  if (bundesland) facts.push(`Bundesland: ${bundesland}`);

  const sprache = labelFor(SPRACHE_OPTIONS, profile.sprache);
  if (sprache) facts.push(`Sprache: ${sprache}`);

  if (profile.kinderVorhanden) {
    facts.push(`Kinder vorhanden: ${profile.kinderVorhanden === 'ja' ? 'ja' : 'nein'}`);
  }
  if (profile.kinderVorhanden === 'ja' && profile.kinderAltersgruppen.length > 0) {
    facts.push(`Altersgruppen der Kinder (grobe Spanne): ${profile.kinderAltersgruppen.join(', ')}`);
  }

  const wohnsituation = labelFor(WOHNSITUATION_OPTIONS, profile.wohnsituation);
  if (wohnsituation) facts.push(`Wohnsituation: ${wohnsituation}`);

  const erwerbsstatus = labelFor(ERWERBSSTATUS_OPTIONS, profile.erwerbsstatus);
  if (erwerbsstatus) facts.push(`Erwerbsstatus: ${erwerbsstatus}`);

  const rolle = labelFor(ROLLE_OPTIONS, profile.rolle);
  if (rolle) facts.push(`Rolle: ${rolle}`);

  return facts;
}

/** Sensible Lebenslagen erhalten keinen Clara-Light-Button (vgl. CLARA-INTEGRATION-NOTES Bedingung 4). */
export function isSensitiveLifeEvent(id: LifeEventId): boolean {
  return FUER_MICH_LIFE_EVENTS.find((e) => e.id === id)?.sensitive === true;
}

/**
 * Sensibler Modus: aktiv bei Pflege/Todesfall (sensible Lebenslage) ODER bei
 * minderjähriger Nutzung (Altersgruppe „unter 16“ / Vertretung eines Kindes).
 */
export function isFuerMichSensitiveContext(args: {
  lifeEvents: LifeEventId[];
  profile: Pick<FuerMichProfileState, 'altersgruppe' | 'nutzungsrolle'>;
}): boolean {
  const sensitiveLifeEvent = args.lifeEvents.some((id) => isSensitiveLifeEvent(id));
  const minorUsage = args.profile.altersgruppe === 'under_16' || args.profile.nutzungsrolle === 'child';
  return sensitiveLifeEvent || minorUsage;
}

export type BuildFuerMichClaraPromptArgs = {
  lifeEvents: LifeEventId[];
  profile: FuerMichProfileState;
  ergebnisse: LeistungEintrag[];
  /** Anrede für Pflichtformulierungen (Standard: 'sie'). */
  addressMode?: AddressMode;
};

/**
 * Baut einen rein app-kontrollierten, statischen Prompt für Clara im Wegweiser-Modus.
 * Es werden ausschließlich Lebenslagen-Keys, grobe Profilkategorien und die
 * bereits gematchten Demo-Katalog-Einträge übergeben — kein Nutzer-Freitext,
 * keine PLZ/Wohnort/Geburts-/Gesundheits-/Einkommensdaten.
 */
export function buildFuerMichClaraPrompt({
  lifeEvents,
  profile,
  ergebnisse,
  addressMode = 'sie',
}: BuildFuerMichClaraPromptArgs): string {
  const mode: AddressMode = addressMode === 'du' ? 'du' : 'sie';
  const profileFacts = buildProfileFacts(profile);
  const ageHint = getFuerMichAgeHint(profile.altersgruppe);
  const sensitive = isFuerMichSensitiveContext({ lifeEvents, profile });
  const sensitiveOpener = mode === 'du' ? FUER_MICH_SENSITIVE_OPENER_DU : FUER_MICH_SENSITIVE_OPENER;

  const themenListe = ergebnisse
    .map((e) => {
      const nachweise = e.nachweise_demo.join('; ');
      return [
        `- ${e.titel}: ${e.kurzbeschreibung}`,
        `  Zuständig (Demo): ${e.zustaendigkeit_demo}`,
        `  Mögliche Nachweise (Demo): ${nachweise}`,
        `  Quellenstatus (Demo): ${e.quelle_hinweis}`,
      ].join('\n');
    })
    .join('\n');

  const lines: string[] = [
    'Aufgabe: Orientierungsanfrage im Demo-Wegweiser von HookAI Civic (Wegweiser-Modus).',
    `Regionaler Demo-Kontext (nur UI/Demo, KEINE personenbezogene Angabe): ${FUER_MICH_REGION_DEMO}.`,
    '',
    'Strikte Vorgaben:',
    `- Beginne deine Antwort GENAU mit diesem Satz: "${fuerMichClaraOpening(mode)}"`,
    '- Nenne ausschließlich Leistungen aus der unten stehenden Liste „Verfügbare Demo-Themen“.',
    `- Wenn nach etwas gefragt wird, das NICHT in dieser Liste steht, antworte ausschließlich mit: "${fuerMichClaraNoInfo(mode)}"`,
    '- Keine Anspruchsprüfung, keine Altersprüfung, keine Berechtigungsprüfung, keine Bewertung individueller Voraussetzungen, keine Empfehlung, keine Bewilligungsaussage.',
    '- Verboten sind Formulierungen wie „Sie haben Anspruch auf“, „Ihnen steht … zu“, „Dir steht … zu“, „Sie erfüllen die Voraussetzungen“, „Du erfüllst die Voraussetzungen“, „Ihr Antrag wird bewilligt“, „Dein Antrag wird bewilligt“, „Sie bekommen“, „Du bekommst“, „Die Wahrscheinlichkeit ist …“.',
    '- Erfinde keine Quellen, keine Behörden, keine Formulare und keine Links. Nutze nur die unten angegebenen Demo-Angaben und den Quellenstatus.',
    '- Wenn zu einem Thema kein geprüfter Online-Link vorliegt, nenne die zuständige Stelle und weise neutral auf den Demo-/Quellenstatus hin.',
    '- Dies ist eine Konzeptvorschau mit Demo-Daten, keine verbindliche behördliche Auskunft.',
    `- Beende deine Antwort GENAU mit diesem Satz: "${fuerMichClaraClosing(mode)}"`,
  ];

  if (ageHint) {
    lines.push(
      `- Alterslogik-Hinweis (binde diesen Hinweis sinngemäß ein, ohne Altersprüfung): "${ageHint}"`,
    );
  }

  if (sensitive) {
    lines.push(
      '',
      'Sensibler Modus aktiv (Pflege/Todesfall oder minderjährige Nutzung):',
      `- Beginne mit einem kurzen, respektvollen Satz, z. B.: "${sensitiveOpener}"`,
      '- Ruhiger, respektvoller Ton. Keine Prämien, keine Bonuspunkte, keine Gamification.',
      '- Keine Detailfragen, keine Diagnosen, keine Namen, kein Pflegegrad, keine Speicherung suggerieren.',
    );
  }

  lines.push(
    '',
    `Aktive Lebenslagen (Keys): ${lifeEvents.join(', ') || '—'}`,
    `Grobe Profilangaben (freiwillig): ${profileFacts.length > 0 ? profileFacts.join(' · ') : 'keine Angaben'}`,
    '',
    'Verfügbare Demo-Themen:',
    themenListe || '—',
  );

  return lines.join('\n');
}
