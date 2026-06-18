import type { OfficialActionLink, OfficialActionStatus } from '@/lib/civic/officialActionTypes';

export function linkCtaLabel(link: OfficialActionLink, du = true): string {
  if (!link.url) {
    switch (link.status) {
      case 'counselling_required':
        return du ? 'Beratung vorbereiten' : 'Beratung vorbereiten';
      case 'regional_lookup_required':
      case 'appointment_required':
        return du ? 'Zuständige Stelle suchen' : 'Zuständige Stelle suchen';
      case 'catalog_missing':
        return du ? 'Quelle/Formular noch nicht im Katalog hinterlegt' : 'Quelle/Formular noch nicht im Katalog hinterlegt';
      default:
        return du ? 'Offizielle Informationen öffnen' : 'Offizielle Informationen öffnen';
    }
  }

  switch (link.kind) {
    case 'online_service':
      return du ? 'Online-Antrag starten' : 'Online-Antrag starten';
    case 'pdf_form':
      return du ? 'Formular herunterladen' : 'Formular herunterladen';
    case 'appointment':
      return du ? 'Termin / zuständige Stelle finden' : 'Termin / zuständige Stelle finden';
    case 'info_page':
    case 'source_page':
    default:
      return du ? 'Offizielle Informationen öffnen' : 'Offizielle Informationen öffnen';
  }
}

export function statusBadgeLabel(status: OfficialActionStatus, du = true): string {
  const labels: Record<OfficialActionStatus, string> = {
    online_service_available: du ? 'Online-Dienst' : 'Online-Dienst',
    online_info_available: du ? 'Offizielle Info' : 'Offizielle Info',
    pdf_form_available: du ? 'Formular' : 'Formular',
    appointment_required: du ? 'Termin nötig' : 'Termin nötig',
    regional_lookup_required: du ? 'Regional prüfen' : 'Regional prüfen',
    counselling_required: du ? 'Beratung nötig' : 'Beratung nötig',
    catalog_missing: du ? 'Katalog ergänzen' : 'Katalog ergänzen',
  };
  return labels[status];
}

export function primaryLinkStatus(links: OfficialActionLink[]): OfficialActionStatus {
  const primary = links.find((l) => l.url) ?? links[0];
  return primary?.status ?? 'catalog_missing';
}
