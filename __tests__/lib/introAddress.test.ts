import { INTRO_OVERLAY_STEPS } from '@/data/introOverlayMarketing';
import { adaptIntroAddress } from '@/lib/introAddress';

describe('adaptIntroAddress', () => {
  it('belässt die Sie-Form unverändert, wenn du=false', () => {
    for (const step of INTRO_OVERLAY_STEPS) {
      expect(adaptIntroAddress(step.body, false)).toBe(step.body);
    }
  });

  it('wandelt Abstimmen-Intro in korrekte Du-Form um', () => {
    const abstimmenBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'abstimmen')?.body ?? '';
    const out = adaptIntroAddress(abstimmenBody, true);

    expect(out).toContain('Hier kannst du aktuelle Themen ansehen');
    expect(out).toContain('Du kannst zwischen „Dafür“, „Dagegen“ oder „Enthaltung“ wählen.');
    expect(out).toContain('findest du zusätzliche Informationen');
    expect(out).toContain('Wenn du am Prämiensystem teilnimmst');
  });

  it('wandelt Wahlen-Intro in korrekte Du-Form um (ohne „Sie“=sie fälschlich zu ersetzen)', () => {
    const wahlenBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'wahlen')?.body ?? '';
    const out = adaptIntroAddress(wahlenBody, true);

    expect(out).toContain('In diesem Bereich findest du verschiedene Wahlen.');
    expect(out).toContain(
      'Du kannst dir Stimmzettel ansehen sowie Informationen zu Kandidaten und Programmen abrufen.',
    );
    expect(out).toContain('Die angezeigten Ergebnisse dienen in dieser Demo zur Veranschaulichung.');
    expect(out).toContain('Sie ersetzen keine offiziellen Wahlergebnisse.');
  });

  it('wandelt Kalender-Intro in korrekte Du-Form um', () => {
    const kalenderBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'kalender')?.body ?? '';
    const out = adaptIntroAddress(kalenderBody, true);

    expect(out).toContain('Im Kalender siehst du anstehende Wahlen und Abstimmungen auf einen Blick.');
    expect(out).toContain('Du kannst nach Bereichen und Zeiträumen filtern.');
    expect(out).toContain('So behältst du den Überblick über relevante Termine.');
  });

  it('wandelt Meldungen-Intro in korrekte Du-Form um', () => {
    const meldungenBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'meldungen')?.body ?? '';
    const out = adaptIntroAddress(meldungenBody, true);

    expect(out).toContain('Hier kannst du Anliegen, Hinweise oder Probleme digital melden.');
    expect(out).toContain(
      'Deine Meldung wird strukturiert erfasst und an die zuständige Stelle weitergeleitet.',
    );
    expect(out).toContain('Du kannst jederzeit nachvollziehen, was mit deiner Meldung passiert.');
  });

  it('wandelt Politikbarometer-Intro in korrekte Du-Form um', () => {
    const body = INTRO_OVERLAY_STEPS.find((s) => s.id === 'politikbarometer')?.body ?? '';
    const out = adaptIntroAddress(body, true);
    expect(out).toContain('legst du fest, welche Themen dir wichtig sind');
    expect(out).toContain('Die App weist dich anschließend');
    expect(out).toContain('in deinen Kalender ein');
  });

  it('wandelt Prämien-Intro in korrekte Du-Form um', () => {
    const praemienBody = INTRO_OVERLAY_STEPS.find((s) => s.id === 'praemien')?.body ?? '';
    const out = adaptIntroAddress(praemienBody, true);

    expect(out).toContain('Du kannst freiwillig am Prämiensystem teilnehmen.');
    expect(out).toContain(
      'Für bestimmte Aktionen, wie zum Beispiel Abstimmungen, erhältst du Punkte.',
    );
    expect(out).toContain(
      'Die Teilnahme ist optional und kann jederzeit aktiviert oder deaktiviert werden.',
    );
    expect(out).toContain(
      'Gesammelte Punkte kannst du im jeweiligen Bereich für lokale Prämien einsetzen.',
    );
  });
});
