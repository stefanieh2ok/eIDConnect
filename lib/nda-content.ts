/**
 * NDA-Inhalte für Vorschau-Gate und Versionierung.
 * NDA_VERSION bei jeder inhaltlichen Änderung der Vereinbarung erhöhen.
 */

export const NDA_VERSION = '1.0';

/** Kurze, harte Zusammenfassung für den Gate-Screen (oberhalb der Vorschau). */
export const GATE_SUMMARY = {
  /** Fett hervorgehobener Satz. */
  strictSentence:
    'Dieser Zugangs-Link ist personalisiert und ausschließlich für den benannten Empfänger bestimmt. Eine Weiterleitung, gemeinsame Nutzung oder Offenlegung an Dritte ist untersagt.',
  /** Kompakter Vertraulichkeitshinweis (Scroll-Bereich). */
  summaryParagraphs: [
    'Mit dem Öffnen bzw. der Nutzung dieses personalisierten Zugangs-Links bestätigen Sie, dass Sie die bereitgestellten Inhalte ausschließlich zur Prüfung einer möglichen Zusammenarbeit verwenden. Der Link darf nicht an Dritte weitergeleitet oder gemeinsam genutzt werden.',
    'Sämtliche Inhalte der Konzeptvorschau – einschließlich Funktionen, Konzepte, Designs, Texte, Workflows, technischer Strukturen und KI-bezogener Logiken – sind vertraulich und dürfen ohne vorherige schriftliche Zustimmung weder kopiert, gespeichert, dokumentiert, per Screenshot oder Aufnahme festgehalten, weitergegeben noch zur Entwicklung eigener oder fremder Lösungen verwendet werden. Reverse Engineering, Benchmarking und die Eingabe in externe KI-Systeme sind untersagt.',
    'Zugriffe werden zu Sicherheits-, Dokumentations- und Nachweiszwecken technisch protokolliert (u. a. IP-Adresse, Zeitstempel, User-Agent, besuchte Seiten, Session-Dauer). Die Vertraulichkeitsverpflichtungen gelten für fünf Jahre. Im Übrigen gilt die vollständige Geheimhaltungsvereinbarung.',
  ],
};
