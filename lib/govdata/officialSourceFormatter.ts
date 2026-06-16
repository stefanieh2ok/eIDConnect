/**
 * Official source labels for service cards and handover links.
 */
import { CLARA_CONFIDENCE_LABELS } from '@/lib/claraCaseGuidance';
import {
  EXTERNAL_HANDOVER_NOTICE,
  handoverLinkLabel,
  resolveExternalLinkStatus,
} from '@/lib/govdata/externalLinkGate';
import { DEMO_SERVICE_SOURCE_LABEL } from '@/lib/govdata/sourceStatus';
import type { GovService, GovServiceSourceSystem, OfficialHandoverLink } from '@/lib/govdata/serviceTypes';

export function sourceSystemLabel(source: GovServiceSourceSystem): string {
  switch (source) {
    case 'PVOG':
      return 'PVOG / Portalverbund';
    case 'Bundesportal':
      return 'Bundesportal';
    case 'ManualDemo':
      return DEMO_SERVICE_SOURCE_LABEL;
    case 'Unknown':
    default:
      return 'Quelle unbekannt';
  }
}

export function isDemoSource(source: GovServiceSourceSystem): boolean {
  return source === 'ManualDemo' || source === 'Unknown';
}

export function confidenceLabel(confidence: GovService['confidence']): string {
  switch (confidence) {
    case 'high':
      return CLARA_CONFIDENCE_LABELS.high;
    case 'medium':
      return CLARA_CONFIDENCE_LABELS.medium;
    case 'low':
    default:
      return CLARA_CONFIDENCE_LABELS.low;
  }
}

export function formatOfficialHandover(service: GovService): OfficialHandoverLink[] {
  const linkStatus = resolveExternalLinkStatus(service);
  const links: OfficialHandoverLink[] = [];
  if (service.officialSourceUrl) {
    links.push({
      id: `${service.serviceId}-source`,
      title: service.title,
      url: service.officialSourceUrl,
      label: handoverLinkLabel(linkStatus, 'source'),
      authority: service.responsibleAuthority,
      linkStatus,
    });
  }
  if (service.onlineServiceUrl) {
    links.push({
      id: `${service.serviceId}-online`,
      title: 'Online-Dienst',
      url: service.onlineServiceUrl,
      label: handoverLinkLabel(linkStatus, 'online'),
      authority: service.responsibleAuthority,
      linkStatus,
    });
  }
  if (service.formUrl) {
    links.push({
      id: `${service.serviceId}-form`,
      title: 'Offizielles Formular',
      url: service.formUrl,
      label: handoverLinkLabel(linkStatus, 'form'),
      authority: service.responsibleAuthority,
      linkStatus,
    });
  }
  if (links.length === 0 && service.responsibleAuthority) {
    links.push({
      id: `${service.serviceId}-authority`,
      title: service.responsibleAuthority,
      label: handoverLinkLabel(linkStatus, 'authority'),
      authority: service.responsibleAuthority,
      linkStatus,
    });
  }
  return links;
}

export { EXTERNAL_HANDOVER_NOTICE };
