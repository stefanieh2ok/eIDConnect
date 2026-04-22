export function adaptIntroAddress(text: string, du: boolean): string {
  if (!du) return text;

  // Bewusst nur explizite, grammatikalisch geprüfte Umformulierungen.
  // Kein generisches "Sie"->"Du", um fehlerhafte Verbformen zu vermeiden.
  const replacements: Array<[RegExp, string]> = [
    [
      /Hier können Sie aktuelle Themen ansehen und Ihre Meinung abgeben\./g,
      'Hier kannst du aktuelle Themen ansehen und deine Meinung abgeben.',
    ],
    [
      /Sie können zwischen „Dafür“, „Dagegen“ oder „Enthaltung“ wählen\./g,
      'Du kannst zwischen „Dafür“, „Dagegen“ oder „Enthaltung“ wählen.',
    ],
    [
      /Zu jedem Thema finden Sie zusätzliche Informationen zur Orientierung\./g,
      'Zu jedem Thema findest du zusätzliche Informationen zur Orientierung.',
    ],
    [
      /Wenn Sie am Prämiensystem teilnehmen, erhalten Sie für jede Teilnahme Punkte\./g,
      'Wenn du am Prämiensystem teilnimmst, erhältst du für jede Teilnahme Punkte.',
    ],
    [
      /In diesem Bereich finden Sie verschiedene Wahlen\./g,
      'In diesem Bereich findest du verschiedene Wahlen.',
    ],
    [
      /Sie können sich Stimmzettel ansehen sowie Informationen zu Kandidaten und Programmen abrufen\./g,
      'Du kannst dir Stimmzettel ansehen sowie Informationen zu Kandidaten und Programmen abrufen.',
    ],
    [
      /Im Kalender sehen Sie anstehende Wahlen und Abstimmungen auf einen Blick\./g,
      'Im Kalender siehst du anstehende Wahlen und Abstimmungen auf einen Blick.',
    ],
    [
      /Sie können nach Bereichen und Zeiträumen filtern\./g,
      'Du kannst nach Bereichen und Zeiträumen filtern.',
    ],
    [
      /So behalten Sie den Überblick über relevante Termine\./g,
      'So behältst du den Überblick über relevante Termine.',
    ],
    [
      /Hier können Sie Anliegen, Hinweise oder Probleme digital melden\./g,
      'Hier kannst du Anliegen, Hinweise oder Probleme digital melden.',
    ],
    [
      /Ihre Meldung wird strukturiert erfasst und an die zuständige Stelle weitergeleitet\./g,
      'Deine Meldung wird strukturiert erfasst und an die zuständige Stelle weitergeleitet.',
    ],
    [
      /Sie können jederzeit nachvollziehen, was mit Ihrer Meldung passiert\./g,
      'Du kannst jederzeit nachvollziehen, was mit deiner Meldung passiert.',
    ],
    [
      /Sie können freiwillig am Prämiensystem teilnehmen\./g,
      'Du kannst freiwillig am Prämiensystem teilnehmen.',
    ],
    [
      /Für bestimmte Aktionen, wie zum Beispiel Abstimmungen, erhalten Sie Punkte\./g,
      'Für bestimmte Aktionen, wie zum Beispiel Abstimmungen, erhältst du Punkte.',
    ],
    [
      /Gesammelte Punkte können Sie im jeweiligen Bereich für lokale Prämien einsetzen\./g,
      'Gesammelte Punkte kannst du im jeweiligen Bereich für lokale Prämien einsetzen.',
    ],
    [
      /Im „Politikbarometer" legen Sie fest, welche Themen Ihnen wichtig sind\./g,
      'Im „Politikbarometer" legst du fest, welche Themen dir wichtig sind.',
    ],
    [
      /Die App weist Sie anschließend auf passende Abstimmungen hin und trägt relevante Termine in Ihren Kalender ein\. Die Nutzung ist freiwillig und jederzeit anpassbar\./g,
      'Die App weist dich anschließend auf passende Abstimmungen hin und trägt relevante Termine in deinen Kalender ein. Die Nutzung ist freiwillig und jederzeit anpassbar.',
    ],
  ];

  return replacements.reduce((acc, [pattern, value]) => acc.replace(pattern, value), text);
}
