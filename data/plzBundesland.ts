/**
 * PLZ → Bundesland (für eID Demo Connect / Region).
 * Basiert auf der üblichen Systematik der ersten beiden PLZ-Ziffern (Deutschland),
 * mit Ausnahmen für 66 (Saarland) und 99 (größtenteils Sachsen/Thüringen).
 *
 * Kein Ersatz für Amtlichkeit; für Produktion ggf. Geocoding oder amtliche Referenz nutzen.
 */

export type BundeslandInfo = { name: string; slug: string };

/** Erste zwei Ziffern (00–99) → Bundesland */
const PLZ2: Record<string, BundeslandInfo> = {
  '01': { name: 'Sachsen', slug: 'sachsen' },
  '02': { name: 'Sachsen', slug: 'sachsen' },
  '03': { name: 'Brandenburg', slug: 'brandenburg' },
  '04': { name: 'Sachsen', slug: 'sachsen' },
  '06': { name: 'Sachsen-Anhalt', slug: 'sachsen-anhalt' },
  '07': { name: 'Thüringen', slug: 'thueringen' },
  '08': { name: 'Sachsen', slug: 'sachsen' },
  '09': { name: 'Sachsen', slug: 'sachsen' },
  '10': { name: 'Berlin', slug: 'berlin' },
  '12': { name: 'Berlin', slug: 'berlin' },
  '13': { name: 'Berlin', slug: 'berlin' },
  '14': { name: 'Berlin', slug: 'berlin' },
  '15': { name: 'Brandenburg', slug: 'brandenburg' },
  '16': { name: 'Brandenburg', slug: 'brandenburg' },
  '17': { name: 'Mecklenburg-Vorpommern', slug: 'mecklenburg-vorpommern' },
  '18': { name: 'Mecklenburg-Vorpommern', slug: 'mecklenburg-vorpommern' },
  '19': { name: 'Mecklenburg-Vorpommern', slug: 'mecklenburg-vorpommern' },
  '20': { name: 'Hamburg', slug: 'hamburg' },
  '21': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '22': { name: 'Hamburg', slug: 'hamburg' },
  '23': { name: 'Schleswig-Holstein', slug: 'schleswig-holstein' },
  '24': { name: 'Schleswig-Holstein', slug: 'schleswig-holstein' },
  '25': { name: 'Schleswig-Holstein', slug: 'schleswig-holstein' },
  '26': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '27': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '28': { name: 'Bremen', slug: 'bremen' },
  '29': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '30': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '31': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '32': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '33': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '34': { name: 'Hessen', slug: 'hessen' },
  '35': { name: 'Hessen', slug: 'hessen' },
  '36': { name: 'Hessen', slug: 'hessen' },
  '37': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '38': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '39': { name: 'Sachsen-Anhalt', slug: 'sachsen-anhalt' },
  '40': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '41': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '42': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '43': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '44': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '45': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '46': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '47': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '48': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '49': { name: 'Niedersachsen', slug: 'niedersachsen' },
  '50': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '51': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '52': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '53': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '54': { name: 'Rheinland-Pfalz', slug: 'rheinland-pfalz' },
  '55': { name: 'Rheinland-Pfalz', slug: 'rheinland-pfalz' },
  '56': { name: 'Rheinland-Pfalz', slug: 'rheinland-pfalz' },
  '57': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '58': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '59': { name: 'Nordrhein-Westfalen', slug: 'nrw' },
  '60': { name: 'Hessen', slug: 'hessen' },
  '61': { name: 'Hessen', slug: 'hessen' },
  '62': { name: 'Hessen', slug: 'hessen' },
  '63': { name: 'Hessen', slug: 'hessen' },
  '64': { name: 'Hessen', slug: 'hessen' },
  '65': { name: 'Hessen', slug: 'hessen' },
  '66': { name: 'Saarland', slug: 'saarland' },
  '67': { name: 'Rheinland-Pfalz', slug: 'rheinland-pfalz' },
  '68': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '69': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '70': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '71': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '72': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '73': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '74': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '75': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '76': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '77': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '78': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '79': { name: 'Baden-Württemberg', slug: 'baden-wuerttemberg' },
  '80': { name: 'Bayern', slug: 'bayern' },
  '81': { name: 'Bayern', slug: 'bayern' },
  '82': { name: 'Bayern', slug: 'bayern' },
  '83': { name: 'Bayern', slug: 'bayern' },
  '84': { name: 'Bayern', slug: 'bayern' },
  '85': { name: 'Bayern', slug: 'bayern' },
  '86': { name: 'Bayern', slug: 'bayern' },
  '87': { name: 'Bayern', slug: 'bayern' },
  '88': { name: 'Bayern', slug: 'bayern' },
  '89': { name: 'Bayern', slug: 'bayern' },
  '90': { name: 'Bayern', slug: 'bayern' },
  '91': { name: 'Bayern', slug: 'bayern' },
  '92': { name: 'Bayern', slug: 'bayern' },
  '93': { name: 'Bayern', slug: 'bayern' },
  '94': { name: 'Bayern', slug: 'bayern' },
  '95': { name: 'Bayern', slug: 'bayern' },
  '96': { name: 'Bayern', slug: 'bayern' },
  '97': { name: 'Bayern', slug: 'bayern' },
  '98': { name: 'Thüringen', slug: 'thueringen' },
  '99': { name: 'Thüringen', slug: 'thueringen' },
};

/**
 * Korrekturen: 11xxx = Brandenburg (nicht Berlin), 19xxx größt. Sachsen-Anhalt, 99xxx gemischt.
 */
export function inferBundeslandFromPlz(plz: string): BundeslandInfo {
  const p = plz.replace(/\D/g, '').padStart(5, '0');
  if (p.length < 2) return { name: 'Deutschland', slug: 'unknown' };

  if (p.startsWith('66')) return { name: 'Saarland', slug: 'saarland' };

  if (p.startsWith('11')) return { name: 'Brandenburg', slug: 'brandenburg' };

  if (p.startsWith('99')) {
    const n = parseInt(p.slice(0, 3), 10);
    if (n >= 985 && n <= 999) return { name: 'Sachsen', slug: 'sachsen' };
    return { name: 'Thüringen', slug: 'thueringen' };
  }

  if (p.startsWith('19')) return { name: 'Sachsen-Anhalt', slug: 'sachsen-anhalt' };

  const key = p.slice(0, 2);
  const hit = PLZ2[key];
  if (hit) return hit;

  return { name: 'Deutschland', slug: 'unknown' };
}
