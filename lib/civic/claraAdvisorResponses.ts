/**
 * Clara advisor response templates — calm, non-accusatory, clear boundaries.
 */
import type { IntegrityIntentClass } from '@/lib/civic/claraIntegrityPolicy';

export type AdvisorResponse = {
  message: string;
  boundaryNote?: string;
  lawfulAlternatives?: string[];
};

const RESPONSES_DU: Record<IntegrityIntentClass, AdvisorResponse> = {
  normal_help: {
    message:
      'Ich ordne deine Situation einem vorbereiteten Behördenweg zu und stelle dir kurz ein paar gezielte Fragen.',
  },
  ambiguous_health_or_benefit: {
    message:
      'Eine Krankschreibung ist ein medizinischer Nachweis, wenn du tatsächlich arbeitsunfähig bist. Wenn du gesundheitlich belastet bist, ist der richtige Schritt ein Arzttermin. Wenn es um Termine, Überforderung oder finanzielle Unsicherheit geht, kann ich dir helfen, die offiziellen Wege sauber zu sortieren.',
    lawfulAlternatives: [
      'Gesundheit sauber klären — Arbeitsunfähigkeit nur bei tatsächlicher Krankheit ärztlich prüfen lassen',
      'Agentur für Arbeit / Krankenkasse informieren, wenn Arbeitsunfähigkeit vorliegt',
      'Termin ändern, Beratung nutzen oder Leistungen offiziell klären',
    ],
  },
  possible_avoidance: {
    message:
      'Es klingt so, als suchst du Entlastung in einer schwierigen Situation. Eine Krankschreibung ist aber kein taktischer Ausweg, sondern ein medizinischer Nachweis bei tatsächlicher Arbeitsunfähigkeit. Wenn du krank oder psychisch belastet bist, ist ein Arzttermin der richtige Weg. Wenn es um Termine, Pflichten oder finanzielle Unsicherheit geht, helfe ich dir, die offiziellen Optionen sauber zu sortieren.',
    lawfulAlternatives: [
      'Termine offiziell verschieben oder Begründung klären',
      'Beratung bei Agentur für Arbeit oder Jobcenter',
      'Leistungen und Meldepflichten offiziell sortieren',
    ],
  },
  request_for_improper_benefit: {
    message:
      'Ich kann nicht dabei helfen, eine Krankschreibung ohne tatsächliche Arbeitsunfähigkeit zu organisieren. Ich kann dir aber zeigen, welche offiziellen Möglichkeiten es bei Krankheit, Überforderung, Terminen oder finanzieller Unsicherheit gibt.',
    boundaryNote: 'Keine Hilfe bei missbräuchlicher Krankmeldung.',
    lawfulAlternatives: [
      'Bei echter Krankheit: Arzttermin und ärztliche Arbeitsunfähigkeitsbescheinigung',
      'Bei Terminkonflikten: offiziell verschieben oder begründen',
      'Bei Überforderung: Beratung und offizielle Unterstützungswege prüfen',
    ],
  },
  self_harm_or_crisis: {
    message:
      'Wenn du dich akut belastet fühlst, wende dich bitte an professionelle Hilfe — z. B. Telefonseelsorge (0800 111 0 111) oder den Notruf 112. Clara kann bei Verwaltungswegen orientieren, ersetzt aber keine Krisenversorgung.',
    boundaryNote: 'Clara ersetzt keine Notfall- oder Therapieversorgung.',
  },
  medical_or_legal_complexity: {
    message:
      'Das klingt nach einer komplexen medizinischen oder rechtlichen Frage. Clara kann dir bei Behördenwegen und Unterlagen orientieren, aber keine Rechtsberatung oder Diagnose ersetzen.',
    boundaryNote: 'Keine Rechtsberatung durch Clara.',
  },
};

export function getAdvisorResponse(intentClass: IntegrityIntentClass, du = true): AdvisorResponse {
  if (!du) {
    const r = RESPONSES_DU[intentClass];
    return {
      ...r,
      message: r.message
        .replace(/\bdu\b/g, 'Sie')
        .replace(/\bdein\b/g, 'Ihr')
        .replace(/\bdeine\b/g, 'Ihre')
        .replace(/\bdich\b/g, 'sich')
        .replace(/\bdir\b/g, 'Ihnen'),
    };
  }
  return RESPONSES_DU[intentClass];
}

export function buildSafeGuidanceSteps(intentClass: IntegrityIntentClass): string[] {
  const r = RESPONSES_DU[intentClass];
  if (!r.lawfulAlternatives?.length) return [];
  if (
    intentClass === 'ambiguous_health_or_benefit' ||
    intentClass === 'possible_avoidance' ||
    intentClass === 'request_for_improper_benefit'
  ) {
    return [
      'Gesundheit sauber klären — Arbeitsunfähigkeit nur bei tatsächlicher Krankheit ärztlich prüfen lassen',
      'Agentur für Arbeit / Krankenkasse informieren, wenn Arbeitsunfähigkeit vorliegt',
      'Alternative offizielle Wege: Termin ändern, Beratung nutzen, Leistungen klären',
    ];
  }
  return r.lawfulAlternatives;
}
