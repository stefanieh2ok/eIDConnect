import { WAHLEN_DEUTSCHLAND } from '@/data/wahlen-deutschland';

/**
 * Regressions-Schutz für die Kirkel-Wahlergebnisse.
 *
 * Quellen (Stand 20.04.2026):
 *  - Bürgermeisterwahl Kirkel 09.06.2024: SR.de, Saarbrücker Zeitung (09.06.2024,
 *    "Kirkel wählt einen neuen Bürgermeister"), kirkel.de/rathaus-service/buergermeister,
 *    Wikipedia "Kirkel".
 *  - Gemeinderatswahl Kirkel 09.06.2024: Landeswahlleiter Saarland, amtliches
 *    Endergebnis vom 03.07.2024 (wahlergebnis.saarland.de/GRW/ergebnisse_gemeinde_45115.html).
 *  - Landratswahl Saarpfalz-Kreis 23.06.2024 (Stichwahl): Saarbrücker Zeitung
 *    (24.06.2024, "Der Saarpfalz-Kreis wählte den künftigen Landrat mit klarem
 *    Ergebnis"), Wikipedia "Frank John".
 */
describe('Kirkel – Bürgermeisterwahl 2024 (amtliches Ergebnis)', () => {
  const wahl = WAHLEN_DEUTSCHLAND.find((w) => w.id === 'bw-kirkel-2024');

  it('existiert in den Wahldaten', () => {
    expect(wahl).toBeDefined();
  });

  it('ist korrekt als Kommune für Kirkel verortet und trägt das richtige Datum', () => {
    expect(wahl?.level).toBe('kommune');
    expect(wahl?.location).toBe('kirkel');
    expect(wahl?.datum).toBe('09.06.2024');
    expect(wahl?.name).toMatch(/Bürgermeisterwahl/i);
  });

  it('zeigt Dominik Hochlenert (CDU) als gewählten Bürgermeister an', () => {
    const hoch = wahl?.kandidaten.find((k) => k.name === 'Dominik Hochlenert');
    expect(hoch).toBeDefined();
    expect(hoch?.partei).toBe('CDU');
  });

  it('führt Dennis Jahnke (SPD) und Carsten Betz (FDP) als Mitkandidaten', () => {
    const jahnke = wahl?.kandidaten.find((k) => k.name === 'Dennis Jahnke');
    const betz = wahl?.kandidaten.find((k) => k.name === 'Carsten Betz');
    expect(jahnke?.partei).toBe('SPD');
    expect(betz?.partei).toBe('FDP');
  });

  it('enthält die offiziellen Ergebnis-Prozente (58,39 / 31,68 / 9,93)', () => {
    const parteien = wahl?.ergebnis?.parteien ?? [];
    const pct = (label: string) =>
      parteien.find((p) => p.partei.toLowerCase().includes(label))?.prozent;

    expect(pct('hochlenert')).toBeCloseTo(58.39, 2);
    expect(pct('jahnke')).toBeCloseTo(31.68, 2);
    expect(pct('betz')).toBeCloseTo(9.93, 2);
  });

  it('ist als abgeschlossen markiert und verweist auf Hochlenert als Amtsinhaber', () => {
    expect(wahl?.ergebnis?.status).toBe('abgeschlossen');
    expect(wahl?.ergebnis?.koalition ?? '').toMatch(/Hochlenert/);
  });
});

describe('Kirkel – Gemeinderatswahl 2024 (amtliches Endergebnis)', () => {
  const wahl = WAHLEN_DEUTSCHLAND.find((w) => w.id === 'kw-kirkel-2024');

  it('trägt die Wahlbeteiligung von 76,7 %', () => {
    expect(wahl?.ergebnis?.wahlbeteiligung).toBeCloseTo(76.7, 1);
  });

  it('spiegelt die amtliche Sitzverteilung (CDU/SPD/FDP/GRÜNE/LINKE) wider', () => {
    const byParty = Object.fromEntries(
      (wahl?.ergebnis?.parteien ?? []).map((p) => [p.partei, p.sitze]),
    );

    expect(byParty['CDU']).toBe(13);
    expect(byParty['SPD']).toBe(13);
    expect(byParty['FDP']).toBe(3);
    expect(byParty['GRÜNE']).toBe(3);
    expect(byParty['DIE LINKE']).toBe(1);
  });

  it('spiegelt die amtlichen Prozente (37,9 / 37,7 / 10,0 / 9,6 / 4,7) wider', () => {
    const byParty = Object.fromEntries(
      (wahl?.ergebnis?.parteien ?? []).map((p) => [p.partei, p.prozent]),
    );

    expect(byParty['CDU']).toBeCloseTo(37.9, 1);
    expect(byParty['SPD']).toBeCloseTo(37.7, 1);
    expect(byParty['FDP']).toBeCloseTo(10.0, 1);
    expect(byParty['GRÜNE']).toBeCloseTo(9.6, 1);
    expect(byParty['DIE LINKE']).toBeCloseTo(4.7, 1);
  });
});

describe('Saarpfalz-Kreis – aktueller Landrat', () => {
  const kt = WAHLEN_DEUTSCHLAND.find((w) => w.id === 'kt-saarpfalz-2024');

  it('führt Frank John (SPD) als aktuellen Landrat seit 02.06.2025', () => {
    const john = kt?.kandidaten.find((k) => k.name === 'Frank John');
    expect(john).toBeDefined();
    expect(john?.partei).toBe('SPD');
    expect(john?.claraInfo ?? '').toMatch(/02\.06\.2025/);
  });

  it('zeigt Theophil Gallo nicht mehr als aktiven Landrat (falls noch gelistet, dann historisch)', () => {
    const gallo = kt?.kandidaten.find((k) => k.name === 'Theophil Gallo');
    if (gallo) {
      expect(gallo.beruf).toMatch(/Ehem\.|ehemalig/i);
    }
  });
});
