import { ClaraAnalysis, ClaraPreferences } from '@/types/clara';
import { VotingCard } from '@/types';
import type { AddressMode } from '@/lib/clara-system-prompt';
import { ensureStructuredClaraResponse } from '@/lib/clara-response-format';

/**
 * Clara KI-Service (Client-seitig)
 *
 * Implementiert die Prinzipien aus Clara System Prompt v5:
 * - Strikte Neutralität (keine Empfehlungen, kein Framing)
 * - Sie/Du-sensitive Formulierungen
 * - Personalisierung nur bei ausdrücklicher Einwilligung
 * - Thematische Relevanz statt „personalMatch"
 */
export class ClaraAI {
  private preferences: ClaraPreferences;
  private personalizationEnabled: boolean;
  private addressMode: AddressMode;
  private apiBaseUrl: string;
  private lastChatSafeMode = false;

  constructor(
    preferences: ClaraPreferences,
    personalizationEnabled: boolean,
    addressMode: AddressMode = 'du',
  ) {
    this.preferences = preferences;
    this.personalizationEnabled = personalizationEnabled;
    this.addressMode = addressMode;
    // In der App immer relativ zum gleichen Origin aufrufen.
    // NEXT_PUBLIC_API_URL hat in Dev/Preview häufig falsche Ports/Hosts verursacht.
    this.apiBaseUrl = '/api';
  }

  private t(du: string, sie: string): string {
    return this.addressMode === 'sie' ? sie : du;
  }

  updatePreferences(preferences: ClaraPreferences) {
    this.preferences = preferences;
  }

  analyzeVotingCard(card: VotingCard): ClaraAnalysis {
    const personalMatch = this.personalizationEnabled
      ? this.calculateThematicRelevance(card)
      : 50;

    let reasoning = this.personalizationEnabled
      ? this.generateNeutralReasoning(card, personalMatch)
      : this.t(
          'Neutrale Übersicht: Clara gibt keine Abstimmungsempfehlung. Ich kann dir die sachlichen Pro- und Contra-Argumente zusammenfassen, damit du dir eine eigene Meinung bilden kannst.',
          'Neutrale Übersicht: Clara gibt keine Abstimmungsempfehlung. Ich kann Ihnen die sachlichen Pro- und Contra-Argumente zusammenfassen, damit Sie sich eine eigene Meinung bilden können.',
        );
    if (card.quickFacts?.length) {
      reasoning = `${reasoning} Demo-Zahlen (aus Karteninhalt): ${card.quickFacts.join(' · ')}.`;
    }

    const fromCardPro = card.kiAnalysis?.pros?.map((p) => p.text).filter(Boolean) ?? [];
    const fromCardCon = card.kiAnalysis?.cons?.map((c) => c.text).filter(Boolean) ?? [];

    const pros =
      this.personalizationEnabled
        ? this.generateContextualPros(card)
        : fromCardPro.length > 0
          ? fromCardPro
          : [
              this.t(
                'In dieser Demo-Karte sind keine gesonderten Pro-Texte hinterlegt.',
                'In dieser Demo-Karte sind keine gesonderten Pro-Texte hinterlegt.',
              ),
            ];
    const cons =
      this.personalizationEnabled
        ? this.generateContextualCons(card)
        : fromCardCon.length > 0
          ? fromCardCon
          : [
              this.t(
                'In dieser Demo-Karte sind keine gesonderten Contra-Texte hinterlegt.',
                'In dieser Demo-Karte sind keine gesonderten Contra-Texte hinterlegt.',
              ),
            ];
    const confidence = this.personalizationEnabled
      ? this.calculateConfidence(personalMatch, card)
      : 60;
    const alternativePerspectives = this.generateAlternativePerspectives();

    return {
      cardId: card.id,
      personalMatch,
      reasoning,
      pros,
      cons,
      confidence,
      alternativePerspectives,
    };
  }

