import { supabaseAdmin } from '@/lib/supabase-admin';

export type InsertAcceptanceLogInput = {
  tokenId: string;
  demoId: string;
  fullName: string;
  company?: string | null;
  email: string;
  ndaVersion: string;
  ndaDocumentHash: string;
  ipAddress?: string | null;
  userAgent?: string | null;
  referrer?: string | null;
  sessionId?: string | null;
};

export async function insertAcceptanceLog(input: InsertAcceptanceLogInput): Promise<void> {
  const { error } = await supabaseAdmin.from('demo_acceptance_logs').insert({
    token_id: input.tokenId,
    demo_id: input.demoId,
    full_name: input.fullName,
    company: input.company ?? null,
    email: input.email,
    nda_version: input.ndaVersion,
    nda_document_hash: input.ndaDocumentHash,
    accepted_at: new Date().toISOString(),
    ip_address: input.ipAddress ?? null,
    user_agent: input.userAgent ?? null,
    referrer: input.referrer ?? null,
    session_id: input.sessionId ?? null,
  });

  if (error) {
    console.error('Acceptance log insert failed:', error);
    throw new Error('Akzeptanz konnte nicht protokolliert werden.');
  }
}
