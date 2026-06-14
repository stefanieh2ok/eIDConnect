# Third-Party Notices — HookAI Civic Demo

This application includes open-source software. See `docs/due-diligence/sbom.json`
(CycloneDX) and `docs/due-diligence/SBOM-LESBAR.md` for the full bill of materials.

## Summary (license-checker, 2026-06-03)

| License | Approx. count |
|---------|----------------|
| MIT | 601 |
| ISC | 44 |
| Apache-2.0 | 23 |
| BSD-3-Clause | 20 |
| BSD-2-Clause | 18 |
| Other (BlueOak, MPL, LGPL combo, etc.) | few |

## Notable components requiring attention

- **Next.js** — MIT (Vercel)
- **React** — MIT (Meta)
- **@supabase/supabase-js** — MIT
- **sharp / @img/sharp-win32-x64** — Apache-2.0 AND LGPL-3.0-or-later (native binary)
- **OpenAI API** — used at runtime; subject to OpenAI Terms of Use (not bundled)

## Attribution

Full license texts for bundled dependencies are available in `node_modules/<package>/`
after `npm install`. For redistribution, reproduce the applicable LICENSE files
per the requirements of each license (especially Apache-2.0).

HookAI Civic Demo application code: Copyright (c) 2026 Stefanie Hook — see LICENSE.
