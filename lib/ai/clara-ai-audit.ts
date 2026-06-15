import { hashForAudit } from '@/lib/ai/hash-content';
import { insertAuditLog } from '@/lib/security/audit-server';

export const CLARA_SOURCE_LOCK_VERSION = 'clara-system-prompt-v7';

export type ClaraAiChannel = 'chat' | 'analyze' | 'tts';

export type ClaraAiAuditParams = {
  request: Request;
  channel: ClaraAiChannel;
  model: string;
  provider: string;
  inputText: string;
  outputText: string;
  sourceRefs?: string[];
  fallback?: boolean;
  demoId?: string;
};

function requestMeta(request: Request) {
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    request.headers.get('x-real-ip') ??
    null;
  return {
    ip_address: ip,
    user_agent: request.headers.get('user-agent'),
  };
}

/** Persistiert KI-Output-Metadaten ohne Klartext (Hashes nur). Ohne Supabase: Demo-Fallback, nicht persistent. */
export async function logClaraAiOutput(params: ClaraAiAuditParams): Promise<void> {
  const inputHash = hashForAudit(params.inputText);
  const outputHash = hashForAudit(params.outputText);
  const sourceRefsHash = params.sourceRefs?.length
    ? hashForAudit(params.sourceRefs.join('|'))
    : null;

  await insertAuditLog({
    demo_id: params.demoId ?? 'eidconnect',
    event_type: 'clara_ai_output',
    event_data: {
      channel: params.channel,
      model: params.model,
      provider: params.provider,
      source_lock_version: CLARA_SOURCE_LOCK_VERSION,
      input_hash: inputHash,
      output_hash: outputHash,
      source_refs_hash: sourceRefsHash,
      fallback: params.fallback ?? false,
      recorded_at: new Date().toISOString(),
    },
    ...requestMeta(params.request),
  });
}

export { hashForAudit };
