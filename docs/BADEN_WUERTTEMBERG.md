# Baden-Württemberg (Demo)

## Kreise und kreisfreie Städte (44 Einheiten)

Entspricht `data/kreise.json` (`landKey: baden-wuerttemberg`). Menü-IDs sind `bw_*` (ASCII); Zuordnung in `data/badenWuerttembergKreis.ts`.

Getrennte IDs wo Stadt und Landkreis gleich heißen (z. B. `bw_heilbronn_stadt` / `bw_heilbronn_lk`, `bw_karlsruhe_stadt` / `bw_karlsruhe_lk`).

**County-String (Nominatim)** → `bwCountyToMenuId()`. Ohne County: `inferBadenWuerttembergKreisFromCity()` und `data/countyInference.ts` (PLZ 7xxxx, 68xxx, 880–887, …).

## Kalender & Wahlen

- Kalender-Aggregation: `BW_CALENDAR_LOCATION_IDS` in `CalendarSection.tsx` (analog Hessen).
- Landtagswahl o. Ä.: `location: 'baden-wuerttemberg'` in `data/wahlen-deutschland.ts`; Filter in `ElectionsSection` über `currentLevel` + `currentLocation`.
- **Kreistag je `bw_*`:** `data/wahlen-kreistage-he-bw.ts` + **reale** Landrät:innen/OB in `data/kreistage-politiker-he-bw.ts` (u. a. Wikipedia „Liste der Landräte in Baden-Württemberg“ / Oberbürgermeister-Liste). Ohne Duplikat zu Rhein-Neckar, Esslingen, Ludwigsburg (`wahlen-deutschland.ts`).

## Start-Tab & UI

`getRegionFromResolvedOrFields` in `BuergerApp.tsx`: BW-Land, Kreis (`bw_*`) oder Kommune (bekannte Städte-IDs). Demo: `votingData`, `LOCATION_COLORS`, Ergebnisse, Prämien, Footer-Demo-Stimmen (`bw1` auf Land-Tab).

Siehe `docs/REGIONAL_DATA_PATTERN.md`.
