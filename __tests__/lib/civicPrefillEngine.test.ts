import { KIRKEL_AUTHORITY_BY_ID } from '@/data/civic/authorities/saarland/saarpfalz/kirkel.authorities';
import { getFormsForService } from '@/data/civic/forms/kirkel/formRegistry';
import { MAX_MUSTERMANN } from '@/data/civic/profiles/demoProfiles';
import { PERSONALAUSWEIS_EID } from '@/data/civic/services/kirkel/buergeramt.services';
import { KFZ_UMMELDUNG } from '@/data/civic/services/kirkel/kfz-homburg.services';
import { BUERGERGELD_ERSTANTRAG } from '@/data/civic/services/kirkel/jobcenter-homburg.services';
import { ALG1_ORIENTIERUNG } from '@/data/civic/services/kirkel/arbeitsagentur.services';
import { buildPrefillPacket } from '@/lib/civicPrefillEngine';
import {
  LEISTUNG_KEY_TO_SERVICE_ID,
  resolveCivicBundle,
  resolveServiceIdFromLeistungKey,
} from '@/lib/civicRegistryIndex';

describe('civicPrefillEngine', () => {
  const profile = MAX_MUSTERMANN;

  describe('Personalausweis/eID', () => {
    const authority = KIRKEL_AUTHORITY_BY_ID['kirkel-buergeramt'];
    const forms = getFormsForService('personalausweis-eid');

    it('füllt Name, Adresse, Geburtsdatum und Kontakt aus', () => {
      const packet = buildPrefillPacket(profile, PERSONALAUSWEIS_EID, authority, forms);
      const filledIds = packet.filledFields.map((f) => f.fieldId);
      expect(filledIds).toEqual(
        expect.arrayContaining(['firstName', 'lastName', 'dateOfBirth', 'address', 'email', 'phone']),
      );
      expect(packet.filledFields.find((f) => f.fieldId === 'firstName')?.value).toBe('Max');
      expect(packet.filledFields.find((f) => f.fieldId === 'lastName')?.value).toBe('Mustermann');
      expect(packet.filledFields.find((f) => f.fieldId === 'dateOfBirth')?.value).toBe('2000-01-01');
      expect(packet.filledFields.find((f) => f.fieldId === 'address')?.value).toContain('66459 Kirkel');
    });

    it('markiert Ausweisnummer und fehlende Nachweise als offen', () => {
      const packet = buildPrefillPacket(profile, PERSONALAUSWEIS_EID, authority, forms);
      const missingIds = packet.missingFields.map((m) => m.fieldId);
      expect(missingIds).toEqual(
        expect.arrayContaining(['idDocumentNumber', 'biometrisches-lichtbild', 'aktueller-ausweis']),
      );
      const ausweis = packet.missingFields.find((m) => m.fieldId === 'idDocumentNumber');
      expect(ausweis?.sensitive).toBe(true);
      expect(ausweis?.reason).toMatch(/niemals geraten/i);
    });

    it('erfordert Termin', () => {
      const packet = buildPrefillPacket(profile, PERSONALAUSWEIS_EID, authority, forms);
      expect(packet.appointmentRequired).toBe(true);
    });
  });

  describe('Kfz-Ummeldung', () => {
    const authority = KIRKEL_AUTHORITY_BY_ID['saarpfalz-kfz-homburg'];
    const forms = getFormsForService('kfz-ummeldung');

    it('markiert eVB und SEPA/IBAN als offen', () => {
      const packet = buildPrefillPacket(profile, KFZ_UMMELDUNG, authority, forms);
      const missingIds = packet.missingFields.map((m) => m.fieldId);
      expect(missingIds).toEqual(expect.arrayContaining(['evb-nummer', 'iban', 'sepa-lastschrift']));
      expect(packet.missingFields.find((m) => m.fieldId === 'evb-nummer')?.reason).toMatch(
        /nicht automatisch/i,
      );
      expect(packet.missingFields.find((m) => m.fieldId === 'iban')?.sensitive).toBe(true);
    });
  });

  describe('Bürgergeld Erstantrag', () => {
    const authority = KIRKEL_AUTHORITY_BY_ID['jobcenter-saarpfalz-homburg'];
    const forms = getFormsForService('buergergeld-erstantrag');

    it('markiert Einkommen und Kontoauszüge als offen, niemals raten', () => {
      const packet = buildPrefillPacket(profile, BUERGERGELD_ERSTANTRAG, authority, forms);
      const missingIds = packet.missingFields.map((m) => m.fieldId);
      expect(missingIds).toEqual(
        expect.arrayContaining(['einkommensnachweise', 'kontoauszuege', 'vermoegensnachweise']),
      );
      for (const id of ['einkommensnachweise', 'kontoauszuege']) {
        expect(packet.missingFields.find((m) => m.fieldId === id)?.reason).toMatch(/nicht geraten/i);
      }
      const incomeFilled = packet.filledFields.some((f) =>
        /einkommen|konto|iban/i.test(f.fieldId),
      );
      expect(incomeFilled).toBe(false);
    });

    it('enthält Hinweis keine Anspruchsprüfung', () => {
      const packet = buildPrefillPacket(profile, BUERGERGELD_ERSTANTRAG, authority, forms);
      expect(packet.reviewFields.some((r) => r.fieldId === 'anspruchspruefung')).toBe(true);
      expect(packet.disclaimer).toMatch(/keine Anspruchsprüfung/i);
    });
  });

  describe('ALG I Orientierung', () => {
    const authority = KIRKEL_AUTHORITY_BY_ID['arbeitsagentur-saarland-homburg-context'];
    const forms = getFormsForService('alg1-orientierung');

    it('nutzt Homburg-Kontext und weist auf zentrale BA-Post-/Kontaktlogik hin', () => {
      const packet = buildPrefillPacket(profile, ALG1_ORIENTIERUNG, authority, forms);
      expect(packet.authorityId).toBe('arbeitsagentur-saarland-homburg-context');
      expect(packet.contextNotes?.join(' ')).toMatch(/Saarbrücken/i);
      expect(packet.reviewFields.some((r) => r.fieldId === 'ba-kontaktlogik')).toBe(true);
      expect(packet.disclaimer).toMatch(/Kontakt- und Postlogik/i);
    });
  });

  describe('Sicherheitsregeln', () => {
    const services = [PERSONALAUSWEIS_EID, KFZ_UMMELDUNG, BUERGERGELD_ERSTANTRAG, ALG1_ORIENTIERUNG];

    it.each(services.map((s) => [s.serviceId, s]))(
      '%s: noSubmission bleibt immer true',
      (_id, service) => {
        const authority = KIRKEL_AUTHORITY_BY_ID[service.authorityId];
        const forms = getFormsForService(service.serviceId);
        const packet = buildPrefillPacket(profile, service, authority, forms);
        expect(packet.noSubmission).toBe(true);
        expect(packet.disclaimer).toMatch(/Demo \/ nicht amtlich/i);
        expect(packet.disclaimer).toMatch(/Verbindlich entscheidet die zuständige Stelle/i);
      },
    );
  });
});

describe('civicRegistryIndex adapter', () => {
  it('mappt leistung_key auf serviceId ohne Katalog zu brechen', () => {
    expect(resolveServiceIdFromLeistungKey('personalausweis-eid')).toBe('personalausweis-eid');
    expect(resolveServiceIdFromLeistungKey('buergergeld-orientierung')).toBe('buergergeld-erstantrag');
    expect(resolveServiceIdFromLeistungKey('arbeitssuche-jobcenter')).toBe('alg1-orientierung');
    expect(resolveServiceIdFromLeistungKey('ummeldung')).toBeNull();
  });

  it('löst personalausweis-eid Bundle auf', () => {
    const bundle = resolveCivicBundle('personalausweis-eid');
    expect(bundle?.service.serviceId).toBe('personalausweis-eid');
    expect(bundle?.authority.authorityId).toBe('kirkel-buergeramt');
    expect(bundle?.forms.length).toBeGreaterThan(0);
  });

  it('enthält alle vier Kern-Mappings', () => {
    expect(Object.keys(LEISTUNG_KEY_TO_SERVICE_ID)).toHaveLength(4);
  });
});
