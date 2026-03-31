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
 * Beide Demo-Typen nutzen dasselbe Onboarding (LoginScreen: Anrede → Politik-Barometer).
 * Die frühere „Stichproben“-Merkmalseite ist entfernt (Inhalt für später: data/app-highlights.ts).
 */
export const INTRO_REQUIRED_FOR_BOTH_DEMO_TYPES = true;
