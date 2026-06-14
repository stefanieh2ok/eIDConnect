import type { LifeEventOption } from '@/types/fuerMich';

// Chronologische, lebenslogische Reihenfolge. Geburt/Neugeborenes immer aus
// Sicht der Eltern/Sorgeberechtigten formuliert – nie so, als handle das Kind selbst.
export const FUER_MICH_LIFE_EVENTS: LifeEventOption[] = [
  {
    id: 'expecting_child',
    labelSie: 'Wir erwarten ein Kind',
    labelDu: 'Wir erwarten ein Kind',
    hintSie: 'Hinweis: aus Sicht der Eltern oder Sorgeberechtigten.',
    hintDu: 'Hinweis: aus Sicht der Eltern oder Sorgeberechtigten.',
  },
  {
    id: 'newborn',
    labelSie: 'Wir haben ein Neugeborenes',
    labelDu: 'Wir haben ein Neugeborenes',
    hintSie: 'Hinweis: aus Sicht der Eltern oder Sorgeberechtigten.',
    hintDu: 'Hinweis: aus Sicht der Eltern oder Sorgeberechtigten.',
  },
  {
    id: 'education',
    labelSie: 'Ich beginne Ausbildung oder Studium',
    labelDu: 'Ich beginne Ausbildung oder Studium',
  },
  {
    id: 'coming_of_age',
    labelSie: 'Ich werde volljährig / starte meinen eigenen Zugang',
    labelDu: 'Ich werde volljährig / starte meinen eigenen Zugang',
    hintSie:
      'Hinweis: Ein eigener digitaler Zugang ist je nach Zugangsmittel erst ab einem bestimmten Alter möglich.',
    hintDu:
      'Hinweis: Ein eigener digitaler Zugang ist je nach Zugangsmittel erst ab einem bestimmten Alter möglich.',
  },
  {
    id: 'mobility',
    labelSie: 'Mobilität & Führerschein',
    labelDu: 'Mobilität & Führerschein',
    hintSie:
      'Hinweis: Einige Leistungen hängen vom Alter und vom Zugangsmittel ab. Keine Anspruchsprüfung.',
    hintDu:
      'Hinweis: Einige Leistungen hängen vom Alter und vom Zugangsmittel ab. Keine Anspruchsprüfung.',
  },
  {
    id: 'moving',
    labelSie: 'Wir ziehen um',
    labelDu: 'Wir ziehen um',
  },
  {
    id: 'job_search',
    labelSie: 'Ich suche Arbeit',
    labelDu: 'Ich suche Arbeit',
  },
  {
    id: 'founding',
    labelSie: 'Ich gründe ein Unternehmen',
    labelDu: 'Ich gründe ein Unternehmen',
  },
  {
    id: 'caregiving',
    labelSie: 'Ich pflege einen Angehörigen',
    labelDu: 'Ich pflege einen Angehörigen',
    sensitive: true,
  },
  {
    id: 'retirement',
    labelSie: 'Ich plane den Ruhestand',
    labelDu: 'Ich plane den Ruhestand',
  },
  {
    id: 'bereavement',
    labelSie: 'Ein Familienmitglied ist verstorben',
    labelDu: 'Ein Familienmitglied ist verstorben',
    sensitive: true,
  },
  {
    id: 'daily_support',
    labelSie: 'Ich benötige Unterstützung im Alltag',
    labelDu: 'Ich benötige Unterstützung im Alltag',
  },
];
