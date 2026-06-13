/**
 * Phase 2 Civic Packets — Komponenten- und Mobile-Viewport-QA.
 */
'use client';

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { AppProvider } from '@/context/AppContext';
import CivicDocumentPacket from '@/components/FuerMich/CivicDocumentPacket';
import CivicPacketBadge from '@/components/FuerMich/CivicPacketBadge';
import { buildPacketSummary } from '@/lib/civicPacketSummary';

const VIEWPORTS = [375, 390, 430] as const;

function setupPacket(leistungKey: string, width = 390) {
  const overlay = document.createElement('div');
  overlay.id = 'app-overlay-root';
  document.body.appendChild(overlay);
  Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: width });

  return render(
    <AppProvider>
      <div style={{ width }} data-testid="viewport-wrap">
        <CivicDocumentPacket leistungKey={leistungKey} mode="card" du />
      </div>
    </AppProvider>,
  );
}

describe('CivicDocumentPacket — vier Kernservices', () => {
  beforeEach(() => {
    document.getElementById('app-overlay-root')?.remove();
    Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
  });

  it.each([
    ['personalausweis-eid', /Bürgeramt Kirkel/i],
    ['kfz-ummeldung', /Kfz-Zulassungsstelle Saarpfalz-Kreis/i],
    ['buergergeld-orientierung', /Jobcenter Saarpfalz-Kreis/i],
    ['arbeitssuche-jobcenter', /Homburg-Kontext/i],
  ] as const)('zeigt Zuständigkeit für %s', (leistungKey, authorityPattern) => {
    setupPacket(leistungKey);
    expect(screen.getByRole('heading', { name: /Behördenpaket/i })).toBeInTheDocument();
    expect(screen.getAllByText(authorityPattern).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/Demo \/ nicht amtlich/i).length).toBeGreaterThan(0);
  });

  it('Review-Gate: Paket vorbereiten ohne Übermittlung', () => {
    setupPacket('personalausweis-eid');
    fireEvent.click(screen.getByRole('button', { name: /Paket vorbereiten/i }));
    expect(
      screen.getByText(/lokal vorbereitet.*nichts an eine Behörde übermittelt/i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Angaben prüfen/i })).toBeInTheDocument();
  });

  it('Clara CTA dispatcht civicContext', () => {
    const handler = jest.fn();
    window.addEventListener('clara:open-chat', handler as EventListener);
    setupPacket('kfz-ummeldung');
    fireEvent.click(screen.getByRole('button', { name: /Warum diese Stelle/i }));
    expect(handler).toHaveBeenCalled();
    const detail = (handler.mock.calls[0][0] as CustomEvent).detail;
    expect(detail.civicContext?.serviceId).toBe('kfz-ummeldung');
    expect(detail.civicContext?.authorityName).toMatch(/Kfz-Zulassungsstelle/i);
    window.removeEventListener('clara:open-chat', handler as EventListener);
  });
});

describe('CivicPacketBadge — Mobile Viewports', () => {
  it.each(VIEWPORTS)('rendert Badges bei %d px', (width) => {
    const summary = buildPacketSummary('personalausweis-eid', true)!;
    const { container } = render(
      <div style={{ width }} data-testid="viewport-wrap">
        <CivicPacketBadge summary={summary} />
      </div>,
    );
    expect(screen.getByLabelText(/Behördenpaket-Zusammenfassung/i)).toBeInTheDocument();
    expect(screen.getByText(/Zuständig:/)).toBeInTheDocument();
    expect(screen.getByText(/vorausgefüllt/)).toBeInTheDocument();
    expect(container.querySelector('[data-testid="viewport-wrap"]')).toBeTruthy();
  });
});

describe('CivicDocumentPacket — Mobile Viewports', () => {
  beforeEach(() => {
    document.getElementById('app-overlay-root')?.remove();
    Element.prototype.scrollIntoView = Element.prototype.scrollIntoView ?? (() => {});
  });

  it.each(VIEWPORTS)('Personalausweis-Paket bei %d px', (width) => {
    setupPacket('personalausweis-eid', width);
    expect(screen.getByRole('heading', { name: /Dein Behördenpaket/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Paket vorbereiten/i })).toBeInTheDocument();
  });
});
