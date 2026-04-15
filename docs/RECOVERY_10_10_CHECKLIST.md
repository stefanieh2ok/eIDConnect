# Recovery 10/10 Checklist

This checklist defines the exact path from stable baseline to a fully accepted 10/10 demo quality state.

## 0) Baseline and release safety

- [x] Create backup branch before any reset
- [x] Reset working branch to stable baseline commit (`5434f5b`)
- [ ] Push reset branch and confirm shared baseline
- [ ] Enable/confirm branch protection on `main`
- [ ] Enforce single-scope PR policy (one area per PR)

## 1) Intro overlay (TopHighlights / swipe preview)

### Requirements
- [ ] No large empty filler block under preview card
- [ ] Voting card and thumb controls visible without forced inner scroll
- [ ] One vertical scroll container only (no nested scrollbar)
- [ ] "Weiter" button always visible in iPhone frame

### Validation
- [ ] Verify on `360x800`
- [ ] Verify on `390x844`
- [ ] Verify on `430x932`
- [ ] Capture before/after screenshots in PR

## 2) NDA personalization (web, PDF, DocuSign)

### Requirements
- [ ] Non-Governikus email: receiving party contains only person name + email
- [ ] Non-Governikus email: no Governikus company address in contract body
- [ ] Governikus email: include Governikus address + contact person + company email
- [ ] Web view, generated PDF, and DocuSign document contain identical recipient semantics

### Validation
- [ ] Test case: non-Gov email without company
- [ ] Test case: non-Gov email with company
- [ ] Test case: valid Governikus email
- [ ] Test case: near-match domain edge case

## 3) App shell / iPhone frame consistency

### Requirements
- [ ] Demo routes render in one consistent PhoneStage behavior
- [ ] No unintended fallback to desktop-like shell for demo pages
- [ ] Build marker visible in UI to detect stale deploy/caching issues

### Validation
- [ ] Verify `/demo/...`
- [ ] Verify access and transition routes used in demo flow
- [ ] Confirm build marker changes after deploy

## 4) Meldungen (municipality-first)

### Requirements
- [ ] Reports only enabled on municipality scope
- [ ] Municipality auto-bound from active region resolution (e.g. Kirkel)
- [ ] Category cards use meaningful icons (no alpha-letter placeholders)
- [ ] Description validation with min/max + live counter
- [ ] Saved reports show municipality + timestamp + status

### Validation
- [ ] Attempt submit outside kommune scope (must be blocked)
- [ ] Submit valid report in kommune scope (must persist)
- [ ] Reload and verify stored reports render cleanly

## 5) Elections / ballots / candidate info

### Requirements
- [ ] View mode toggle available: `Originalnah` / `Kompakt`
- [ ] Mobile typography in compact mode is readable and not oversized
- [ ] Long names clamp gracefully with full title on tooltip/long-press
- [ ] Election cards display participation points visibly
- [ ] Candidate data status badge shown (`verified` / `partial` / `missing`)

### Validation
- [ ] Bund ballot pass on small viewport
- [ ] Land ballot pass on small viewport
- [ ] Kreis ballot pass on small viewport
- [ ] Kommune ballot pass on small viewport

## 6) Calendar visibility and markers

### Requirements
- [ ] Day markers are high-contrast and discoverable without zoom
- [ ] Marker style and legend are consistent
- [ ] Event click-through to corresponding card remains functional

### Validation
- [ ] Verify month navigation and marker rendering
- [ ] Verify each level marker color/shape
- [ ] Verify click-routing behavior

## 7) Clara (strict evidence + consistency)

### Requirements
- [ ] Strict evidence mode clearly visible in UI
- [ ] Structured response format enforced:
  - [ ] Core statement
  - [ ] Facts and numbers
  - [ ] Pro
  - [ ] Contra
  - [ ] Uncertainties
  - [ ] Sources
- [ ] No recommendation text ("dafür/dagegen")
- [ ] No claim without source status (`verified` / `partial` / `missing`)
- [ ] Trusted source URL checks applied in display

### Validation
- [ ] Program query with `verified` source
- [ ] Program query with `partial` source
- [ ] Query with missing source must return explicit `missing` status

## 8) CI and regression guardrails

### Required checks
- [ ] `npx tsc --noEmit`
- [ ] Jest test suite green
- [ ] Add/maintain visual regression checks for key screens

### Target visual regression coverage
- [ ] Intro overlay
- [ ] Meldungen
- [ ] Calendar
- [ ] Ballots (all levels)
- [ ] Clara chat/modal

## 9) PR acceptance template (for every area)

Each PR must include:
- [ ] Scope statement (single area only)
- [ ] Before/after screenshots (3 mobile viewports)
- [ ] Test output summary
- [ ] Risk notes (or explicit "none")
- [ ] Completed checklist subsection reference

## 10) Execution order

1. Intro overlay
2. Meldungen
3. Elections/ballots
4. Calendar
5. NDA
6. Clara
7. Full release audit

