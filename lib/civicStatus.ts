import type { SourceStatus } from '@/lib/kirkelServiceResolver';
import type { AppointmentFields, AppointmentStatus } from '@/lib/fuerMichTermin';
import type { DocumentKind, DocumentStatus } from '@/lib/fuerMichDokumente';

export type CivicStatusTone = 'navy' | 'mint' | 'amber' | 'red' | 'neutral' | 'civic';

export type MeldungsProcessStatus = 'offen' | 'in_bearbeitung' | 'erledigt';

const TONE_PILL: Record<CivicStatusTone, string> = {
  navy: 'status-pill status-pill--navy',
  mint: 'status-pill status-pill--mint',
  amber: 'status-pill status-pill--amber',
  red: 'status-pill status-pill--red',
  neutral: 'status-pill status-pill--neutral',
  civic: 'status-pill status-pill--civic',
};

const TONE_BORDER: Record<CivicStatusTone, string> = {
  navy: 'status-border--navy',
  mint: 'status-border--mint',
  amber: 'status-border--amber',
  red: 'status-border--red',
  neutral: 'status-border--neutral',
  civic: 'status-border--civic',
};

const TONE_STRIP: Record<CivicStatusTone, string> = {
  navy: 'process-strip__item--navy',
  mint: 'process-strip__item--mint',
  amber: 'process-strip__item--amber',
  red: 'process-strip__item--red',
  neutral: 'process-strip__item--neutral',
  civic: 'process-strip__item--civic',
};

export function statusPillClass(tone: CivicStatusTone): string {
  return TONE_PILL[tone];
}

export function statusBorderClass(tone: CivicStatusTone): string {
  return TONE_BORDER[tone];
}

export function processStripItemClass(tone: CivicStatusTone, active: boolean): string {
  return `process-strip__item ${TONE_STRIP[tone]}${active ? ' process-strip__item--active' : ''}`;
}

export function sourceStatusTone(status: SourceStatus): CivicStatusTone {
  switch (status) {
    case 'verified':
      return 'mint';
    case 'needs_verification':
      return 'amber';
    case 'demo':
      return 'neutral';
    case 'unavailable':
      return 'red';
    default:
      return 'amber';
  }
}

export function meldungStatusTone(status: MeldungsProcessStatus): CivicStatusTone {
  switch (status) {
    case 'offen':
      return 'amber';
    case 'in_bearbeitung':
      return 'civic';
    case 'erledigt':
      return 'mint';
    default:
      return 'neutral';
  }
}

export function meldungStatusLabel(status: MeldungsProcessStatus): string {
  switch (status) {
    case 'offen':
      return 'Offen';
    case 'in_bearbeitung':
      return 'In Bearbeitung';
    case 'erledigt':
      return 'Erledigt';
    default:
      return status;
  }
}

export function documentStatusTone(status: DocumentStatus, kind: DocumentKind): CivicStatusTone {
  if (status === 'ausgewaehlt') return 'mint';
  if (status === 'optional' || status === 'nicht_erforderlich') return 'neutral';
  if (status === 'fehlt') return kind === 'required' ? 'amber' : 'neutral';
  return 'neutral';
}

export function documentStatusDisplayLabel(status: DocumentStatus): string {
  switch (status) {
    case 'ausgewaehlt':
      return 'lokal ausgewählt';
    case 'fehlt':
      return 'fehlt';
    case 'optional':
      return 'optional';
    case 'nicht_erforderlich':
      return 'optional';
    default:
      return status;
  }
}

export function evidenceListStatusTone(label: string): CivicStatusTone {
  if (label === 'optional') return 'neutral';
  if (label === 'vorbereiten') return 'amber';
  return 'neutral';
}

export type AppointmentDisplayStatus = {
  tone: CivicStatusTone;
  label: string;
};

export function appointmentDisplayStatus(
  fields: AppointmentFields,
  options?: { vormerkt?: boolean; canOpen?: boolean },
): AppointmentDisplayStatus {
  if (options?.vormerkt) {
    return { tone: 'mint', label: 'Termin vorgemerkt' };
  }
  if (options?.canOpen && fields.appointment_status === 'verified') {
    return { tone: 'mint', label: 'Offizieller Terminweg verifiziert' };
  }
  if (fields.appointment_status === 'verified') {
    return { tone: 'mint', label: 'Terminweg verifiziert' };
  }
  if (fields.appointment_status === 'unavailable') {
    return { tone: 'red', label: 'Terminweg nicht verfügbar' };
  }
  if (fields.appointment_status === 'demo') {
    return { tone: 'neutral', label: 'Demo — Terminweg nur lokal' };
  }
  return { tone: 'amber', label: 'Vor Besuch prüfen' };
}

export function appointmentStatusTone(status: AppointmentStatus): CivicStatusTone {
  switch (status) {
    case 'verified':
      return 'mint';
    case 'needs_verification':
      return 'amber';
    case 'demo':
      return 'neutral';
    case 'unavailable':
      return 'red';
    default:
      return 'amber';
  }
}

export type DeadlineUrgency = 'normal' | 'soon' | 'today' | 'passed';

export function deadlineUrgency(deadline?: string, reference = new Date()): DeadlineUrgency {
  if (!deadline) return 'normal';
  const parts = deadline.trim().split(/\./);
  if (parts.length !== 3) return 'normal';
  const [d, m, y] = parts.map(Number);
  if (!d || !m || !y) return 'normal';
  const refDay = new Date(reference.getFullYear(), reference.getMonth(), reference.getDate());
  const endDay = new Date(y, m - 1, d);
  const diffDays = Math.round((endDay.getTime() - refDay.getTime()) / 86_400_000);
  if (diffDays < 0) return 'passed';
  if (diffDays === 0) return 'today';
  if (diffDays <= 7) return 'soon';
  return 'normal';
}

export function deadlineUrgencyTone(urgency: DeadlineUrgency): CivicStatusTone {
  switch (urgency) {
    case 'today':
      return 'red';
    case 'soon':
      return 'amber';
    case 'passed':
      return 'neutral';
    default:
      return 'civic';
  }
}

export function calendarEventDotTone(
  kind: 'wahl' | 'abstimmung' | 'vormerkung',
  deadline?: string,
  reference?: Date,
): CivicStatusTone {
  if (kind === 'vormerkung') return 'mint';
  if (kind === 'wahl') return 'civic';
  return deadlineUrgencyTone(deadlineUrgency(deadline, reference));
}

const TONE_HEX: Record<CivicStatusTone, string> = {
  navy: '#003366',
  mint: '#34d399',
  amber: '#f59e0b',
  red: '#ef4444',
  civic: '#0055a4',
  neutral: '#94a3b8',
};

export function calendarMarkerStyle(
  kind: 'wahl' | 'abstimmung' | 'vormerkung',
  deadline?: string,
  reference?: Date,
): { background?: string; border?: string } {
  const tone = calendarEventDotTone(kind, deadline, reference);
  const color = TONE_HEX[tone];
  if (kind === 'abstimmung') {
    return { border: color, background: 'transparent' };
  }
  return { background: color };
}
