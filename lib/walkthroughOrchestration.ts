/**
 * Zentrale Walkthrough-Orchestrierung (Clara + UI-Schritte).
 * Eine State-Machine-Index-Reihe — unabhängig von lose gekoppelten Timern.
 */

export const WALKTHROUGH_MACHINE_STEPS = [
  'auth',
  'politikBarometer',
  'abstimmen',
  'wahlen',
  'kalender',
  'meldungen',
  'praemien',
  'outro',
] as const;

export type WalkthroughMachineStep = (typeof WALKTHROUGH_MACHINE_STEPS)[number];

/** Index in INTRO_OVERLAY_STEPS (politikbarometer … praemien), oder null für auth/outro. */
export function overlayIndexForMachineIndex(machineIndex: number): number | null {
  if (machineIndex <= 0 || machineIndex >= WALKTHROUGH_MACHINE_STEPS.length - 1) return null;
  return machineIndex - 1;
}

export function machineStepId(machineIndex: number): WalkthroughMachineStep {
  return WALKTHROUGH_MACHINE_STEPS[machineIndex] ?? 'outro';
}

type StepCopy = {
  title: string;
  shortDu: string;
  shortSie: string;
  speakPartsDu: string[];
  speakPartsSie: string[];
};

const STEPS: Record<WalkthroughMachineStep, StepCopy> = {
  auth: {
    title: 'Zugang & Demo',
    shortDu:
      'Hier geht es um den Zugang zur Demo. Für die Vorschau kannst du entweder die eID-Perspektive ansehen oder die EU-Wallet-Perspektive öffnen. Für die eigentliche Demo verwenden wir eine Beispielidentität.',
    shortSie:
      'Hier geht es um den Zugang zur Demo. Für die Vorschau können Sie entweder die eID-Perspektive ansehen oder die EU-Wallet-Perspektive öffnen. Für die eigentliche Demo verwenden wir eine Beispielidentität.',
    speakPartsDu: [
      'Hier geht es um den Zugang zur Demo. Für die Vorschau kannst du entweder die eID-Perspektive ansehen oder die EU-Wallet-Perspektive öffnen. Für die eigentliche Demo verwenden wir eine Beispielidentität.',
    ],
    speakPartsSie: [
      'Hier geht es um den Zugang zur Demo. Für die Vorschau können Sie entweder die eID-Perspektive ansehen oder die EU-Wallet-Perspektive öffnen. Für die eigentliche Demo verwenden wir eine Beispielidentität.',
    ],
  },
  politikBarometer: {
    title: 'Politikbarometer',
    shortDu:
      'Das Politik-Barometer zeigt dir, welche Themen gerade besonders relevant sind – lokal, im Saarland und auf Bundesebene. So entsteht ein schneller Überblick, bevor du tiefer in einzelne Beteiligungen einsteigst.',
    shortSie:
      'Das Politik-Barometer zeigt Ihnen, welche Themen gerade besonders relevant sind – lokal, im Saarland und auf Bundesebene. So entsteht ein schneller Überblick, bevor Sie tiefer in einzelne Beteiligungen einsteigen.',
    speakPartsDu: [
      'Das Politik-Barometer zeigt dir, welche Themen gerade besonders relevant sind – lokal, im Saarland und auf Bundesebene. So entsteht ein schneller Überblick, bevor du tiefer in einzelne Beteiligungen einsteigst.',
    ],
    speakPartsSie: [
      'Das Politik-Barometer zeigt Ihnen, welche Themen gerade besonders relevant sind – lokal, im Saarland und auf Bundesebene. So entsteht ein schneller Überblick, bevor Sie tiefer in einzelne Beteiligungen einsteigen.',
    ],
  },
  abstimmen: {
    title: 'Abstimmen',
    shortDu:
      'Im Bereich Abstimmen kannst du Beteiligungen wie eine moderne Entscheidungskarte erleben. Du siehst das Thema, kannst Pro und Contra öffnen und entscheidest bewusst – nicht aus dem Bauch heraus, sondern informiert.',
    shortSie:
      'Im Bereich Abstimmen können Sie Beteiligungen wie eine moderne Entscheidungskarte erleben. Sie sehen das Thema, können Pro und Contra öffnen und entscheiden bewusst – nicht aus dem Bauch heraus, sondern informiert.',
    speakPartsDu: [
      'Im Bereich Abstimmen kannst du Beteiligungen wie eine moderne Entscheidungskarte erleben. Du siehst das Thema, kannst Pro und Contra öffnen und entscheidest bewusst – nicht aus dem Bauch heraus, sondern informiert.',
    ],
    speakPartsSie: [
      'Im Bereich Abstimmen können Sie Beteiligungen wie eine moderne Entscheidungskarte erleben. Sie sehen das Thema, können Pro und Contra öffnen und entscheiden bewusst – nicht aus dem Bauch heraus, sondern informiert.',
    ],
  },
  wahlen: {
    title: 'Wahlen',
    shortDu:
      'Im Bereich Wahlen geht es nicht um eine echte Stimmabgabe, sondern um Orientierung. Du kannst Parteien, Programme und Kandidierende vergleichen und dir einen verifizierten Überblick verschaffen.',
    shortSie:
      'Im Bereich Wahlen geht es nicht um eine echte Stimmabgabe, sondern um Orientierung. Sie können Parteien, Programme und Kandidierende vergleichen und sich einen verifizierten Überblick verschaffen.',
    speakPartsDu: [
      'Im Bereich Wahlen geht es nicht um eine echte Stimmabgabe, sondern um Orientierung. Du kannst Parteien, Programme und Kandidierende vergleichen und dir einen verifizierten Überblick verschaffen.',
    ],
    speakPartsSie: [
      'Im Bereich Wahlen geht es nicht um eine echte Stimmabgabe, sondern um Orientierung. Sie können Parteien, Programme und Kandidierende vergleichen und sich einen verifizierten Überblick verschaffen.',
    ],
  },
  kalender: {
    title: 'Kalender',
    shortDu:
      'Der Kalender bündelt relevante Termine: Abstimmungen, Beteiligungen und Wahlen. Über Filter erkennst du schnell, was für deine Kommune, dein Bundesland oder den Bund wichtig ist.',
    shortSie:
      'Der Kalender bündelt relevante Termine: Abstimmungen, Beteiligungen und Wahlen. Über Filter erkennen Sie schnell, was für Ihre Kommune, Ihr Bundesland oder den Bund wichtig ist.',
    speakPartsDu: [
      'Der Kalender bündelt relevante Termine: Abstimmungen, Beteiligungen und Wahlen. Über Filter erkennst du schnell, was für deine Kommune, dein Bundesland oder den Bund wichtig ist.',
    ],
    speakPartsSie: [
      'Der Kalender bündelt relevante Termine: Abstimmungen, Beteiligungen und Wahlen. Über Filter erkennen Sie schnell, was für Ihre Kommune, Ihr Bundesland oder den Bund wichtig ist.',
    ],
  },
  meldungen: {
    title: 'Meldungen',
    shortDu:
      'Unter Meldungen kannst du lokale Probleme strukturiert erfassen – zum Beispiel Schäden, Gefahrenstellen oder Hinweise im öffentlichen Raum. Die Demo zeigt, wie Meldungen priorisiert und nachvollziehbar weitergeleitet werden könnten.',
    shortSie:
      'Unter Meldungen können Sie lokale Probleme strukturiert erfassen – zum Beispiel Schäden, Gefahrenstellen oder Hinweise im öffentlichen Raum. Die Demo zeigt, wie Meldungen priorisiert und nachvollziehbar weitergeleitet werden könnten.',
    speakPartsDu: [
      'Unter Meldungen kannst du lokale Probleme strukturiert erfassen – zum Beispiel Schäden, Gefahrenstellen oder Hinweise im öffentlichen Raum. Die Demo zeigt, wie Meldungen priorisiert und nachvollziehbar weitergeleitet werden könnten.',
    ],
    speakPartsSie: [
      'Unter Meldungen können Sie lokale Probleme strukturiert erfassen – zum Beispiel Schäden, Gefahrenstellen oder Hinweise im öffentlichen Raum. Die Demo zeigt, wie Meldungen priorisiert und nachvollziehbar weitergeleitet werden könnten.',
    ],
  },
  praemien: {
    title: 'Prämien',
    shortDu:
      'Bei Prämien siehst du, wie freiwillige Beteiligung auch sichtbar wertgeschätzt werden kann. Nur mit Einwilligung können lokale Vorteile angezeigt werden – zum Beispiel ein Naturfreibad-Gutschein als digitaler QR-Code fürs Wallet.',
    shortSie:
      'Bei Prämien sehen Sie, wie freiwillige Beteiligung auch sichtbar wertgeschätzt werden kann. Nur mit Einwilligung können lokale Vorteile angezeigt werden – zum Beispiel ein Naturfreibad-Gutschein als digitaler QR-Code fürs Wallet.',
    speakPartsDu: [
      'Bei Prämien siehst du, wie freiwillige Beteiligung auch sichtbar wertgeschätzt werden kann. Nur mit Einwilligung können lokale Vorteile angezeigt werden – zum Beispiel ein Naturfreibad-Gutschein als digitaler QR-Code fürs Wallet.',
    ],
    speakPartsSie: [
      'Bei Prämien sehen Sie, wie freiwillige Beteiligung auch sichtbar wertgeschätzt werden kann. Nur mit Einwilligung können lokale Vorteile angezeigt werden – zum Beispiel ein Naturfreibad-Gutschein als digitaler QR-Code fürs Wallet.',
    ],
  },
  outro: {
    title: 'Rundgang abgeschlossen',
    shortDu:
      'Du hast die wichtigsten Bereiche gesehen: Abstimmen, Wahlen, Kalender, Meldungen und Prämien.',
    shortSie:
      'Sie haben die wichtigsten Bereiche gesehen: Abstimmen, Wahlen, Kalender, Meldungen und Prämien.',
    speakPartsDu: [
      'Damit endet der geführte Rundgang. Du kannst jetzt in die Demo wechseln und die Bereiche selbst ausprobieren.',
    ],
    speakPartsSie: [
      'Damit endet der geführte Rundgang. Sie können jetzt in die Demo wechseln und die Bereiche selbst ausprobieren.',
    ],
  },
};

export function machineTitle(machineIndex: number): string {
  const id = machineStepId(machineIndex);
  return STEPS[id].title;
}

export function machineShort(machineIndex: number, du: boolean): string {
  const id = machineStepId(machineIndex);
  return du ? STEPS[id].shortDu : STEPS[id].shortSie;
}

export function machineSpeakParts(machineIndex: number, du: boolean): string[] {
  const id = machineStepId(machineIndex);
  return du ? [...STEPS[id].speakPartsDu] : [...STEPS[id].speakPartsSie];
}

export function machineContinueLabel(machineIndex: number): string {
  switch (machineStepId(machineIndex)) {
    case 'auth':
      return 'Weiter';
    case 'outro':
    default:
      return 'App starten';
    case 'politikBarometer':
    case 'abstimmen':
    case 'wahlen':
    case 'kalender':
    case 'meldungen':
    case 'praemien':
      return 'Weiter';
  }
}

/** Sichtbarer Clara-Fließtext (Banner) — immer mindestens dieser Text, auch ohne Audio. */
export function machineNarrationPlain(machineIndex: number, du: boolean): string {
  return machineSpeakParts(machineIndex, du).join('\n\n');
}
