import type { Candidate } from '@/types';

/** Nur explizit verifizierte Bilder anzeigen — keine Wikimedia-Hotlinks o. Ä. */
export function isCandidateImageVerified(candidate: Candidate): boolean {
  return candidate.image_verified === true && Boolean(candidate.image?.trim());
}

export function candidateInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((part) => part[0]?.toUpperCase() || '')
    .filter(Boolean)
    .slice(0, 2)
    .join('');
}
