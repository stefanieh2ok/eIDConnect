import { createHash } from 'crypto';

/** Header für den NDA-Screen */
export const NDA_HEADER =
  'Vertrauliche personalisierte Demo – Zugriff nur für autorisierte Empfänger';

/** Kurzfassung (5–6 Punkte) für den Screen */
export const NDA_GATE_SUMMARY = [
  'Diese Demo enthält vertrauliche und nicht öffentliche Informationen.',
  'Der Zugriff ist ausschließlich für den personalisierten Empfänger bestimmt.',
  'Der Link darf nicht weitergeleitet, geteilt oder gemeinsam genutzt werden.',
  'Screenshots, Aufzeichnungen, Reverse Engineering, Benchmarking und die Eingabe in nicht freigegebene KI-Systeme sind untersagt.',
  'Zugriffe, Zustimmungen und sicherheitsrelevante Ereignisse werden zu Dokumentations-, Sicherheits-, Nachweis- und Geheimnisschutzzwecken protokolliert.',
  'Durch den Zugriff werden keinerlei Nutzungsrechte, Lizenzen oder sonstige Rechte übertragen.',
];

/** Footer-Hinweis zur Protokollierung */
export const NDA_FOOTER =
  'Diese personalisierte Demo-Session wird zu Dokumentations-, Sicherheits- und Nachweiszwecken protokolliert.';

/** Button-Text für elektronische Zustimmung */
export const NDA_BUTTON_TEXT =
  'Vertraulichkeitsvereinbarung akzeptieren und Demo öffnen';

/** Fehlermeldung bei Speicherfehler */
export const NDA_ERROR_SAVE =
  'Die Zustimmung konnte gerade nicht gespeichert werden. Bitte versuche es erneut.';

/** Checkbox-Text */
export const NDA_CHECKBOX_TEXT =
  'Ich habe die Vertraulichkeitsvereinbarung gelesen, verstanden und akzeptiere sie.';

/** Kurzer Hinweis über der Checkbox */
export const NDA_HINT_ABOVE_CHECKBOX =
  'Der bereitgestellte Zugang ist personalisiert und ausschließlich für den benannten Empfänger bestimmt.';

/** Satz unter dem Button */
export const NDA_SENTENCE_BELOW_BUTTON =
  'Mit der Zustimmung bestätigst du die vertrauliche Nutzung dieser Demo ausschließlich zum Prüfungszweck.';

/**
 * Optional: Pfad zu deiner Unterschrift (PNG) für die Druck-/PDF-Version.
 * Datei in public/ ablegen, z. B. public/signature-stefanie-hook.png → '/signature-stefanie-hook.png'.
 * Leer lassen, wenn nur Unterschriftslinien angezeigt werden sollen.
 */
export const NDA_SIGNATURE_IMAGE_PATH = '';

/** Bezeichnung Unterschrift Offenlegende Partei (Druck/PDF) */
export const NDA_SIGNATURE_LABEL_DISCLOSING = 'Stefanie Hook (Offenlegende Partei)';

/** Bezeichnung Unterschrift Empfangende Partei (Druck/PDF) */
export const NDA_SIGNATURE_LABEL_RECEIVING =
  'Governikus GmbH & Co. KG, z. Hd. der Geschäftsführung (Empfangende Partei)';

