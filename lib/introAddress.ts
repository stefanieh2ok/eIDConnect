export function adaptIntroAddress(text: string, du: boolean): string {
  if (!du) return text;

  // Bewusst nur explizite, grammatikalisch geprüfte Umformulierungen.
  // Kein generisches "Sie"->"Du", um fehlerhafte Verbformen zu vermeiden.
  const replacements: Array<[RegExp, string]> = [
    [/\bUnter „Abstimmen“ sehen Sie\b/g, 'Unter „Abstimmen“ siehst du'],
    [/\bSie erhalten Pro- und Contra-Argumente\b/g, 'Du erhältst Pro- und Contra-Argumente'],
    [/\bund anschließend Ihr Meinungsbild abgeben\b/g, 'und anschließend dein Meinungsbild abgeben'],
    [/\bUnter „Wahlen“ erleben Sie\b/g, 'Unter „Wahlen“ erlebst du'],
    [/\bSie sehen den digitalen Stimmzettel\b/g, 'Du siehst den digitalen Stimmzettel'],
    [
      /\bund können Parteiprogramme sowie quellenbasierte Informationen zu Kandidierenden direkt aufrufen\b/g,
      'und kannst Parteiprogramme sowie quellenbasierte Informationen zu Kandidierenden direkt aufrufen',
    ],
    [/\bUnter „Kalender“ finden Sie\b/g, 'Unter „Kalender“ findest du'],
    [/\bUnter „Meldungen“ erfassen Sie\b/g, 'Unter „Meldungen“ erfasst du'],
    [/\bfür Ihre Kommune\b/g, 'für deine Kommune'],
    [
      /\n\nSie wählen die passende Kategorie, ergänzen Ort, Beschreibung und Fotos und leiten Ihr Anliegen\b/g,
      '\n\nDu wählst die passende Kategorie, ergänzt Ort, Beschreibung und Fotos und leitest dein Anliegen',
    ],
    [
      /\n\nPrämien und Einlöseangebote werden erst angezeigt, wenn Sie dem Programm ausdrücklich zustimmen\./g,
      '\n\nPrämien und Einlöseangebote werden erst angezeigt, wenn du dem Programm ausdrücklich zustimmst.',
    ],
    [
      /\bDie Teilnahme am Prämienprogramm ist freiwillig und wird erst nach Ihrer ausdrücklichen Zustimmung aktiviert\./g,
      'Die Teilnahme am Prämienprogramm ist freiwillig und wird erst nach deiner ausdrücklichen Zustimmung aktiviert.',
    ],
  ];

  return replacements.reduce((acc, [pattern, value]) => acc.replace(pattern, value), text);
}
