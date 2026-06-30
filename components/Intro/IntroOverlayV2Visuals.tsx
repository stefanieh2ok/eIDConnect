'use client';

import React from 'react';
import type { IntroOverlayV2StepId } from '@/data/introOverlayV2';
import { DEMO_POSTFACH_MESSAGES } from '@/data/demoPostfachMessages';
import { ShieldCheck } from 'lucide-react';

type Props = {
  stepId: IntroOverlayV2StepId;
  du: boolean;
};

const BUNDESTAG_ROWS = [
  { name: 'Müller, Andreas', partei: 'CDU' },
  { name: 'Klein, Sarah', partei: 'SPD' },
  { name: 'Hoffmann, Lisa', partei: 'GRÜNE' },
] as const;

function IntroV2QrMini() {
  const n = 11;
  const cells = new Array<boolean>(n * n).fill(false);
  const paintFinder = (br: number, bc: number) => {
    for (let r = 0; r < 5; r++) {
      for (let c = 0; c < 5; c++) {
        const i = (br + r) * n + (bc + c);
        if (i < 0 || i >= cells.length) continue;
        const outer = r === 0 || c === 0 || r === 4 || c === 4;
        const inner = r >= 1 && r <= 3 && c >= 1 && c <= 3;
        cells[i] = outer || inner;
      }
    }
  };
  paintFinder(0, 0);
  paintFinder(0, n - 5);
  paintFinder(n - 5, 0);
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) continue;
    cells[i] = i % 5 === 0;
  }
  return (
    <div
      className="intro-v2-praemie__qr"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? 'intro-v2-praemie__qr-cell--on' : ''} />
      ))}
    </div>
  );
}

