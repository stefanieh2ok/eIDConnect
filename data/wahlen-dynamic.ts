/**
 * Dynamische Wahl-Einträge aus auto-generierten Wikidata-Daten.
 * Kombiniert statische (handkuratierte) und automatische Daten.
 */
import { Wahl, Candidate } from '@/types';
import { WAHLEN_DATA } from './constants';
import {
  findBuergermeister,
  findLandrat,
  KommunalPolitiker,
} from './kommunalpolitiker-auto';

const SHORT_PARTY: Record<string, string> = {
  'Sozialdemokratische Partei Deutschlands': 'SPD',
  'Christlich Demokratische Union': 'CDU',
  'Christlich Demokratische Union Deutschlands': 'CDU',
  'Christlich-Soziale Union in Bayern': 'CSU',
  'Bündnis 90/Die Grünen': 'GRÜNE',
  'Freie Demokratische Partei': 'FDP',
  'Alternative für Deutschland': 'AfD',
  'Die Linke': 'DIE LINKE',
  'Bündnis Sahra Wagenknecht': 'BSW',
  'Freie Wähler': 'Freie Wähler',
  'parteilos': 'parteilos',
  'Parteiloser': 'parteilos',
};

function shortParty(full: string): string {
  return SHORT_PARTY[full] || full;
}

function politikerToCandidate(p: KommunalPolitiker, rolle: string): Candidate {
  return {
    name: p.name,
    partei: shortParty(p.partei),
    emoji: '👨‍💼',
    alter: p.alter ?? 0,
    beruf: rolle,
    positionen: [],
    claraInfo: `${rolle} – Daten automatisch aus Wikidata (CC0).`,
    quellen: ['[1] Wikidata / Wikipedia'],
    image: p.image || undefined,
    quelle: p.image ? 'Wikimedia Commons' : undefined,
    wikipediaUrl: p.wikipediaUrl || undefined,
    standDatum: new Date().toISOString().slice(0, 10),
  };
}

function hasStaticKommunalwahl(cityNameLower: string): boolean {
  return WAHLEN_DATA.some(
    (w) =>
      w.level === 'kommune' &&
      (w.location === cityNameLower ||
        w.wahlkreis.toLowerCase() === cityNameLower)
  );
}

function hasStaticKreiswahl(kreisNameLower: string): boolean {
  return WAHLEN_DATA.some(
    (w) =>
      w.level === 'kreis' &&
      (w.wahlkreis.toLowerCase() === kreisNameLower ||
        w.wahlkreis.toLowerCase().includes(kreisNameLower) ||
        kreisNameLower.includes(w.wahlkreis.toLowerCase()))
  );
}

/**
 * Erzeugt eine dynamische Kommunalwahl für eine Stadt, falls keine
 * handkuratierte vorhanden ist.
 */
export function getDynamicKommunalwahl(
  cityName: string,
): Wahl | null {
  const cityLower = cityName.toLowerCase().trim();
  if (hasStaticKommunalwahl(cityLower)) return null;

  const bm = findBuergermeister(cityName);
  if (!bm) return null;

  const kandidaten: Candidate[] = [
    politikerToCandidate(bm, 'Bürgermeister/in'),
  ];

  return {
    id: `kw-auto-${cityLower.replace(/\s+/g, '-')}`,
    name: `Kommunalpolitik ${cityName}`,
    datum: 'aktuell',
    wahlkreis: cityName,
    level: 'kommune',
    location: 'kommune',
    kandidaten,
    parteien: [],
  };
}

/**
 * Erzeugt eine dynamische Kreis-Wahl für einen Landkreis, falls keine
 * handkuratierte vorhanden ist. Zeigt den Landrat wenn Daten verfügbar,
 * ansonsten einen Platzhalter-Eintrag.
 */
export function getDynamicKreiswahl(
  kreisName: string,
): Wahl | null {
  const kreisLower = kreisName.toLowerCase().trim();
  if (hasStaticKreiswahl(kreisLower)) return null;
  if (!kreisName) return null;

  const lr = findLandrat(kreisName);
  const kandidaten: Candidate[] = lr
    ? [politikerToCandidate(lr, 'Landrat/Landrätin')]
    : [];

  return {
    id: `kt-auto-${kreisLower.replace(/\s+/g, '-')}`,
    name: `Kreispolitik ${kreisName}`,
    datum: 'aktuell',
    wahlkreis: kreisName,
    level: 'kreis',
    location: 'kreis',
    kandidaten,
    parteien: [],
  };
}

/**
 * Gibt alle relevanten Wahlen für den aktuellen Nutzer zurück:
 * statische WAHLEN_DATA + dynamische Einträge für Kreis und Kommune.
 */
export function getWahlenForUser(opts: {
  kreisName?: string;
  cityName?: string;
}): Wahl[] {
  const result = [...WAHLEN_DATA];

  if (opts.kreisName) {
    const kreisWahl = getDynamicKreiswahl(opts.kreisName);
    if (kreisWahl) result.push(kreisWahl);
  }

  if (opts.cityName) {
    const kommunalWahl = getDynamicKommunalwahl(opts.cityName);
    if (kommunalWahl) result.push(kommunalWahl);
  }

  return result;
}
