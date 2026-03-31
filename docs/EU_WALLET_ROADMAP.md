# EU Wallet Roadmap fuer eIDConnect

## Ziel
EU Wallet als zweiten Identitaetskanal neben eID integrieren, ohne das aktuelle Sicherheitsniveau zu senken.

Prinzip:
- heute: Teilnahme ueber eID
- morgen: Teilnahme ueber eID oder EU Wallet
- intern: einheitlicher Identity- und Token-Flow

---

## Produkt-Regeln (fachlich)

1. Teilnahme nur mit verifizierter digitaler Identitaet.
2. Wohnort darf nicht frei ueberschrieben werden.
3. Wohnortwechsel erst nach offizieller Ummeldung + erneuter Identitaetspruefung.
4. Minimalprinzip: nur notwendige Claims verarbeiten/speichern.
5. Gleiches Regelwerk fuer eID und EU Wallet (Berechtigung, Einmaligkeit, Audit).

---

## Technisches Zielbild

## 1) Einheitliche Identity-Abstraktion

Provider:
- `eid`
- `eu_wallet`

Ein verifizierter Login liefert intern immer ein gemeinsames Objekt:

```ts
type VerifiedIdentity = {
  provider: 'eid' | 'eu_wallet';
  subjectId: string;          // pseudonymisiert/provider-spezifisch
  assuranceLevel: string;     // z. B. hoch/substanziell
  claims: {
    residence?: {
      municipalityCode?: string;
      districtCode?: string;
      stateCode?: string;
      countryCode?: string;
      validFrom?: string;
    };
    ageOver18?: boolean;
    citizenship?: string;
  };
  verifiedAt: string;         // ISO timestamp
  issuer: string;             // ausstellende Stelle/Trust Framework
};
```

Danach laufen Token-Erzeugung, Session und Berechtigungspruefung provider-unabhaengig.

---

## 2) Datenmodell (DB)

Empfohlene Felder fuer Identitaetsnachweise:

- `identity_provider` (`eid` | `eu_wallet`)
- `identity_subject_hash` (gehashte, nicht direkt lesbare Subjekt-ID)
- `identity_assurance_level`
- `identity_issuer`
- `identity_verified_at`
- `residence_municipality_code`
- `residence_district_code`
- `residence_state_code`
- `residence_country_code`
- `claims_version`

Empfehlung:
- Raw-Claims nicht dauerhaft speichern.
- Nur benoetigte, abgeleitete Merkmale persistieren.

---

## 3) API-Contracts (v1 vorbereiten)

Neue/erweiterte Endpunkte:

- `POST /api/identity/verify`
  - Input: provider-spezifischer Auth-Response
  - Output: `VerifiedIdentity`

- `POST /api/access/enter-demo`
  - Input: `VerifiedIdentity` (serverseitig gebunden)
  - Output: Session + redirect

- `POST /api/tokens` (bestehend)
  - erweitern um `identity_provider` und berechnete Residence-Claims

Wichtig:
- Berechtigung nie nur aus Clientdaten.
- Residence und Teilnahmebedingungen immer serverseitig pruefen.

---

## 4) Policy-Engine (Berechtigung)

Eine zentrale Prueffunktion:

```ts
canParticipate(identity, electionScope) => {
  // 1) assurance level ausreichend?
  // 2) residence passt zu Ebene/Ort?
  // 3) token/session aktiv und nicht abgelaufen?
  // 4) one-person/one-vote Regeln eingehalten?
}
```

So bleibt das Verhalten fuer eID und EU Wallet identisch.

---

## 5) UX/Kommunikation

Im UI klar kennzeichnen:
- aktiver Identitaetskanal (`eID` oder `EU Wallet`)
- warum Wohnort nicht frei aenderbar ist
- welche Daten fuer Teilnahme genutzt werden

FAQ-Textvorschlag:
- "Teilnahme nur mit verifizierter digitaler Identitaet."
- "Wohnortwechsel wird erst nach Ummeldung und erneuter Pruefung wirksam."

---

## 6) Rollout-Plan

Phase 1 (jetzt):
- Datenmodell und API-Vertraege vorbereiten
- UI-Texte fuer "EU Wallet in Vorbereitung"
- Feature Flag `EU_WALLET_ENABLED=false`

Phase 2 (Pilot):
- EU Wallet Verify-Endpoint hinter Feature Flag
- interne Testfaelle fuer Claims-Mapping
- Audit-Logs fuer provider-spezifische Fehlerbilder

Phase 3 (Produktiv):
- Aktivierung fuer ausgewaehlte Nutzergruppen
- Monitoring: Erfolgsraten, Abbrueche, Fehlertypen
- schrittweiser Ausbau auf alle Teilnahmeflows

---

## 7) Risiken und Guardrails

Risiken:
- Uneinheitliche Claim-Formate
- Fehlende oder uneindeutige Residence-Attribute
- Falsches Vertrauen in Clientdaten

Guardrails:
- strenges serverseitiges Mapping/Validierung
- deny-by-default bei unklaren Claims
- Versionierung der Claim-Parser
- aussagekraeftige Audit-Logs

---

## 8) Konkrete naechste Aufgaben im Repo

1. Typen erweitern (`types`):
   - `IdentityProvider`, `VerifiedIdentity`, `ResidenceClaims`
2. Neue Service-Schicht:
   - `lib/identity/verify.ts`
   - `lib/identity/policy.ts`
3. Token-Flow erweitern:
   - `app/api/tokens/*` um Provider/Claims-Metadaten
4. Feature Flag:
   - `EU_WALLET_ENABLED`
5. Tests:
   - Unit: Claims-Mapping
   - Integration: participation policy fuer beide Provider

---

## Definition of Done

EU Wallet gilt als "integriert", wenn:
- gleicher Teilnahme-Flow wie eID erreicht ist,
- alle Berechtigungspruefungen provider-unabhaengig laufen,
- keine freie Wohnort-Ueberschreibung moeglich ist,
- Audit und Transparenztexte produktiv konsistent sind.

