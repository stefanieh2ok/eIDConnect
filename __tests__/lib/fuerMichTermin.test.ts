import { ALL_KIRKEL_SERVICES, type KirkelService } from '@/lib/kirkelServiceResolver';
import { resolveDocumentPrep } from '@/lib/fuerMichDokumente';
import {
  APPOINTMENT_BY_KEY,
  DEFAULT_APPOINTMENT_FIELDS,
  ICS_FILENAME,
  buildIcsReminder,
  buildReminderForAppointment,
  canOpenAppointment,
  escapeIcsText,
  formatIcsLocal,
  formatIcsUtc,
  getAppointmentFields,
  nextWorkdayAt9,
  resolveAppointmentInfo,
  type AppointmentFields,
} from '@/lib/fuerMichTermin';

function serviceByKey(key: string): KirkelService {
  const s = ALL_KIRKEL_SERVICES.find((x) => x.leistung_key === key);
  if (!s) throw new Error(`Service ${key} fehlt im Katalog`);
  return s;
}

describe('Appointment Resolver — Defaults', () => {
  it('Default appointment_required ist "unklar" ohne verifizierte Quelle', () => {
    expect(DEFAULT_APPOINTMENT_FIELDS.appointment_required).toBe('unklar');
    expect(DEFAULT_APPOINTMENT_FIELDS.appointment_status).toBe('needs_verification');
    expect(getAppointmentFields('gibt-es-nicht').appointment_required).toBe('unklar');
  });

  it('alle hinterlegten Termin-Konfigurationen sind needs_verification/unklar (kein Raten)', () => {
    for (const fields of Object.values(APPOINTMENT_BY_KEY)) {
      expect(fields.appointment_required).toBe('unklar');
      expect(fields.appointment_status).toBe('needs_verification');
      expect(fields.appointment_url).toBeNull();
      expect(fields.calendar_export_enabled).toBe(true);
      expect(fields.ics_preview_enabled).toBe(true);
    }
  });
});

describe('Appointment Resolver — Verified-Only-Link', () => {
  it('canOpenAppointment nur bei verified + URL', () => {
    const verifiedWithUrl: AppointmentFields = {
      ...DEFAULT_APPOINTMENT_FIELDS,
      appointment_status: 'verified',
      appointment_url: 'https://example.org/demo/termin',
    };
    const verifiedNoUrl: AppointmentFields = {
      ...DEFAULT_APPOINTMENT_FIELDS,
      appointment_status: 'verified',
      appointment_url: null,
    };
    expect(canOpenAppointment(verifiedWithUrl)).toBe(true);
    expect(canOpenAppointment(verifiedNoUrl)).toBe(false);
    expect(canOpenAppointment(DEFAULT_APPOINTMENT_FIELDS)).toBe(false);
  });

  it('needs_verification erzeugt Fallback und keinen externen Link', () => {
    const info = resolveAppointmentInfo(serviceByKey('ummeldung'));
    expect(info.canOpenAppointmentUrl).toBe(false);
    expect(info.appointmentUrl).toBeNull();
    expect(info.appointmentFallback.length).toBeGreaterThan(0);
  });

  it('erzeugt Terminweg-Output mit allen Feldern', () => {
    const info = resolveAppointmentInfo(serviceByKey('geburtsurkunde'));
    expect(info.appointmentRequiredLabel).toBe('unklar');
    expect(info.appointmentTypeLabel).toBe('Standesamt');
    expect(info.zustaendigeStelle.length).toBeGreaterThan(0);
    expect(info.canCreatePrivateReminder).toBe(true);
    expect(info.icsTitle).toBe('Geburtsurkunde vorbereiten');
  });
});

