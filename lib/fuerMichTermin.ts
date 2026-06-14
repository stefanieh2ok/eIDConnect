/**
 * Appointment Resolver V1 — Terminweg + private Kalender-Erinnerung (Wegweiser, Demo).
 *
 * REINE LOKALE DEMO-LOGIK:
 * - KEINE echte Terminbuchung, KEIN Zugriff auf kommunale Kalender.
 * - KEIN Schreiben in Behördenkalender, KEIN Scraping von Terminverfügbarkeiten.
 * - KEINE echte API-Anbindung, KEINE Anspruchsprüfung, KEINE Rechtsberatung.
 *
 * Default-Regel: ohne verifizierte Quelle ist `appointment_required` immer "unklar"
 * und `appointment_status` "needs_verification". Es wird nie geraten.
 *
 * Dieser Baustein dupliziert NICHT die Dokumenten-/Behördenweg-Simulation
 * (`lib/fuerMichDokumente.ts`); er ergänzt nur den Termin-Teil.
 */

import type { KirkelService } from '@/lib/kirkelServiceResolver';

export type AppointmentRequired = 'ja' | 'nein' | 'unklar';

export type AppointmentType =
  | 'buergeramt'
  | 'standesamt'
  | 'kreis'
  | 'landesstelle'
  | 'online'
  | 'telefonisch'
  | 'unklar';

export type AppointmentStatus = 'verified' | 'demo' | 'needs_verification' | 'unavailable';

/** Optionale Termin-Felder je Leistung (Resolver-Interface, additiv). */
export type AppointmentFields = {
  appointment_required: AppointmentRequired;
  appointment_type: AppointmentType;
  appointment_status: AppointmentStatus;
  appointment_url: string | null;
  appointment_fallback: string;
  calendar_export_enabled: boolean;
  ics_preview_enabled: boolean;
  appointment_notice: string;
};

export const APPOINTMENT_UNCLEAR_NOTICE =
  'Ob ein Termin erforderlich ist, muss vor dem Besuch bei der zuständigen Stelle geprüft werden.';

export const APPOINTMENT_FALLBACK_DEFAULT =
  'Bitte nutzen Sie die angezeigte zuständige Stelle oder das offizielle Terminangebot der Kommune.';

export const APPOINTMENT_NO_VERIFIED_URL =
  'Noch kein verifizierter Online-Terminweg hinterlegt. Die zuständige Stelle wird angezeigt.';

/** Sicherer Default: nichts verifiziert → „unklar“, kein externer Link. */
export const DEFAULT_APPOINTMENT_FIELDS: AppointmentFields = {
  appointment_required: 'unklar',
  appointment_type: 'unklar',
  appointment_status: 'needs_verification',
  appointment_url: null,
  appointment_fallback: APPOINTMENT_FALLBACK_DEFAULT,
  calendar_export_enabled: true,
  ics_preview_enabled: true,
  appointment_notice: APPOINTMENT_UNCLEAR_NOTICE,
};

export const APPOINTMENT_REQUIRED_LABELS: Record<AppointmentRequired, string> = {
  ja: 'ja',
  nein: 'nein',
  unklar: 'unklar',
};

export const APPOINTMENT_TYPE_LABELS: Record<AppointmentType, string> = {
  buergeramt: 'Bürgeramt',
  standesamt: 'Standesamt',
  kreis: 'Kreis',
  landesstelle: 'Landesstelle',
  online: 'online',
  telefonisch: 'telefonisch',
  unklar: 'unklar',
};

/**
 * Termin-Konfiguration je Leistung (keyed nach leistung_key).
 * Alle Einträge sind „needs_verification“/„unklar“, weil in der Demo keine
 * verifizierte Terminquelle hinterlegt ist (keine erfundenen Portale/Links).
 * Nur die (strukturelle) Terminart wird – wo eindeutig – grob benannt.
 */
