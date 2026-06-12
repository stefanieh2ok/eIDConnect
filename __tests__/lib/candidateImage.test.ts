import { candidateInitials, isCandidateImageVerified } from '@/lib/candidateImage';
import type { Candidate } from '@/types';

describe('candidateImage', () => {
  it('zeigt Bild nur bei image_verified === true', () => {
    const unverified: Candidate = {
      name: 'Max Mustermann',
      partei: 'Demo',
      alter: '40',
      beruf: 'Test',
      positionen: ['Kandidat'],
      image: 'https://example.org/photo.jpg',
    };
    expect(isCandidateImageVerified(unverified)).toBe(false);

    const verified: Candidate = {
      ...unverified,
      image_verified: true,
    };
    expect(isCandidateImageVerified(verified)).toBe(true);
  });

  it('bildet Initialen aus dem Namen', () => {
    expect(candidateInitials('Anna Beispiel')).toBe('AB');
    expect(candidateInitials('Klaus')).toBe('K');
  });
});
