import { ALL_KIRKEL_SERVICES } from '@/lib/kirkelServiceResolver';
import {
  APP_CALENDAR_REMINDER_DESCRIPTION,
  buildAppCalendarReminderTitle,
  buildPrivateCalendarReminder,
  buildReminderForAppointment,
  resolveAppointmentInfo,
} from '@/lib/fuerMichTermin';

const FORBIDDEN = [
  'Termin gebucht',
  'Behörde bestätigt',
  'API erfolgreich',
  'an Behörde übertragen',
  'eingereicht',
];

function serviceByKey(key: string) {
  const s = ALL_KIRKEL_SERVICES.find((x) => x.leistung_key === key);
  if (!s) throw new Error(`Service ${key} fehlt`);
  return s;
}

describe('Private App-Kalender-Vormerkung', () => {
  const fixed = new Date(2026, 5, 10, 14, 0, 0);

  it('erzeugt PII-freien Kalendereintrag mit Werktag 09:00', () => {
    const service = serviceByKey('fuehrerschein');
    const reminder = buildPrivateCalendarReminder(service, fixed);
    const start = new Date(reminder.startAt);

    expect(reminder.title).toBe('Führerschein / Fahrerlaubnis: Terminweg prüfen');
    expect(reminder.description).toBe(APP_CALENDAR_REMINDER_DESCRIPTION);
    expect(reminder.serviceKey).toBe('fuehrerschein');
    expect(start.getDay()).toBeGreaterThanOrEqual(1);
    expect(start.getDay()).toBeLessThanOrEqual(5);
    expect(start.getHours()).toBe(9);
  });

  it('behauptet keine Behördenbuchung in Texten', () => {
    const service = serviceByKey('ummeldung');
    const reminder = buildPrivateCalendarReminder(service, fixed);
    const info = resolveAppointmentInfo(service);
    const ics = buildReminderForAppointment(info, fixed);
    const blob = [reminder.title, reminder.description, ics].join(' ');

    for (const word of FORBIDDEN) {
      expect(blob).not.toContain(word);
    }
    expect(blob).toContain('Kein gebuchter Behördentermin');
  });

  it('formatiert App-Kalender-Titel konsistent', () => {
    expect(buildAppCalendarReminderTitle('Ummeldung')).toBe('Ummeldung: Terminweg prüfen');
  });
});
