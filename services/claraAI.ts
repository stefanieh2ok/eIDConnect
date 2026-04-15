import { ClaraAnalysis, ClaraPreferences, ClaraMessage } from '@/types/clara';
import { VotingCard } from '@/types';

export class ClaraAI {
  private preferences: ClaraPreferences;
  private personalizationEnabled: boolean;
  private apiBaseUrl: string;

  constructor(preferences: ClaraPreferences, personalizationEnabled: boolean) {
    this.preferences = preferences;
    this.personalizationEnabled = personalizationEnabled;
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  updatePreferences(preferences: ClaraPreferences) {
    this.preferences = preferences;
  }

  analyzeVotingCard(card: VotingCard): ClaraAnalysis {
    // Wenn keine Einwilligung zur Personalisierung vorliegt, arbeiten wir neutral (keine Ableitung aus
    // Politik-Schwerpunkten). Das ist datenminimierend und verhindert ungewollte Beeinflussung.
    const personalMatch = this.personalizationEnabled ? this.calculatePersonalMatch(card) : 50;
    const reasoning = this.personalizationEnabled
      ? this.generateReasoning(card, personalMatch)
      : this.generateNeutralReasoning(card);

    const pros = this.personalizationEnabled ? this.generatePersonalizedPros(card) : this.generateNeutralPros(card);
    const cons = this.personalizationEnabled ? this.generatePersonalizedCons(card) : this.generateNeutralCons(card);
    const recommendation = this.personalizationEnabled ? this.getRecommendation(personalMatch) : undefined;
    const confidence = this.personalizationEnabled ? this.calculateConfidence(personalMatch, card) : 60;
    const alternativePerspectives = this.generateAlternativePerspectives(card);

    return {
      cardId: card.id,
      personalMatch,
      reasoning,
      pros,
      cons,
      recommendation,
      confidence,
      alternativePerspectives
    };
  }

  private calculatePersonalMatch(card: VotingCard): number {
    let match = 0;
    let totalWeight = 0;

    // Umwelt & Klima
    if (card.category.includes('Umwelt') || card.category.includes('Energie')) {
      match += this.preferences.umwelt * 0.3;
      totalWeight += 0.3;
    }

    // Finanzen & Wirtschaft
    if (card.category.includes('Finanzen') || card.category.includes('Wirtschaft')) {
      match += this.preferences.finanzen * 0.25;
      totalWeight += 0.25;
    }

    // Bildung & Forschung
    if (card.category.includes('Bildung') || card.category.includes('Forschung')) {
      match += this.preferences.bildung * 0.2;
      totalWeight += 0.2;
    }

    // Digitalisierung
    if (card.category.includes('Digital') || card.title.includes('Digital')) {
      match += this.preferences.digital * 0.15;
      totalWeight += 0.15;
    }

    // Soziales & Gesundheit
    if (card.category.includes('Sozial') || card.category.includes('Gesundheit')) {
      match += this.preferences.soziales * 0.1;
      totalWeight += 0.1;
    }

    return totalWeight > 0 ? Math.round(match / totalWeight) : 50;
  }

  private generateReasoning(card: VotingCard, match: number): string {
    const highMatch = match > 75;
    const mediumMatch = match > 50;
    
    if (highMatch) {
      return `Basierend auf deinen Präferenzen (${this.getTopPreference()}) ist diese Abstimmung sehr gut auf dich zugeschnitten. Die Auswirkungen entsprechen deinen Prioritäten.`;
    } else if (mediumMatch) {
      return `Diese Abstimmung passt teilweise zu deinen Präferenzen. Es gibt sowohl positive als auch neutrale Aspekte für dich.`;
    } else {
      return `Diese Abstimmung entspricht nicht vollständig deinen Hauptinteressen. Lass mich dir die wichtigsten Punkte erklären.`;
    }
  }

  private getTopPreference(): string {
    const prefs = Object.entries(this.preferences);
    const sorted = prefs.sort(([,a], [,b]) => b - a);
    const [key, value] = sorted[0];
    
    const names: Record<string, string> = {
      umwelt: 'Umwelt & Klima',
      finanzen: 'Finanzen & Wirtschaft',
      bildung: 'Bildung & Forschung',
      digital: 'Digitalisierung',
      soziales: 'Soziales & Gesundheit',
      sicherheit: 'Sicherheit & Verteidigung'
    };
    
    return `${names[key]} (${value}%)`;
  }

  private generatePersonalizedPros(card: VotingCard): string[] {
    const pros: string[] = [];
    
    if (this.preferences.umwelt > 70 && card.category.includes('Umwelt')) {
      pros.push('Stärkt deine Umweltprioritäten und trägt zum Klimaschutz bei');
    }
    
    if (this.preferences.finanzen > 70 && card.category.includes('Finanzen')) {
      pros.push('Entspricht deinen wirtschaftlichen Interessen und Prioritäten');
    }
    
    if (this.preferences.bildung > 70 && card.category.includes('Bildung')) {
      pros.push('Fördert deine bildungspolitischen Ziele');
    }
    
    if (this.preferences.digital > 70 && card.title.includes('Digital')) {
      pros.push('Unterstützt deine Digitalisierungsagenda');
    }
    
    const factualPros = this.buildFactualPros(card);
    const merged = [...pros, ...factualPros];
    return merged.length > 0 ? merged.slice(0, 4) : ['Generelle positive Auswirkungen erwartet'];
  }

  private generatePersonalizedCons(card: VotingCard): string[] {
    const cons: string[] = [];
    
    if (this.preferences.umwelt < 30 && card.category.includes('Umwelt')) {
      cons.push('Möglicherweise nicht deine höchste Priorität');
    }
    
    if (this.preferences.finanzen < 30 && card.category.includes('Finanzen')) {
      cons.push('Finanzielle Auswirkungen könnten deine anderen Prioritäten beeinträchtigen');
    }
    
    const factualCons = this.buildFactualCons(card);
    const merged = [...cons, ...factualCons];
    return merged.length > 0
      ? merged.slice(0, 4)
      : ['Keine spezifischen Bedenken basierend auf deinen Präferenzen'];
  }

  private getRecommendation(match: number): 'strong_yes' | 'yes' | 'neutral' | 'no' | 'strong_no' {
    if (match > 85) return 'strong_yes';
    if (match > 70) return 'yes';
    if (match > 40) return 'neutral';
    if (match > 25) return 'no';
    return 'strong_no';
  }

  private calculateConfidence(match: number, card: VotingCard): number {
    let confidence = Math.abs(match - 50) * 1.5; // Higher confidence for extreme matches
    confidence = Math.min(confidence, 95);
    confidence = Math.max(confidence, 60);
    return Math.round(confidence);
  }

  private generateAlternativePerspectives(card: VotingCard): string[] {
    return [
      'Betrachte auch die langfristigen Auswirkungen über deine aktuellen Prioritäten hinaus',
      'Überlege, wie sich diese Entscheidung auf andere Bereiche auswirken könnte',
      'Denke an die gesellschaftlichen Auswirkungen für alle Bürger'
    ];
  }

  private generateNeutralReasoning(card: VotingCard): string {
    const facts = card.quickFacts?.slice(0, 2).join(' · ') || 'Keine Kurzfakten vorhanden';
    const fiscal = this.buildFiscalSnapshot(card);
    return `Neutrale Einordnung zu "${card.title}" (${card.category}): Der Vorschlag wird aktuell mit ${card.yes}% Dafür, ${card.no}% Dagegen und ${card.abstain}% Enthaltungen bewertet (${card.votes.toLocaleString('de-DE')} Abstimmende). Wichtige Punkte aus der Vorlage: ${facts}. ${fiscal}`;
  }

  private generateNeutralPros(card: VotingCard): string[] {
    const fromAnalysis = card.kiAnalysis?.pros?.map((pro) => pro.text).filter(Boolean) ?? [];
    const factualPros = this.buildFactualPros(card);
    const quickFacts = (card.quickFacts?.slice(0, 2) ?? []).map((fact) => `Möglicher Vorteil laut Vorlage: ${fact}`);
    const merged = [...fromAnalysis, ...factualPros, ...quickFacts];
    return merged.length > 0
      ? merged.slice(0, 4)
      : ['Potenzielle Vorteile sind von Umsetzung, Finanzierung und Zeitplan abhängig.'];
  }

  private generateNeutralCons(card: VotingCard): string[] {
    const fromAnalysis = card.kiAnalysis?.cons?.map((con) => con.text).filter(Boolean) ?? [];
    const factualCons = this.buildFactualCons(card);
    const leadCon = card.quickFacts?.find((fact) => /(risiko|kosten|aufwand|kritik|belastung)/i.test(fact));
    const merged = [...fromAnalysis, ...factualCons, ...(leadCon ? [`Möglicher Nachteil laut Vorlage: ${leadCon}`] : [])];
    return merged.length > 0
      ? merged.slice(0, 4)
      : ['Mögliche Nachteile können Kosten, Umsetzungsaufwand oder Zielkonflikte sein.'];
  }

  private buildNumericFactLines(card: VotingCard): string[] {
    const lines: string[] = [];
    lines.push(
      `Zwischenstand: ${card.yes}% dafür, ${card.no}% dagegen, ${card.abstain}% Enthaltungen bei ${card.votes.toLocaleString('de-DE')} Stimmen.`
    );

    const sourceFacts = [
      ...(card.quickFacts ?? []),
      card.kiAnalysis?.financialImpact ?? '',
      card.kiAnalysis?.environmentalImpact ?? '',
    ]
      .filter(Boolean)
      .map((x) => x.trim());

    const numericFacts = sourceFacts.filter((fact) =>
      /(\d+[.,]?\d*\s?(€|EUR|%|Mio|Mrd|kWh|t|Tonnen|Jahre|Monat|Monate|Jahr)|haushalt|belastung|kosten)/i.test(
        fact
      )
    );
    for (const fact of numericFacts.slice(0, 3)) {
      lines.push(`Fakt: ${fact}`);
    }
    return lines;
  }

  private buildFiscalSnapshot(card: VotingCard): string {
    const fiscalSource = [card.kiAnalysis?.financialImpact, ...(card.quickFacts ?? [])]
      .filter(Boolean)
      .find((text) => /(haushalt|kosten|belastung|invest|finanz|steuer|einspar)/i.test(text));
    if (!fiscalSource) {
      return 'Haushaltswirkung: In der Vorlage sind derzeit keine belastbaren Euro-Beträge ausgewiesen.';
    }
    return `Haushaltswirkung: ${fiscalSource}`;
  }

  private buildFactualPros(card: VotingCard): string[] {
    const lines = this.buildNumericFactLines(card);
    const fiscal = this.buildFiscalSnapshot(card);
    return [`Zahlenbasis Pro-Einordnung: ${lines[0]}`, `Einordnung zu Nutzen/Kosten: ${fiscal}`];
  }

  private buildFactualCons(card: VotingCard): string[] {
    const lines = this.buildNumericFactLines(card);
    const riskFact =
      [card.kiAnalysis?.financialImpact, ...(card.quickFacts ?? [])]
        .filter(Boolean)
        .find((text) => /(risiko|mehrkosten|belastung|verzug|aufwand|folgekosten)/i.test(text)) ??
      'Es sind potenzielle Mehrkosten und Folgekosten zu prüfen.';
    return [`Zahlenbasis Contra-Einordnung: ${lines[0]}`, `Risiko-/Belastungsfaktor: ${riskFact}`];
  }

  async generateChatResponse(userMessage: string, context?: any): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/clara/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          context,
          // Datenminimierung: Präferenzen nur senden, wenn explizite Einwilligung vorliegt.
          preferences: this.personalizationEnabled ? this.preferences : undefined
        })
      });

      if (!response.ok) {
        throw new Error('API-Fehler');
      }

      const data = await response.json();
      return data.response;
    } catch (error) {
      console.error('Clara Chat API Fehler:', error);
      return this.getFallbackResponse(userMessage);
    }
  }

  private getFallbackResponse(userMessage: string): string {
    const message = userMessage.toLowerCase();
    
    if (message.includes('hallo') || message.includes('hi')) {
      return `Hallo! Ich bin Clara, dein KI-Assistent für politische Informationen. Wie kann ich dir heute helfen?`;
    }
    
    if (message.includes('erklär') || message.includes('was bedeutet')) {
      return `Gerne erkläre ich dir die Details. Ich kann die relevanten Aspekte sachlich einordnen – ohne Wahlempfehlung.`;
    }
    
    if (message.includes('empfehlung') || message.includes('soll ich')) {
      return `Ich kann Ihnen / dir keine Abstimmungs-Empfehlung geben (also kein „dafür/dagegen“). Ich kann aber erklären, warum die Abstimmung zu Ihren / deinen Schwerpunkten passt und welche Argumente dafür bzw. dagegen relevant sind. Wollen Sie / willst du, dass ich die wichtigsten Punkte dazu zusammenfasse?`;
    }
    
    if (message.includes('danke') || message.includes('dankeschön')) {
      return `Gerne geschehen! Ich bin hier, um dir bei politischen Entscheidungen zu helfen.`;
    }
    
    return `Das ist eine interessante Frage! Ich kann dir die relevanten Informationen und Argumente neutral zusammenfassen.`;
  }

  generateVoiceGreeting(): string {
    return this.personalizationEnabled
      ? `Hallo! Ich bin Clara. Ich helfe dir, Informationen neutral zu verstehen und einzuordnen – passend zu deinen Präferenzen. Wobei kann ich dir heute helfen?`
      : `Hallo! Ich bin Clara. Ich helfe dir, Informationen neutral zu verstehen und einzuordnen. Wobei kann ich dir heute helfen?`;
  }

  async generateDeepDiveAnalysis(card: VotingCard): Promise<string> {
    try {
      const response = await fetch(`${this.apiBaseUrl}/clara/analyze`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          votingCard: card,
          // Datenminimierung: Präferenzen nur senden, wenn explizite Einwilligung vorliegt.
          preferences: this.personalizationEnabled ? this.preferences : undefined
        })
      });

      if (!response.ok) {
        throw new Error('API-Fehler');
      }

      const data = await response.json();
      const analysis = data.analysis;
      
      const intro = this.personalizationEnabled
        ? `Basierend auf deinem Politik-Barometer (${this.getTopPreference()}) ist deine Übereinstimmung ${analysis.personalMatch}%.`
        : `Neutrale Tiefenanalyse für "${card.title}" ohne personalisierte Schwerpunkte.`;

      const aspectsLabel = this.personalizationEnabled
        ? 'Wichtige Aspekte (für deine Schwerpunkte relevant):'
        : 'Wichtige Aspekte (für eine eigene Entscheidung):';

      const numericEvidence = this.buildNumericFactLines(card);
      return `Tiefenanalyse für "${card.title}": 

${intro}

${analysis.reasoning}

${aspectsLabel}
${analysis.pros.map((pro: string) => `• ${pro}`).join('\n')}

${analysis.cons.length > 0 ? `Bedenken:\n${analysis.cons.map((con: string) => `• ${con}`).join('\n')}` : ''}

Zahlen- und Faktenbasis:
${numericEvidence.map((line) => `• ${line}`).join('\n')}
• ${this.buildFiscalSnapshot(card)}

Alternative Perspektiven:
${analysis.alternativePerspectives.map((perspective: string) => `• ${perspective}`).join('\n')}

Hinweis: Clara gibt keine „dafür/dagegen“-Empfehlung.`;
    } catch (error) {
      console.error('Clara Analyse API Fehler:', error);
      return this.getFallbackAnalysis(card);
    }
  }

  private getFallbackAnalysis(card: VotingCard): string {
    const analysis = this.analyzeVotingCard(card);
    const intro = this.personalizationEnabled
      ? `Basierend auf deinem Politik-Barometer (${this.getTopPreference()}) ist deine Übereinstimmung ${analysis.personalMatch}%.`
      : `Neutrale Tiefenanalyse für "${card.title}" ohne personalisierte Schwerpunkte.`;

    const aspectsLabel = this.personalizationEnabled
      ? 'Wichtige Aspekte (für deine Schwerpunkte relevant):'
      : 'Wichtige Aspekte (für eine eigene Entscheidung):';

    const numericEvidence = this.buildNumericFactLines(card);
    return `Tiefenanalyse für "${card.title}": 

${intro}

${analysis.reasoning}

${aspectsLabel}
${analysis.pros.map(pro => `• ${pro}`).join('\n')}

${analysis.cons.length > 0 ? `Bedenken:\n${analysis.cons.map(con => `• ${con}`).join('\n')}` : ''}

Zahlen- und Faktenbasis:
${numericEvidence.map((line) => `• ${line}`).join('\n')}
• ${this.buildFiscalSnapshot(card)}

Alternative Perspektiven:
${analysis.alternativePerspectives.map(perspective => `• ${perspective}`).join('\n')}

Hinweis: Clara gibt keine „dafür/dagegen“-Empfehlung.`;
  }

  // getRecommendationText wird nicht mehr verwendet (Abstimmungs-Empfehlungen sind tabu).
}
