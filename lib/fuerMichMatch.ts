import katalog from '@/data/leistungskatalog-demo.json';
import type { LifeEventId } from '@/types/fuerMich';

export type LeistungBadge = 'wichtig' | 'nachweis' | 'optional' | 'beratung';

export type LeistungEintrag = {
  id: string;
  titel: string;
  kurzbeschreibung: string;
  lebenslagen: string[];
  zustaendigkeit_demo: string;
  nachweise_demo: string[];
  quelle_hinweis: string;
  link_demo: string;
  /** Optionaler regionaler Demo-Bezug (UI-only, fließt NICHT in den Clara-Prompt). */
  region_demo?: string;
  /** Optionales Demo-Badge für die UX-Einordnung (rein anzeigend). */
  badge?: LeistungBadge;
  /** Optionale Demo-Priorität (kleiner = weiter oben). Nur für Sortierung/Reihung. */
  prioritaet?: number;
};

const ALL_LEISTUNGEN = katalog.leistungen as LeistungEintrag[];

/**
 * Reine Zuordnung: liefert die Demo-Leistungen, deren `lebenslagen`-Tags
 * mindestens eine der ausgewählten Lebenslagen enthalten.
 *
 * Keine Anspruchsprüfung, keine Berechnung, keine Gewichtung — nur Filterung
 * über vordefinierte Tags aus `data/leistungskatalog-demo.json`.
 */
export function matchLeistungen(
  selectedLifeEvents: LifeEventId[],
): LeistungEintrag[] {
  if (selectedLifeEvents.length === 0) return [];
  const selected = new Set<string>(selectedLifeEvents);
  return ALL_LEISTUNGEN.filter((leistung) =>
    leistung.lebenslagen.some((tag) => selected.has(tag)),
  );
}

/**
 * Stabile Sortierung nach optionaler Demo-Priorität (kleiner zuerst).
 * Einträge ohne Priorität landen hinten, ihre Reihenfolge aus dem Katalog
 * bleibt erhalten. Reine Anzeige-Reihung, keine inhaltliche Bewertung.
 */
export function sortByPrioritaet(eintraege: LeistungEintrag[]): LeistungEintrag[] {
  return eintraege
    .map((eintrag, index) => ({ eintrag, index }))
    .sort((a, b) => {
      const pa = a.eintrag.prioritaet ?? Number.MAX_SAFE_INTEGER;
      const pb = b.eintrag.prioritaet ?? Number.MAX_SAFE_INTEGER;
      if (pa !== pb) return pa - pb;
      return a.index - b.index;
    })
    .map(({ eintrag }) => eintrag);
}
