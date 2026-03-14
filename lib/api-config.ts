/**
 * API Configuration für eIDConnect
 * Verwaltet API-Schlüssel und Endpunkte für verschiedene KI-Services
 */

export interface APIConfig {
  openai: {
    apiKey: string;
    baseURL: string;
    model: string;
  };
  alephAlpha?: {
    apiKey: string;
    baseURL: string;
  };
  stackit?: {
    apiKey: string;
    baseURL: string;
  };
}

export const getAPIConfig = (): APIConfig => {
  const openaiApiKey = process.env.OPENAI_API_KEY;
  const alephAlphaApiKey = process.env.ALEPH_ALPHA_API_KEY;
  const stackitApiKey = process.env.STACKIT_API_KEY;

  if (!openaiApiKey) {
    throw new Error('OPENAI_API_KEY ist nicht in den Umgebungsvariablen definiert');
  }

  return {
    openai: {
      apiKey: openaiApiKey,
      baseURL: 'https://api.openai.com/v1',
      model: 'gpt-4'
    },
    ...(alephAlphaApiKey && {
      alephAlpha: {
        apiKey: alephAlphaApiKey,
        baseURL: 'https://api.aleph-alpha.com'
      }
    }),
    ...(stackitApiKey && {
      stackit: {
        apiKey: stackitApiKey,
        baseURL: 'https://api.stackit.de'
      }
    })
  };
};

export const validateAPIKeys = (): { valid: boolean; missing: string[] } => {
  const missing: string[] = [];
  
  if (!process.env.OPENAI_API_KEY) {
    missing.push('OPENAI_API_KEY');
  }
  
  if (!process.env.ALEPH_ALPHA_API_KEY) {
    missing.push('ALEPH_ALPHA_API_KEY (optional)');
  }
  
  if (!process.env.STACKIT_API_KEY) {
    missing.push('STACKIT_API_KEY (optional)');
  }

  return {
    valid: missing.length === 0 || missing.every(key => key.includes('optional')),
    missing
  };
};

// Hilfsfunktion für API-Aufrufe
export const createAPIHeaders = (apiKey: string) => ({
  'Authorization': `Bearer ${apiKey}`,
  'Content-Type': 'application/json',
  'User-Agent': 'eIDConnect/1.0.0'
});

// Rate Limiting Konfiguration
export const RATE_LIMITS = {
  openai: {
    requestsPerMinute: 60,
    tokensPerMinute: 150000
  },
  alephAlpha: {
    requestsPerMinute: 30,
    tokensPerMinute: 100000
  }
};
