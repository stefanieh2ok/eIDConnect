# Hessen-Erweiterung (Demo)

## Kreise und kreisfreie Städte (26 Einheiten)

Entspricht `data/kreise.json` (`landKey: hessen`). Menü-IDs sind `he_*` (ASCII); Zuordnung in `data/hessenKreis.ts`.

| Amtlich (`kreise.json`)     | Menü-ID / `votingData`-Key   |
|----------------------------|------------------------------|
| Darmstadt, Wissenschaftsstadt | `he_darmstadt_stadt`      |
| Frankfurt am Main, Stadt   | `he_frankfurt_stadt`        |
| Offenbach am Main, Stadt   | `he_offenbach_stadt`        |
| Wiesbaden, Landeshauptstadt | `he_wiesbaden_stadt`       |
| Bergstraße                 | `he_bergstrasse`            |
| Darmstadt-Dieburg          | `he_darmstadt_dieburg`      |
| Groß-Gerau                 | `he_gross_gerau`            |
| Hochtaunuskreis            | `he_hochtaunus`             |
| Main-Kinzig-Kreis          | `he_main_kinzig`            |
| Main-Taunus-Kreis          | `he_main_taunus`            |
| Odenwaldkreis              | `he_odenwald`               |
| Offenbach (Landkreis)      | `he_offenbach_lk`           |
| Rheingau-Taunus-Kreis      | `he_rheingau_taunus`        |
| Wetteraukreis              | `he_wetterau`               |
| Gießen (Landkreis)         | `he_giessen_lk`             |
| Lahn-Dill-Kreis            | `he_lahn_dill`              |
| Limburg-Weilburg           | `he_limburg_weilburg`       |
| Marburg-Biedenkopf         | `he_marburg_biedenkopf`     |
| Vogelsbergkreis            | `he_vogelsberg`             |
| Kassel, documenta-Stadt    | `he_kassel_stadt`           |
| Fulda                      | `he_fulda`                  |
| Hersfeld-Rotenburg         | `he_hersfeld_rotenburg`     |
| Kassel (Landkreis)         | `he_kassel_lk`              |
| Schwalm-Eder-Kreis         | `he_schwalm_eder`           |
| Waldeck-Frankenberg        | `he_waldeck_frankenberg`    |
| Werra-Meißner-Kreis        | `he_werra_meissner`         |

**County-String (Nominatim)** → `hessenCountyToMenuId()`. Ohne County: `inferHessenKreisFromCity()` plus Ergänzung in `data/countyInference.ts` (u. a. PLZ 34–36, 37[23], 60–64, 685, 69).

## Kommunen (Beispiele mit eigener Tab-ID)

Siehe `SUPPORTED_CITIES` in `BuergerApp.tsx` (u. a. Wiesbaden, Kassel, Darmstadt, Frankfurt, Viernheim, Hanau, Marburg, Gießen, …). Weitere Orte nutzen den Tab **`kommune`** mit `communalVotes2026ForCity(Ortname)`.

## Start-Tab nach Adresse

`getRegionFromResolvedOrFields` setzt für Hessen bei bekannten Kommunen deren ID, sonst den passenden Kreis-Tab (`he_*`), sonst `hessen` (Land).

## PLZ-Hinweis

`getStateFromPLZ` behandelt **34xxx–36xxx** und **372/373** (Werra-Meißner) als Hessen statt pauschal Niedersachsen (vereinfachte Demo-Logik).

## Kreistags-Demo (Wahlen-Tab)

Für **jeden** Kreis-Tab (`he_*`) ein Eintrag in `data/wahlen-kreistage-he-bw.ts`; **Amtsträger:innen** mit Namen/Partei in `data/kreistage-politiker-he-bw.ts` (u. a. Wikipedia „Liste der Landräte in Hessen“). Handkuratiert: Bergstraße + Main-Taunus in `wahlen-deutschland.ts`. `wahl.location` = Menü-ID.

## Nächste Schritte (echte Daten)

Snapshots + Import – siehe `REGIONAL_DATA_PATTERN.md` und `SAARLAND.md`.
