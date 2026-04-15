# Regionale Demo-Daten – einheitliches Muster

Damit nicht erneut Daten einer anderen Kommune (z. B. Kirkel) unter einer fälschlich gewählten Region erscheinen:

1. **Abstimmungen / Kalender**  
   Pro Standort-Key (`viernheim`, `kirkel`, …) eigene Einträge. Unbekannte Kommune → Tab `kommune` mit `communalVotes2026ForCity(Ortname)` aus `data/demoVoting2026.ts`. Mindestens fünf Themen ab 2026.

2. **Ergebnisse**  
   Jeder Datensatz **muss** ein `locationId` tragen, Filter in `renderErgebnisseTab` nach Ebene **und** `mappedLocation`.

3. **Prämien**  
   Kein Fallback auf bundesweite Amazon-/Spotify-Prämien für Land/Kreis/Kommune. Nur `deutschland` → Bund-Liste; sonst Land (`hessen`, `baden-wuerttemberg`, `saarland`, …), `kreis`, Kreis-Tabs (`he_*` / `bw_*` → Kreis-Pool) oder `regionalPraemienForCity(...)`.

4. **Kreis in der UI**  
   `effectiveCounty` = Nominatim-`county` **oder** `inferCountyIfMissing` (PLZ/Ort) aus `data/countyInference.ts`. Überall dieselbe Quelle für Menü, Wahlkreis, Prämien-Text, Programme.

5. **Wahlen**  
   Kreistags-Demos: `wahl.location` = Menü-ID des Kreis-Tabs (`saarpfalz`, `he_*`, `bw_*`, …), nicht pauschal `kreis`. Filter in `ElectionsSection` exakt nach `currentLocation`; `location: 'kreis'` nur für generische Demos/Wikidata. **Hessen/BW:** Kandidaten mit **echten Namen** in `data/kreistage-politiker-he-bw.ts`, gebaut in `data/wahlen-kreistage-he-bw.ts` (Quellen: u. a. Wikipedia-Landräte-/OB-Listen); plus handkuratiert Bergstraße, Main-Taunus, Rhein-Neckar, Esslingen, Ludwigsburg in `wahlen-deutschland.ts`. **Saarland:** alle sechs Kreise in `wahlen-deutschland.ts`.

Bei neuen Städten/Kreisen: zuerst **Kreis-Inferenz** und **LOCATION_MAP**, dann Demo-Abstimmungen und ggf. statische Prämien-Liste.

**Hessen:** Kreis-IDs und Inferenz siehe `docs/HESSEN.md` und `data/hessenKreis.ts` (analog Saarland in `docs/SAARLAND.md`).

**Baden-Württemberg:** `docs/BADEN_WUERTTEMBERG.md` und `data/badenWuerttembergKreis.ts`.
