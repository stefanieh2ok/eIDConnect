export type DemoSessionRecord = {
  id: string;
  token_id: string | null;
  access_token_id: string | null;
  demo_id: string | null;
  session_token_hash: string | null;
  started_at: string;
  session_expires_at: string | null;
  is_active: boolean | null;
  full_name: string | null;
  company: string | null;
  email: string | null;
};

export type DemoAuditLogInsert = {
  demo_id?: string | null;
  token_id?: string | null;
  session_id?: string | null;
  event_type: string;
  event_data?: Record<string, unknown>;
  ip_address?: string | null;
  user_agent?: string | null;
  device_fingerprint?: string | null;
};
