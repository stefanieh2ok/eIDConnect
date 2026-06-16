import type { CivicCasePlanResult } from '@/lib/govdata/serviceTypes';
import { CLARA_CASE_DISCLAIMER } from '@/lib/claraCaseGuidance';

/** Client-side demo export — plain text, not an official PDF. */
export function buildCasePlanTextExport(plan: CivicCasePlanResult, du = true): string {
  const lines: string[] = [
    'HookAI Civic — Behördenfahrplan (Vorbereitung, Demo-Export)',
    '============================================================',
    '',
    du ? 'Kurzfassung' : 'Kurzfassung',
    plan.situationSummary,
    '',
  ];

  if (plan.topics.length) {
    lines.push('Betroffene Themen', plan.topics.join(', '), '');
  }

  if (plan.touchedAuthorities.length) {
    lines.push('Beteiligte Stellen', ...plan.touchedAuthorities.map((a) => `- ${a}`), '');
  }

  if (plan.sequenceSteps.length) {
    lines.push('Sinnvolle Reihenfolge', ...plan.sequenceSteps.map((s, i) => `${i + 1}. ${s}`), '');
  }

  if (plan.documents.length) {
    lines.push(
      'Unterlagen-Check',
      ...plan.documents.map((d) => `- ${d.label}`),
      '',
    );
  }

  if (plan.handoverLinks.length) {
    lines.push('Offizielle Übergabe (extern)');
    for (const link of plan.handoverLinks) {
      lines.push(`- ${link.title}: ${link.label}${link.url ? ` (${link.url})` : ''}`);
    }
    lines.push('');
  }

  lines.push('Hinweise', CLARA_CASE_DISCLAIMER, '');
  lines.push('— Exportiert aus HookAI Civic. Kein amtliches Dokument. —');

  return lines.join('\n');
}

export function downloadCasePlanTextExport(plan: CivicCasePlanResult, du = true): void {
  if (typeof window === 'undefined') return;
  const body = buildCasePlanTextExport(plan, du);
  const blob = new Blob([body], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'behoerdenfahrplan-vorbereitung.txt';
  anchor.click();
  URL.revokeObjectURL(url);
}