describe('Private ICS-Erinnerung', () => {
  const fixedStart = new Date(2026, 5, 15, 9, 0, 0); // 15.06.2026 09:00 lokal
  const fixedStamp = new Date(Date.UTC(2026, 5, 11, 12, 0, 0)); // 11.06.2026 12:00 UTC

  it('ICS-Titel enthält keine personenbezogenen Daten', () => {
    const info = resolveAppointmentInfo(serviceByKey('ummeldung'));
    expect(info.icsTitle).toBe('Ummeldung vorbereiten');
    expect(info.icsTitle).not.toMatch(/@/);
    expect(info.icsTitle).not.toMatch(/\d/);
  });

  it('ICS-Beschreibung enthält Hinweis „kein gebuchter Behördentermin“', () => {
    const ics = buildIcsReminder({
      title: 'Ummeldung vorbereiten',
      description: resolveAppointmentInfo(serviceByKey('ummeldung')).icsDescription,
      start: fixedStart,
      stamp: fixedStamp,
    });
    expect(ics).toContain('Kein gebuchter Behördentermin');
  });

  it('DTSTART als lokale Zeit ohne Z-Suffix', () => {
    expect(formatIcsLocal(fixedStart)).toBe('20260615T090000');
    const ics = buildIcsReminder({ title: 'T', description: 'D', start: fixedStart, stamp: fixedStamp });
    expect(ics).toMatch(/DTSTART:20260615T090000(\r\n)/);
    expect(ics).not.toMatch(/DTSTART:[0-9T]+Z/);
  });

  it('DTSTAMP in UTC mit Z-Suffix', () => {
    expect(formatIcsUtc(fixedStamp)).toBe('20260611T120000Z');
    const ics = buildIcsReminder({ title: 'T', description: 'D', start: fixedStart, stamp: fixedStamp });
    expect(ics).toContain('DTSTAMP:20260611T120000Z');
  });

  it('verwendet CRLF-Zeilenenden', () => {
    const ics = buildIcsReminder({ title: 'T', description: 'D', start: fixedStart, stamp: fixedStamp });
    expect(ics.includes('\r\n')).toBe(true);
    expect(ics).toMatch(/^BEGIN:VCALENDAR\r\n/);
    // Keine nackten LF ohne vorangestelltes CR.
    expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
  });

  it('escaped Kommas, Semikolons und Backslashes in SUMMARY/DESCRIPTION', () => {
    expect(escapeIcsText('a,b;c\\d')).toBe('a\\,b\\;c\\\\d');
    expect(escapeIcsText('Zeile1\nZeile2')).toBe('Zeile1\\nZeile2');
    const ics = buildIcsReminder({
      title: 'Ummeldung, Teil; A\\B',
      description: 'Zeile1\nZeile2',
      start: fixedStart,
      stamp: fixedStamp,
    });
    expect(ics).toContain('SUMMARY:Ummeldung\\, Teil\\; A\\\\B');
    expect(ics).toContain('DESCRIPTION:Zeile1\\nZeile2');
  });

  it('LOCATION bleibt leer, wenn die Terminquelle nicht verifiziert ist', () => {
    const info = resolveAppointmentInfo(serviceByKey('ummeldung'));
    const ics = buildReminderForAppointment(info, fixedStart);
    expect(ics).not.toContain('LOCATION:');
  });

  it('nextWorkdayAt9 liefert Mo–Fr um 09:00 in der Zukunft', () => {
    const from = new Date(2026, 5, 12, 15, 0, 0); // Freitag 12.06.2026
    const next = nextWorkdayAt9(from);
    expect(next.getHours()).toBe(9);
    expect([1, 2, 3, 4, 5]).toContain(next.getDay());
    expect(next.getTime()).toBeGreaterThan(from.getTime());
  });

  it('Dateiname ist generisch und PII-frei', () => {
    expect(ICS_FILENAME).toBe('hookai-civic-termin-vormerken.ics');
  });
});

describe('Dokumenten-/Behördenweg-Simulation bleibt unverändert', () => {
  it('Dokumenten-Resolver liefert weiterhin required_documents (z. B. Elterngeld)', () => {
    expect(resolveDocumentPrep('elterngeld')?.required_documents.length).toBeGreaterThan(0);
  });
});
