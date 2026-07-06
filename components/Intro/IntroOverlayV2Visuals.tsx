'use client';

import React from 'react';
import type { IntroOverlayV2StepId } from '@/data/introOverlayV2';
import {
  INTRO_KIRKEL_PRAEMIEN,
  INTRO_MELDEN_DEMO_PHOTO,
  INTRO_TRAILER_ASSETS,
  introShowcasePraemie,
} from '@/data/introTrailerAssets';
import {
  KIRKEL_DEMO_VOUCHER_CODE,
  rewardVisual,
} from '@/lib/rewardVisual';
import {
  useIntroV2Phase,
  useIntroV2ReducedMotion,
  useIntroV2Typewriter,
} from '@/components/Intro/introV2Motion';

type Props = {
  stepId: IntroOverlayV2StepId;
  du: boolean;
};

const MELDEN_TEXT = 'Ratten auf dem Drachenspielplatz in Kirkel-Neuhäusel';
const WEGWEISER_TEXT =
  'Ich wurde gekündigt und weiß nicht, was ich jetzt tun muss.';

function IntroFilmStill({
  src,
  className = '',
  children,
  soft = false,
}: {
  src: string;
  className?: string;
  children?: React.ReactNode;
  soft?: boolean;
}) {
  return (
    <div
      className={
        `intro-v2-film-still intro-v3-film-still ${soft ? 'intro-v3-film-still--soft' : ''} ${className}`.trim()
      }
      aria-hidden
    >
      <img src={src} alt="" className="intro-v2-film-still__img" loading="eager" decoding="async" />
      {children}
    </div>
  );
}

function IntroTypewriterOverlay({
  text,
  active,
  className = '',
}: {
  text: string;
  active: boolean;
  className?: string;
}) {
  const reduced = useIntroV2ReducedMotion();
  const typed = useIntroV2Typewriter(text, active, reduced);
  if (!active && !typed) return null;
  return (
    <div className={`intro-v2-typewriter-overlay ${className}`.trim()} aria-hidden>
      {typed}
      {typed.length < text.length ? <span className="intro-v2-typewriter-cursor" /> : null}
    </div>
  );
}

function IntroQrMini({ seed }: { seed: string }) {
  const n = 13;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h + seed.charCodeAt(i) * (i + 1)) % 1_000_000;
  const cells = new Array<boolean>(n * n).fill(false);
  const paintFinder = (br: number, bc: number) => {
    for (let r = 0; r < 7; r++) {
      for (let c = 0; c < 7; c++) {
        const i = (br + r) * n + (bc + c);
        if (i < 0 || i >= cells.length) continue;
        const outer = r === 0 || c === 0 || r === 6 || c === 6;
        const inner = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[i] = outer || inner;
      }
    }
  };
  paintFinder(0, 0);
  paintFinder(0, n - 7);
  paintFinder(n - 7, 0);
  for (let i = 0; i < cells.length; i++) {
    if (cells[i]) continue;
    h = (h * 1103515245 + 12345) & 0x7fffffff;
    cells[i] = h % 3 === 0;
  }
  return (
    <div className="intro-v3-qr-grid" aria-hidden>
      {cells.map((on, i) => (
        <div key={i} className={`intro-v3-qr-cell ${on ? 'intro-v3-qr-cell--on' : ''}`} />
      ))}
    </div>
  );
}

function RuhigerEinstiegVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [900, 1100], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--entry" aria-hidden>
      <IntroFilmStill
        src={INTRO_TRAILER_ASSETS.calmAppEntry}
        className={'intro-v2-film-still--hero' + (phase >= 0 ? ' intro-v3-calm-zoom' : '')}
      >
        <div className="intro-v3-nav-highlights">
          <span className={phase >= 1 ? 'intro-v3-nav-chip intro-v3-nav-chip--on' : 'intro-v3-nav-chip'}>
            Wegweiser
          </span>
          <span className={phase >= 1 ? 'intro-v3-nav-chip intro-v3-nav-chip--on' : 'intro-v3-nav-chip'}>
            Melden
          </span>
          <span className={phase >= 2 ? 'intro-v3-nav-chip intro-v3-nav-chip--on' : 'intro-v3-nav-chip'}>
            Beteiligen
          </span>
          <span className={phase >= 2 ? 'intro-v3-nav-chip intro-v3-nav-chip--on' : 'intro-v3-nav-chip'}>
            Prämien
          </span>
        </div>
        <div className="intro-v3-trust-stack">
          <span>Zugang später per eID oder EU Digital Identity Wallet möglich.</span>
          <span>Demo: keine echte Antragstellung.</span>
        </div>
      </IntroFilmStill>
    </div>
  );
}

function MeldenFotoVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(6, [500, 600, 700, 900, 500, 600], reduced);
  const showPhotoInReport = phase >= 1;

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--melden" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.meldenDrachenspielplatz} className="intro-v2-film-still--hero">
        {phase === 0 ? (
          <div className="intro-v3-photo-picker intro-v3-fade-in">
            <button type="button" className="intro-v3-photo-tile intro-v3-photo-tile--selected">
              <img src={INTRO_MELDEN_DEMO_PHOTO} alt="" />
              <span>Drachenspielplatz</span>
            </button>
          </div>
        ) : null}
        {showPhotoInReport ? (
          <div className="intro-v3-melden-photo-thumb intro-v3-fade-in">
            <img src={INTRO_MELDEN_DEMO_PHOTO} alt="" />
          </div>
        ) : null}
        {phase >= 2 ? (
          <span className="intro-v3-category-pill intro-v3-fade-in">Spielplatz</span>
        ) : null}
        <IntroTypewriterOverlay
          text={MELDEN_TEXT}
          active={phase >= 3}
          className="intro-v2-typewriter-overlay--melden intro-v3-typewriter--melden"
        />
        {phase >= 4 ? (
          <span className="intro-v3-priority-pill intro-v3-fade-in">Priorität · Mittel</span>
        ) : null}
        <span
          className={
            'intro-v2-film-cta intro-v2-film-cta--melden intro-v3-cta--melden' +
            (phase >= 5 ? ' intro-v3-cta--pulse-once' : '')
          }
        >
          Meldung vorbereiten
        </span>
        {phase >= 6 ? (
          <span className="intro-v3-prepared-badge intro-v3-fade-in">Vorbereitet · nicht versendet</span>
        ) : null}
      </IntroFilmStill>
    </div>
  );
}

function PostfachStatusVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [700, 1000], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--postfach" aria-hidden>
      <IntroFilmStill
        src={INTRO_TRAILER_ASSETS.postfachDrachenspielplatz}
        className={'intro-v2-film-still--hero' + (phase >= 0 ? ' intro-v2-slide-in' : '')}
      >
        <div className={'intro-v3-postfach-card' + (phase >= 0 ? ' intro-v3-fade-in' : '')}>
          <span className="intro-v3-postfach-card__org">Gemeinde Kirkel</span>
          <strong>Meldung eingegangen</strong>
          <p>
            Ihre Meldung zur Rattenplage auf dem Drachenspielplatz wurde aufgenommen.
          </p>
        </div>
        <span
          className={
            'intro-v2-film-badge intro-v2-film-badge--verified' +
            (phase >= 1 ? ' intro-v2-film-badge--pop' : '')
          }
        >
          Verifiziert
        </span>
        <span
          className={
            'intro-v2-film-cta intro-v2-film-cta--postfach' +
            (phase >= 2 ? ' intro-v3-cta--pulse-once' : '')
          }
        >
          Status ansehen
        </span>
      </IntroFilmStill>
    </div>
  );
}

function WegweiserClaraVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(4, [800, 700, 900, 700], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--wegweiser" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.wegweiserKuendigungFahrplan} className="intro-v2-film-still--hero">
        <IntroTypewriterOverlay
          text={WEGWEISER_TEXT}
          active={phase >= 0 && phase < 2}
          className="intro-v2-typewriter-overlay--wegweiser"
        />
        {phase >= 1 ? (
          <div className={'intro-v3-clara-badge' + (phase >= 1 ? ' intro-v3-fade-in' : '')}>
            <span className="intro-v3-clara-badge__dot" />
            Clara
          </div>
        ) : null}
        {phase >= 2 ? (
          <div className="intro-v3-wegweiser-result intro-v3-fade-in">
            Kündigung &amp; Arbeitslosigkeit erkannt
          </div>
        ) : null}
        {phase >= 3 ? (
          <div className="intro-v3-wegweiser-step intro-v3-fade-in">1. Arbeitsuchend melden</div>
        ) : null}
        <span
          className={
            'intro-v2-film-cta intro-v2-film-cta--wegweiser intro-v2-film-cta--active' +
            (phase >= 4 ? ' intro-v3-cta--pulse-once' : '')
          }
        >
          Offiziellen Online-Dienst öffnen
        </span>
      </IntroFilmStill>
    </div>
  );
}

function BeteiligenPunkteVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(6, [600, 500, 500, 600, 500, 700], reduced);
  const pointsDisplay = phase >= 6 ? '2.800' : '2.680';

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--beteiligen" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.beteiligenKirkel} className="intro-v2-film-still--hero">
        <div className="intro-v3-beteiligen-flow">
          <span className={phase >= 0 ? 'intro-v3-flow-chip intro-v3-flow-chip--on' : 'intro-v3-flow-chip'}>
            Quellen
          </span>
          <span className={phase >= 1 ? 'intro-v3-flow-chip intro-v3-flow-chip--on' : 'intro-v3-flow-chip'}>
            Pro
          </span>
          <span className={phase >= 2 ? 'intro-v3-flow-chip intro-v3-flow-chip--on' : 'intro-v3-flow-chip'}>
            Contra
          </span>
        </div>
        {phase >= 3 ? (
          <span className="intro-v2-film-cta intro-v3-cta--zustimmen intro-v3-cta--pulse-once">
            Zustimmen
          </span>
        ) : null}
        {phase >= 4 ? (
          <span className="intro-v3-status-line intro-v3-fade-in">Teilnahme abgeschlossen</span>
        ) : null}
        {phase >= 5 ? (
          <span className="intro-reward-float intro-v3-points-float">+120 Punkte</span>
        ) : null}
        <span className="intro-v3-points-balance">
          <span className="intro-v3-points-balance__label">Punktestand</span>
          <span className="intro-v3-points-balance__value">{pointsDisplay} Punkte</span>
        </span>
        <span className="intro-v3-mandatory-hint">
          Mitwirkungspunkte belohnen Beteiligung — nicht Meinung.
        </span>
      </IntroFilmStill>
    </div>
  );
}

function IntroPraemieThumb({ name }: { name: string }) {
  const visual = rewardVisual(name);
  return (
    <div className={`intro-v3-praemien-thumb ${visual.className}`} aria-hidden>
      {visual.imageSrc ? (
        <img src={visual.imageSrc} alt="" className="intro-v3-praemien-thumb__img" />
      ) : visual.cinestar ? (
        <div className="intro-v3-praemien-thumb__cinestar">
          <span>CineStar</span>
          <small>Saarbrücken</small>
        </div>
      ) : (
        <span
          className={
            visual.db
              ? 'intro-v3-praemien-thumb__db'
              : visual.label === 'KINO'
                ? 'intro-v3-praemien-thumb__kino'
                : 'intro-v3-praemien-thumb__label'
          }
        >
          {visual.label}
        </span>
      )}
    </div>
  );
}

function PraemienAuswahlVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(3, [600, 700, 900], reduced);
  const showcase = introShowcasePraemie();

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--praemien-list" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.praemienOverview} className="intro-v2-film-still--hero">
        <div className="intro-v3-praemien-panel intro-v3-fade-in">
          <div className="intro-v3-praemien-panel__header">
            <span>Kirkel · Prämien</span>
            <strong>2.800 Punkte</strong>
          </div>
          <div className={'intro-v3-praemien-list' + (phase >= 1 ? ' intro-v3-praemien-list--scroll' : '')}>
            {INTRO_KIRKEL_PRAEMIEN.map((b) => (
              <div
                key={b.id}
                className={
                  'intro-v3-praemien-row' +
                  (b.id === showcase.id && phase >= 2 ? ' intro-v3-praemien-row--focus' : '')
                }
              >
                <IntroPraemieThumb name={b.name} />
                <div className="intro-v3-praemien-row__body">
                  <span className="intro-v3-praemien-row__name">{b.name}</span>
                  <span className="intro-v3-praemien-row__desc">{b.description}</span>
                  <span className="intro-v3-praemien-row__points">
                    {b.points.toLocaleString('de-DE')} Punkte
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {phase >= 3 ? (
          <span className="intro-v2-film-cta intro-v2-film-cta--praemien intro-v3-cta--pulse-once">
            Prämie auswählen
          </span>
        ) : null}
      </IntroFilmStill>
    </div>
  );
}

function PraemienWalletQrVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(4, [600, 700, 800, 600], reduced);
  const showcase = introShowcasePraemie();
  const visual = rewardVisual(showcase.name);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--wallet" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.praemienDetailQr} className="intro-v2-film-still--hero">
        <div className={'intro-v3-voucher-card' + (phase >= 0 ? ' intro-v3-fade-in' : '')}>
          {visual.imageSrc ? (
            <img src={visual.imageSrc} alt="" className="intro-v3-voucher-card__hero" />
          ) : null}
          <strong>{showcase.name.split(' – ')[0]}</strong>
          <span>{showcase.description}</span>
          <span>Gültig bis 30.09.2026</span>
        </div>
        {phase >= 1 ? (
          <div className={'intro-v3-qr-wrap' + (phase >= 2 ? ' intro-v3-qr-wrap--built' : '')}>
            <IntroQrMini seed={KIRKEL_DEMO_VOUCHER_CODE} />
          </div>
        ) : null}
        {phase >= 2 ? (
          <span className="intro-v3-security-code intro-v3-fade-in">{KIRKEL_DEMO_VOUCHER_CODE}</span>
        ) : null}
        {phase >= 3 ? (
          <span className="intro-v2-film-cta intro-v3-cta--wallet intro-v3-cta--pulse-once">
            Zum Wallet hinzufügen
          </span>
        ) : null}
        {phase >= 4 ? (
          <span className="intro-v3-wallet-badge intro-v3-fade-in">Wallet · Demo</span>
        ) : null}
        <span className="intro-v3-demo-hint">Demo-Gutschein · keine echte Einlösung</span>
      </IntroFilmStill>
    </div>
  );
}

function EidTrustVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [700, 900], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--eid" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.identityTrust} className="intro-v2-film-still--hero">
        <div className={'intro-v3-identity-seal' + (phase >= 0 ? ' intro-v3-fade-in' : '')}>
          <span className="intro-v3-identity-seal__title">Identity Seal</span>
          <ul className="intro-v3-identity-checks">
            <li className={phase >= 0 ? 'intro-v3-check--on' : ''}>Bürgerzugang bestätigt</li>
            <li className={phase >= 1 ? 'intro-v3-check--on' : ''}>Vorschaudaten geladen</li>
            <li className={phase >= 2 ? 'intro-v3-check--on' : ''}>
              Offizielle Stellen bleiben maßgeblich
            </li>
          </ul>
        </div>
        <p className="intro-v3-governance-line intro-v3-fade-in">
          HookAI Civic bereitet vor — rechtswirksame Schritte laufen über die zuständigen
          offiziellen Dienste.
        </p>
      </IntroFilmStill>
    </div>
  );
}

function AbschlussVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(0, [600], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v3-visual--finale" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.finaleApp} className="intro-v2-film-still--hero" soft>
        <span
          className={
            'intro-v2-film-cta intro-v2-film-cta--finale' +
            (phase >= 0 ? ' intro-v3-cta--pulse-once' : '')
          }
        >
          Direkt zur App
        </span>
      </IntroFilmStill>
    </div>
  );
}

export function IntroOverlayV2Visual({ stepId, du }: Props) {
  void du;
  switch (stepId) {
    case 'ruhiger-einstieg':
      return <RuhigerEinstiegVisual />;
    case 'melden-foto':
      return <MeldenFotoVisual />;
    case 'postfach-status':
      return <PostfachStatusVisual />;
    case 'wegweiser-clara':
      return <WegweiserClaraVisual />;
    case 'beteiligen-punkte':
      return <BeteiligenPunkteVisual />;
    case 'praemien-auswahl':
      return <PraemienAuswahlVisual />;
    case 'praemien-wallet-qr':
      return <PraemienWalletQrVisual />;
    case 'eid-trust':
      return <EidTrustVisual />;
    case 'abschluss':
      return <AbschlussVisual />;
    default:
      return null;
  }
}
