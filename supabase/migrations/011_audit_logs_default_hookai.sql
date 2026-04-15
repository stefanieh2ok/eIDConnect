-- Default demo_id für neue Audit-Zeilen: eID Demo Connect (bestehende Zeilen unverändert)
alter table audit_logs alter column demo_id set default 'eidconnect';