export function IntroOverlayV2Visual({ stepId, du }: Props) {
  const postfachLead = DEMO_POSTFACH_MESSAGES[0];

  switch (stepId) {
    case 'cold-open':
      return (
        <div className="intro-v2-visual intro-v2-visual--cold-open" aria-hidden>
          <div className="intro-v2-montage">
            <div className="intro-v2-montage__tile intro-v2-montage__tile--wegweiser">
              <span className="intro-v2-montage__chip">Wegweiser</span>
              <span className="intro-v2-montage__line intro-v2-montage__line--wide" />
              <span className="intro-v2-montage__line" />
              <span className="intro-v2-montage__cta">Behördenfahrplan</span>
            </div>
            <div className="intro-v2-montage__tile intro-v2-montage__tile--photo">
              <img src="/demo-rat-playground.jpg" alt="" className="intro-v2-montage__img" />
              <span className="intro-v2-montage__badge">Melden</span>
            </div>
            <div className="intro-v2-montage__tile intro-v2-montage__tile--postfach">
              <span className="intro-v2-montage__post-title">Meldung eingegangen</span>
              <span className="intro-v2-montage__pill">Verifiziert</span>
            </div>
            <div className="intro-v2-montage__tile intro-v2-montage__tile--wahlen">
              <span className="intro-v2-montage__chip">Wahlvorschau</span>
              <span className="intro-v2-montage__ballot-row" />
              <span className="intro-v2-montage__ballot-row" />
              <span className="intro-v2-montage__cta intro-v2-montage__cta--highlight">
                Stimmzettel anzeigen
              </span>
            </div>
            <div className="intro-v2-montage__tile intro-v2-montage__tile--photo">
              <img
                src="/praemien/naturfreibad-kirkel.jpg"
                alt=""
                className="intro-v2-montage__img"
              />
              <span className="intro-v2-montage__badge">Prämie</span>
            </div>
          </div>
          <div className="intro-v2-cold-open__veil" />
          <div className="intro-v2-cold-open__clara-glow" />
        </div>
      );

    case 'clara-wegweiserin':
      return (
        <div className="intro-v2-visual intro-v2-visual--clara" aria-hidden>
          <div className="intro-v2-mock-wegweiser">
            <div className="intro-v2-mock-wegweiser__header">
              <span className="intro-v2-mock-wegweiser__context">Wegweiser · Clara</span>
              <span className="intro-v2-mock-wegweiser__topic">Kündigung &amp; Arbeit</span>
            </div>
            <p className="intro-v2-mock-wegweiser__label">
              {du ? 'Was beschäftigt dich gerade?' : 'Was beschäftigt Sie gerade?'}
            </p>
            <div className="intro-v2-mock-wegweiser__textarea intro-v2-mock-wegweiser__textarea--typed">
              {du
                ? 'Ich wurde gekündigt und möchte wissen, was jetzt wichtig ist.'
                : 'Ich wurde gekündigt und möchte wissen, was jetzt wichtig ist.'}
            </div>
            <div className="intro-v2-mock-wegweiser__cta intro-v2-mock-wegweiser__cta--active">
              Behördenfahrplan erstellen
            </div>
          </div>
          <div className="intro-v2-clara-pill">
            <span className="intro-v2-clara-pill__dot" />
            Clara
          </div>
        </div>
      );

    case 'melden-sichtbar':
      return (
        <div className="intro-v2-visual intro-v2-visual--melden" aria-hidden>
          <div className="intro-v2-melden-flow">
            <div className="intro-v2-melden-flow__photo">
              <img src="/demo-rat-playground.jpg" alt="" />
              <span className="intro-v2-melden-flow__photo-tag">Foto hinzugefügt</span>
            </div>
            <div className="intro-v2-melden-flow__form">
              <span className="intro-v2-melden-flow__category intro-v2-melden-flow__category--active">
                Spielplatz
              </span>
              <p className="intro-v2-melden-flow__desc">Ratten am Drachenspielplatz</p>
              <p className="intro-v2-melden-flow__meta">Drachenspielplatz · Kirkel</p>
              <div className="intro-v2-melden-flow__footer">
                <span className="intro-v2-melden-flow__status">Entwurf — nicht versendet</span>
                <span className="intro-v2-melden-flow__cta">Meldung vorbereiten</span>
              </div>
            </div>
          </div>
        </div>
      );

    case 'wegweiser-plan':
      return (
        <div className="intro-v2-visual intro-v2-visual--plan" aria-hidden>
          <div className="intro-v2-plan-split">
            <div className="intro-v2-plan-split__before">
              <span className="intro-v2-plan-split__label">Deine Eingabe</span>
              <p className="intro-v2-plan-split__input">Ich wurde gekündigt …</p>
            </div>
            <div className="intro-v2-plan-card intro-v2-plan-card--result">
              <p className="intro-v2-plan-card__eyebrow">Behördenfahrplan · Demo</p>
              <h4 className="intro-v2-plan-card__title">Jobverlust — nächste Schritte</h4>
              <ol className="intro-v2-plan-card__steps">
                <li className="intro-v2-plan-card__step--active">Arbeitslosigkeit beim Jobcenter anzeigen</li>
                <li>Unterlagen sammeln (Kündigung, Lohnnachweise)</li>
                <li>Fristen im Blick behalten</li>
              </ol>
              <p className="intro-v2-plan-card__hint">Zuständige Stelle · Orientierung</p>
            </div>
          </div>
        </div>
      );

    case 'postfach-status':
      return (
        <div className="intro-v2-visual intro-v2-visual--postfach" aria-hidden>
          <div className="intro-v2-postfach-card">
            <div className="intro-v2-postfach-card__header">
              <div className="min-w-0 flex-1">
                <p className="intro-v2-postfach-card__sender">{postfachLead.sender}</p>
                <h4 className="intro-v2-postfach-card__title">{postfachLead.title}</h4>
              </div>
              <span className="intro-v2-postfach-card__badge">
                <ShieldCheck className="intro-v2-postfach-card__badge-icon" aria-hidden />
                {postfachLead.badgeLabel}
              </span>
            </div>
            <p className="intro-v2-postfach-card__body">{postfachLead.body}</p>
            <div className="intro-v2-postfach-card__meta">
              <span className="intro-v2-postfach-card__status">{postfachLead.status}</span>
              <span>{postfachLead.receivedAt}</span>
            </div>
            <span className="intro-v2-postfach-card__action">{postfachLead.action.label}</span>
          </div>
          <div className="intro-v2-postfach-card intro-v2-postfach-card--secondary">
            <p className="intro-v2-postfach-card__sender">Wegweiser</p>
            <h4 className="intro-v2-postfach-card__title">Checkliste vorbereitet</h4>
            <span className="intro-v2-postfach-card__status intro-v2-postfach-card__status--muted">
              Bereit
            </span>
          </div>
        </div>
      );

    case 'wahlen-vorschau':
      return (
        <div className="intro-v2-visual intro-v2-visual--wahlen" aria-hidden>
          <div className="intro-v2-wahlen-crop">
            <div className="intro-v2-wahlen-crop__header">
              <span className="intro-v2-wahlen-crop__label">Wahlvorschau</span>
              <span className="intro-v2-wahlen-crop__neutral">Neutral · Quellen</span>
            </div>
            <p className="intro-v2-wahlen-crop__title">Bundestagswahl 2025</p>
            <p className="intro-v2-wahlen-crop__subtitle">Wahlkreis Saarbrücken · Vorschau</p>
            <div className="intro-v2-wahlen-crop__ballot">
              <p className="intro-v2-wahlen-crop__ballot-head">Wahlvorschlag Nr. 1</p>
              {BUNDESTAG_ROWS.map((row) => (
                <div key={row.name} className="intro-v2-wahlen-crop__row">
                  <span className="intro-v2-wahlen-crop__circle" />
                  <span className="intro-v2-wahlen-crop__name">{row.name}</span>
                  <span className="intro-v2-wahlen-crop__partei">{row.partei}</span>
                </div>
              ))}
            </div>
            <span className="intro-v2-wahlen-crop__cta">Stimmzettel anzeigen</span>
          </div>
        </div>
      );

    case 'vertrauen-start':
      return (
        <div className="intro-v2-visual intro-v2-visual--trust" aria-hidden>
          <div className="intro-v2-praemie-card">
            <p className="intro-v2-praemie-card__eyebrow">Beispielprämie · Kirkel</p>
            <div className="intro-v2-praemie-card__hero">
              <img src="/praemien/naturfreibad-kirkel.jpg" alt="" />
            </div>
            <h4 className="intro-v2-praemie-card__title">Naturfreibad Kirkel</h4>
            <p className="intro-v2-praemie-card__hint">
              Lokale Anerkennung fürs Mitmachen — unabhängig von deiner Entscheidung.
            </p>
            <div className="intro-v2-praemie-card__wallet">
              <IntroV2QrMini />
              <span className="intro-v2-praemie-card__wallet-label">Wallet / Pass anzeigen</span>
            </div>
          </div>
        </div>
      );

    default:
      return null;
  }
}
