/** Profile field labels and prefill mapping for civic forms (Kirkel demo slice). */

export const PROFILE_FIELD_LABELS: Record<string, string> = {
  firstName: 'Vorname',
  lastName: 'Nachname',
  dateOfBirth: 'Geburtsdatum',
  address: 'Anschrift',
  email: 'E-Mail',
  phone: 'Telefon',
  municipality: 'Kommune',
  county: 'Landkreis',
};

/** Fields that must never be guessed or auto-filled from demo profile. */
export const NEVER_PREFILL_FIELD_IDS = new Set([
  'idDocumentNumber',
  'iban',
  'evb-nummer',
  'sozialversicherungsnummer',
  'einkommensnachweise',
  'kontoauszuege',
  'vermoegensnachweise',
  'mietvertrag',
  'kennzeichen',
  'zb-teil-i',
  'zb-teil-ii',
  'biometrisches-lichtbild',
  'aktueller-ausweis',
  'kuendigung-arbeitsvertrag',
]);

export const MISSING_FIELD_REASONS: Record<string, string> = {
  idDocumentNumber: 'Ausweisnummer ist nicht im Demo-Profil — wird niemals geraten.',
  'biometrisches-lichtbild': 'Biometrisches Lichtbild muss separat vorgelegt werden.',
  'aktueller-ausweis': 'Aktueller Ausweis oder Reisepass muss mitgebracht werden.',
  'evb-nummer': 'eVB-Nummer wird nicht automatisch vorausgefüllt.',
  iban: 'IBAN/SEPA-Lastschrift wird nicht automatisch vorausgefüllt.',
  'sepa-lastschrift': 'SEPA-Lastschriftmandat muss separat vorgelegt werden.',
  kennzeichen: 'Kennzeichen ist nicht im Demo-Profil hinterlegt.',
  'zb-teil-i': 'Zulassungsbescheinigung Teil I muss vorgelegt werden.',
  'zb-teil-ii': 'Zulassungsbescheinigung Teil II muss vorgelegt werden.',
  mietvertrag: 'Mietvertrag liegt nicht im Demo-Profil vor.',
  kontoauszuege: 'Kontoauszüge werden nicht geraten — bitte selbst bereitstellen.',
  einkommensnachweise: 'Einkommensnachweise werden nicht geraten — bitte selbst bereitstellen.',
  vermoegensnachweise: 'Vermögensnachweise werden nicht geraten — bitte selbst bereitstellen.',
  krankenversicherung: 'Krankenversicherungsnachweis muss separat vorgelegt werden.',
  'sozialversicherungsnummer': 'Sozialversicherungsnummer wird nicht automatisch vorausgefüllt.',
  'kuendigung-arbeitsvertrag': 'Kündigung/Arbeitsvertrag muss separat vorgelegt werden.',
  personalausweis: 'Personalausweis muss bei Vorsprache mitgebracht werden.',
};
