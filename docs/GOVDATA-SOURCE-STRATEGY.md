# Gov-Data Source Strategy

Internal note for HookAI Civic Wegweiser source handling.

## Why PVOG Bereitstelldienst is not assumed for demo

Production access to the PVOG Bereitstelldienst requires authorization and a justified interest in the full PVOG dataset. For a civic demo or pilot, that access is typically unavailable. The app must not pretend otherwise.

## Source modes

| Mode | Meaning |
|------|---------|
| `demo` | Local prepared demo logic (`ManualDemo`). No verified official links. |
| `verified_catalog` | Manually curated catalogue of public official URLs. Links show as **Manuell verifizierte offizielle Quelle**. |
| `pvog_search` | Future/attempted PVOG Suchdienst integration. Live only after successful API response. |
| `pvog_bereitstelldienst` | Future protected PVOG access via OAuth credentials. |

Set via `GOVDATA_SOURCE_MODE` or `NEXT_PUBLIC_GOVDATA_SOURCE_MODE`.

## What “manuell verifizierte offizielle Quelle” means

- A human reviewed a **public official URL** (Bund.de, Arbeitsagentur, ELSTER, etc.).
- The entry is stored in `lib/govdata/verifiedOfficialSources.ts` with `sourceVerifiedAt`.
- It is **not** a live PVOG/XZuFi feed and **not** random demo placeholder text.
- Clara still does not submit applications — external handover only.

## Production PVOG/XZuFi access (still required)

1. Official authorization from FITKO / PVOG operator.
2. OAuth credentials for Bereitstelldienst (`PVOG_CLIENT_ID`, `PVOG_CLIENT_SECRET`, `PVOG_TOKEN_URL`).
3. Suchdienst API access (currently returns HTTP 401 without credentials).
4. Staging validation via `GET /api/govdata/diagnostics` and `node scripts/check-govdata-source.mjs`.

## Updating curated entries

Edit `lib/govdata/verifiedOfficialSources.ts`:

- Use only public official domains.
- Do not invent application URLs.
- Set `regionRequired: true` + `regionHint` when zuständigkeit is local.
- Update `sourceVerifiedAt` when re-checking a link.
- Run `npm test -- verifiedOfficialSources govDataDiagnostics externalLinkGate`.

## Avoiding fake official links

- `demo` and PVOG fallback modes use `demo_unverified` link status.
- `verified_catalog` requires `sourceSystem: VerifiedCatalog`, `sourceVerifiedAt`, and `officialSourceUrl`.
- Never label catalogue entries as “PVOG live” or “amtlich angebunden”.

## Diagnostics

Dev-only: `GET /api/govdata/diagnostics` (or `GOVDATA_DIAGNOSTICS_ENABLED=true` in production).

Reports `verifiedManualCount` vs `verifiedPvogCount` separately.
