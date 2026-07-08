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

const MELDEN_TEXT = 'Ratten auf dem Drachenspielplatz in Kirkel-Neuhäusel.';
const WEGWEISER_TEXT =
  'Ich wurde gekündigt und weiß nicht, was ich jetzt tun muss.';

function IntroFilmStill({
  src,
  className = '',
  children,
  dim = false,
  enter = false,
}: {
  src?: string;
  className?: string;
  children?: React.ReactNode;
  dim?: boolean;
  enter?: boolean;
}) {
  return (
    <div
      className={
        `intro-v2-film-still intro-v3-film-still ${dim ? 'intro-v3-film-still--dim' : ''} ${enter ? 'intro-v3-film--enter' : ''} ${className}`.trim()
      }
      aria-hidden
    >
      {src ? (
        <img src={src} alt="" className="intro-v2-film-still__img" loading="eager" decoding="async" />
      ) : null}
      {children ? <div className="intro-v3-film-layer">{children}</div> : null}
    </div>
  );
}

function IntroFilmScene({
  src,
  className = '',
  filmClass = '',
  children,
  footer,
  dim = false,
  enter = true,
}: {
  src?: string;
  className?: string;
  filmClass?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  dim?: boolean;
  enter?: boolean;
}) {
  return (
    <div className={`intro-v2-visual intro-v2-visual--hero ${filmClass}`.trim()} aria-hidden>
      <div className="intro-v3-film-scene">
        <IntroFilmStill src={src} className={className} dim={dim} enter={enter}>
          {children}
        </IntroFilmStill>
        {footer ? <div className="intro-v3-film-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function IntroTapRing({
  className = '',
  active = true,
  pressed = false,
  pulse = false,
  trail = false,
}: {
  className?: string;
  active?: boolean;
  pressed?: boolean;
  pulse?: boolean;
  trail?: boolean;
}) {
  if (!active) return null;
  return (
    <span
      className={
        `intro-v3-tap-ring ${pressed ? 'intro-v3-tap-ring--pressed' : ''} ${pulse ? 'intro-v3-tap-ring--pulse' : ''} ${trail ? 'intro-v3-tap-ring--trail' : ''} ${className}`.trim()
      }
      aria-hidden
    />
  );
}

function IntroSlotText({
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
    <div className={`intro-v3-slot-text ${className}`.trim()}>
      {typed}
      {typed.length < text.length ? <span className="intro-v2-typewriter-cursor" /> : null}
    </div>
  );
}

function IntroFilmPanel({
  filmClass = '',
  className = '',
  children,
  footer,
}: {
  filmClass?: string;
  className?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  return (
    <div className={`intro-v2-visual intro-v2-visual--hero ${filmClass}`.trim()} aria-hidden>
      <div className="intro-v3-film-scene intro-v3-film-scene--panel">
        <div className={`intro-v3-film-panel ${className}`.trim()}>{children}</div>
        {footer ? <div className="intro-v3-film-footer">{footer}</div> : null}
      </div>
    </div>
  );
}

function IntroResultChip({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span className={`intro-v3-result-chip intro-v3-film-reveal ${className}`.trim()} aria-hidden>
      {children}
    </span>
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
  const phase = useIntroV2Phase(3, [700, 650, 650], reduced);

  return (
    <IntroFilmScene
      src={INTRO_TRAILER_ASSETS.calmAppEntry}
      className="intro-v2-film-still--hero intro-v3-film-still--entry-crop"
      filmClass="intro-v3-visual--entry"
      footer={
        <>
          <span>Zugang später per eID oder EU Digital Identity Wallet möglich.</span>
          <span>Demo: keine echte Antragstellung.</span>
        </>
      }
    >
      <IntroTapRing
        className="intro-v3-tap-ring--nav-wegweiser"
        active={phase >= 0}
        pulse={phase === 0}
        trail={phase > 0}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--nav-melden"
        active={phase >= 1}
        pulse={phase === 1}
        trail={phase > 1}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--nav-beteiligen"
        active={phase >= 2}
        pulse={phase === 2}
        trail={phase > 2}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--nav-praemien"
        active={phase >= 3}
        pulse={phase === 3}
      />
    </IntroFilmScene>
  );
}

function MeldenFotoVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(9, [350, 950, 450, 450, 500, 600, 700, 500, 450], reduced);
  const showUploadTile = phase === 5;
  const showPreview = phase >= 6;

  return (
    <IntroFilmScene
      src={INTRO_TRAILER_ASSETS.meldenDrachenspielplatz}
      className="intro-v2-film-still--hero"
      filmClass="intro-v3-visual--melden"
      footer="Demo: Meldung wird vorbereitet — nicht versendet."
    >
      <IntroSlotText
        text={MELDEN_TEXT}
        active={phase >= 1}
        className="intro-v3-slot-text--melden-desc"
      />
      <IntroTapRing
        className="intro-v3-tap-ring--melden-category"
        active={phase >= 2}
        pulse={phase === 2}
        trail={phase > 2 && phase < 9}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--melden-priority"
        active={phase >= 3}
        pulse={phase === 3}
        trail={phase > 3 && phase < 9}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--melden-photo-btn"
        active={phase >= 4}
        pulse={phase === 4}
        trail={phase > 4 && phase < 6}
      />
      {showUploadTile ? (
        <div className="intro-v3-upload-chip intro-v3-film-reveal">
          <img src={INTRO_MELDEN_DEMO_PHOTO} alt="" />
          <span>Drachenspielplatz.jpg</span>
        </div>
      ) : null}
      {showPreview ? (
        <div className="intro-v3-photo-preview intro-v3-film-reveal">
          <img src={INTRO_MELDEN_DEMO_PHOTO} alt="" />
        </div>
      ) : null}
      <IntroTapRing
        className="intro-v3-tap-ring--melden-submit"
        active={phase >= 7}
        pressed={phase >= 8}
        pulse={phase === 7}
      />
      {phase >= 9 ? (
        <IntroResultChip className="intro-v3-result-chip--melden">
          Vorbereitet · nicht versendet
        </IntroResultChip>
      ) : null}
    </IntroFilmScene>
  );
}

function PostfachStatusVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [800, 900], reduced);

  return (
    <IntroFilmScene
      src={INTRO_TRAILER_ASSETS.postfachDrachenspielplatz}
      className={'intro-v2-film-still--hero' + (phase >= 0 ? ' intro-v3-film-slide-in' : '')}
      filmClass="intro-v3-visual--postfach"
    >
      <span
        className={
          'intro-v3-in-scene-badge intro-v3-in-scene-badge--verified' +
          (phase >= 1 ? ' intro-v3-in-scene-badge--pop' : '')
        }
      >
        Verifiziert
      </span>
      <span
        className={
          'intro-v3-in-scene-btn intro-v3-in-scene-btn--status' +
          (phase >= 2 ? ' intro-v3-in-scene-btn--focus' : '')
        }
      >
        Status ansehen
      </span>
    </IntroFilmScene>
  );
}

function WegweiserClaraVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(6, [900, 750, 700, 650, 650, 700], reduced);

  return (
    <IntroFilmScene
      src={INTRO_TRAILER_ASSETS.wegweiserKuendigungFahrplan}
      className="intro-v2-film-still--hero"
      filmClass="intro-v3-visual--wegweiser"
      footer="Clara bereitet vor — offizielle Stellen entscheiden."
    >
      <IntroSlotText
        text={WEGWEISER_TEXT}
        active={phase >= 0 && phase < 2}
        className="intro-v3-slot-text--wegweiser-input"
      />
      {phase >= 1 ? (
        <div className="intro-v3-clara-status intro-v3-clara-status--compact intro-v3-film-reveal">
          <span className="intro-v3-clara-status__dot" />
          Clara ordnet dein Anliegen …
        </div>
      ) : null}
      <IntroTapRing
        className="intro-v3-tap-ring--wegweiser-result"
        active={phase >= 2}
        pulse={phase === 2}
        trail={phase > 2}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--wegweiser-step-1"
        active={phase >= 3}
        pulse={phase === 3}
        trail={phase > 3}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--wegweiser-step-2"
        active={phase >= 4}
        pulse={phase === 4}
        trail={phase > 4}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--wegweiser-step-3"
        active={phase >= 5}
        pulse={phase === 5}
        trail={phase > 5}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--wegweiser-official"
        active={phase >= 6}
        pulse={phase === 6}
      />
    </IntroFilmScene>
  );
}

function BeteiligenPunkteVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(7, [550, 500, 500, 550, 450, 550, 700], reduced);
  const votePressed = phase >= 4 && phase < 6;

  return (
    <IntroFilmScene
      src={INTRO_TRAILER_ASSETS.beteiligenKirkel}
      className="intro-v2-film-still--hero"
      filmClass="intro-v3-visual--beteiligen"
      footer="Mitwirkungspunkte belohnen Beteiligung — nicht Meinung."
    >
      <IntroTapRing
        className="intro-v3-tap-ring--vote-quellen"
        active={phase >= 0}
        pulse={phase === 0}
        trail={phase > 0}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--vote-pro"
        active={phase >= 1}
        pulse={phase === 1}
        trail={phase > 1}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--vote-contra"
        active={phase >= 2}
        pulse={phase === 2}
        trail={phase > 2}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--vote-yes"
        active={phase >= 3}
        pressed={votePressed}
        pulse={phase === 3 || phase === 4}
        trail={phase > 4}
      />
      {phase >= 5 ? (
        <span className="intro-v3-vote-status intro-v3-film-reveal">Teilnahme abgeschlossen</span>
      ) : null}
      {phase >= 6 ? (
        <span className="intro-reward-float intro-v3-points-float intro-v3-film-reveal">+120 Punkte</span>
      ) : null}
      {phase >= 7 ? (
        <span className="intro-v3-points-counter intro-v3-points-counter--late intro-v3-film-reveal">
          2.680 → 2.800 Punkte
        </span>
      ) : null}
    </IntroFilmScene>
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
  const phase = useIntroV2Phase(3, [500, 700, 900], reduced);
  const showcase = introShowcasePraemie();

  return (
    <IntroFilmPanel
      filmClass="intro-v3-visual--praemien-list"
      className="intro-v3-praemien-scene"
      footer="Erst Prämie wählen — Gutschein folgt im nächsten Schritt."
    >
      <div className="intro-v3-praemien-scene__header">
        <span>Kirkel · Prämien</span>
        <strong>2.800 Punkte</strong>
      </div>
      <div className={'intro-v3-praemien-scene__list' + (phase >= 1 ? ' intro-v3-praemien-scene__list--scroll' : '')}>
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
      <IntroTapRing
        className="intro-v3-tap-ring--praemien-row"
        active={phase >= 2}
        pulse={phase === 2}
        trail={phase > 2}
      />
      <IntroTapRing
        className="intro-v3-tap-ring--praemien-select"
        active={phase >= 3}
        pressed={phase >= 3}
        pulse={phase === 3}
      />
    </IntroFilmPanel>
  );
}

function PraemienWalletQrVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(5, [500, 650, 750, 550, 500], reduced);
  const showcase = introShowcasePraemie();
  const visual = rewardVisual(showcase.name);

  return (
    <IntroFilmPanel
      filmClass="intro-v3-visual--wallet"
      className="intro-v3-wallet-scene"
      footer={
        <>
          <span>Demo-Gutschein · keine echte Einlösung</span>
          <span>Partner sehen nur, ob ein Gutschein gültig ist — nicht, wie du abgestimmt hast.</span>
        </>
      }
    >
      <div className={'intro-v3-voucher-detail' + (phase >= 0 ? ' intro-v3-film-reveal' : '')}>
        {visual.imageSrc ? (
          <img src={visual.imageSrc} alt="" className="intro-v3-voucher-detail__hero" />
        ) : null}
        <strong>{showcase.name.split(' – ')[0]}</strong>
        <span>Eintritt reduziert</span>
        <span>Gültig bis 30.09.2026</span>
      </div>
      {phase >= 1 ? (
        <div className={'intro-v3-qr-stage' + (phase >= 2 ? ' intro-v3-qr-stage--built' : '')}>
          <IntroQrMini seed={KIRKEL_DEMO_VOUCHER_CODE} />
        </div>
      ) : null}
      {phase >= 2 ? (
        <span className="intro-v3-security-code intro-v3-film-reveal">{KIRKEL_DEMO_VOUCHER_CODE}</span>
      ) : null}
      <IntroTapRing
        className="intro-v3-tap-ring--wallet-add"
        active={phase >= 3}
        pressed={phase >= 4}
        pulse={phase === 3}
      />
      {phase >= 5 ? (
        <IntroResultChip className="intro-v3-result-chip--wallet">
          Zum Wallet hinzugefügt · Demo
        </IntroResultChip>
      ) : null}
    </IntroFilmPanel>
  );
}

function EidTrustVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(1, [1200], reduced);
  const tab = phase >= 1 ? 'wallet' : 'eid';

  return (
    <IntroFilmPanel
      filmClass="intro-v3-visual--eid"
      className="intro-v3-trust-screen"
      footer="HookAI Civic bereitet vor — rechtswirksame Schritte laufen über die zuständigen offiziellen Dienste."
    >
      <div className="intro-v3-trust-screen__tabs">
        <span
          className={'intro-v3-trust-screen__tab' + (tab === 'eid' ? ' intro-v3-trust-screen__tab--on' : '')}
        >
          eID
        </span>
        <span
          className={
            'intro-v3-trust-screen__tab' + (tab === 'wallet' ? ' intro-v3-trust-screen__tab--on' : '')
          }
        >
          EU Wallet
        </span>
      </div>
      {tab === 'eid' ? (
        <div className="intro-v3-trust-screen__panel intro-v3-film-reveal">
          <p>
            Für Vorgänge mit Identitätsnachweis kann die Online-Ausweisfunktion genutzt werden.
          </p>
          <ul>
            <li>Identität bestätigen</li>
            <li>Daten kontrolliert freigeben</li>
            <li>Offizielle Dienste bleiben maßgeblich</li>
          </ul>
        </div>
      ) : (
        <div className="intro-v3-trust-screen__panel intro-v3-film-reveal">
          <p>
            Perspektivisch können Nachweise und Berechtigungen über die EU Digital Identity
            Wallet eingebunden werden.
          </p>
          <ul>
            <li>Nachweise sicher vorzeigen</li>
            <li>Wallet-fähige Gutscheine und Berechtigungen</li>
            <li>Nutzer entscheidet, was geteilt wird</li>
          </ul>
        </div>
      )}
      {phase >= 1 ? (
        <div className="intro-v3-trust-screen__check intro-v3-film-reveal">
          ✓ Vorbereitet für sichere Identitätsflüsse
        </div>
      ) : null}
    </IntroFilmPanel>
  );
}

function AbschlussVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(0, [600], reduced);

  return (
    <IntroFilmScene
      src={INTRO_TRAILER_ASSETS.calmAppEntry}
      className="intro-v2-film-still--hero"
      filmClass="intro-v3-visual--finale"
      dim
      enter={phase >= 0}
    />
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
