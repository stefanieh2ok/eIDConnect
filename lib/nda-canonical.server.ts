/**
 * Kanonischer NDA-Text für Hash-Berechnung (nur Server).
 * Wird ausschließlich in API-Routen verwendet, um nachzuweisen, welche Fassung akzeptiert wurde.
 */

import { NDA_VERSION } from '@/lib/nda-content';

/** Vollständiger NDA-Text in stabiler, kanonischer Form (für SHA-256). Bei Änderung NDA_VERSION in nda-content.ts erhöhen. */
const CANONICAL_NDA_TEXT = `VERTRAULICHKEITSVEREINBARUNG
für vertrauliche Gespräche und den Zugang zu einer geschützten Produkt-/Software-Demo

§ 1 Zweck
Die Parteien beabsichtigen, vertrauliche Gespräche über eine mögliche strategische Zusammenarbeit zu führen. In diesem Zusammenhang kann die offenlegende Partei der empfangenden Partei vertrauliche Informationen offenlegen sowie einen personalisierten Zugang zu einer nicht öffentlichen Produkt-, Konzept- oder Software-Demo bereitstellen. Diese Vereinbarung regelt den Schutz sämtlicher in diesem Zusammenhang offengelegter oder zugänglich gemachter vertraulicher Informationen.

§ 2 Vertrauliche Informationen
(1) Als vertraulich gelten alle Informationen, Unterlagen, Daten und sonstigen Inhalte, die als vertraulich gekennzeichnet sind oder deren vertraulicher Charakter sich aus den Umständen ergibt.
(2) Hierzu zählen insbesondere: technische Konzepte, Software- und Systemarchitekturen, Datenmodelle, APIs, Workflows, Prompt-Logiken, KI-gestützte Funktionen; Produktideen, Roadmaps, Mockups, UX/UI-Konzepte; Geschäftsmodelle, Marktinformationen; Inhalte und Strukturen einer Demo; personalisierte Demo-Links, Zugangsdaten, Tokens, Session-Informationen; Screenshots, Bildschirmaufnahmen, Notizen und sonstige Reproduktionen vertraulicher Inhalte.
(3) Dies gilt auch für mündlich offengelegte Informationen, sofern deren vertraulicher Charakter erkennbar ist.

§ 3 Ausnahmen
Die Vertraulichkeitspflicht gilt nicht für Informationen, die die empfangende Partei nachweislich bereits rechtmäßig kannte, die öffentlich bekannt sind, die von Dritten rechtmäßig erhalten wurden oder die sie unabhängig entwickelt hat.

§ 4 Pflichten der empfangenden Partei
Die empfangende Partei verpflichtet sich, vertrauliche Informationen streng vertraulich zu behandeln, ausschließlich für den vereinbarten Zweck zu verwenden, nur einem zwingend erforderlichen, zur Vertraulichkeit verpflichteten Personenkreis zugänglich zu machen und mindestens die gleiche Sorgfalt wie bei eigenen vertraulichen Informationen anzuwenden.

§ 5 Besondere Schutzpflichten für Demo-Zugänge
Personalisierte Demo-Links, Freischaltungen, Tokens und Testzugänge gelten selbst als vertrauliche Informationen. Solche Zugänge dürfen ohne vorherige ausdrückliche Zustimmung weder weitergeleitet noch geteilt, kopiert, veröffentlicht oder intern verteilt werden. Die Nutzung einer bereitgestellten Demo ist ausschließlich durch die konkret autorisierte Person zulässig. Ein Verdacht auf unbefugte Weitergabe oder missbräuchliche Nutzung ist unverzüglich mitzuteilen.

§ 6 Verbotene Handlungen
Ohne vorherige ausdrückliche Zustimmung ist insbesondere untersagt: Screenshots, Bildschirmaufnahmen oder Vervielfältigungen anzufertigen; Inhalte in Kollaborations- oder Ticketsysteme einzustellen; Informationen an externe Berater oder Dritte weiterzugeben; Reverse Engineering, Decompiling, strukturelle Analyse, Scraping, Prompt-Extraktion oder vergleichbare technische Untersuchungen vorzunehmen; Benchmarking oder Nachbauplanungen auf Grundlage der Demo zu erstellen; Sicherheitsmechanismen oder Zugriffsbeschränkungen zu umgehen.

§ 7 KI- und Datenverarbeitungsbeschränkung
Vertrauliche Informationen dürfen nicht ohne vorherige ausdrückliche Zustimmung in öffentlich zugängliche oder nicht freigegebene KI-, LLM-, Copilot- oder sonstige externe Auswertungssysteme eingegeben, für Trainings- oder Optimierungszwecke verwendet oder automatisiert zusammengefasst, klassifiziert oder in Vektor- oder Wissenssysteme überführt werden.

§ 8 Gesetzliche Offenlegung
Soweit eine Offenlegung gesetzlich, behördlich oder gerichtlich vorgeschrieben ist, wird die empfangende Partei die andere Partei – soweit rechtlich zulässig – unverzüglich vorab informieren.

§ 9 Kein Rechteübergang
Durch diese Vereinbarung werden keine Nutzungsrechte, Lizenzen oder sonstigen Schutzrechte übertragen. Insbesondere erwirbt die empfangende Partei keine Rechte an Software, Quellcode, Konzepten, Designs, Geschäftsmodellen, Prompt-Strukturen oder Know-how.

§ 10 Zugriffsprotokollierung und Beweissicherung
Soweit digitale Demo-Zugänge bereitgestellt werden, ist die offenlegende Partei berechtigt, Zugriffe und sicherheitsrelevante Ereignisse im erforderlichen Umfang zu protokollieren (u. a. Zeitpunkt, Bestätigung der Vereinbarung, Session-ID, IP-Adresse, User-Agent, aufgerufene Bereiche). Die Protokollierung dient ausschließlich der Zugriffskontrolle, IT-Sicherheit, Missbrauchsprävention und Beweissicherung.

§ 11 Rückgabe, Löschung und Vernichtung
Auf Verlangen sind vertrauliche Informationen unverzüglich zurückzugeben, zu löschen oder zu vernichten, soweit keine gesetzlichen Aufbewahrungspflichten entgegenstehen. Dies gilt auch für Notizen, Screenshots, Kopien und Cloud-Speicherungen.

§ 12 Laufzeit
Die Vertraulichkeitspflichten gelten für fünf Jahre ab Offenlegung der jeweiligen Information. Für Geschäftsgeheimnisse gelten sie darüber hinaus, solange der rechtliche Schutz besteht.

§ 13 Unterlassung, Auskunft, Schadensersatz
Bei Verstößen können die gesetzlich zustehenden Ansprüche geltend gemacht werden (Unterlassung, Auskunft, Beseitigung, Löschung, Schadensersatz). Es wird keine Vertragsstrafe vereinbart.

§ 14 Form
Änderungen und Ergänzungen bedürfen der Textform. Die Zustimmung zu dieser Vereinbarung kann – soweit rechtlich zulässig – durch dokumentierte elektronische Akzeptanz erfolgen (z. B. NDA-Gate mit Protokollierung).

§ 15 Schlussbestimmungen
Es gilt deutsches Recht. Sollten einzelne Bestimmungen unwirksam sein, bleibt die Wirksamkeit der übrigen unberührt. Gerichtsstand ist – soweit gesetzlich zulässig – der Sitz der jeweils beklagten Partei.`;

/**
 * Liefert den kanonischen Text zur Berechnung des Dokumenten-Hashes.
 * Nur auf dem Server verwenden (API-Route).
 */
export function getCanonicalContentForHash(): string {
  return `${NDA_VERSION}\n\n${CANONICAL_NDA_TEXT}`;
}
