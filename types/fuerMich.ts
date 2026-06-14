export type LifeEventId =
  | 'expecting_child'
  | 'newborn'
  | 'education'
  | 'coming_of_age'
  | 'mobility'
  | 'moving'
  | 'job_search'
  | 'founding'
  | 'caregiving'
  | 'retirement'
  | 'bereavement'
  | 'daily_support';

export type LifeEventOption = {
  id: LifeEventId;
  labelSie: string;
  labelDu: string;
  /** Zurückhaltende Darstellung, keine Gamification-Hinweise */
  sensitive?: boolean;
  /** Optionaler erläuternder Hinweis (Sie-Form), wird bei Auswahl angezeigt. */
  hintSie?: string;
  /** Optionaler erläuternder Hinweis (Du-Form), wird bei Auswahl angezeigt. */
  hintDu?: string;
};

export type ChildAgeBand = '0-3' | '4-6' | '7-17' | '18+';

export type HousingSituation = 'miete' | 'eigentum' | 'wg' | 'einrichtung';

export type EmploymentStatus =
  | 'arbeitnehmer'
  | 'selbststaendig'
  | 'student'
  | 'auszubildend'
  | 'arbeitssuchend'
  | 'rentner';

export type ProfileRole =
  | 'privatperson'
  | 'unternehmer'
  | 'freiberufler'
  | 'verein'
  | 'ehrenamt';

/** Vertretungslogik: für wen die App genutzt wird (keine Zustimmungserklärung). */
export type UsageRole = 'self' | 'child' | 'relative';

/** Grobe Altersgruppe – bewusst ohne Geburtsdatum, nur Orientierung. */
export type AgeGroup = 'under_16' | '16_17' | '18_plus';

export type FuerMichProfileState = {
  bundesland: string;
  plz: string;
  wohnort: string;
  sprache: string;
  nutzungsrolle: UsageRole | '';
  altersgruppe: AgeGroup | '';
  kinderVorhanden: 'ja' | 'nein' | '';
  kinderAltersgruppen: ChildAgeBand[];
  wohnsituation: HousingSituation | '';
  erwerbsstatus: EmploymentStatus | '';
  rolle: ProfileRole | '';
};

export const EMPTY_FUER_MICH_PROFILE: FuerMichProfileState = {
  bundesland: '',
  plz: '',
  wohnort: '',
  sprache: '',
  nutzungsrolle: '',
  altersgruppe: '',
  kinderVorhanden: '',
  kinderAltersgruppen: [],
  wohnsituation: '',
  erwerbsstatus: '',
  rolle: '',
};
