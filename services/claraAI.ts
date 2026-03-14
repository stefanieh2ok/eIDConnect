import { ClaraAnalysis, ClaraPreferences, ClaraMessage } from '@/types/clara';
import { VotingCard } from '@/types';

export class ClaraAI {
  private preferences: ClaraPreferences;
  private apiBaseUrl: string;

  constructor(preferences: ClaraPreferences) {
    this.preferences = preferences;
    this.apiBaseUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
  }

  updatePreferences(preferences: ClaraPreferences) {
    this.preferences = preferences;
  }

  analyzeVotingCard(card: VotingCard): ClaraAnalysis {
    const personalMatch = this.calculatePersonalMatch(card);
    const reasoning = this.generateReasoning(card, personalMatch);
    const pros = this.generatePersonalizedPros(card);
    const cons = this.generatePersonalizedCons(card);
    const recommendation = this.getRecommendation(personalMatch);
    const confidence = this.calculateConfidence(personalMatch, card);
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
    
    return pros.length > 0 ? pros : ['Generelle positive Auswirkungen erwartet'];
  }

  private generatePersonalizedCons(card: VotingCard): string[] {
    const cons: string[] = [];
    
    if (this.preferences.umwelt < 30 && card.category.includes('Umwelt')) {
      cons.push('Möglicherweise nicht deine höchste Priorität');
    }
    
    if (this.preferences.finanzen < 30 && card.category.includes('Finanzen')) {
      cons.push('Finanzielle Auswirkungen könnten deine anderen Prioritäten beeinträchtigen');
    }
    
    return cons.length > 0 ? cons : ['Keine spezifischen Bedenken basierend auf deinen Präferenzen'];
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
          preferences: this.preferences
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
      return `Hallo! Ich bin Clara, deine KI-Assistentin für politische Entscheidungen. Wie kann ich dir heute helfen?`;
    }
    
    if (message.includes('erklär') || message.includes('was bedeutet')) {
      return `Gerne erkläre ich dir die Details! Basierend auf deinen Präferenzen kann ich dir eine personalisierte Analyse anbieten.`;
    }
    
    if (message.includes('empfehlung') || message.includes('soll ich')) {
      return `Meine Empfehlung basiert auf deinem Politik-Barometer. Lass mich die Abstimmung für dich analysieren.`;
    }
    
    if (message.includes('danke') || message.includes('dankeschön')) {
      return `Gerne geschehen! Ich bin hier, um dir bei politischen Entscheidungen zu helfen.`;
    }
    
    return `Das ist eine interessante Frage! Basierend auf deinen Präferenzen kann ich dir eine detaillierte Analyse anbieten. Möchtest du, dass ich die aktuelle Abstimmung für dich durchgehe?`;
  }

  generateVoiceGreeting(): string {
    return `Hallo! Ich bin Clara, deine persönliche KI-Assistentin. Ich helfe dir dabei, politische Entscheidungen basierend auf deinen Präferenzen zu treffen. Wie kann ich dir heute helfen?`;
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
          preferences: this.preferences
        })
      });

      if (!response.ok) {
        throw new Error('API-Fehler');
      }

      const data = await response.json();
      const analysis = data.analysis;
      
      return `Tiefenanalyse für "${card.title}": 

Basierend auf deinem Politik-Barometer (${this.getTopPreference()}) ist deine Übereinstimmung ${analysis.personalMatch}%.

${analysis.reasoning}

Meine Empfehlung: ${this.getRecommendationText(analysis.recommendation)} (${analysis.confidence}% Vertrauen)

Wichtige Punkte für dich:
${analysis.pros.map((pro: string) => `• ${pro}`).join('\n')}

${analysis.cons.length > 0 ? `Bedenken:\n${analysis.cons.map((con: string) => `• ${con}`).join('\n')}` : ''}

Alternative Perspektiven:
${analysis.alternativePerspectives.map((perspective: string) => `• ${perspective}`).join('\n')}`;
    } catch (error) {
      console.error('Clara Analyse API Fehler:', error);
      return this.getFallbackAnalysis(card);
    }
  }

  private getFallbackAnalysis(card: VotingCard): string {
    const analysis = this.analyzeVotingCard(card);
    
    return `Tiefenanalyse für "${card.title}": 

Basierend auf deinem Politik-Barometer (${this.getTopPreference()}) ist deine Übereinstimmung ${analysis.personalMatch}%.

${analysis.reasoning}

Meine Empfehlung: ${this.getRecommendationText(analysis.recommendation)} (${analysis.confidence}% Vertrauen)

Wichtige Punkte für dich:
${analysis.pros.map(pro => `• ${pro}`).join('\n')}

${analysis.cons.length > 0 ? `Bedenken:\n${analysis.cons.map(con => `• ${con}`).join('\n')}` : ''}

Alternative Perspektiven:
${analysis.alternativePerspectives.map(perspective => `• ${perspective}`).join('\n')}`;
  }

  private getRecommendationText(recommendation: string): string {
    const texts: Record<string, string> = {
      strong_yes: 'Starke Zustimmung empfohlen',
      yes: 'Zustimmung empfohlen',
      neutral: 'Neutrale Haltung angemessen',
      no: 'Ablehnung empfohlen',
      strong_no: 'Starke Ablehnung empfohlen'
    };
    return texts[recommendation] || 'Neutrale Haltung angemessen';
  }
}
