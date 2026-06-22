# Wegweiser Mastercase Matrix

Structured catalogue of recurring private and business life situations for Clara Wegweiser — analogous to a digital public service portal taxonomy.

**Source file:** `lib/civic/mastercaseMatrix.ts`  
**Runtime MVP journeys:** `lib/civic/mastercaseJourneyMatrix.ts` (25 templates wired to planner UI)

## Categories

| Category | Focus |
|----------|--------|
| Familie & Kind | Geburt, Kita, Schule, Elterngeld, Kindergeld, Trennung |
| Wohnen & Umzug | Umzug, Ummeldung, Wohngeld, Fahrzeug |
| Arbeit & Einkommen | Kündigung, ALG, Bürgergeld, Weiterbildung |
| Gesundheit & Pflege | Pflegefall, Pflegegrad, KV-Wechsel |
| Tod & Nachlass | Todesfall, Sterbeurkunde, Hinterbliebenenrente |
| Identität & Dokumente | Ausweis, Pass, Namensänderung |
| Rente | Rentenantrag, Renteninformation |
| Gewerbe starten | Anmeldung, Handwerk, Gastronomie, Ummeldung |
| Arbeitgeberpflichten | Betriebsnummer, SV, Lohnsteuer, BG, Minijob |
| Betriebscompliance | Erlaubnisse, Hygiene, Datenschutz |
| Förderung & Beratung | Gründung, Saarland-Förderung, Digitalisierung |

## Mastercase count

- **Total:** 57 mastercases in `MASTERCASE_MATRIX`
- **MVP:** cases marked `priority: 'mvp'` — ready for demo journey wiring
- **Important / Later:** catalogue entries for roadmap and test coverage

## Source status

| Status | Meaning |
|--------|---------|
| `verified_catalog` | At least one action links to verified official catalogue entry |
| `regional_lookup_required` | Municipal/regional step — show “Zuständige Stelle suchen”, no invented deep links |
| `catalog_missing` | Federal/agency step known but no validated URL in catalogue yet |
| `template_only` | Orientation step only — no direct official link |

## MVP-ready for demo (Kirkel / Saarland)

Cases with `journeyId` mapped to existing runtime templates and sufficient catalogue coverage:

- Kündigung & Arbeitslosigkeit (`job_loss_unemployment`)
- Geburt & Familienleistungen (`child_birth_kita`)
- Umzug mit Kindern (`moving_with_children`)
- Wohngeld (`housing_support`)
- Pflegefall (`family_care`)
- Gewerbe anmelden (`business_registration`)
- Erste Mitarbeitende (`employer_onboarding`)
- Gastronomie (`gastronomy_permit`)

## Regional lookup required

Typical municipal steps without validated deep links:

- Standesamt / Geburtsurkunde / Sterbeurkunde
- Bürgeramt Ummeldung, Ausweis, Pass
- Gewerbeamt Kirkel
- Kita / Schulanmeldung
- Ordnungsamt / Sondernutzung
- Zulassungsstelle

Clara shows regional orientation — **never** invented `gemeinde-kirkel.de/form/...` URLs.

## Catalogue gaps (not demo-blocking)

- Jobcenter / Bürgergeld direct online service
- Deutsche Rentenversicherung deep links
- Krankenkasse Wechsel / Familienversicherung
- Some Nachlass / Erbschaft orientation steps

## Not ready for full demo (later priority)

- Schwerbehinderung / Nachteilsausgleich
- Urkunden-Nachbestellung generisch
- Kommunale Sondernutzung (detail)
- Digitalisierungsförderung (detail)
- Arbeitgeber-Weiterbildungsförderung

## Governance

- No PVOG / XZuFi live claims
- No Demo-Link in user-facing copy
- No fake application submission
- No entitlement promises (especially Bürgergeld / Leistungen)
- Clara v7 governance unchanged

## Tests

`__tests__/lib/mastercaseMatrix.test.ts` — structure, catalogue ID validation, domain rules, resolver integration.

## Next steps

1. Wire high-priority matrix entries without `journeyId` into `mastercaseJourneyMatrix.ts` incrementally.
2. Extend official action catalogue for `catalog_missing` federal steps.
3. Add regional lookup UI label consistency in action-plan cards.
