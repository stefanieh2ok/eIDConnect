-- Neue Spalte: require_docusign (default true = bestehende Tokens brauchen DocuSign)
-- Test-Tokens werden mit require_docusign=false erstellt.

alter table demo_access_tokens
  add column if not exists require_docusign boolean not null default true;