/** Vollständiger NDA-Volltext (Governikus / DeinDeutschland / Bürger App) */
export const NDA_FULL_TEXT = `GEHEIMHALTUNGSVEREINBARUNG / NDA
für den Zugang zu einer vertraulichen Demo-Umgebung

zwischen

Stefanie Hook
Neuhäuseler Straße 10
66459 Kirkel

– nachfolgend „Offenlegende Partei“ –

und

Governikus GmbH & Co. KG
z. Hd. der Geschäftsführung
Herrn Dr. Stephan Klein und Herrn Hartje Bruns
Hochschulring 4
28359 Bremen

– nachfolgend „Empfangende Partei“ –

gemeinsam auch „die Parteien“.

1. Parteien

Die vorliegende Vereinbarung wird zwischen der Offenlegenden Partei und der Empfangenden Partei geschlossen. Sie regelt die Vertraulichkeit sämtlicher im Rahmen einer Demo, Präsentation, Prüfung oder Anbahnung einer möglichen Zusammenarbeit offengelegten Informationen.

2. Zweck der Offenlegung

Die Offenlegende Partei gewährt der Empfangenden Partei Zugang zu einer vertraulichen Demo-, Test- oder Präsentationsumgebung einer digitalen Civic-Tech-/GovTech-Lösung mit dem Arbeitstitel „DeinDeutschland“ / „Bürger App“ sowie zu damit verbundenen Informationen, Unterlagen, Konzepten und technischen bzw. geschäftlichen Inhalten.

Die Offenlegung erfolgt ausschließlich zum Zweck der Prüfung einer möglichen geschäftlichen, technischen, strategischen oder partnerschaftlichen Zusammenarbeit.

Eine Nutzung der offengelegten Informationen zu anderen Zwecken ist unzulässig.

3. Vertrauliche Informationen

Als „Vertrauliche Informationen“ im Sinne dieser Vereinbarung gelten sämtliche nicht öffentlich bekannten Informationen, die der Empfangenden Partei direkt oder indirekt zugänglich gemacht werden, unabhängig davon, ob dies mündlich, schriftlich, elektronisch, visuell oder durch Zugang zu einer Demo-Umgebung geschieht.

Hierzu zählen insbesondere, aber nicht abschließend:

a) Produktideen, Produktkonzepte, Use Cases, Roadmaps, Strategien und Geschäftsmodelle;
b) Quellcode, Software-Strukturen, Datenmodelle, Datenbankschemata, APIs, Integrationskonzepte, Systemarchitekturen und technische Dokumentationen;
c) Benutzeroberflächen, UX/UI-Konzepte, Designs, Wireframes, Klickpfade, Texte, Inhalte, Module, Workflows, Features und Geschäftslogiken;
d) KI-bezogene Konzepte, Prompt-Logiken, Agenten-Architekturen, Modell-Orchestrierungen, Automatisierungen, Auswertungslogiken und Schutzmechanismen;
e) Demo-Umgebungen, Prototypen, Testzugänge, Testdaten, Bildschirminhalte, Screens, Beobachtungen, Notizen, Bewertungen, Zusammenfassungen und daraus abgeleitete Erkenntnisse;
f) personalisierte Demo-Links, Tokens, Zugangsdaten, Session-Informationen und Testzugänge;
g) alle Informationen, bei denen nach den Umständen erkennbar ist, dass sie vertraulich oder geschäftlich sensibel sind.

Vertrauliche Informationen gelten auch dann als vertraulich, wenn sie nicht ausdrücklich als „vertraulich“ gekennzeichnet sind.

4. Zulässige Nutzung

Die Empfangende Partei darf die Vertraulichen Informationen ausschließlich zur internen Prüfung und Bewertung einer möglichen Zusammenarbeit mit der Offenlegenden Partei verwenden.

Insbesondere unzulässig ist eine Nutzung:

a) zur Entwicklung, Vorbereitung, Spezifikation oder Verbesserung eigener oder fremder Produkte oder Dienstleistungen;
b) zur Vorbereitung konkurrierender Lösungen;
c) zur Nutzung in Ausschreibungen, Angeboten, Konzeptpapieren, Produktentscheidungen oder Entwicklungsprozessen außerhalb des ausdrücklich zulässigen Prüfungszwecks;
d) zur wirtschaftlichen, operativen oder strategischen Weiterverwertung.

5. Geheimhaltung und Need-to-know

Die Empfangende Partei verpflichtet sich, sämtliche Vertraulichen Informationen streng vertraulich zu behandeln und nur solchen eigenen Mitarbeitenden, Organen, Beauftragten oder Beratern offenzulegen, die diese Informationen zwingend für den in Ziffer 2 genannten Zweck benötigen und ihrerseits mindestens in entsprechendem Umfang zur Vertraulichkeit verpflichtet sind.

Die Empfangende Partei stellt sicher, dass alle von ihr einbezogenen Personen diese Vereinbarung einhalten, und haftet für deren Verhalten wie für eigenes Verhalten.

6. Personalisierte Demo-Zugänge / Nichtweitergabe

Personalisierte Demo-Links, Tokens, Testzugänge und sonstige Zugangsinformationen sind selbst Vertrauliche Informationen.

Die Empfangende Partei verpflichtet sich insbesondere,

a) den personalisierten Demo-Link oder Token nicht an Dritte weiterzuleiten, nicht zu teilen und nicht gemeinsam mit nicht autorisierten Personen zu nutzen;
b) keine interne Verteilung außerhalb des zwingend erforderlichen Personenkreises vorzunehmen;
c) keine Veröffentlichung oder Ablage in offenen Verzeichnissen, Gruppen-Chats, Ticketsystemen, Wikis oder vergleichbaren Systemen vorzunehmen;
d) Dritten keinen unmittelbaren oder mittelbaren Zugang zur Demo zu verschaffen.

Jede unautorisierte Weitergabe oder sonstige Zugänglichmachung stellt einen Verstoß gegen diese Vereinbarung dar.

7. Verbotene Handlungen

Ohne vorherige ausdrückliche schriftliche Zustimmung der Offenlegenden Partei ist der Empfangenden Partei insbesondere untersagt:

a) Screenshots, Bildschirmfotos, Fotografien, Screen-Recordings, Videoaufzeichnungen oder sonstige Reproduktionen der Demo oder ihrer Inhalte anzufertigen;
b) Vertrauliche Informationen ganz oder teilweise zu kopieren, zu extrahieren, systematisch auszuwerten oder außerhalb des zulässigen Zwecks zu dokumentieren;
c) Reverse Engineering, Dekompilierung, Scraping, API-Enumeration, Prompt-Extraktion, systematische Analyse technischer Logiken, Nachbauplanung, Benchmarking oder Konkurrenzanalyse auf Grundlage der offengelegten Informationen vorzunehmen;
d) Schutzmechanismen, Zugriffsbeschränkungen oder technische Limitierungen zu umgehen, zu testen oder zu manipulieren;
e) Vertrauliche Informationen ganz oder teilweise in öffentliche oder nicht ausdrücklich von der Offenlegenden Partei freigegebene KI-Systeme, LLMs, Chatbots, externe Analysewerkzeuge, Trainingsumgebungen oder Inferenzsysteme einzugeben;
f) Vertrauliche Informationen zur Entwicklung abgeleiteter, ähnlicher oder konkurrierender Spezifikationen, Konzepte, Produkte oder Dienstleistungen zu verwenden.

Zwingende gesetzliche Rechte, auf die nicht wirksam verzichtet werden kann, bleiben unberührt.

8. Protokollierung / elektronische Dokumentation

Die Empfangende Partei nimmt zur Kenntnis und erklärt sich damit einverstanden, dass der Zugriff auf Demo-Umgebungen, Testzugänge und vertrauliche digitale Inhalte zu Dokumentations-, Sicherheits-, Nachweis-, Missbrauchspräventions- und Geheimnisschutzzwecken technisch protokolliert werden darf.

Hierbei können insbesondere folgende Daten verarbeitet und gespeichert werden:

a) Zeitpunkte von Zugriffen und Zustimmungen;
b) verwendete Tokens, Session-IDs und besuchte Bereiche bzw. Seiten;
c) IP-Adresse, User-Agent, Browser- und Geräteinformationen;
d) Zugriffsdauer, Session-Dauer und sicherheitsrelevante Ereignisse;
e) Bestätigungen im Rahmen elektronischer Zustimmungserklärungen.

Die Protokollierung dient ausschließlich legitimen Sicherheits-, Dokumentations-, Nachweis- und Schutzinteressen der Offenlegenden Partei.

9. Kein Rechteübergang

Sämtliche Rechte an den Vertraulichen Informationen verbleiben ausschließlich bei der Offenlegenden Partei.

Durch diese Vereinbarung, durch die Offenlegung oder durch die Nutzung einer Demo werden keinerlei Rechte eingeräumt, insbesondere keine:

a) Urheber- oder Nutzungsrechte;
b) Lizenzrechte;
c) Rechte an Geschäftsgeheimnissen, Know-how, Konzepten, Designs oder Kennzeichen;
d) Rechte zur wirtschaftlichen Verwertung, Bearbeitung oder Nachnutzung.

10. Ausnahmen

Die Verpflichtungen aus dieser Vereinbarung gelten nicht für Informationen, bei denen die Empfangende Partei nachweist, dass sie:

a) ihr bereits vor der Offenlegung rechtmäßig bekannt waren;
b) ohne Verstoß gegen diese Vereinbarung öffentlich bekannt werden;
c) ihr von einem hierzu berechtigten Dritten rechtmäßig und ohne Vertraulichkeitsverpflichtung mitgeteilt wurden; oder
d) aufgrund zwingender gesetzlicher Vorschriften oder vollziehbarer behördlicher bzw. gerichtlicher Anordnung offengelegt werden müssen.

Soweit rechtlich zulässig, hat die Empfangende Partei die Offenlegende Partei vor einer solchen Offenlegung unverzüglich schriftlich zu informieren.

11. Schutz von Geschäftsgeheimnissen

Die Parteien sind sich einig, dass die offengelegten Informationen ganz oder teilweise Geschäftsgeheimnisse sowie sonstige schutzwürdige vertrauliche Informationen darstellen können.

Diese Vereinbarung dient ausdrücklich auch dazu, angemessene Geheimhaltungsmaßnahmen für diese Informationen zu begründen und aufrechtzuerhalten.

12. Laufzeit

Diese Vereinbarung tritt mit Unterzeichnung oder mit dokumentierter elektronischer Zustimmung in Kraft.

Die Vertraulichkeitspflichten gelten für fünf (5) Jahre ab dem Zeitpunkt der letzten Offenlegung.

Soweit einzelne Informationen Geschäftsgeheimnisse im rechtlichen Sinne darstellen, gelten die Geheimhaltungspflichten darüber hinaus fort, solange die Voraussetzungen des gesetzlichen Schutzes bestehen.

13. Rückgabe / Löschung / Deaktivierung

Auf schriftliches Verlangen der Offenlegenden Partei hat die Empfangende Partei unverzüglich:

a) alle erhaltenen Unterlagen, Notizen, Kopien, Auszüge und gespeicherten Informationen zurückzugeben oder zu löschen;
b) die Nutzung von Demo-Links, Tokens und Testzugängen einzustellen;
c) schriftlich zu bestätigen, dass die Rückgabe oder Löschung erfolgt ist.

Ausgenommen hiervon sind nur gesetzlich zwingend aufzubewahrende Unterlagen sowie automatisiert erzeugte Sicherungskopien im üblichen IT-Betrieb, soweit diese nicht aktiv genutzt werden.

14. Rechtsfolgen bei Verstößen

Bei einem Verstoß gegen diese Vereinbarung kann die Offenlegende Partei alle ihr gesetzlich zustehenden Rechte geltend machen, insbesondere auf:

a) Unterlassung;
b) Auskunft;
c) Beseitigung;
d) Löschung bzw. Herausgabe;
e) Schadensersatz.

Eine Vertragsstrafe wird nicht vereinbart.

15. Keine Verpflichtung zur Zusammenarbeit

Diese Vereinbarung begründet weder eine Verpflichtung zum Abschluss weiterer Verträge noch eine Exklusivität, noch eine Abnahme-, Entwicklungs-, Lizenz- oder Kooperationsverpflichtung.

16. Elektronische Zustimmung

Die Parteien können vereinbaren, dass diese Geheimhaltungsvereinbarung für Demo-Zugänge auch durch dokumentierte elektronische Zustimmung wirksam angenommen wird.

Eine solche elektronische Zustimmung ist ausreichend, wenn Zeitpunkt, Version des Zustimmungstextes und die zustimmende Person bzw. der zugeordnete Empfänger technisch nachvollziehbar dokumentiert werden.

17. Anwendbares Recht und Gerichtsstand

Es gilt das Recht der Bundesrepublik Deutschland unter Ausschluss des UN-Kaufrechts.

Ist die Empfangende Partei Kaufmann, juristische Person des öffentlichen Rechts oder öffentlich-rechtliches Sondervermögen, ist – soweit rechtlich zulässig – ausschließlicher Gerichtsstand der Sitz der Offenlegenden Partei.

Im Übrigen gelten die gesetzlichen Gerichtsstandsregelungen.

18. Schlussbestimmungen

Änderungen und Ergänzungen dieser Vereinbarung bedürfen mindestens der Textform, soweit nicht gesetzlich eine strengere Form vorgeschrieben ist.

Sollten einzelne Bestimmungen dieser Vereinbarung ganz oder teilweise unwirksam oder undurchführbar sein oder werden, bleibt die Wirksamkeit der übrigen Bestimmungen unberührt. Anstelle der unwirksamen oder undurchführbaren Bestimmung gilt eine wirksame Regelung als vereinbart, die dem wirtschaftlichen Zweck der weggefallenen Regelung am nächsten kommt.`;

export const ndaConfig = {
  version: 'v3.0.0',
  gateSummary: NDA_GATE_SUMMARY,
  fullText: NDA_FULL_TEXT.trim(),
  header: NDA_HEADER,
  footer: NDA_FOOTER,
  buttonText: NDA_BUTTON_TEXT,
  errorSave: NDA_ERROR_SAVE,
  checkboxText: NDA_CHECKBOX_TEXT,
  hintAboveCheckbox: NDA_HINT_ABOVE_CHECKBOX,
  sentenceBelowButton: NDA_SENTENCE_BELOW_BUTTON,
  signatureImagePath: NDA_SIGNATURE_IMAGE_PATH,
  signatureLabelDisclosing: NDA_SIGNATURE_LABEL_DISCLOSING,
  signatureLabelReceiving: NDA_SIGNATURE_LABEL_RECEIVING,
};

export function getNdaDocumentHash(): string {
  return createHash('sha256')
    .update(`${ndaConfig.version}::${ndaConfig.fullText}`, 'utf8')
    .digest('hex');
}
