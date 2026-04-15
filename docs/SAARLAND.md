# Saarland-Erweiterung (Demo)

## Kreise (6 Einheiten)

| Amtlich (`kreise.json`)            | Menü-ID / `votingData`-Key |
|-----------------------------------|----------------------------|
| Regionalverband Saarbrücken       | `rv_saarbruecken`          |
| Merzig-Wadern                     | `merzig_wadern`            |
| Neunkirchen                       | `neunkirchen`              |
| Saarlouis                         | `saarlouis`                |
| Saarpfalz-Kreis                   | `saarpfalz`                |
| St. Wendel                        | `st_wendel`                |

Zuordnung aus Nominatim-`county` → `saarlandCountyToMenuId()` in `data/saarlandKreis.ts`.  
Fehlendes `county`: Heuristik `inferSaarlandKreisFromCity` + PLZ-Präfixe in `data/countyInference.ts`.

## Kommunen (Beispiele mit eigener Tab-ID)

Homburg, Saarbrücken, Völklingen, Bexbach, Blieskastel, St. Ingbert, Saarlouis (Stadt), Dillingen, Lebach, Merzig, Wadern, St. Wendel (Stadt), Kirkel – siehe `SUPPORTED_CITIES` in `BuergerApp.tsx`. Weitere Gemeinden nutzen den generischen Tab **`kommune`** mit `communalVotes2026ForCity(Ortname)`.

## Start-Tab nach Adresse

`getRegionFromResolvedOrFields` setzt für Saarland nach erkanntem Kreis den passenden Kreis-Tab (`neunkirchen`, `saarpfalz`, …), nicht mehr pauschal „Neunkirchen → Saarpfalz“.

## Nächste Schritte (echte Daten)

Snapshot-JSON unter `data/snapshots/saarland-*.json` + einmaliger Import – siehe `REGIONAL_DATA_PATTERN.md`.