  private calculateThematicRelevance(card: VotingCard): number {
    let relevance = 0;
    let totalWeight = 0;

    if (card.category.includes('Umwelt') || card.category.includes('Energie')) {
      relevance += this.preferences.umwelt * 0.3;
      totalWeight += 0.3;
    }
    if (card.category.includes('Finanzen') || card.category.includes('Wirtschaft')) {
      relevance += this.preferences.finanzen * 0.25;
      totalWeight += 0.25;
    }
    if (card.category.includes('Bildung') || card.category.includes('Forschung')) {
      relevance += this.preferences.bildung * 0.2;
      totalWeight += 0.2;
    }
    if (card.category.includes('Digital') || card.title.includes('Digital')) {
      relevance += this.preferences.digital * 0.15;
      totalWeight += 0.15;
    }
    if (card.category.includes('Sozial') || card.category.includes('Gesundheit')) {
      relevance += this.preferences.soziales * 0.1;
      totalWeight += 0.1;
    }

    return totalWeight > 0 ? Math.round(relevance / totalWeight) : 50;
  }

  private generateNeutralReasoning(card: VotingCard, relevance: number): string {
    const topTheme = this.getTopPreference();
    if (relevance > 70) {
      return this.t(
        `Dieses Thema hat eine hohe thematische Nähe zu deinen aktiv gewählten Sachthemen (${topTheme}). KI-gestützte Zusammenfassung: Die folgenden Argumente können bei einer eigenen Einschätzung helfen.`,
        `Dieses Thema hat eine hohe thematische Nähe zu Ihren aktiv gewählten Sachthemen (${topTheme}). KI-gestützte Zusammenfassung: Die folgenden Argumente können bei einer eigenen Einschätzung helfen.`,
      );
    }
    if (relevance > 45) {
      return this.t(
        `Dieses Thema berührt teilweise deine gewählten Sachthemen. Nachfolgend eine sachliche Zusammenfassung der relevanten Aspekte.`,
        `Dieses Thema berührt teilweise Ihre gewählten Sachthemen. Nachfolgend eine sachliche Zusammenfassung der relevanten Aspekte.`,
      );
    }
    return this.t(
      `Dieses Thema liegt außerhalb deiner hauptsächlich gewählten Sachthemen. Hier sind die sachlichen Argumente für eine eigene Einschätzung.`,
      `Dieses Thema liegt außerhalb Ihrer hauptsächlich gewählten Sachthemen. Hier sind die sachlichen Argumente für eine eigene Einschätzung.`,
    );
  }

  private getTopPreference(): string {
    const prefs = Object.entries(this.preferences);
    const sorted = prefs.sort(([, a], [, b]) => b - a);
    const [key] = sorted[0];

    const names: Record<string, string> = {
      umwelt: 'Umwelt & Klima',
      finanzen: 'Finanzen & Wirtschaft',
      bildung: 'Bildung & Forschung',
      digital: 'Digitalisierung',
      soziales: 'Soziales & Gesundheit',
      sicherheit: 'Sicherheit & Verteidigung',
    };

    return names[key] || key;
  }

  private generateContextualPros(card: VotingCard): string[] {
    const pros: string[] = [];

    if (card.kiAnalysis?.pros) {
      pros.push(...card.kiAnalysis.pros.map((p) => p.text));
    }

    if (pros.length === 0) {
      pros.push('KI-gestützte Zusammenfassung: Sachliche Vorteile werden analysiert');
    }

    return pros;
  }

  private generateContextualCons(card: VotingCard): string[] {
    const cons: string[] = [];

    if (card.kiAnalysis?.cons) {
      cons.push(...card.kiAnalysis.cons.map((c) => c.text));
    }

    if (cons.length === 0) {
      cons.push('KI-gestützte Zusammenfassung: Sachliche Gegenargumente werden analysiert');
    }

    return cons;
  }

  private calculateConfidence(_relevance: number, _card: VotingCard): number {
    return 70;
  }

  private generateAlternativePerspectives(): string[] {
    return [
      this.t(
        'Betrachte auch langfristige Auswirkungen über die aktuelle Diskussion hinaus',
        'Betrachten Sie auch langfristige Auswirkungen über die aktuelle Diskussion hinaus',
      ),
      this.t(
        'Überlege, wie sich diese Entscheidung auf verschiedene Bevölkerungsgruppen auswirken könnte',
        'Überlegen Sie, wie sich diese Entscheidung auf verschiedene Bevölkerungsgruppen auswirken könnte',
      ),
      this.t(
        'Prüfe die offiziellen Quellen und Unterlagen für weitere Details',
        'Prüfen Sie die offiziellen Quellen und Unterlagen für weitere Details',
      ),
    ];
  }

