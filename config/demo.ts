/**
 * Demo-Konfiguration: Zwei Demo-Typen
 *
 * Beide Typen landen auf /demo/[demoId] und sehen dieselbe App inkl. Intro.
 * Der Unterschied liegt nur im Zugangsweg (NDA-Flow).
 */

export type DemoType = 'governikus' | 'friends_family';

/**
 * Demo für Governikus (und vergleichbare Partner)
 * - Zugangs-Link mit DocuSign
 * - NDA per DocuSign unterzeichnet
 * - require_docusign: true
 */
export const DEMO_GOVERNIKUS: DemoType = 'governikus';

/**
 * Demo für Freunde und Familie (Tests)
 * - Test-Link ohne DocuSign
 * - NDA per Checkbox akzeptiert
 * - require_docusign: false
 */
export const DEMO_FRIENDS_FAMILY: DemoType = 'friends_family';

/**
 * Beide Demo-Typen müssen das Intro anzeigen.
 * Das Intro (TopHighlightsSlide) wird in BuergerApp gerendert,
 * unabhängig davon, ob der Nutzer über Governikus- oder Friends-Link kam.
 */
export const INTRO_REQUIRED_FOR_BOTH_DEMO_TYPES = true;