function makeAppointment(type: AppointmentType): AppointmentFields {
  return {
    ...DEFAULT_APPOINTMENT_FIELDS,
    appointment_type: type,
  };
}

export const APPOINTMENT_BY_KEY: Record<string, AppointmentFields> = {
  ummeldung: makeAppointment('buergeramt'),
  wohnungsgeberbestaetigung: makeAppointment('unklar'),
  'kfz-ummeldung': makeAppointment('kreis'),
  geburtsurkunde: makeAppointment('standesamt'),
  elterngeld: makeAppointment('landesstelle'),
  kindergeld: makeAppointment('unklar'),
  fuehrerschein: makeAppointment('kreis'),
  'begleitetes-fahren-bf17': makeAppointment('kreis'),
  'personalausweis-eid': makeAppointment('buergeramt'),
  gewerbeanmeldung: makeAppointment('buergeramt'),
  wohngeld: makeAppointment('kreis'),
  bafoeg: makeAppointment('landesstelle'),
};

export function getAppointmentFields(leistungKey: string): AppointmentFields {
  return APPOINTMENT_BY_KEY[leistungKey] ?? DEFAULT_APPOINTMENT_FIELDS;
}

// ── Resolver-Output ──────────────────────────────────────────────────────────

export type AppointmentInfo = {
  fields: AppointmentFields;
  appointmentRequiredLabel: string;
  appointmentTypeLabel: string;
  /** Nur true bei verifizierter Quelle MIT URL — sonst nie extern öffnen. */
  canOpenAppointmentUrl: boolean;
  appointmentUrl: string | null;
  appointmentFallback: string;
  appointmentNotice: string;
  zustaendigeStelle: string;
  /** Lokale, private .ics-Erinnerung erlaubt (kein Behördentermin). */
  canCreatePrivateReminder: boolean;
  icsTitle: string;
  icsDescription: string;
};

export const ICS_PRIVATE_DESCRIPTION =
  'Private Vormerkung aus HookAI Civic. Kein gebuchter Behördentermin.';

export const APP_CALENDAR_REMINDER_DESCRIPTION = ICS_PRIVATE_DESCRIPTION;

/** Lokale Demo-Vormerkung im App-Kalender (nur Session-State, kein Server). */
export type PrivateCalendarReminder = {
  id: string;
  title: string;
  description: string;
  serviceKey: string;
  /** ISO-8601, Start der privaten Erinnerung */
  startAt: string;
  createdAt: string;
};

export function buildAppCalendarReminderTitle(serviceTitle: string): string {
  return `${serviceTitle}: Terminweg prüfen`;
}

export function buildPrivateCalendarReminder(
  service: KirkelService,
  from: Date = new Date(),
): PrivateCalendarReminder {
  const start = nextWorkdayAt9(from);
  return {
    id: `vormerk-${service.leistung_key}-${start.getTime()}`,
    title: buildAppCalendarReminderTitle(service.titel),
    description: APP_CALENDAR_REMINDER_DESCRIPTION,
    serviceKey: service.leistung_key,
    startAt: start.toISOString(),
    createdAt: from.toISOString(),
  };
}

/** Externer Terminlink ist NUR bei verifizierter Quelle MIT URL öffenbar. */
export function canOpenAppointment(fields: AppointmentFields): boolean {
  return fields.appointment_status === 'verified' && Boolean(fields.appointment_url);
}

/**
 * Liefert die aufbereitete Termininfo zu einer Leistung. Öffnet niemals einen
 * externen Link, wenn die Quelle nicht „verified“ ist.
 */
