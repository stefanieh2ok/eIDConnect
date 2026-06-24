/**
 * Official action / form catalogue for Wegweiser mastercases.
 * URLs only from verified sources — never invented at runtime.
 */
import type {
  OfficialAction,
  OfficialActionLevel,
  OfficialActionLink,
} from '@/lib/civic/officialActionTypes';
import { CATALOG_LAST_VERIFIED } from '@/lib/civic/officialActionTypes';
import type { CivicJourneyId } from '@/lib/civic/civicJourneyTemplates';
import {
  BA_URLS,
  EMPLOYER_OFFICIAL_URLS,
  FAMILY_OFFICIAL_URLS,
} from '@/lib/civic/officialUrls';

export type {
  OfficialAction,
  OfficialActionLevel,
  OfficialActionLink,
  OfficialActionStatus,
  ResolvedOfficialAction,
  ResolvedOfficialActionGroup,
  TrainingFundingState,
} from '@/lib/civic/officialActionTypes';

export { CATALOG_LAST_VERIFIED } from '@/lib/civic/officialActionTypes';
export { BA_URLS, FAMILY_OFFICIAL_URLS, EMPLOYER_OFFICIAL_URLS } from '@/lib/civic/officialUrls';

const V = CATALOG_LAST_VERIFIED;

type LinkMeta = {
  ctaLabel?: string;
  notes?: string;
  sourceRuleId?: string;
  requiresBundId?: boolean;
  requiresEid?: boolean;
};

export const VERIFIED_URLS = {
  familienportalForms: FAMILY_OFFICIAL_URLS.familienportalForms,
  kinderzuschlag: FAMILY_OFFICIAL_URLS.kinderzuschlag,
  betriebsnummerService: EMPLOYER_OFFICIAL_URLS.betriebsnummerService,
  meldeverfahrenSozialversicherung: EMPLOYER_OFFICIAL_URLS.meldeverfahrenSozialversicherung,
  ummeldung: 'https://www.bund.de/DE/themen/verwaltung-in-deutschland/buergerdienste/buergerdienste-node.html',
  wohngeld: 'https://www.bmwsb.bund.de/SharedDocs/faqs/DE/wohngeld/wohngeld.html',
  pflege: 'https://www.bund.de/DE/themen/gesundheit-und-pflege/pflege/pflege-node.html',
  arbeitslosengeldHub: BA_URLS.arbeitslosengeldHub,
  baEservices: BA_URLS.eservices,
  baBildungsgutschein: BA_URLS.bildungsgutschein,
  baWeiterbildung: BA_URLS.weiterbildung,
  gruendung: 'https://www.existenzgruender.de/DE/Home/home_node.html',
  elster: 'https://www.elster.de/eportal/start',
  kammer: 'https://www.bund.de/DE/themen/verwaltung-in-deutschland/unternehmensgruendung/unternehmensgruendung-node.html',
  foerderung: 'https://www.foerderdatenbank.de/',
  schwerbehinderung:
    'https://www.bund.de/DE/themen/verwaltung-in-deutschland/leistungen-fuer-menschen-mit-behinderungen/leistungen-fuer-menschen-mit-behinderungen-node.html',
} as const;

function info(
  url: string,
  sourceOwner: string,
  level: OfficialActionLevel,
  meta?: LinkMeta | string,
): OfficialActionLink {
  const opts = typeof meta === 'string' ? { sourceRuleId: meta } : meta;
  return {
    label: sourceOwner,
    url,
    kind: 'info_page',
    sourceOwner,
    level,
    status: 'online_info_available',
    lastVerified: V,
    confidence: 'manual_verified',
    notes: opts?.notes ?? opts?.sourceRuleId,
    ctaLabel: opts?.ctaLabel,
  };
}

function online(
  url: string,
  sourceOwner: string,
  level: OfficialActionLevel,
  meta?: LinkMeta,
): OfficialActionLink {
  const opts = meta ?? {};
  return {
    label: sourceOwner,
    url,
    kind: 'online_service',
    sourceOwner,
    level,
    status: 'online_service_available',
    lastVerified: V,
    confidence: 'official_source',
    requiresBundId: opts.requiresBundId,
    requiresEid: opts.requiresEid,
    notes: opts.notes,
    ctaLabel: opts.ctaLabel,
  };
}

function regional(
  owner: string,
  level: OfficialActionLevel = 'municipal',
  ctaLabel?: string,
): OfficialActionLink {
  return {
    label: owner,
    kind: 'appointment',
    sourceOwner: owner,
    level,
    status: 'regional_lookup_required',
    regionSpecific: true,
    lastVerified: V,
    confidence: 'needs_region_check',
    ctaLabel: ctaLabel ?? 'Zuständige Stelle suchen',
  };
}

function counselling(owner: string, level: OfficialActionLevel = 'agency'): OfficialActionLink {
  return {
    label: owner,
    kind: 'source_page',
    sourceOwner: owner,
    level,
    status: 'counselling_required',
    lastVerified: V,
    confidence: 'official_source',
  };
}

function catalogMissing(owner: string, level: OfficialActionLevel = 'mixed'): OfficialActionLink {
  return {
    label: owner,
    kind: 'source_page',
    sourceOwner: owner,
    level,
    status: 'catalog_missing',
    lastVerified: V,
    confidence: 'needs_region_check',
    ctaLabel: 'Zuständige Stelle prüfen',
  };
}

function act(
  actionId: string,
  title: string,
  description: string,
  journeyIds: CivicJourneyId[],
  bodies: string[],
  docs: string[],
  links: OfficialActionLink[],
  extra?: Partial<OfficialAction>,
): OfficialAction {
  return {
    actionId,
    title,
    description,
    journeyIds,
    triggerKeywords: extra?.triggerKeywords ?? [],
    responsibleBodies: bodies,
    requiredDocuments: docs,
    conditionalDocuments: extra?.conditionalDocuments,
    links,
    sourceRuleIds: extra?.sourceRuleIds,
    safetyNotes: extra?.safetyNotes,
  };
}

