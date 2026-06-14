/**
 * Lokaler Dev-Fallback für Zugangslinks und Sessions, wenn Supabase nicht erreichbar ist.
 * NUR in NODE_ENV=development — niemals in Produktion.
 */
import { randomBytes } from 'crypto';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { DemoAccessTokenRecord } from '@/lib/security/token';

const STORE_DIR = join(process.cwd(), '.dev-local');
const STORE_FILE = join(STORE_DIR, 'access-store.json');

type DevSession = {
  id: string;
  session_token_hash: string;
  access_token_id: string;
  demo_id: string;
  session_expires_at: string;
  is_active: boolean;
  full_name: string;
  company: string | null;
  email: string;
};

type DevStore = {
  tokens: Array<DemoAccessTokenRecord & { token_hash: string }>;
  sessions: DevSession[];
  acceptance_counts: Record<string, number>;
};

export function isDevLocalAccessEnabled(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isDevLocalTokenId(id: string): boolean {
  return id.startsWith('devlocal-');
}

function readStore(): DevStore {
  if (!existsSync(STORE_FILE)) {
    return { tokens: [], sessions: [], acceptance_counts: {} };
  }
  try {
    return JSON.parse(readFileSync(STORE_FILE, 'utf8')) as DevStore;
  } catch {
    return { tokens: [], sessions: [], acceptance_counts: {} };
  }
}

function writeStore(store: DevStore): void {
  if (!existsSync(STORE_DIR)) mkdirSync(STORE_DIR, { recursive: true });
  writeFileSync(STORE_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export function devLocalInsertAccessToken(input: {
  tokenHash: string;
  demoId: string;
  fullName: string;
  company: string | null;
  email: string;
  ndaVersion: string;
  ndaDocumentHash: string;
  expiresAt: string;
  requireDocusign: boolean;
}): DemoAccessTokenRecord {
  const store = readStore();
  const record: DemoAccessTokenRecord & { token_hash: string } = {
    id: `devlocal-${randomBytes(8).toString('hex')}`,
    token_hash: input.tokenHash,
    demo_id: input.demoId,
    full_name: input.fullName,
    company: input.company,
    email: input.email,
    nda_version: input.ndaVersion,
    nda_document_hash: input.ndaDocumentHash,
    expires_at: input.expiresAt,
    max_views: 100000,
    max_devices: 1,
    is_revoked: false,
    require_docusign: input.requireDocusign,
  };
  store.tokens.push(record);
  writeStore(store);
  return record;
}

export function devLocalFindAccessTokenByHash(
  tokenHash: string,
): DemoAccessTokenRecord | null {
  const store = readStore();
  const row = store.tokens.find((t) => t.token_hash === tokenHash);
  if (!row) return null;
  const { token_hash: _h, ...record } = row;
  return record;
}

export function devLocalCountTokenSessions(tokenId: string): number {
  const store = readStore();
  return store.sessions.filter((s) => s.access_token_id === tokenId && s.is_active).length;
}

export function devLocalCountAcceptanceEvents(tokenId: string): number {
  const store = readStore();
  return store.acceptance_counts[tokenId] ?? 0;
}

export function devLocalIncrementAcceptance(tokenId: string): void {
  const store = readStore();
  store.acceptance_counts[tokenId] = (store.acceptance_counts[tokenId] ?? 0) + 1;
  writeStore(store);
}

export function devLocalDeactivateSessionsForToken(tokenId: string): void {
  const store = readStore();
  const now = new Date().toISOString();
  for (const s of store.sessions) {
    if (s.access_token_id === tokenId && s.is_active) s.is_active = false;
  }
  writeStore(store);
}

export function devLocalCreateSession(input: {
  sessionTokenHash: string;
  tokenId: string;
  demoId: string;
  fullName: string;
  company: string | null;
  email: string;
  expiresAt: string;
}): { id: string } {
  const store = readStore();
  const session: DevSession = {
    id: `devlocal-session-${randomBytes(8).toString('hex')}`,
    session_token_hash: input.sessionTokenHash,
    access_token_id: input.tokenId,
    demo_id: input.demoId,
    session_expires_at: input.expiresAt,
    is_active: true,
    full_name: input.fullName,
    company: input.company,
    email: input.email,
  };
  store.sessions.push(session);
  writeStore(store);
  return { id: session.id };
}

export function devLocalFindSessionByHash(
  sessionTokenHash: string,
): DevSession | null {
  const store = readStore();
  return store.sessions.find((s) => s.session_token_hash === sessionTokenHash && s.is_active) ?? null;
}

export function devLocalInvalidateSession(sessionId: string): void {
  const store = readStore();
  const row = store.sessions.find((s) => s.id === sessionId);
  if (row) row.is_active = false;
  writeStore(store);
}
