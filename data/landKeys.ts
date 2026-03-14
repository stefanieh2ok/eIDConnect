/**
 * Amtlicher Gemeindeschlüssel (AGS) – Land-Nummer (2 Ziffern) zu stateKey.
 * Quelle: Destatis / Gemeindeverzeichnis (01–16 = Bundesländer).
 */
export const AGS_LAND_TO_STATE: Record<string, string> = {
  '01': 'schleswig-holstein',
  '02': 'hamburg',
  '03': 'niedersachsen',
  '04': 'bremen',
  '05': 'nordrhein-westfalen',
  '06': 'hessen',
  '07': 'rheinland-pfalz',
  '08': 'baden-wuerttemberg',
  '09': 'bayern',
  '10': 'saarland',
  '11': 'berlin',
  '12': 'brandenburg',
  '13': 'mecklenburg-vorpommern',
  '14': 'sachsen',
  '15': 'sachsen-anhalt',
  '16': 'thueringen',
};

export type KreisItem = { name: string; ags: string; landKey: string };
export type GemeindeItem = { name: string; ags: string; kreisAgs: string; landKey: string };
