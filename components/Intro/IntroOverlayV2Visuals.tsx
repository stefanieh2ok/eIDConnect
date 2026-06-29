'use client';

import React from 'react';
import type { IntroOverlayV2StepId } from '@/data/introOverlayV2';
import {
  Calendar,
  ListChecks,
  MessageCircle,
  ThumbsUp,
  Vote,
} from 'lucide-react';

type Props = {
  stepId: IntroOverlayV2StepId;
  du: boolean;
};

const CHIP_LABELS = ['Ausweis', 'Umzug', 'Kita', 'Jobverlust', 'Schaden melden'] as const;

export function IntroOverlayV2Visual({ stepId, du }: Props) {
  switch (stepId) {
    case 'cold-open':
      return (
        <div className="intro-v2-visual intro-v2-visual--cold-open" aria-hidden>
          <div className="intro-v2-cold-open__layer intro-v2-cold-open__layer--back" />
          <div className="intro-v2-cold-open__icons">
            <span className="intro-v2-cold-open__glyph">
              <ListChecks className="h-4 w-4" />
            </span>
            <span className="intro-v2-cold-open__glyph">
              <MessageCircle className="h-4 w-4" />
            </span>
            <span className="intro-v2-cold-open__glyph">
              <ThumbsUp className="h-4 w-4" />
            </span>
            <span className="intro-v2-cold-open__glyph">
              <Calendar className="h-4 w-4" />
            </span>
          </div>
          <div className="intro-v2-cold-open__clara-glow" />
        </div>
      );

    case 'alltag-chaos':
      return (
        <div className="intro-v2-visual intro-v2-visual--chips" aria-hidden>
          <div className="intro-v2-chip-grid">
            {CHIP_LABELS.map((label) => (
              <span key={label} className="intro-v2-chip">
                {label}
              </span>
            ))}
          </div>
        </div>
      );

    case 'clara-wegweiserin':
      return (
        <div className="intro-v2-visual intro-v2-visual--clara" aria-hidden>
          <div className="intro-v2-mock-wegweiser">
            <p className="intro-v2-mock-wegweiser__label">
              {du ? 'Was beschäftigt dich gerade?' : 'Was beschäftigt Sie gerade?'}
            </p>
            <div className="intro-v2-mock-wegweiser__textarea">
              {du
                ? 'Ich wurde gekündigt. Was muss ich jetzt tun?'
                : 'Ich wurde gekündigt. Was muss ich jetzt tun?'}
            </div>
            <div className="intro-v2-mock-wegweiser__cta">Behördenfahrplan erstellen</div>
          </div>
          <div className="intro-v2-clara-pill">
            <span className="intro-v2-clara-pill__dot" />
            Clara
          </div>
        </div>
      );

    case 'wegweiser-plan':
      return (
        <div className="intro-v2-visual intro-v2-visual--plan" aria-hidden>
          <div className="intro-v2-plan-card">
            <p className="intro-v2-plan-card__eyebrow">Behördenfahrplan · Demo</p>
            <h4 className="intro-v2-plan-card__title">Jobverlust — nächste Schritte</h4>
            <ol className="intro-v2-plan-card__steps">
              <li>Arbeitslosigkeit beim Jobcenter anzeigen</li>
              <li>Unterlagen sammeln (Kündigung, Lohnnachweise)</li>
              <li>Fristen im Blick behalten</li>
            </ol>
            <p className="intro-v2-plan-card__hint">Zuständige Stelle · Orientierung</p>
          </div>
        </div>
      );

    case 'melden-sichtbar':
      return (
        <div className="intro-v2-visual intro-v2-visual--melden" aria-hidden>
          <div className="intro-v2-melden-card">
            <p className="intro-v2-melden-card__tag">Meldung vorbereiten</p>
            <h4 className="intro-v2-melden-card__title">Spielplatz — Schaden sichtbar machen</h4>
            <p className="intro-v2-melden-card__meta">Kirkel · Demo-Beispiel</p>
            <div className="intro-v2-melden-card__status">Entwurf — nicht versendet</div>
          </div>
        </div>
      );

    case 'mitwirken':
      return (
        <div className="intro-v2-visual intro-v2-visual--split" aria-hidden>
          <div className="intro-v2-split-col">
            <ThumbsUp className="intro-v2-split-col__icon" />
            <span className="intro-v2-split-col__label">Beteiligen</span>
            <span className="intro-v2-split-col__hint">Neutral</span>
          </div>
          <div className="intro-v2-split-col">
            <Vote className="intro-v2-split-col__icon" />
            <span className="intro-v2-split-col__label">Wahlen</span>
            <span className="intro-v2-split-col__hint">Vorschau</span>
          </div>
          <div className="intro-v2-split-col">
            <Calendar className="intro-v2-split-col__icon" />
            <span className="intro-v2-split-col__label">Termine</span>
            <span className="intro-v2-split-col__hint">Überblick</span>
          </div>
        </div>
      );

    case 'vertrauen-start':
      return (
        <div className="intro-v2-visual intro-v2-visual--trust" aria-hidden>
          <div className="intro-v2-trust-shell">
            <div className="intro-v2-trust-shell__logo">HookAI Civic</div>
            <div className="intro-v2-trust-nav">
              <span>Wegweiser</span>
              <span>Melden</span>
              <span>Beteiligen</span>
              <span>Wahlen</span>
            </div>
            <div className="intro-v2-trust-clara" />
          </div>
        </div>
      );

    default:
      return null;
  }
}
