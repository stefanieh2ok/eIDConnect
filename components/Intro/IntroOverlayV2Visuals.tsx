'use client';

import React from 'react';
import type { IntroOverlayV2StepId } from '@/data/introOverlayV2';
import {
  INTRO_TRAILER_ASSETS,
  INTRO_TRAILER_MONTAGE_TILES,
} from '@/data/introTrailerAssets';
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
}: {
  src: string;
  className?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className={`intro-v2-film-still ${className}`.trim()} aria-hidden>
      <img src={src} alt="" className="intro-v2-film-still__img" loading="eager" decoding="async" />
      {children}
    </div>
  );
}

function IntroFakeCursor({
  visible,
  className = '',
  style,
}: {
  visible: boolean;
  className?: string;
  style?: React.CSSProperties;
}) {
  if (!visible) return null;
  return (
    <span
      className={`intro-v2-fake-cursor intro-v2-fake-cursor--tap ${className}`.trim()}
      style={style}
      aria-hidden
    />
  );
}

function IntroUploadProgress({ progress, visible }: { progress: number; visible: boolean }) {
  if (!visible) return null;
  return (
    <div className="intro-v2-upload-progress" aria-hidden>
      <div className="intro-v2-upload-progress__row">
        <span>Upload</span>
        <span>{progress}%</span>
      </div>
      <div className="intro-v2-upload-progress__track">
        <div className="intro-v2-upload-progress__bar" style={{ width: `${progress}%` }} />
      </div>
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

function IntroMotionToast({
  visible,
  lines,
  className = '',
}: {
  visible: boolean;
  lines: string[];
  className?: string;
}) {
  if (!visible) return null;
  return (
    <div className={`intro-v2-motion-toast intro-v2-fade-up ${className}`.trim()} aria-hidden>
      {lines.map((line) => (
        <span key={line}>{line}</span>
      ))}
    </div>
  );
}

function BuergerzugangVisual() {
  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--cold-open" aria-hidden>
      <div className="intro-v2-montage intro-v2-montage--hero intro-v2-montage--film">
        {INTRO_TRAILER_MONTAGE_TILES.map((tile) => (
          <div key={tile.label} className="intro-v2-montage__tile intro-v2-montage__tile--film">
            <img src={tile.src} alt="" className="intro-v2-montage__film-img" />
            <span className="intro-v2-montage__badge">{tile.label}</span>
          </div>
        ))}
      </div>
      <div className="intro-v2-trust-bar">
        Sicherer Demo-Zugang · Offizielle Stellen maßgeblich
      </div>
      <div className="intro-v2-cold-open__veil" />
      <div className="intro-v2-cold-open__clara-glow" />
    </div>
  );
}

function MeldenAktionVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(3, [500, 700, 900], reduced);
  const uploadPct = phase >= 1 ? (phase >= 2 ? 100 : 62) : 0;

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--melden" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.meldenDrachenspielplatz} className="intro-v2-film-still--hero">
        <IntroFakeCursor
          visible={phase >= 0}
          className="intro-v2-fake-cursor--melden-cat"
        />
        <IntroUploadProgress visible={phase >= 1} progress={uploadPct} />
        <IntroTypewriterOverlay
          text={MELDEN_TEXT}
          active={phase >= 2}
          className="intro-v2-typewriter-overlay--melden"
        />
        <span
          className={
            'intro-v2-film-cta intro-v2-film-cta--melden' +
            (phase >= 3 ? ' intro-v2-tap-pulse' : '')
          }
        >
          Meldung vorbereiten
        </span>
        <span className="intro-v2-film-draft">Entwurf — nicht versendet</span>
      </IntroFilmStill>
    </div>
  );
}

function PostfachStatusVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [600, 900], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--postfach" aria-hidden>
      <IntroFilmStill
        src={INTRO_TRAILER_ASSETS.postfachDrachenspielplatz}
        className={
          'intro-v2-film-still--hero' + (phase >= 0 ? ' intro-v2-slide-in' : '')
        }
      >
        <span
          className={
            'intro-v2-film-badge intro-v2-film-badge--verified' +
            (phase >= 2 ? ' intro-v2-film-badge--pop' : '')
          }
        >
          Verifiziert
        </span>
        <span
          className={
            'intro-v2-film-cta intro-v2-film-cta--postfach' +
            (phase >= 1 ? ' intro-v2-tap-pulse' : '')
          }
        >
          Status ansehen
        </span>
      </IntroFilmStill>
    </div>
  );
}

function BeteiligenVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [800, 1000], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--beteiligen" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.beteiligenKirkel} className="intro-v2-film-still--hero">
        <IntroFakeCursor
          visible={phase >= 1}
          className="intro-v2-fake-cursor--beteiligen-yes"
        />
        <IntroMotionToast
          visible={phase >= 2}
          lines={['Mitwirkung erfasst', 'Punkt vorgemerkt']}
          className="intro-v2-motion-toast--beteiligen"
        />
        <span className="intro-v2-film-hint intro-v2-film-hint--beteiligen">
          unabhängig von deiner Entscheidung
        </span>
      </IntroFilmStill>
    </div>
  );
}

function PraemienWalletVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [700, 900], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--trust" aria-hidden>
      <IntroFilmStill
        src={INTRO_TRAILER_ASSETS.praemienNaturfreibadWallet}
        className={
          'intro-v2-film-still--hero' + (phase >= 1 ? ' intro-v2-film-still--selected' : '')
        }
      >
        {phase >= 2 ? (
          <div className="intro-v2-wallet-reveal intro-v2-wallet-reveal--film">
            <span className="intro-v2-tap-pulse">Wallet / Pass anzeigen</span>
          </div>
        ) : (
          <span className="intro-v2-film-cta intro-v2-film-cta--praemien intro-v2-tap-pulse">
            Prämie auswählen
          </span>
        )}
      </IntroFilmStill>
    </div>
  );
}

function WahlenVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(1, [1100], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--wahlen" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.wahlenBundestagswahl} className="intro-v2-film-still--hero">
        <IntroFakeCursor
          visible={phase === 0}
          className="intro-v2-fake-cursor--wahlen-cta"
        />
        <div
          className={
            'intro-v2-ballot-veil' + (phase >= 1 ? ' intro-v2-ballot-veil--open' : '')
          }
          aria-hidden
        />
        <span
          className={
            'intro-v2-film-cta intro-v2-film-cta--wahlen' +
            (phase === 0 ? ' intro-v2-tap-pulse' : ' intro-v2-film-cta--done')
          }
        >
          {phase >= 1 ? 'Stimmzettel geöffnet' : 'Stimmzettel anzeigen'}
        </span>
      </IntroFilmStill>
    </div>
  );
}

function WegweiserPlanVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [1200, 800], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--clara" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.wegweiserKuendigungFahrplan} className="intro-v2-film-still--hero">
        <IntroTypewriterOverlay
          text={WEGWEISER_TEXT}
          active={phase >= 0 && phase < 2}
          className="intro-v2-typewriter-overlay--wegweiser"
        />
        <span
          className={
            'intro-v2-film-cta intro-v2-film-cta--wegweiser' +
            (phase >= 1 ? ' intro-v2-tap-pulse intro-v2-film-cta--active' : '')
          }
        >
          Behördenfahrplan erstellen
        </span>
        <div
          className={
            'intro-v2-plan-reveal' + (phase >= 2 ? ' intro-v2-plan-reveal--visible intro-v2-fade-up' : '')
          }
          aria-hidden
        />
        <div className={'intro-v2-clara-pill' + (phase >= 2 ? ' intro-v2-clara-pill--glow' : '')}>
          <span className="intro-v2-clara-pill__dot" />
          Clara
        </div>
      </IntroFilmStill>
    </div>
  );
}

function VertrauenStartVisual() {
  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--finale" aria-hidden>
      <IntroFilmStill src={INTRO_TRAILER_ASSETS.finalAppOverviewTrust} className="intro-v2-film-still--hero">
        <div className="intro-v2-finale-trust intro-v2-fade-up">
          Vorbereiten, nicht entscheiden
        </div>
        <span className="intro-v2-film-cta intro-v2-film-cta--finale intro-v2-tap-pulse">
          Direkt zur App
        </span>
      </IntroFilmStill>
    </div>
  );
}

export function IntroOverlayV2Visual({ stepId, du }: Props) {
  void du;
  switch (stepId) {
    case 'buergezugang-hook':
      return <BuergerzugangVisual />;
    case 'melden-aktion':
      return <MeldenAktionVisual />;
    case 'postfach-status':
      return <PostfachStatusVisual />;
    case 'beteiligen-mitwirken':
      return <BeteiligenVisual />;
    case 'praemien-wallet':
      return <PraemienWalletVisual />;
    case 'wahlen-vorschau':
      return <WahlenVisual />;
    case 'wegweiser-plan':
      return <WegweiserPlanVisual />;
    case 'vertrauen-start':
      return <VertrauenStartVisual />;
    default:
      return null;
  }
}
