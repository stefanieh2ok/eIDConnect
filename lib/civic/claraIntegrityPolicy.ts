/**
 * Clara integrity / fairness routing — not a punishment system.
 * Routes ambiguous or sensitive input to safe advisor responses.
 */

export type IntegrityIntentClass =
  | 'normal_help'
  | 'ambiguous_health_or_benefit'
  | 'possible_avoidance'
  | 'request_for_improper_benefit'
  | 'improper_benefit_reporting'
  | 'self_harm_or_crisis'
  | 'medical_or_legal_complexity';

export type IntegrityAssessment = {
  intentClass: IntegrityIntentClass;
  flags: string[];
  /** Higher = more sensitive routing needed */
  sensitivity: 'low' | 'medium' | 'high';
};

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, ' ').trim();
}

export function classifyIntegrityIntent(inputText: string): IntegrityAssessment {
  const t = normalize(inputText);
  const flags: string[] = [];

  if (
    /suizid|selbstmord|leben beenden|nicht mehr leben|umbringen|notfall.*psych/i.test(t)
  ) {
    return {
      intentClass: 'self_harm_or_crisis',
      flags: ['crisis_language'],
      sensitivity: 'high',
    };
  }

  const explicitFakeSick =
    /obwohl ich nicht krank|obwohl ich gesund|nicht krank bin.*krankschreib|krankschreib.*obwohl|vortäuschen|simulieren|vorgaukeln|ohne.*krank.*krankschreib|falsche.*krankschreib/i.test(
      t,
    );

  if (explicitFakeSick) {
    flags.push('explicit_improper_sick_leave');
    return {
      intentClass: 'request_for_improper_benefit',
      flags,
      sensitivity: 'high',
    };
  }

  const sickNoteMention =
    /krankschreib|krank\s*schreib|krankschreibung|arbeitsunfähig|au\s*bescheinigung|krankmelden/i.test(t);

  const benefitContext =
    /arbeitslosengeld|alg\s*1|alg1|bürgergeld|jobcenter|arbeitsagentur|termin.*verschieb|pflichttermin/i.test(
      t,
    );

  if (sickNoteMention && benefitContext) {
    flags.push('health_benefit_overlap');
    return {
      intentClass: 'ambiguous_health_or_benefit',
      flags,
      sensitivity: 'medium',
    };
  }

  if (
    sickNoteMention &&
    /verschieb|vermeid|umgeh|taktik|trick|ausweg|nicht hin/i.test(t)
  ) {
    flags.push('possible_avoidance_language');
    return {
      intentClass: 'possible_avoidance',
      flags,
      sensitivity: 'medium',
    };
  }

  if (sickNoteMention) {
    flags.push('health_mention');
    return {
      intentClass: 'ambiguous_health_or_benefit',
      flags,
      sensitivity: 'low',
    };
  }

  if (/rechtsanwalt|anwalt.*mandat|gericht.*klage|strafrecht|betrug/i.test(t)) {
    flags.push('legal_complexity');
    return {
      intentClass: 'medical_or_legal_complexity',
      flags,
      sensitivity: 'medium',
    };
  }

  const benefitMisreport =
    /bürgergeld|grundsicherung|hartz iv|hartziv|jobcenter.*leistung/i.test(t) &&
    /obwohl|trotzdem noch|eigentlich noch|verstecken|falsch.*angab|nicht angeben|nicht dazu sagen|heimlich|umgehen/i.test(
      t,
    );

  if (benefitMisreport) {
    flags.push('benefit_misreporting');
    return {
      intentClass: 'improper_benefit_reporting',
      flags,
      sensitivity: 'high',
    };
  }

  return {
    intentClass: 'normal_help',
    flags,
    sensitivity: 'low',
  };
}
