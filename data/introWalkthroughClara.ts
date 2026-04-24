import type { IntroOverlayStepId } from '@/data/introOverlayMarketing';

/**
 * Pro Walkthrough-Screen: UI (short/long) und **Spoken** (`speakSegments*`) getrennt.
 * Premium tonality: Wert, Orientierung, kein defensives Demo-Vokabular.
 */
export type WalkthroughClaraBlock = {
  label: string;
  /** 10s-Kicker, sichtbar oben, vor der Vorschau. */
  line10sDu: string;
  line10sSie: string;
  shortDu: string;
  shortSie: string;
  longDu: string;
  longSie: string;
  speakSegmentsDu: readonly string[];
  speakSegmentsSie: readonly string[];
};

export const INTRO_WALKTHROUGH_CLARA: Record<IntroOverlayStepId, WalkthroughClaraBlock> = {
  abstimmen: {
    label: 'Abstimmen',
    line10sDu:
      'Hier siehst du aktuelle Themen auf einen Blick und kannst klar, schnell und informiert daran mitwirken.',
    line10sSie:
      'Hier sehen Sie aktuelle Themen auf einen Blick und können klar, schnell und informiert daran mitwirken.',
    shortDu: 'Aktuelle Themen klar erfassen, einordnen und direkt daran mitwirken.',
    shortSie: 'Aktuelle Themen klar erfassen, einordnen und direkt daran mitwirken.',
    longDu:
      'Hier siehst du aktuelle Themen auf einen Blick.\n\n' +
      'Du kannst zwischen Dafür, Dagegen und Enthaltung wählen.\n\n' +
      'Wenn du mehr Kontext brauchst, helfen dir Clara und vertiefende Informationen beim Einordnen.\n\n' +
      'So wird Beteiligung einfacher, verständlicher und zugänglicher.',
    longSie:
      'Hier sehen Sie aktuelle Themen auf einen Blick.\n\n' +
      'Sie können zwischen Dafür, Dagegen und Enthaltung wählen.\n\n' +
      'Wenn Sie mehr Kontext brauchen, helfen Ihnen Clara und vertiefende Informationen beim Einordnen.\n\n' +
      'So wird Beteiligung einfacher, verständlicher und zugänglicher.',
    speakSegmentsDu: [
      'Hier findest du aktuelle Themen, an denen du direkt mitwirken kannst.',
      'Du stimmst klar und intuitiv ab: dafür, dagegen oder Enthaltung.',
      'Wenn du mehr Orientierung brauchst, bekommst du zusätzliche Informationen direkt im Kontext.',
      'So wird Beteiligung schneller, verständlicher und alltagstauglich.',
    ],
    speakSegmentsSie: [
      'Hier finden Sie aktuelle Themen, an denen Sie direkt mitwirken können.',
      'Sie stimmen klar und intuitiv ab: dafür, dagegen oder Enthaltung.',
      'Wenn Sie mehr Orientierung brauchen, bekommen Sie zusätzliche Informationen direkt im Kontext.',
      'So wird Beteiligung schneller, verständlicher und alltagstauglich.',
    ],
  },
  wahlen: {
    label: 'Wahlen',
    line10sDu:
      'Hier findest du Wahlen, Stimmzettel und politische Informationen in einer Struktur, die Orientierung leichter macht.',
    line10sSie:
      'Hier finden Sie Wahlen, Stimmzettel und politische Informationen in einer Struktur, die Orientierung leichter macht.',
    shortDu: 'Wahlen, Stimmzettel und politische Informationen strukturiert an einem Ort.',
    shortSie: 'Wahlen, Stimmzettel und politische Informationen strukturiert an einem Ort.',
    longDu:
      'Hier erhältst du einen klaren Zugang zu Wahlen, Stimmzetteln, Programmen, Kandidaten und weiteren relevanten Informationen.\n\n' +
      'Die Inhalte sind so aufgebaut, dass Orientierung leichter fällt und Zusammenhänge schneller verständlich werden.\n\n' +
      'Wo vorgesehen, lassen sich auch Ergebnisse und weiterführende Informationen einsehen.',
    longSie:
      'Hier erhalten Sie einen klaren Zugang zu Wahlen, Stimmzetteln, Programmen, Kandidaten und weiteren relevanten Informationen.\n\n' +
      'Die Inhalte sind so aufgebaut, dass Orientierung leichter fällt und Zusammenhänge schneller verständlich werden.\n\n' +
      'Wo vorgesehen, lassen sich auch Ergebnisse und weiterführende Informationen einsehen.',
    speakSegmentsDu: [
      'Dieser Bereich bündelt Wahlen und die dazugehörigen Informationen in einer klaren Struktur.',
      'Du findest Stimmzettel, Hintergründe, Programme und weitere Inhalte, die Orientierung schaffen.',
      'So wird politische Information zugänglicher, ohne an Tiefe zu verlieren.',
    ],
    speakSegmentsSie: [
      'Dieser Bereich bündelt Wahlen und die dazugehörigen Informationen in einer klaren Struktur.',
      'Sie finden Stimmzettel, Hintergründe, Programme und weitere Inhalte, die Orientierung schaffen.',
      'So wird politische Information zugänglicher, ohne an Tiefe zu verlieren.',
    ],
  },
  kalender: {
    label: 'Kalender',
    line10sDu:
      'Im Kalender behältst du wichtige Termine, Fristen und Beteiligungen zentral im Blick.',
    line10sSie:
      'Im Kalender behalten Sie wichtige Termine, Fristen und Beteiligungen zentral im Blick.',
    shortDu: 'Wichtige Termine, Fristen und Beteiligungen zentral im Blick.',
    shortSie: 'Wichtige Termine, Fristen und Beteiligungen zentral im Blick.',
    longDu:
      'Der Kalender bündelt relevante Termine rund um Wahlen, Abstimmungen und weitere Beteiligungsformate.\n\n' +
      'So wird sichtbar, was ansteht, was Fristen hat und wann Beteiligung möglich ist.\n\n' +
      'Das erleichtert Planung, Orientierung und rechtzeitige Teilnahme.',
    longSie:
      'Der Kalender bündelt relevante Termine rund um Wahlen, Abstimmungen und weitere Beteiligungsformate.\n\n' +
      'So wird sichtbar, was ansteht, was Fristen hat und wann Beteiligung möglich ist.\n\n' +
      'Das erleichtert Planung, Orientierung und rechtzeitige Teilnahme.',
    speakSegmentsDu: [
      'Im Kalender siehst du, was wann relevant wird.',
      'Wahlen, Beteiligungen und Fristen sind übersichtlich zusammengeführt.',
      'So behältst du wichtige Termine im Blick und kannst einfacher zum richtigen Zeitpunkt handeln.',
    ],
    speakSegmentsSie: [
      'Im Kalender sehen Sie, was wann relevant wird.',
      'Wahlen, Beteiligungen und Fristen sind übersichtlich zusammengeführt.',
      'So behalten Sie wichtige Termine im Blick und können einfacher zum richtigen Zeitpunkt handeln.',
    ],
  },
  meldungen: {
    label: 'Meldungen',
    line10sDu:
      'Über diesen Bereich lassen sich Anliegen digital, geordnet und nachvollziehbar weitergeben.',
    line10sSie:
      'Über diesen Bereich lassen sich Anliegen digital, geordnet und nachvollziehbar weitergeben.',
    shortDu: 'Anliegen strukturiert übermitteln und digital nachvollziehbar weitergeben.',
    shortSie: 'Anliegen strukturiert übermitteln und digital nachvollziehbar weitergeben.',
    longDu:
      'Über diesen Bereich lassen sich Hinweise, Anliegen oder konkrete Meldungen digital und geordnet erfassen.\n\n' +
      'Die Informationen werden strukturiert vorbereitet, damit sie schneller an der richtigen Stelle ankommen und nachvollziehbar bearbeitet werden können.\n\n' +
      'So wird Bürgerkommunikation einfacher, klarer und effizienter.',
    longSie:
      'Über diesen Bereich lassen sich Hinweise, Anliegen oder konkrete Meldungen digital und geordnet erfassen.\n\n' +
      'Die Informationen werden strukturiert vorbereitet, damit sie schneller an der richtigen Stelle ankommen und nachvollziehbar bearbeitet werden können.\n\n' +
      'So wird Bürgerkommunikation einfacher, klarer und effizienter.',
    speakSegmentsDu: [
      'Hier können Anliegen digital und strukturiert erfasst werden.',
      'Das sorgt für einen klareren Ablauf und hilft, Informationen gezielt weiterzugeben.',
      'Für Nutzerinnen und Nutzer wird Kommunikation damit einfacher, transparenter und besser nachvollziehbar.',
    ],
    speakSegmentsSie: [
      'Hier können Anliegen digital und strukturiert erfasst werden.',
      'Das sorgt für einen klareren Ablauf und hilft, Informationen gezielt weiterzugeben.',
      'Für Nutzerinnen und Nutzer wird Kommunikation damit einfacher, transparenter und besser nachvollziehbar.',
    ],
  },
  praemien: {
    label: 'Prämien',
    line10sDu:
      'Dieser Bereich ergänzt Beteiligung um ein freiwilliges Modell sichtbarer Anerkennung und zusätzlicher Anreize.',
    line10sSie:
      'Dieser Bereich ergänzt Beteiligung um ein freiwilliges Modell sichtbarer Anerkennung und zusätzlicher Anreize.',
    shortDu: 'Freiwillige Aktivierung für sichtbare Anerkennung von Beteiligung.',
    shortSie: 'Freiwillige Aktivierung für sichtbare Anerkennung von Beteiligung.',
    longDu:
      'Dieser Bereich ergänzt die App um ein freiwilliges Punkte- und Prämiensystem.\n\n' +
      'Beteiligung kann damit sichtbar honoriert werden — transparent, optional und nachvollziehbar.\n\n' +
      'So entsteht ein zusätzlicher Anreiz für wiederkehrende Mitwirkung, ohne die Nutzung zu überfrachten.',
    longSie:
      'Dieser Bereich ergänzt die App um ein freiwilliges Punkte- und Prämiensystem.\n\n' +
      'Beteiligung kann damit sichtbar honoriert werden — transparent, optional und nachvollziehbar.\n\n' +
      'So entsteht ein zusätzlicher Anreiz für wiederkehrende Mitwirkung, ohne die Nutzung zu überfrachten.',
    speakSegmentsDu: [
      'Dieser Bereich ergänzt Beteiligung um ein freiwilliges Modell sichtbarer Anerkennung und zusätzlicher Anreize.',
      'Wer mitwirkt, kann Aktivität sichtbar machen und zusätzliche Anreize nutzen.',
      'Das bleibt optional, ist sinnvoll integriert und leicht verständlich.',
    ],
    speakSegmentsSie: [
      'Dieser Bereich ergänzt Beteiligung um ein freiwilliges Modell sichtbarer Anerkennung und zusätzlicher Anreize.',
      'Wer mitwirkt, kann Aktivität sichtbar machen und zusätzliche Anreize nutzen.',
      'Das bleibt optional, ist sinnvoll integriert und leicht verständlich.',
    ],
  },
  politikbarometer: {
    label: 'Politikbarometer',
    line10sDu: 'Das Politikbarometer macht Entwicklungen, Stimmungen und Tendenzen schneller erfassbar.',
    line10sSie: 'Das Politikbarometer macht Entwicklungen, Stimmungen und Tendenzen schneller erfassbar.',
    shortDu: 'Stimmungen, Entwicklungen und Tendenzen schneller erfassen.',
    shortSie: 'Stimmungen, Entwicklungen und Tendenzen schneller erfassen.',
    longDu:
      'Das Politikbarometer verdichtet Beteiligung und Rückmeldungen zu einer schnellen Übersicht.\n\n' +
      'So lassen sich Entwicklungen, Tendenzen und Schwerpunkte früher erkennen und besser einordnen.\n\n' +
      'Der Bereich unterstützt Orientierung, ohne einzelne Themen aus dem Zusammenhang zu lösen.',
    longSie:
      'Das Politikbarometer verdichtet Beteiligung und Rückmeldungen zu einer schnellen Übersicht.\n\n' +
      'So lassen sich Entwicklungen, Tendenzen und Schwerpunkte früher erkennen und besser einordnen.\n\n' +
      'Der Bereich unterstützt Orientierung, ohne einzelne Themen aus dem Zusammenhang zu lösen.',
    speakSegmentsDu: [
      'Das Politikbarometer macht Entwicklungen schneller sichtbar.',
      'Es hilft, Tendenzen einzuordnen und Beteiligung in einem größeren Zusammenhang zu sehen.',
      'So entsteht Orientierung, ohne dass du dich erst durch viele Einzeldaten arbeiten musst.',
    ],
    speakSegmentsSie: [
      'Das Politikbarometer macht Entwicklungen schneller sichtbar.',
      'Es hilft, Tendenzen einzuordnen und Beteiligung in einem größeren Zusammenhang zu sehen.',
      'So entsteht Orientierung, ohne sich erst durch viele Einzeldaten arbeiten zu müssen.',
    ],
  },
};

export function claraBlockForStep(
  id: IntroOverlayStepId,
  du: boolean,
): {
  label: string;
  line10s: string;
  short: string;
  long: string;
  speak: string;
  speakSegments: string[];
} {
  const b = INTRO_WALKTHROUGH_CLARA[id];
  const body = du ? b.longDu : b.longSie;
  const speakSegments = du ? [...b.speakSegmentsDu] : [...b.speakSegmentsSie];
  const line10s = du ? b.line10sDu : b.line10sSie;
  return {
    label: b.label,
    line10s,
    short: du ? b.shortDu : b.shortSie,
    long: body,
    speak: [line10s, ...speakSegments].join(' '),
    speakSegments,
  };
}