  async generateChatResponse(userMessage: string, context?: string): Promise<string> {
    try {
      this.lastChatSafeMode = false;
      const response = await fetch(`${this.apiBaseUrl}/clara/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage,
          context,
          addressMode: this.addressMode,
          preferences: this.personalizationEnabled ? this.preferences : undefined,
        }),
      });

      if (!response.ok) throw new Error('API-Fehler');

      const data = await response.json();
      const raw = String(data.response || '');
      const enforced = this.enforceSafeOutput(raw);
      this.lastChatSafeMode = enforced.safeModeUsed;
      return ensureStructuredClaraResponse(enforced.text, this.addressMode);
    } catch (error) {
      console.error('Clara Chat API Fehler:', error);
      this.lastChatSafeMode = true;
      return ensureStructuredClaraResponse(this.getFallbackResponse(userMessage), this.addressMode);
    }
  }

  private enforceSafeOutput(text: string): { text: string; safeModeUsed: boolean } {
    const t = text.trim();
    if (!t) {
      return { text: this.safeNoVerifiedSource(), safeModeUsed: true };
    }
    const riskyRecommendation = /(ich empfehle|du solltest|sie sollten|waehle|wahlen sie|stimme fuer|stimme gegen|am besten passend)/i;
    if (riskyRecommendation.test(t)) {
      return {
        text: this.t(
        'Ich bleibe neutral und gebe keine politische Empfehlung. Dazu liegt mir hier keine verifizierte offizielle Quelle vor.',
        'Ich bleibe neutral und gebe keine politische Empfehlung. Dazu liegt mir hier keine verifizierte offizielle Quelle vor.',
        ),
        safeModeUsed: true,
      };
    }
    return { text: t, safeModeUsed: false };
  }

  private safeNoVerifiedSource(): string {
    return 'Dazu liegt mir hier keine verifizierte offizielle Quelle vor.';
  }

  private getFallbackResponse(userMessage: string): string {
    const msg = userMessage.toLowerCase();

    if (msg.includes('hallo') || msg.includes('hi') || msg.includes('guten tag')) {
      return this.t(
        'Clara ist derzeit nur eingeschraenkt verfuegbar (Safe Mode). Ich helfe dir neutral bei Verfahrensfragen zu Orientierung, Meldungen, Beteiligung, Wahlen und Terminen.',
        'Clara ist derzeit nur eingeschraenkt verfuegbar (Safe Mode). Ich helfe Ihnen neutral bei Verfahrensfragen zu Orientierung, Meldungen, Beteiligung, Wahlen und Terminen.',
      );
    }

    if (
      msg.includes('wie funktioniert') ||
      msg.includes('erklaer') ||
      msg.includes('was bedeutet') ||
      msg.includes('frist') ||
      msg.includes('ablauf') ||
      msg.includes('buergerbegehren') ||
      msg.includes('meldung')
    ) {
      return this.t(
        'Safe Mode: Ich erklaere dir gern den Ablauf neutral. Fuer verbindliche Inhalte nutze bitte die offiziellen Stellen und Unterlagen.',
        'Safe Mode: Ich erklaere Ihnen gern den Ablauf neutral. Fuer verbindliche Inhalte nutzen Sie bitte die offiziellen Stellen und Unterlagen.',
      );
    }

    if (msg.includes('empfehlung') || msg.includes('soll ich') || msg.includes('was wuerdest')) {
      return this.t(
        'Ich gebe keine politische Empfehlung. Dazu liegt mir hier keine verifizierte offizielle Quelle vor.',
        'Ich gebe keine politische Empfehlung. Dazu liegt mir hier keine verifizierte offizielle Quelle vor.',
      );
    }

    if (msg.includes('danke') || msg.includes('dankeschoen')) {
      return this.t(
        'Gern. Solange Safe Mode aktiv ist, antworte ich nur neutral und verfahrensorientiert.',
        'Gern. Solange Safe Mode aktiv ist, antworte ich nur neutral und verfahrensorientiert.',
      );
    }

    return this.safeNoVerifiedSource();
  }

  public wasLastChatSafeMode(): boolean {
    return this.lastChatSafeMode;
  }

  generateVoiceGreeting(): string {
    return this.t(
      'Hallo! Ich bin Clara, deine digitale Assistentin für demokratische Orientierung. Ich helfe dir, Informationen neutral zu verstehen und Beteiligungsmöglichkeiten zu finden. Wobei kann ich dir helfen?',
      'Hallo! Ich bin Clara, Ihre digitale Assistentin für demokratische Orientierung. Ich helfe Ihnen, Informationen neutral zu verstehen und Beteiligungsmöglichkeiten zu finden. Wobei kann ich Ihnen helfen?',
    );
  }

  async generateDeepDiveAnalysis(card: VotingCard): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/clara/analyze`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          votingCard: card,
          addressMode: this.addressMode,
          preferences: this.personalizationEnabled ? this.preferences : undefined,
        }),
      });

      if (!response.ok) throw new Error('API-Fehler');

      const data = await response.json();
      const analysis = data.analysis ?? {};

      const prosList = Array.isArray(analysis.pros) ? analysis.pros.filter((p: unknown) => typeof p === 'string') : [];
      const consList = Array.isArray(analysis.cons) ? analysis.cons.filter((p: unknown) => typeof p === 'string') : [];
      const altList = Array.isArray(analysis.alternativePerspectives)
        ? analysis.alternativePerspectives.filter((p: unknown) => typeof p === 'string')
        : [];

      const intro = this.personalizationEnabled
        ? this.t(
            `Thematische Relevanz (basierend auf deinen aktiv gewählten Sachthemen: ${this.getTopPreference()}): ${analysis.personalMatch}%.`,
            `Thematische Relevanz (basierend auf Ihren aktiv gewählten Sachthemen: ${this.getTopPreference()}): ${analysis.personalMatch}%.`,
          )
        : `KI-gestützte Zusammenfassung für „${card.title}" – ohne personalisierte Sachthemen.`;

      const reasoningText = typeof analysis.reasoning === 'string' ? analysis.reasoning : '';
      const fallbackFromCard = this.analyzeVotingCard(card);
      const prosOut = prosList.length ? prosList : fallbackFromCard.pros;
      const consOut = consList.length ? consList : fallbackFromCard.cons;
      const altOut = altList.length ? altList : fallbackFromCard.alternativePerspectives;

      return `${intro}

${reasoningText || fallbackFromCard.reasoning}

Sachliche Pro-Argumente:
${prosOut.map((pro: string) => `• ${pro}`).join('\n')}

Sachliche Contra-Argumente:
${consOut.map((con: string) => `• ${con}`).join('\n')}

Weitere Perspektiven:
${altOut.map((p: string) => `• ${p}`).join('\n')}

Dies ist eine KI-gestützte Zusammenfassung. Clara gibt keine Abstimmungsempfehlung. ${this.t('Bitte prüfe die offiziellen Quellen.', 'Bitte prüfen Sie die offiziellen Quellen.')}`;
    } catch (error) {
      console.error('Clara Analyse API Fehler:', error);
      return this.getFallbackAnalysis(card);
    }
  }

  private getFallbackAnalysis(card: VotingCard): string {
    const analysis = this.analyzeVotingCard(card);

    const intro = this.personalizationEnabled
      ? this.t(
          `Thematische Relevanz (basierend auf deinen aktiv gewählten Sachthemen: ${this.getTopPreference()}): ${analysis.personalMatch}%.`,
          `Thematische Relevanz (basierend auf Ihren aktiv gewählten Sachthemen: ${this.getTopPreference()}): ${analysis.personalMatch}%.`,
        )
      : `KI-gestützte Zusammenfassung für „${card.title}" – ohne personalisierte Sachthemen.`;

    return `${intro}

${analysis.reasoning}

Sachliche Pro-Argumente:
${analysis.pros.map((pro) => `• ${pro}`).join('\n')}

Sachliche Contra-Argumente:
${analysis.cons.map((con) => `• ${con}`).join('\n')}

Weitere Perspektiven:
${analysis.alternativePerspectives.map((p) => `• ${p}`).join('\n')}

Dies ist eine KI-gestützte Zusammenfassung. Clara gibt keine Abstimmungsempfehlung. ${this.t('Bitte prüfe die offiziellen Quellen.', 'Bitte prüfen Sie die offiziellen Quellen.')}`;
  }
}