export const OFFICIAL_ACTION_CATALOG: OfficialAction[] = [
  // ── child_birth_kita ──────────────────────────────────────────────
  act(
    'birth_register',
    'Geburt beurkunden / Geburtsurkunde',
    'Die Geburt wird beim Standesamt beurkundet — Grundlage für viele Folgeanträge.',
    ['child_birth_kita'],
    ['Standesamt'],
    ['Personalausweis der Eltern', 'Muttpass / Geburtsbescheinigung der Klinik'],
    [regional('Standesamt / Kommune', 'municipal')],
    { triggerKeywords: ['geburt', 'standesamt', 'geburtsurkunde'] },
  ),
  act(
    'kindergeld_apply',
    'Kindergeld beantragen',
    'Kindergeld wird über die Familienkasse beantragt — oft nach der Geburt.',
    ['child_birth_kita', 'separation_support', 'moving_with_children', 'housing_support'],
    ['Familienkasse'],
    ['Kindergeldantrag', 'Geburtsurkunde', 'Steuer-ID des Kindes'],
    [info(VERIFIED_URLS.familienportalForms, 'Familienportal des Bundes / Familienkasse', 'federal', {
      ctaLabel: 'Kindergeld-Formular öffnen',
      notes: 'Offizieller Einstieg; Formular/Onlineweg abhängig von Familienkasse und Nutzerkonto.',
      sourceRuleId: 'vc-kindergeld',
    })],
    { sourceRuleIds: ['vc-kindergeld'], triggerKeywords: ['kindergeld'] },
  ),
  act(
    'elterngeld_apply',
    'Elterngeld beantragen',
    'Elterngeld beantragst du bei der zuständigen Familienkasse — je nach Bundesland auch digital.',
    ['child_birth_kita'],
    ['Familienkasse'],
    ['Geburtsurkunde', 'Einkommensnachweise', 'Mutterschaftsgeld-Bescheid'],
    [
      info(VERIFIED_URLS.familienportalForms, 'Familienportal des Bundes', 'federal', {
        ctaLabel: 'Formulare beim Familienportal öffnen',
        notes: 'Bundesland auswählen; Online-Antrag/Antragsformular abhängig vom Land.',
        sourceRuleId: 'vc-elterngeld',
      }),
    ],
    {
      sourceRuleIds: ['vc-elterngeld'],
      triggerKeywords: ['elterngeld', 'elternzeit'],
      safetyNotes: ['ElterngeldDigital ist je nach Bundesland verfügbar — Zuständigkeit prüfen.'],
    },
  ),
  act(
    'kinderzuschlag_check',
    'Kinderzuschlag prüfen / beantragen',
    'Bei geringem Einkommen kann der Kinderzuschlag relevant sein — über die Familienkasse.',
    ['child_birth_kita', 'housing_support', 'separation_support'],
    ['Familienkasse'],
    ['Einkommensnachweise', 'Mietunterlagen', 'Haushaltsmitglieder'],
    [info(VERIFIED_URLS.kinderzuschlag, 'Bundesagentur für Arbeit / Familienkasse', 'federal', {
      ctaLabel: 'Kinderzuschlag online prüfen',
      notes: 'KiZ-Lotse und Online-Antrag über offizielle BA-Seite.',
    })],
    { triggerKeywords: ['kinderzuschlag', 'einkommen'] },
  ),
  act(
    'kita_reserve',
    'Kita-Platz / Kinderbetreuung vormerken',
    'Kinderbetreuung ist kommunal geregelt — frühzeitig bei der zuständigen Stelle informieren.',
    ['child_birth_kita', 'childcare_school', 'moving_with_children'],
    ['Kommune / Jugendamt'],
    ['Geburtsurkunde oder Schwangerschaftsnachweis', 'Wohnsitznachweis'],
    [regional('Kommune / Jugendamt', 'municipal')],
    { sourceRuleIds: ['vc-kita'], triggerKeywords: ['kita', 'betreuung'] },
  ),
  act(
    'family_insurance',
    'Familienversicherung / Krankenkasse klären',
    'Nach der Geburt die Krankenversicherung des Kindes und ggf. Elternzeit mit der Kasse klären.',
    ['child_birth_kita', 'marriage_name_change'],
    ['Krankenkasse'],
    ['Versichertenkarte', 'Geburtsurkunde'],
    [catalogMissing('Krankenkasse', 'agency')],
    { triggerKeywords: ['krankenkasse', 'versicherung'] },
  ),
  act(
    'parental_leave_employer',
    'Elternzeit / Arbeitgeber informieren',
    'Elternzeit und Mutterschutz frühzeitig mit dem Arbeitgeber abstimmen.',
    ['child_birth_kita'],
    ['Arbeitgeber'],
    ['Geplanter Elternzeitbeginn', 'Arbeitsvertrag'],
    [counselling('Arbeitgeber / Betriebsrat', 'agency')],
    { triggerKeywords: ['elternzeit', 'arbeitgeber'] },
  ),

  // ── moving_with_children ────────────────────────────────────────────
  act(
    'residence_register',
    'Wohnsitz anmelden / ummelden',
    'Nach einem Umzug innerhalb Deutschlands meldest du dich bei der Meldebehörde an.',
    ['moving_with_children', 'marriage_name_change'],
    ['Meldebehörde / Bürgeramt'],
    ['Personalausweis oder Reisepass', 'Wohnungsgeberbestätigung'],
    [
      info(VERIFIED_URLS.ummeldung, 'Bund.de', 'municipal', 'vc-ummeldung'),
      regional('Meldebehörde', 'municipal'),
    ],
    { sourceRuleIds: ['vc-ummeldung'], triggerKeywords: ['ummeld', 'umzug', 'wohnsitz'] },
  ),
  act(
    'id_address_change',
    'Ausweisadresse ändern',
    'Bei Umzug kann die Adresse im Personalausweis geändert werden — bei der Meldebehörde.',
    ['moving_with_children', 'marriage_name_change'],
    ['Meldebehörde / Bürgeramt'],
    ['Personalausweis', 'Wohnungsgeberbestätigung'],
    [regional('Meldebehörde', 'municipal')],
    { triggerKeywords: ['ausweis', 'adresse'] },
  ),
  act(
    'school_kita_change',
    'Schulwechsel / Kita-Wechsel vorbereiten',
    'Schul- und Kitawechsel hängen von Kommune und Schulbezirk ab.',
    ['moving_with_children', 'childcare_school'],
    ['Schule / Kommune / Jugendamt'],
    ['Immatrikulations- oder Anmeldeunterlagen', 'Zeugnisse'],
    [
      regional('Schulamt / Kommune', 'municipal'),
    ],
    { triggerKeywords: ['schule', 'kita', 'wechsel'] },
  ),
  act(
    'vehicle_reregister',
    'Kfz-Ummeldung',
    'Fahrzeug ummelden, wenn du mit einem Fahrzeug umziehst.',
    ['moving_with_children', 'vehicle_registration'],
    ['Zulassungsstelle'],
    ['Fahrzeugschein', 'Personalausweis', 'eVB-Nummer', 'SEPA-Mandat Kfz-Steuer'],
    [regional('Zulassungsstelle', 'municipal')],
    { triggerKeywords: ['kfz', 'auto', 'fahrzeug', 'ummeld'] },
  ),
  act(
    'wohngeld_moving',
    'Wohngeld / Unterstützung prüfen',
    'Bei hohen Wohnkosten und niedrigem Einkommen kann Wohngeld relevant sein.',
    ['moving_with_children', 'housing_support', 'separation_support', 'pension_retirement'],
    ['Wohngeldstelle'],
    ['Mietvertrag', 'Einkommensnachweise', 'Haushaltsmitglieder'],
    [
      info(VERIFIED_URLS.wohngeld, 'BMWSB', 'federal', 'vc-wohngeld'),
      regional('Wohngeldstelle', 'municipal'),
    ],
    { sourceRuleIds: ['vc-wohngeld'], triggerKeywords: ['wohngeld', 'miete', 'einkommen'] },
  ),

  // ── housing_support ─────────────────────────────────────────────────
  act(
    'wohngeld_apply',
    'Wohngeld prüfen / beantragen',
    'Wohngeld kann bei hohen Wohnkosten und niedrigem Einkommen relevant sein.',
    ['housing_support'],
    ['Wohngeldstelle'],
    ['Mietvertrag', 'Einkommensnachweise', 'Haushaltsmitglieder'],
    [
      info(VERIFIED_URLS.wohngeld, 'BMWSB', 'federal', 'vc-wohngeld'),
      regional('Wohngeldstelle', 'municipal'),
    ],
    { sourceRuleIds: ['vc-wohngeld'] },
  ),
  act(
    'buergergeld_housing',
    'Bürgergeld prüfen',
    'Wenn das Einkommen für Wohnkosten nicht reicht, kann Bürgergeld relevant sein — Jobcenter prüft.',
    ['housing_support', 'unemployment_training', 'job_loss_unemployment', 'citizen_benefit'],
    ['Jobcenter'],
    ['Einkommensnachweise', 'Mietvertrag', 'Kontoauszüge'],
    [catalogMissing('Jobcenter', 'agency')],
    { triggerKeywords: ['bürgergeld', 'grundsicherung'] },
  ),
  act(
    'bildung_teilhabe',
    'Bildung und Teilhabe prüfen',
    'Für Kinder aus einkommensschwachen Haushalten können BuT-Leistungen relevant sein.',
    ['housing_support', 'childcare_school'],
    ['Kommune / Schulamt / Jobcenter'],
    ['Schulbescheinigung', 'Einkommensnachweise'],
    [regional('Kommune / Jobcenter', 'mixed')],
    { triggerKeywords: ['schule', 'kinder', 'teilhabe'] },
  ),

  // ── disability_support ──────────────────────────────────────────────
  act(
    'disability_certificate_apply',
    'Schwerbehindertenausweis prüfen / beantragen',
    'Anspruch und Grad der Behinderung prüft das Versorgungsamt — Clara verspricht keinen Anspruch.',
    ['disability_support'],
    ['Versorgungsamt / Integrationsamt'],
    ['Ärztliche Unterlagen', 'Ausweis'],
    [
      info(VERIFIED_URLS.schwerbehinderung, 'Bund.de', 'federal'),
      regional('Versorgungsamt', 'state'),
    ],
    { triggerKeywords: ['schwerbehindert', 'behinderung'] },
  ),

  // ── childcare_school ────────────────────────────────────────────────
  act(
    'school_transfer',
    'Schulwechsel vorbereiten',
    'Schulwechsel und Anmeldung erfolgen über die zuständige Schule bzw. Schulamt.',
    ['childcare_school'],
    ['Schule / Schulamt'],
    ['Zeugnisse', 'Immatrikulationsunterlagen'],
    [regional('Schulamt / Schule', 'municipal')],
    { triggerKeywords: ['schule', 'wechsel'] },
  ),
  act(
    'school_transport',
    'Schülerbeförderung prüfen',
    'Anspruch auf Schülerbeförderung hängt von Entfernung und regionalen Regeln ab.',
    ['childcare_school'],
    ['Schulamt / Kommune'],
    ['Schulweg-Dokumentation', 'Schulbescheinigung'],
    [regional('Schulamt', 'state')],
    { triggerKeywords: ['schülerbeförderung', 'schulweg'] },
  ),

  // ── family_care ─────────────────────────────────────────────────────
  act(
    'care_grade_apply',
    'Pflegegrad beantragen',
    'Pflegebedürftigkeit wird durch den Medizinischen Dienst geprüft.',
    ['family_care'],
    ['Pflegekasse / MD'],
    ['Antrag auf Pflegeleistungen', 'Atteste', 'Versichertennachweis'],
    [info(VERIFIED_URLS.pflege, 'Bund.de', 'federal', 'vc-pflege')],
    { sourceRuleIds: ['vc-pflege'], triggerKeywords: ['pflegegrad'] },
  ),
  act(
    'care_counselling',
    'Pflegeberatung / Pflegestützpunkt finden',
    'Pflegestützpunkte beraten zu Leistungen und Entlastung — regional unterschiedlich.',
    ['family_care'],
    ['Pflegestützpunkt'],
    [],
    [
      info(VERIFIED_URLS.pflege, 'Bund.de', 'federal'),
      regional('Pflegestützpunkt', 'municipal'),
    ],
    { triggerKeywords: ['beratung', 'pflege'] },
  ),
  act(
    'relief_benefits',
    'Entlastungsleistungen prüfen',
    'Entlastungsbetrag und Verhinderungspflege können zusätzlich relevant sein.',
    ['family_care'],
    ['Pflegekasse'],
    ['Pflegegrad-Bescheid', 'Versichertennachweis'],
    [info(VERIFIED_URLS.pflege, 'Bund.de', 'federal')],
    { triggerKeywords: ['entlastung'] },
  ),
  act(
    'power_of_attorney_hint',
    'Vollmacht / Betreuung — Orientierung',
    'Vollmachten und Betreuung sind individuell — keine Rechtsberatung durch Clara.',
    ['family_care', 'death_case'],
    ['Betreuungsgericht / Notar'],
    [],
    [counselling('Betreuungsgericht / Beratungsstelle', 'agency')],
    {
      safetyNotes: ['Keine Rechtsberatung — bei rechtlichen Fragen Fachstelle oder Anwalt.'],
      triggerKeywords: ['vollmacht', 'betreuung'],
    },
  ),

  // ── id_passport ─────────────────────────────────────────────────────
  act(
    'id_card_apply',
    'Personalausweis beantragen',
    'Personalausweis wird bei der Meldebehörde am Wohnsitz beantragt.',
    ['id_passport'],
    ['Meldebehörde / Bürgeramt'],
    ['Biometrisches Lichtbild', 'Alter Ausweis falls vorhanden', 'Geburtsurkunde bei Erstbeantragung'],
    [regional('Meldebehörde', 'municipal')],
    { triggerKeywords: ['personalausweis', 'ausweis'] },
  ),
  act(
    'passport_apply',
    'Reisepass beantragen',
    'Reisepass wird bei der Meldebehörde beantragt — Termin oft erforderlich.',
    ['id_passport'],
    ['Meldebehörde / Bürgeramt'],
    ['Biometrisches Lichtbild', 'Personalausweis'],
    [regional('Meldebehörde', 'municipal')],
    { triggerKeywords: ['reisepass', 'pass'] },
  ),
  act(
    'eid_bundid_check',
    'eID / BundID / Online-Ausweis prüfen',
    'Online-Ausweisfunktionen und BundID hängen von Ausweis und Bundesland ab.',
    ['id_passport'],
    ['BundID / Meldebehörde'],
    ['Personalausweis mit Online-Ausweisfunktion'],
    [catalogMissing('BundID / AusweisApp', 'federal')],
    { triggerKeywords: ['bundid', 'eid', 'online-ausweis'] },
  ),

  // ── separation_support ──────────────────────────────────────────────
  act(
    'maintenance_advance',
    'Unterhaltsvorschuss prüfen',
    'Unterhaltsvorschuss kann für Alleinerziehende relevant sein — beim Jugendamt.',
    ['separation_support'],
    ['Jugendamt'],
    ['Nachweis über Trennung', 'Geburtsurkunde des Kindes', 'Einkommensnachweise'],
    [regional('Jugendamt', 'municipal')],
    { triggerKeywords: ['unterhalt', 'trennung'] },
  ),
  act(
    'youth_office_counselling',
    'Jugendamt Beratung',
    'Das Jugendamt berät zu Sorge, Umgang und Unterhalt — ohne Rechtsberatung durch Clara.',
    ['separation_support'],
    ['Jugendamt'],
    [],
    [regional('Jugendamt', 'municipal')],
    { triggerKeywords: ['jugendamt', 'sorge'] },
  ),

  // ── unemployment / job loss ───────────────────────────────────────────
  act(
    'register_jobseeker',
    'Arbeitsuchend melden',
    'Vor Ende des Arbeitsverhältnisses kann eine Arbeitsuchend-Meldung relevant sein.',
    ['job_loss_unemployment', 'unemployment_training'],
    ['Agentur für Arbeit'],
    ['Personalausweis', 'Arbeitsvertrag'],
    [
      online(VERIFIED_URLS.baEservices, 'Bundesagentur für Arbeit', 'federal'),
      info(VERIFIED_URLS.arbeitslosengeldHub, 'Bundesagentur für Arbeit', 'federal', 'vc-arbeitslos'),
    ],
    { sourceRuleIds: ['vc-arbeitslos'], triggerKeywords: ['arbeitsuchend'] },
  ),
  act(
    'register_unemployed',
    'Arbeitslos melden',
    'Arbeitslosmeldung bei der Agentur für Arbeit — Fristen beachten.',
    ['job_loss_unemployment', 'unemployment_training'],
    ['Agentur für Arbeit'],
    ['Personalausweis', 'Kündigungsschreiben oder Aufhebungsvertrag', 'Arbeitsvertrag', 'Lebenslauf'],
    [
      online(VERIFIED_URLS.baEservices, 'Bundesagentur für Arbeit', 'federal'),
      info(VERIFIED_URLS.arbeitslosengeldHub, 'Bundesagentur für Arbeit', 'federal', 'vc-arbeitslos'),
    ],
    { sourceRuleIds: ['vc-arbeitslos'], triggerKeywords: ['arbeitslos', 'gekündigt'] },
  ),
  act(
    'alg1_apply',
    'Arbeitslosengeld beantragen',
    'Arbeitslosengeld I wird nach Arbeitslosmeldung bei der Agentur für Arbeit geprüft.',
    ['job_loss_unemployment', 'unemployment_training'],
    ['Agentur für Arbeit'],
    ['Kündigungsschreiben', 'Arbeitsvertrag', 'Lohnnachweise', 'Sozialversicherungsnachweise'],
    [info(VERIFIED_URLS.arbeitslosengeldHub, 'Bundesagentur für Arbeit', 'federal', 'vc-arbeitslos')],
    { sourceRuleIds: ['vc-arbeitslos'], triggerKeywords: ['alg', 'arbeitslosengeld'] },
  ),
  act(
    'training_counselling',
    'Weiterbildungsinteresse / Bildungsgutschein-Beratung vorbereiten',
    'Weiterbildungsinteresse kann Clara strukturieren. Ob eine Förderung möglich ist, klärt die Agentur für Arbeit nach Beratung und Prüfung. Ein Bildungsgutschein ist keine automatische Leistung.',
    ['job_loss_unemployment', 'unemployment_training'],
    ['Agentur für Arbeit'],
    ['Lebenslauf', 'Qualifikationsnachweise'],
    [
      counselling('Bundesagentur für Arbeit', 'federal'),
      info(VERIFIED_URLS.baBildungsgutschein, 'Bundesagentur für Arbeit', 'federal'),
      info(VERIFIED_URLS.baWeiterbildung, 'Bundesagentur für Arbeit', 'federal'),
    ],
    {
      triggerKeywords: ['weiterbildung', 'bildungsgutschein', 'qualifizierung'],
      safetyNotes: [
        'Weiterbildungsinteresse kann Clara strukturieren. Ob eine Förderung möglich ist, klärt die Agentur für Arbeit nach Beratung und Prüfung. Ein Bildungsgutschein ist keine automatische Leistung.',
      ],
    },
  ),
  act(
    'sick_note_report',
    'Arbeitsunfähigkeit melden',
    'Krankheit und Arbeitsunfähigkeit müssen Arbeitgeber und ggf. Agentur für Arbeit getrennt gemeldet werden.',
    ['job_loss_unemployment', 'unemployment_training'],
    ['Arbeitgeber', 'Agentur für Arbeit', 'Krankenkasse'],
    ['Arbeitsunfähigkeitsbescheinigung'],
    [counselling('Arbeitgeber / Krankenkasse', 'agency')],
    { triggerKeywords: ['krank', 'arbeitsunfähig', 'au'] },
  ),

  // ── pension_retirement ──────────────────────────────────────────────
  act(
    'pension_apply',
    'Rente beantragen / Rentenkonto klären',
    'Rentenantrag und Rentenkonto über die Deutsche Rentenversicherung.',
    ['pension_retirement'],
    ['Deutsche Rentenversicherung'],
    ['Personalausweis', 'Versicherungsverlauf', 'Arbeitsnachweise'],
    [catalogMissing('Deutsche Rentenversicherung', 'federal')],
    { triggerKeywords: ['rente', 'rentenkonto'] },
  ),
  act(
    'health_insurance_retirement',
    'Krankenversicherung im Ruhestand prüfen',
    'Krankenversicherungsschutz ändert sich oft beim Renteneintritt.',
    ['pension_retirement'],
    ['Krankenkasse / Rentenversicherung'],
    ['Rentenbescheid', 'Versichertennachweis'],
    [catalogMissing('Krankenkasse', 'agency')],
    { triggerKeywords: ['krankenversicherung', 'ruhestand'] },
  ),
  act(
    'basic_security_age',
    'Grundsicherung im Alter prüfen',
    'Bei geringem Einkommen im Alter kann Grundsicherung relevant sein.',
    ['pension_retirement'],
    ['Sozialamt'],
    ['Einkommensnachweise', 'Mietunterlagen'],
    [regional('Sozialamt', 'municipal')],
    { triggerKeywords: ['grundsicherung', 'einkommen'] },
  ),

  // ── death_case ──────────────────────────────────────────────────────
  act(
    'death_register',
    'Sterbefall anzeigen / Sterbeurkunde',
    'Sterbefall wird beim Standesamt beurkundet — oft über Bestatter organisiert.',
    ['death_case'],
    ['Standesamt'],
    ['Sterbeurkunde', 'Personalausweis des Verstorbenen'],
    [regional('Standesamt', 'municipal')],
    { triggerKeywords: ['sterbefall', 'sterbeurkunde'] },
  ),
  act(
    'survivor_pension',
    'Hinterbliebenenrente prüfen',
    'Hinterbliebenenleistungen über die Deutsche Rentenversicherung prüfen.',
    ['death_case'],
    ['Deutsche Rentenversicherung'],
    ['Sterbeurkunde', 'Ehe- oder Lebenspartnerschaftsnachweis'],
    [catalogMissing('Deutsche Rentenversicherung', 'federal')],
    { triggerKeywords: ['hinterblieben', 'witwen'] },
  ),
  act(
    'insurance_inform_death',
    'Krankenkasse / Versicherungen informieren',
    'Versicherungen und Verträge des Verstorbenen informieren und kündigen.',
    ['death_case'],
    ['Krankenkasse', 'Versicherungen'],
    ['Sterbeurkunde', 'Versicherungsunterlagen'],
    [counselling('Versicherungen / Krankenkasse', 'agency')],
    { triggerKeywords: ['versicherung', 'krankenkasse'] },
  ),
  act(
    'probate_orientation',
    'Nachlassgericht — Orientierung',
    'Erbschaft und Nachlass sind individuell — Clara gibt keine Rechtsberatung.',
    ['death_case'],
    ['Nachlassgericht / Notar'],
    [],
    [counselling('Nachlassgericht', 'agency')],
    {
      safetyNotes: ['Keine Rechtsberatung zu Erbfolge oder Testament.'],
      triggerKeywords: ['nachlass', 'erbe'],
    },
  ),

  // ── marriage_name_change ────────────────────────────────────────────
  act(
    'marriage_register',
    'Eheschließung anmelden',
    'Eheschließung wird beim Standesamt angemeldet — Fristen und Unterlagen regional.',
    ['marriage_name_change'],
    ['Standesamt'],
    ['Personalausweis', 'Geburtsurkunde', 'Erweiterte Meldebescheinigung'],
    [regional('Standesamt', 'municipal')],
    { triggerKeywords: ['heirat', 'eheschließung'] },
  ),
  act(
    'name_change_id',
    'Namensänderung / Ausweis ändern',
    'Nach Namensänderung Ausweis und Meldedaten aktualisieren.',
    ['marriage_name_change'],
    ['Standesamt', 'Meldebehörde'],
    ['Heiratsurkunde', 'Personalausweis'],
    [regional('Meldebehörde', 'municipal')],
    { triggerKeywords: ['namensänderung', 'name'] },
  ),
  act(
    'tax_class_info',
    'Steuerklassenwechsel — offizielle Info',
    'Steuerklassen können sich nach Heirat ändern — Finanzamt bzw. ELSTER informiert.',
    ['marriage_name_change'],
    ['Finanzamt'],
    ['Steuer-ID', 'Heiratsurkunde'],
    [info(VERIFIED_URLS.elster, 'ELSTER / Finanzverwaltung', 'federal', { ctaLabel: 'ELSTER-Portal öffnen' })],
    { triggerKeywords: ['steuerklasse'] },
  ),

  // ── vehicle_registration ────────────────────────────────────────────
  act(
    'vehicle_register',
    'Fahrzeug anmelden',
    'Neuzulassung bei der Zulassungsstelle — eVB, Versicherung und SEPA-Kfz-Steuer nötig.',
    ['vehicle_registration'],
    ['Zulassungsstelle'],
    ['Fahrzeugschein', 'eVB-Nummer', 'SEPA-Mandat', 'Personalausweis'],
    [regional('Zulassungsstelle', 'municipal')],
    { triggerKeywords: ['anmelden', 'zulassung'] },
  ),
  act(
    'vehicle_transfer',
    'Halterwechsel',
    'Beim Verkauf oder Erwerb Fahrzeug und Halter beim Zulassungsamt ummelden.',
    ['vehicle_registration'],
    ['Zulassungsstelle'],
    ['Fahrzeugschein', 'Kaufvertrag', 'eVB-Nummer'],
    [regional('Zulassungsstelle', 'municipal')],
    { triggerKeywords: ['halterwechsel', 'verkauf'] },
  ),
  act(
    'evb_insurance_tax',
    'eVB / Versicherung / SEPA-Kfz-Steuer',
    'Elektronische Versicherungsbestätigung und Kfz-Steuer vor Zulassung klären.',
    ['vehicle_registration'],
    ['Versicherung', 'Kfz-Zulassungsstelle', 'Finanzamt'],
    ['eVB-Nummer', 'SEPA-Mandat Kfz-Steuer'],
    [catalogMissing('Versicherung / Kfz-Steuer', 'mixed')],
    { triggerKeywords: ['evb', 'versicherung', 'kfz-steuer'] },
  ),

  // ── business_registration ───────────────────────────────────────────
  act(
    'trade_register',
    'Gewerbe anmelden',
    'Gewerbeanmeldung beim zuständigen Gewerbeamt.',
    ['business_registration', 'self_employed_start', 'craft_business_start', 'gastronomy_permit', 'ecommerce_start', 'company_foundation', 'business_change_deregister', 'company_relocation'],
    ['Gewerbeamt / Ordnungsamt'],
    ['Personalausweis', 'Gewerbeanmeldung'],
    [regional('Gewerbeamt', 'municipal')],
    { sourceRuleIds: ['vc-gewerbe'], triggerKeywords: ['gewerbe'] },
  ),
  act(
    'tax_registration',
    'Steuerliche Erfassung vorbereiten',
    'Fragebogen zur steuerlichen Erfassung beim Finanzamt — oft über ELSTER.',
    ['business_registration', 'self_employed_start', 'company_foundation', 'ecommerce_start', 'business_change_deregister'],
    ['Finanzamt'],
    ['Fragebogen zur steuerlichen Erfassung', 'Gewerbeanmeldung', 'Identifikationsnachweise'],
    [
      info(VERIFIED_URLS.elster, 'ELSTER / Finanzverwaltung', 'federal', {
        ctaLabel: 'ELSTER-Portal öffnen',
        notes: 'Offizieller Einstieg; Antrag/Formular über ELSTER — keine direkte Formular-URL im Katalog.',
        sourceRuleId: 'vc-finanzamt',
      }),
    ],
    { sourceRuleIds: ['vc-finanzamt'], triggerKeywords: ['steuer', 'finanzamt', 'elster'] },
  ),
  act(
    'chamber_check',
    'IHK/HWK Zuständigkeit prüfen',
    'Kammerpflichtige Berufe melden sich bei IHK oder Handwerkskammer.',
    ['business_registration', 'craft_business_start', 'company_foundation', 'business_change_deregister'],
    ['IHK oder Handwerkskammer'],
    ['Gewerbeanmeldung', 'Qualifikationsnachweise'],
    [
      info(VERIFIED_URLS.kammer, 'Bund.de', 'mixed', 'vc-kammer'),
      regional('IHK / HWK', 'state'),
    ],
    { sourceRuleIds: ['vc-kammer'], triggerKeywords: ['ihk', 'hwk', 'handwerk'] },
  ),
  act(
    'bg_register',
    'Berufsgenossenschaft informieren',
    'Unternehmen melden sich bei der zuständigen Berufsgenossenschaft an.',
    ['business_registration', 'self_employed_start', 'employer_onboarding', 'craft_business_start', 'company_foundation', 'gastronomy_permit', 'ecommerce_start'],
    ['Berufsgenossenschaft / DGUV'],
    ['Gewerbeanmeldung', 'Beschäftigtenzahl'],
    [catalogMissing('Berufsgenossenschaft / DGUV')],
    { sourceRuleIds: ['vc-bg'], triggerKeywords: ['berufsgenossenschaft', 'unfallversicherung'] },
  ),
  act(
    'permit_activity_check',
    'Erlaubnispflichtige Tätigkeit prüfen',
    'Manche Tätigkeiten brauchen Genehmigungen — regional unterschiedlich.',
    ['business_registration', 'gastronomy_permit', 'event_special_use'],
    ['Ordnungsamt / zuständige Behörde'],
    [],
    [regional('Ordnungsamt', 'municipal')],
    { triggerKeywords: ['erlaubnis', 'genehmigung'] },
  ),

  // ── self_employed_start ───────────────────────────────────────────────
  act(
    'freelance_vs_trade',
    'Freiberuflich vs. gewerblich klären',
    'Die Einordnung beeinflusst IHK-Pflicht und steuerliche Behandlung.',
    ['self_employed_start'],
    ['Finanzamt', 'IHK / HWK'],
    ['Tätigkeitsbeschreibung'],
    [
      info(VERIFIED_URLS.gruendung, 'Existenzgründerportal', 'federal'),
      regional('Gewerbeamt / Finanzamt', 'mixed'),
    ],
    { triggerKeywords: ['freiberuf', 'selbstständig'] },
  ),
  act(
    'self_employed_social',
    'Krankenversicherung / Rentenversicherung prüfen',
    'Selbstständige wählen Kranken- und Rentenversicherung bewusst.',
    ['self_employed_start'],
    ['Krankenkasse', 'Deutsche Rentenversicherung'],
    ['Nachweis der Tätigkeit'],
    [catalogMissing('Krankenkasse / DRV', 'agency')],
    { triggerKeywords: ['krankenversicherung', 'rentenversicherung'] },
  ),

  // ── company_foundation ──────────────────────────────────────────────
  act(
    'legal_form_orientation',
    'Rechtsform wählen — Orientierung',
    'Rechtsform beeinflusst Haftung, Steuern und Gründungsweg — keine Rechtsberatung.',
    ['company_foundation'],
    ['Notar', 'IHK', 'Existenzgründerberatung'],
    [],
    [info(VERIFIED_URLS.gruendung, 'Existenzgründerportal', 'federal', 'vc-gruendung')],
    {
      sourceRuleIds: ['vc-gruendung'],
      safetyNotes: ['Keine Rechtsberatung zur Wahl der Rechtsform.'],
      triggerKeywords: ['rechtsform', 'gmbh', 'ug'],
    },
  ),
  act(
    'notary_contract',
    'Notar / Gesellschaftsvertrag',
    'Kapitalgesellschaften werden notariell gegründet.',
    ['company_foundation'],
    ['Notar'],
    ['Gesellschafterliste', 'Stammkapital-Nachweis'],
    [regional('Notar', 'state')],
    { triggerKeywords: ['notar', 'gesellschaftsvertrag'] },
  ),
  act(
    'commercial_register',
    'Handelsregister',
    'Eintragung ins Handelsregister nach notarieller Beurkundung.',
    ['company_foundation'],
    ['Handelsregister / Notar'],
    ['Gesellschaftsvertrag', 'Gesellschafterliste'],
    [regional('Handelsregister', 'federal')],
    { triggerKeywords: ['handelsregister'] },
  ),

  // ── employer_onboarding ─────────────────────────────────────────────
  act(
    'employer_number',
    'Betriebsnummer beantragen',
    'Betriebsnummer für Meldungen an Sozialversicherung und Agentur für Arbeit.',
    ['employer_onboarding'],
    ['Bundesagentur für Arbeit'],
    ['Unternehmensdaten', 'Gewerbeanmeldung'],
    [
      info(VERIFIED_URLS.betriebsnummerService, 'Bundesagentur für Arbeit', 'federal', {
        ctaLabel: 'Betriebsnummer-Service öffnen',
        notes: 'Offizieller BA-Einstieg zur Betriebsnummer; Online-Antrag wird dort angeboten.',
        sourceRuleId: 'vc-personal',
      }),
    ],
    { sourceRuleIds: ['vc-personal'], triggerKeywords: ['betriebsnummer'] },
  ),
  act(
    'social_insurance_employer',
    'Sozialversicherung / Krankenkasse',
    'Erstmeldung und laufende Sozialversicherungsmeldungen für Beschäftigte.',
    ['employer_onboarding'],
    ['Krankenkasse', 'Bundesagentur für Arbeit'],
    ['Arbeitsvertrag', 'Sozialversicherungsmeldungen'],
    [
      info(VERIFIED_URLS.meldeverfahrenSozialversicherung, 'Bundesagentur für Arbeit', 'federal', {
        ctaLabel: 'Meldeverfahren öffnen',
        notes: 'Informationen zu Meldungen, Betriebsnummer und Sozialversicherung.',
      }),
    ],
    { triggerKeywords: ['sozialversicherung', 'krankenkasse'] },
  ),
  act(
    'payroll_tax_elster',
    'Lohnsteuer / ELSTER',
    'Lohnsteuer-Anmeldung und laufende Meldungen über Finanzamt bzw. ELSTER.',
    ['employer_onboarding'],
    ['Finanzamt'],
    ['Betriebsnummer', 'Lohnunterlagen'],
    [
      info(VERIFIED_URLS.elster, 'ELSTER / Finanzverwaltung', 'federal', {
        ctaLabel: 'ELSTER-Portal öffnen',
        notes: 'Offizieller Einstieg für Lohnsteuer-Meldungen über ELSTER.',
      }),
    ],
    { triggerKeywords: ['lohnsteuer', 'elster'] },
  ),
  act(
    'employment_contract_orientation',
    'Arbeitsvertrag / Datenschutz — Orientierung',
    'Arbeitsverträge und Datenschutz im Betrieb — keine Rechtsberatung durch Clara.',
    ['employer_onboarding'],
    ['Arbeitgeber / Datenschutzbeauftragter'],
    ['Arbeitsvertragsentwurf'],
    [counselling('IHK / Rechtsberatung', 'agency')],
    {
      safetyNotes: ['Keine Rechtsberatung zu Arbeitsverträgen.'],
      triggerKeywords: ['arbeitsvertrag', 'datenschutz'],
    },
  ),

  // ── craft_business_start ────────────────────────────────────────────
  act(
    'craft_roll_check',
    'Handwerksrolle / HWK prüfen',
    'Zulassungsfreie und zulassungspflichtige Handwerke unterscheiden sich.',
    ['craft_business_start'],
    ['Handwerkskammer'],
    ['Qualifikationsnachweise', 'Meisterbrief falls erforderlich'],
    [
      info(VERIFIED_URLS.kammer, 'Bund.de', 'mixed'),
      regional('Handwerkskammer', 'state'),
    ],
    { triggerKeywords: ['handwerksrolle', 'meister'] },
  ),
  act(
    'craft_qualification',
    'Qualifikationsnachweise',
    'Handwerkskarte oder Eintragung in die Handwerksrolle kann erforderlich sein.',
    ['craft_business_start'],
    ['Handwerkskammer'],
    ['Qualifikationsnachweise', 'Gesellenbrief / Meisterbrief'],
    [regional('Handwerkskammer', 'state')],
    { triggerKeywords: ['qualifikation', 'handwerkskarte'] },
  ),

  // ── gastronomy_permit ───────────────────────────────────────────────
  act(
    'gastronomy_permit_apply',
    'Gaststättenerlaubnis',
    'Gaststättenerlaubnis bei der zuständigen Behörde — wenn Ausschank oder Bewirtung.',
    ['gastronomy_permit'],
    ['Ordnungsamt / Gewerbeamt'],
    ['Gewerbeanmeldung', 'Zuverlässigkeitsnachweis', 'Raumplan'],
    [regional('Ordnungsamt', 'municipal')],
    { triggerKeywords: ['gaststätte', 'ausschank', 'alkohol'] },
  ),
  act(
    'health_food_authority',
    'Gesundheitsamt / Lebensmittelhygiene',
    'Lebensmittelhygiene und Infektionsschutz beim Gesundheitsamt.',
    ['gastronomy_permit', 'event_special_use', 'ecommerce_start'],
    ['Gesundheitsamt'],
    ['Hygieneunterweisung', 'HACCP-Konzept'],
    [regional('Gesundheitsamt', 'municipal')],
    { triggerKeywords: ['lebensmittel', 'hygiene', 'gesundheitsamt'] },
  ),
  act(
    'outdoor_seating_permit',
    'Sondernutzung Außenfläche',
    'Außenbestuhlung auf öffentlichem Grund oft Sondernutzungserlaubnis.',
    ['gastronomy_permit', 'event_special_use'],
    ['Ordnungsamt'],
    ['Lageplan', 'Gewerbeanmeldung'],
    [regional('Ordnungsamt', 'municipal')],
    { triggerKeywords: ['außenfläche', 'sondernutzung'] },
  ),
  act(
    'building_use_gastro',
    'Bauamt / Nutzungsänderung',
    'Nutungsänderung am Standort kann bauordnungsrechtlich relevant sein.',
    ['gastronomy_permit', 'building_use_change'],
    ['Bauamt'],
    ['Grundriss', 'Nutzungskonzept'],
    [regional('Bauamt', 'municipal')],
    { triggerKeywords: ['bauamt', 'nutzungsänderung'] },
  ),

  // ── business_change_deregister ──────────────────────────────────────
  act(
    'trade_relocate',
    'Gewerbe ummelden',
    'Gewerbeummeldung bei Standortwechsel.',
    ['business_change_deregister', 'company_relocation'],
    ['Gewerbeamt'],
    ['Gewerbeanmeldung', 'Personalausweis'],
    [regional('Gewerbeamt', 'municipal')],
    { triggerKeywords: ['ummeld', 'standort'] },
  ),
  act(
    'trade_deregister',
    'Gewerbe abmelden',
    'Gewerbeabmeldung beim Gewerbeamt bei Aufgabe der Tätigkeit.',
    ['business_change_deregister'],
    ['Gewerbeamt'],
    ['Gewerbeanmeldung', 'Personalausweis'],
    [regional('Gewerbeamt', 'municipal')],
    { triggerKeywords: ['abmelden', 'aufgeben'] },
  ),
  act(
    'finanzamt_inform_close',
    'Finanzamt informieren',
    'Finanzamt über Beendigung oder Änderung der Tätigkeit informieren.',
    ['business_change_deregister'],
    ['Finanzamt'],
    ['Gewerbeabmeldung', 'Schlussrechnungen'],
    [info(VERIFIED_URLS.elster, 'ELSTER / Finanzverwaltung', 'federal', { ctaLabel: 'ELSTER-Portal öffnen' })],
    { triggerKeywords: ['finanzamt'] },
  ),
  act(
    'chamber_update',
    'IHK/HWK aktualisieren',
    'Kammer über Änderung oder Beendigung informieren.',
    ['business_change_deregister'],
    ['IHK / HWK'],
    ['Gewerbeabmeldung'],
    [info(VERIFIED_URLS.kammer, 'Bund.de', 'mixed')],
    { triggerKeywords: ['ihk', 'hwk'] },
  ),

  // ── funding_startup ───────────────────────────────────────────────────
  act(
    'funding_database',
    'Förderdatenbank recherchieren',
    'Öffentliche Förderprogramme in der Förderdatenbank recherchieren.',
    ['funding_startup', 'public_procurement_readiness'],
    ['Fördergeber (Bund, Länder, EU)'],
    ['Projektbeschreibung', 'Finanzplan'],
    [info(VERIFIED_URLS.foerderung, 'BMWE Förderdatenbank', 'federal', 'vc-foerderung')],
    { sourceRuleIds: ['vc-foerderung'], triggerKeywords: ['förder', 'zuschuss'] },
  ),
  act(
    'founding_grant_counselling',
    'Gründungszuschuss Beratung',
    'Gründungszuschuss nur nach Beratung und Prüfung durch die Agentur für Arbeit.',
    ['funding_startup', 'unemployment_training', 'job_loss_unemployment'],
    ['Agentur für Arbeit'],
    ['Arbeitslosmeldung', 'Businessplan'],
    [counselling('Bundesagentur für Arbeit', 'federal')],
    {
      triggerKeywords: ['gründungszuschuss', 'existenzgründung'],
      safetyNotes: ['Gründungszuschuss ist keine automatische Leistung — Beratung erforderlich.'],
    },
  ),
  act(
    'regional_funding',
    'Landes-/Kommunalförderung prüfen',
    'Regionale Förderprogramme über IHK, HWK oder Wirtschaftsförderung.',
    ['funding_startup'],
    ['IHK / Kommune / Wirtschaftsförderung'],
    ['Businessplan', 'Finanzplan'],
    [regional('Wirtschaftsförderung', 'mixed')],
    { triggerKeywords: ['landesförderung', 'kommune'] },
  ),
  act(
    'business_plan_prep',
    'Businessplan / Finanzplan vorbereiten',
    'Businessplan für Banken, Förderstellen und Beratung vorbereiten.',
    ['funding_startup', 'company_foundation'],
    ['IHK / Beratungsstelle'],
    ['Finanzplan', 'Marktanalyse'],
    [info(VERIFIED_URLS.gruendung, 'Existenzgründerportal', 'federal')],
    { triggerKeywords: ['businessplan', 'finanzplan'] },
  ),

  // ── building_use_change ───────────────────────────────────────────────
  act(
    'use_change_check',
    'Nutzungsänderung prüfen',
    'Geänderte Nutzung eines Gebäudes kann genehmigungspflichtig sein.',
    ['building_use_change'],
    ['Bauamt'],
    ['Grundriss', 'Nutzungsbeschreibung'],
    [regional('Bauamt', 'municipal')],
    { triggerKeywords: ['nutzungsänderung'] },
  ),
  act(
    'building_permit_check',
    'Baugenehmigung prüfen',
    'Bauvorhaben und Umbauten können baugenehmigungspflichtig sein.',
    ['building_use_change'],
    ['Bauamt'],
    ['Bauzeichnungen', 'Lageplan'],
    [regional('Bauamt', 'municipal')],
    { triggerKeywords: ['baugenehmigung', 'bauantrag'] },
  ),
  act(
    'fire_accessibility_parking',
    'Brandschutz / Stellplätze / Barrierefreiheit',
    'Nebenanforderungen je nach Nutzung und Gebäude prüfen.',
    ['building_use_change', 'gastronomy_permit'],
    ['Bauamt', 'Brandschutz'],
    ['Nutzungskonzept'],
    [regional('Bauamt / Brandschutz', 'municipal')],
    { triggerKeywords: ['brandschutz', 'stellplatz', 'barrierefrei'] },
  ),

  // ── event_special_use ───────────────────────────────────────────────
  act(
    'event_register',
    'Veranstaltung anmelden',
    'Veranstaltungen können beim Ordnungsamt oder der Kommune angemeldet werden müssen.',
    ['event_special_use'],
    ['Ordnungsamt / Kommune'],
    ['Veranstaltungskonzept', 'Sicherheitskonzept'],
    [regional('Ordnungsamt', 'municipal')],
    { triggerKeywords: ['veranstaltung', 'event'] },
  ),
  act(
    'special_use_apply',
    'Sondernutzung beantragen',
    'Nutzung öffentlicher Flächen erfordert oft eine Sondernutzungserlaubnis.',
    ['event_special_use'],
    ['Ordnungsamt'],
    ['Lageplan', 'Zeitraum', 'Sicherheitskonzept'],
    [regional('Ordnungsamt', 'municipal')],
    { triggerKeywords: ['sondernutzung'] },
  ),
  act(
    'traffic_noise_safety',
    'Straßenverkehr / Lärm / Sicherheit prüfen',
    'Verkehrsführung, Lärmschutz und Sicherheit bei Veranstaltungen klären.',
    ['event_special_use'],
    ['Ordnungsamt', 'Polizei / Straßenverkehrsbehörde'],
    ['Verkehrs- und Sicherheitskonzept'],
    [regional('Ordnungsamt', 'municipal')],
    { triggerKeywords: ['verkehr', 'lärm', 'sicherheit'] },
  ),

  // ── ecommerce_start ─────────────────────────────────────────────────
  act(
    'packaging_register',
    'Verpackungsregister prüfen',
    'Verpackungsgesetz kann Registrierung im Verpackungsregister erfordern.',
    ['ecommerce_start'],
    ['Verpackungsregister / Stiftung Zentrale Stelle'],
    ['Verpackungsmengen-Schätzung'],
    [catalogMissing('Verpackungsregister', 'federal')],
    { triggerKeywords: ['verpackung', 'lucid'] },
  ),
  act(
    'vat_oss_check',
    'USt-ID / OSS prüfen',
    'Grenzüberschreitender Handel kann USt-ID und OSS-Verfahren erfordern.',
    ['ecommerce_start'],
    ['Finanzamt'],
    ['Umsatzprognose', 'Lieferländer'],
    [info(VERIFIED_URLS.elster, 'ELSTER / Finanzverwaltung', 'federal', { ctaLabel: 'ELSTER-Portal öffnen' })],
    { triggerKeywords: ['umsatzsteuer', 'oss', 'ust-id'] },
  ),
  act(
    'privacy_imprint_orientation',
    'Datenschutz / Impressum — Orientierung',
    'Impressum und Datenschutzhinweise für Online-Shops — keine Rechtsberatung.',
    ['ecommerce_start'],
    ['Datenschutzbeauftragter / IT-Dienstleister'],
    [],
    [counselling('Datenschutz / IHK', 'agency')],
    {
      safetyNotes: ['Keine Rechtsberatung zu Impressum oder Datenschutz.'],
      triggerKeywords: ['impressum', 'datenschutz'],
    },
  ),

  // ── public_procurement_readiness ────────────────────────────────────
  act(
    'procurement_platform',
    'Vergabeplattform finden',
    'Öffentliche Ausschreibungen über Vergabeplattformen des Bundes und der Länder.',
    ['public_procurement_readiness'],
    ['Vergabestelle / Vergabeplattform'],
    ['Unternehmensprofil'],
    [catalogMissing('Vergabeplattform', 'federal')],
    { triggerKeywords: ['vergabe', 'ausschreibung'] },
  ),
  act(
    'prequalification_check',
    'Präqualifikation prüfen',
    'Präqualifikationsregister kann für öffentliche Aufträge relevant sein.',
    ['public_procurement_readiness'],
    ['Präqualifikationsstelle'],
    ['Referenzen', 'Unternehmensnachweise'],
    [catalogMissing('Präqualifikationsregister', 'federal')],
    { triggerKeywords: ['präqualifikation'] },
  ),
  act(
    'self_declarations_prep',
    'Eigenerklärungen / Registerauszüge vorbereiten',
    'Ausschreibungen verlangen oft Eigenerklärungen und Registerauszüge.',
    ['public_procurement_readiness'],
    ['Vergabestelle'],
    ['Handelsregisterauszug', 'Gewerbeanmeldung', 'Eigenerklärungen'],
    [counselling('IHK / Vergabestelle', 'agency')],
    { triggerKeywords: ['eigenerklärung', 'registerauszug'] },
  ),
  act(
    'references_prep',
    'Referenzen / Nachweise vorbereiten',
    'Referenzprojekte und Nachweise für Ausschreibungen sammeln.',
    ['public_procurement_readiness'],
    ['Unternehmen'],
    ['Referenzliste', 'Projektnachweise'],
    [counselling('Vergabestelle', 'agency')],
    { triggerKeywords: ['referenz', 'nachweis'] },
  ),

  // ── catalog_missing fallback per journey without primary URL ─────────
  ...(['id_passport', 'death_case', 'marriage_name_change', 'pension_retirement', 'building_use_change', 'event_special_use', 'public_procurement_readiness', 'disability_support', 'citizen_benefit', 'company_relocation'] as CivicJourneyId[]).map(
    (jid) =>
      act(
        `catalog_orientation_${jid}`,
        'Weitere zuständige Stellen regional klären',
        'Für einige Schritte liegt noch kein verifizierter Formular-Link im Katalog vor — Clara zeigt die nächsten offiziellen Orientierungspunkte.',
        [jid],
        ['Kommune / zuständige Behörde'],
        [],
        [catalogMissing('Kommune / regional abhängig', 'mixed')],
      ),
  ),
];

export function getOfficialActionsForJourney(journeyId: CivicJourneyId): OfficialAction[] {
  return OFFICIAL_ACTION_CATALOG.filter(
    (a) => a.journeyIds.includes(journeyId) && !a.actionId.startsWith('catalog_orientation_'),
  );
}

export function getCatalogOrientationAction(journeyId: CivicJourneyId): OfficialAction | undefined {
  return OFFICIAL_ACTION_CATALOG.find((a) => a.actionId === `catalog_orientation_${journeyId}`);
}

export function getAllJourneyIdsInCatalog(): CivicJourneyId[] {
  const ids = new Set<CivicJourneyId>();
  for (const a of OFFICIAL_ACTION_CATALOG) {
    for (const j of a.journeyIds) ids.add(j);
  }
  return Array.from(ids);
}
