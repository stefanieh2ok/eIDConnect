/**
 * Kreistags-Demos für alle Hessen- und BW-Menü-IDs (`he_*`, `bw_*`).
 * Amtsträger:innen aus `kreistage-politiker-he-bw.ts` (Wikipedia-Listen, Stand 2026).
 * Handkuratiert in wahlen-deutschland.ts: Bergstraße, Main-Taunus, Rhein-Neckar, Esslingen, Ludwigsburg.
 */
import type { Candidate, Partei, Wahl } from '@/types';
import {
  HESSEN_KREIS_MENU_LABELS,
  HESSEN_OFFICIAL_NAME_BY_MENU_ID,
  type HessenKreisMenuId,
} from './hessenKreis';
import {
  BW_KREIS_MENU_LABELS,
  BW_OFFICIAL_NAME_BY_MENU_ID,
  type BadenWuerttembergKreisMenuId,
} from './badenWuerttembergKreis';
import {
  KREISTAGE_POLITIKER_BW,
  KREISTAGE_POLITIKER_HESSEN,
  type BwKreistagGeneratedId,
  type HessenKreistagGeneratedId,
  type KreistagSpitze,
} from './kreistage-politiker-he-bw';

const HESSEN_KREISTAG_SKIP = new Set<HessenKreisMenuId>(['he_bergstrasse', 'he_main_taunus']);
const BW_KREISTAG_SKIP = new Set<BadenWuerttembergKreisMenuId>([
  'bw_rhein_neckar',
  'bw_esslingen',
  'bw_ludwigsburg',
]);

const KREIS_PARTEIEN: Partei[] = [
  { name: 'CDU', programm: 'Wirtschaft, Infrastruktur, Sicherheit, solide Finanzen.' },
  { name: 'SPD', programm: 'Soziale Gerechtigkeit, Bildung, bezahlbares Wohnen, Klimaschutz.' },
  { name: 'GRÜNE', programm: 'Klimaschutz, Verkehrswende, Umwelt, Bürgerbeteiligung.' },
  { name: 'FDP', programm: 'Digitalisierung, Wirtschaftsfreiheit, bürgernahe Verwaltung.' },
  { name: 'Freie Wähler', programm: 'Bürgernähe, kommunale Selbstverwaltung, Sachpolitik.' },
];

function spitzeToCandidate(sp: KreistagSpitze): Candidate {
  const quellen = ['[1] Wikipedia (Liste Landräte / Oberbürgermeister, Stand 2026)'];
  if (sp.quelleUrl) quellen.push('[2] Offizielle Kreis-/Stadtseite');
  return {
    name: sp.name,
    partei: sp.partei,
    emoji: '👨‍💼',
    alter: sp.alter,
    beruf: sp.beruf,
    positionen: sp.positionen,
    claraInfo: sp.claraInfo,
    quellen,
    wikipediaUrl: sp.wikipediaUrl,
    quelleUrl: sp.quelleUrl,
    standDatum: '2026-01-24',
  };
}

function buildHessenKreistag(menuId: HessenKreisMenuId): Wahl {
  const idGen = menuId as HessenKreistagGeneratedId;
  const sp = KREISTAGE_POLITIKER_HESSEN[idGen];
  if (!sp) {
    throw new Error(`kreistage-politiker-he-bw.ts: fehlender Eintrag für ${menuId}`);
  }
  const official = HESSEN_OFFICIAL_NAME_BY_MENU_ID[menuId];
  const label = HESSEN_KREIS_MENU_LABELS[menuId];
  return {
    id: `kt-${menuId}-demo`,
    name: `Kreistag ${label}`,
    datum: 'aktuell',
    wahlkreis: official,
    level: 'kreis',
    location: menuId,
    kandidaten: [spitzeToCandidate(sp)],
    parteien: KREIS_PARTEIEN,
  };
}

function buildBwKreistag(menuId: BadenWuerttembergKreisMenuId): Wahl {
  const idGen = menuId as BwKreistagGeneratedId;
  const sp = KREISTAGE_POLITIKER_BW[idGen];
  if (!sp) {
    throw new Error(`kreistage-politiker-he-bw.ts: fehlender Eintrag für ${menuId}`);
  }
  const official = BW_OFFICIAL_NAME_BY_MENU_ID[menuId];
  const label = BW_KREIS_MENU_LABELS[menuId];
  return {
    id: `kt-${menuId}-demo`,
    name: `Kreistag ${label}`,
    datum: 'aktuell',
    wahlkreis: official,
    level: 'kreis',
    location: menuId,
    kandidaten: [spitzeToCandidate(sp)],
    parteien: KREIS_PARTEIEN,
  };
}

export const KREISTAGE_HESSEN_BW: Wahl[] = [
  ...(Object.keys(HESSEN_OFFICIAL_NAME_BY_MENU_ID) as HessenKreisMenuId[])
    .filter((id) => !HESSEN_KREISTAG_SKIP.has(id))
    .map(buildHessenKreistag),
  ...(Object.keys(BW_OFFICIAL_NAME_BY_MENU_ID) as BadenWuerttembergKreisMenuId[])
    .filter((id) => !BW_KREISTAG_SKIP.has(id))
    .map(buildBwKreistag),
];
