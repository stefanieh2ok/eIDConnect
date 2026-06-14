import {
  appointmentDisplayStatus,
  calendarEventDotTone,
  calendarMarkerStyle,
  deadlineUrgency,
  documentStatusDisplayLabel,
  documentStatusTone,
  meldungStatusTone,
  sourceStatusTone,
} from '@/lib/civicStatus';
import type { AppointmentFields } from '@/lib/fuerMichTermin';

describe('civicStatus', () => {
  it('maps source status to consistent tones', () => {
    expect(sourceStatusTone('verified')).toBe('mint');
    expect(sourceStatusTone('needs_verification')).toBe('amber');
    expect(sourceStatusTone('demo')).toBe('neutral');
    expect(sourceStatusTone('unavailable')).toBe('red');
  });

  it('maps meldung process status to tones', () => {
    expect(meldungStatusTone('offen')).toBe('amber');
    expect(meldungStatusTone('in_bearbeitung')).toBe('civic');
    expect(meldungStatusTone('erledigt')).toBe('mint');
  });

  it('maps document status with kind-aware tones', () => {
    expect(documentStatusTone('ausgewaehlt', 'required')).toBe('mint');
    expect(documentStatusTone('fehlt', 'required')).toBe('amber');
    expect(documentStatusTone('fehlt', 'optional')).toBe('neutral');
    expect(documentStatusDisplayLabel('ausgewaehlt')).toBe('lokal ausgewählt');
  });

  it('derives appointment display status without forbidden wording', () => {
    const fields: AppointmentFields = {
      appointment_required: 'ja',
      appointment_status: 'needs_verification',
      appointment_url: null,
      appointment_type: 'unklar',
      appointment_fallback: 'Demo-Fallback',
      calendar_export_enabled: true,
      ics_preview_enabled: true,
      appointment_notice: 'Vor Besuch prüfen',
    };
    expect(appointmentDisplayStatus(fields).label).toBe('Vor Besuch prüfen');
    expect(appointmentDisplayStatus(fields, { vormerkt: true }).label).toBe('Termin vorgemerkt');
  });

  it('classifies deadline urgency for calendar markers', () => {
    const ref = new Date(2026, 2, 10);
    expect(deadlineUrgency('16.03.2026', ref)).toBe('soon');
    expect(deadlineUrgency('10.03.2026', ref)).toBe('today');
    expect(calendarEventDotTone('vormerkung')).toBe('mint');
    expect(calendarEventDotTone('wahl')).toBe('civic');
    expect(calendarMarkerStyle('abstimmung', '16.03.2026', ref).border).toBe('#f59e0b');
  });
});
