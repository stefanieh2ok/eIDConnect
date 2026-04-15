-- Index für Reverse-Lookup: envelope_id → token_hash (falls DocuSign token weglässt)
create index if not exists idx_demo_docusign_envelopes_envelope_id
  on demo_docusign_envelopes (envelope_id);