export function resolveAppointmentInfo(service: KirkelService): AppointmentInfo {
  const fields = getAppointmentFields(service.leistung_key);
  const canOpenAppointmentUrl = canOpenAppointment(fields);

  return {
    fields,
    appointmentRequiredLabel: APPOINTMENT_REQUIRED_LABELS[fields.appointment_required],
    appointmentTypeLabel: APPOINTMENT_TYPE_LABELS[fields.appointment_type],
    canOpenAppointmentUrl,
    appointmentUrl: canOpenAppointmentUrl ? fields.appointment_url : null,
    appointmentFallback: fields.appointment_fallback,
    appointmentNotice: fields.appointment_notice,
    zustaendigeStelle: service.zustaendige_stelle,
    canCreatePrivateReminder: fields.calendar_export_enabled,
    // Generischer, PII-freier Titel — nur Leistungsbezeichnung.
    icsTitle: `${service.titel} vorbereiten`,
    icsDescription: ICS_PRIVATE_DESCRIPTION,
  };
}

// ── ICS-Erzeugung (ohne neue Dependency, rein lokal) ─────────────────────────

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

/** Lokale Zeit ohne Z-Suffix: YYYYMMDDTHHMMSS */
export function formatIcsLocal(d: Date): string {
  return (
    `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}` +
    `T${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`
  );
}

/** UTC mit Z-Suffix: YYYYMMDDTHHMMSSZ */
export function formatIcsUtc(d: Date): string {
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Escaping gemäß RFC 5545 für SUMMARY/DESCRIPTION/LOCATION. */
export function escapeIcsText(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\r?\n/g, '\\n');
}

/** Nächster Werktag (Mo–Fr) um 09:00 lokaler Zeit. Keine Feiertagsprüfung. */
export function nextWorkdayAt9(from: Date = new Date()): Date {
  const d = new Date(from);
  d.setDate(d.getDate() + 1);
  d.setHours(9, 0, 0, 0);
  while (d.getDay() === 0 || d.getDay() === 6) {
    d.setDate(d.getDate() + 1);
  }
  return d;
}

/** PII-freie UID (nur Zeitstempel + Zufall, kein Name/Adresse). */
function buildIcsUid(stamp: Date): string {
  const rand = Math.random().toString(36).slice(2, 10);
  return `hookai-civic-${formatIcsUtc(stamp)}-${rand}@demo`;
}

export type IcsReminderArgs = {
  /** Generischer Titel ohne personenbezogene Daten. */
  title: string;
  description: string;
  /** Nur zuständige Stelle ODER leer (z. B. wenn nicht verifiziert). */
  location?: string;
  start: Date;
  /** Zeitpunkt der Erstellung (UTC). Default: jetzt. */
  stamp?: Date;
  /** Optionale UID (Tests); sonst PII-frei generiert. */
  uid?: string;
};

/**
 * Baut eine minimale, RFC-5545-konforme .ics-Datei mit CRLF-Zeilenenden.
 * DTSTART lokal (ohne Z), DTSTAMP in UTC (mit Z). Keine PII.
 */
export function buildIcsReminder({
  title,
  description,
  location,
  start,
  stamp = new Date(),
  uid,
}: IcsReminderArgs): string {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//HookAI Civic Demo//Appointment Reminder//DE',
    'BEGIN:VEVENT',
    `UID:${uid ?? buildIcsUid(stamp)}`,
    `DTSTAMP:${formatIcsUtc(stamp)}`,
    `DTSTART:${formatIcsLocal(start)}`,
    `SUMMARY:${escapeIcsText(title)}`,
    `DESCRIPTION:${escapeIcsText(description)}`,
  ];
  if (location && location.trim().length > 0) {
    lines.push(`LOCATION:${escapeIcsText(location)}`);
  }
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
}

export const ICS_FILENAME = 'hookai-civic-termin-vormerken.ics';

/**
 * Baut die private Erinnerung für eine Leistung. LOCATION nur, wenn die
 * Terminquelle verifiziert ist (sonst leer).
 */
export function buildReminderForAppointment(info: AppointmentInfo, from: Date = new Date()): string {
  const location = info.canOpenAppointmentUrl ? info.zustaendigeStelle : '';
  return buildIcsReminder({
    title: info.icsTitle,
    description: info.icsDescription,
    location,
    start: nextWorkdayAt9(from),
  });
}
