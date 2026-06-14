/**
 * Zentrale Walkthrough-Orchestrierung (Clara + UI-Schritte).
 * Bürgerreise: Intro → Wegweiser → Profil → Behördenweg → Civic-Ökosystem.
 */
import { claraBlockForStep } from '@/data/introWalkthroughClara';
import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';

export const WALKTHROUGH_MACHINE_STEPS = [
  'intro',
  'wegweiser',
  'profil',
  'behoerdenweg',
  'meldungen',
  'abstimmen',
  'wahlen',
  'kalender',
  'postfach',
  'praemien',
  'praemien_wallet',
  'oekosystem',
  'outro',
] as const;

export type WalkthroughMachineStep = (typeof WALKTHROUGH_MACHINE_STEPS)[number];

/** Empfohlene Mindestdauer pro Szene (ms) — Auto-Advance-Fallback nach TTS-Ende. */
export const WALKTHROUGH_SCENE_DURATION_MS: Record<WalkthroughMachineStep, number> = {
  intro: 7000,
  wegweiser: 10000,
  profil: 8000,
  behoerdenweg: 10000,
  meldungen: 10000,
  abstimmen: 9000,
  wahlen: 10000,
  kalender: 7000,
  postfach: 9000,
  praemien: 10000,
  praemien_wallet: 9000,
  oekosystem: 8000,
  outro: 0,
};

/** Index in INTRO_OVERLAY_STEPS, oder null für outro. */
export function overlayIndexForMachineIndex(machineIndex: number): number | null {
  if (machineIndex < 0 || machineIndex >= WALKTHROUGH_MACHINE_STEPS.length - 1) return null;
  return machineIndex;
}

export function machineStepId(machineIndex: number): WalkthroughMachineStep {
  return WALKTHROUGH_MACHINE_STEPS[machineIndex] ?? 'outro';
}

function isOverlayStep(id: WalkthroughMachineStep): id is IntroOverlayStepId {
  return id !== 'outro';
}

type StepMeta = {
  title: string;
  shortDu: string;
  shortSie: string;
};

const STEP_META: Record<WalkthroughMachineStep, StepMeta> = {
  intro: {
    title: 'HookAI Civic',
    shortDu: 'Verwaltung verständlicher. Beteiligung einfacher. Kommunikation vertrauenswürdiger.',
    shortSie: 'Verwaltung verständlicher. Beteiligung einfacher. Kommunikation vertrauenswürdiger.',
  },
  wegweiser: {
    title: 'Wegweiser',
    shortDu: 'Aus einer Lebenslage wird ein klarer nächster Schritt.',
    shortSie: 'Aus einer Lebenslage wird ein klarer nächster Schritt.',
  },
  profil: {
    title: 'Profil',
    shortDu: 'Freiwillige Angaben. Keine Bewertung. Keine automatische Entscheidung.',
    shortSie: 'Freiwillige Angaben. Keine Bewertung. Keine automatische Entscheidung.',
  },
  behoerdenweg: {
    title: 'Behördenweg',
    shortDu: 'Welche Stelle? Welche Unterlagen? Welcher nächste Schritt?',
    shortSie: 'Welche Stelle? Welche Unterlagen? Welcher nächste Schritt?',
  },
  meldungen: {
    title: 'Meldungen',
    shortDu: 'Aus einem Foto wird eine nachvollziehbare Meldung.',
    shortSie: 'Aus einem Foto wird eine nachvollziehbare Meldung.',
  },
  abstimmen: {
    title: 'Abstimmungen',
    shortDu: 'Punkte für Mitwirkung — nicht für eine bestimmte Meinung.',
    shortSie: 'Punkte für Mitwirkung — nicht für eine bestimmte Meinung.',
  },
  wahlen: {
    title: 'Wahlen',
    shortDu: 'Stimmzettel verstehen. Kandidaten und Programme prüfen.',
    shortSie: 'Stimmzettel verstehen. Kandidierende und Programme prüfen.',
  },
  kalender: {
    title: 'Kalender',
    shortDu: 'Fristen und Beteiligungen an einem Ort.',
    shortSie: 'Fristen und Beteiligungen an einem Ort.',
  },
  postfach: {
    title: 'Postfach',
    shortDu: 'Verifizierte Hinweise, Rückfragen und Statusmeldungen an einem Ort.',
    shortSie: 'Verifizierte Hinweise, Rückfragen und Statusmeldungen an einem Ort.',
  },
  praemien: {
    title: 'Prämien',
    shortDu: 'Naturfreibad Kirkel — Gutschein anzeigen.',
    shortSie: 'Naturfreibad Kirkel — Gutschein anzeigen.',
  },
  praemien_wallet: {
    title: 'Prämien',
    shortDu: 'QR-Code und Wallet-Pass — Vorschau.',
    shortSie: 'QR-Code und Wallet-Pass — Vorschau.',
  },
  oekosystem: {
    title: 'Ökosystem',
    shortDu: 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.',
    shortSie: 'Ein Civic-Ökosystem für Orientierung, Beteiligung und Vertrauen.',
  },
  outro: {
    title: 'Bereit zum Start',
    shortDu: 'Bereit, HookAI Civic selbst zu erkunden?',
    shortSie: 'Bereit, HookAI Civic selbst zu erkunden?',
  },
};

const OUTRO_SPEAK_DU = [
  'Damit ist der geführte Überblick abgeschlossen.',
  'Du kannst HookAI Civic jetzt selbst erkunden oder mir gezielt Fragen stellen.',
] as const;

const OUTRO_SPEAK_SIE = [
  'Damit ist der geführte Überblick abgeschlossen.',
  'Sie können HookAI Civic jetzt selbst erkunden oder mir gezielt Fragen stellen.',
] as const;

export function machineTitle(machineIndex: number): string {
  return STEP_META[machineStepId(machineIndex)].title;
}

export function machineShort(machineIndex: number, du: boolean): string {
  const meta = STEP_META[machineStepId(machineIndex)];
  return du ? meta.shortDu : meta.shortSie;
}

/** Runtime-TTS: nur speakSegments — keine Doppelung mit line10s. */
export function machineSpeakParts(machineIndex: number, du: boolean): string[] {
  const id = machineStepId(machineIndex);
  if (id === 'outro') {
    return du ? [...OUTRO_SPEAK_DU] : [...OUTRO_SPEAK_SIE];
  }
  const { speakSegments } = claraBlockForStep(id, du);
  return [...speakSegments];
}

export function machineContinueLabel(machineIndex: number): string {
  return machineStepId(machineIndex) === 'outro' ? 'App starten' : 'Weiter';
}

export function machineNarrationPlain(machineIndex: number, du: boolean): string {
  return machineSpeakParts(machineIndex, du).join('\n\n');
}

export function machineSceneDurationMs(machineIndex: number): number {
  return WALKTHROUGH_SCENE_DURATION_MS[machineStepId(machineIndex)] ?? 8000;
}

export function machineOverlayStepId(machineIndex: number): IntroOverlayStepId | null {
  const id = machineStepId(machineIndex);
  return isOverlayStep(id) ? id : null;
}
