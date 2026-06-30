'use client';

import React from 'react';
import type { IntroOverlayV2StepId } from '@/data/introOverlayV2';
import { DEMO_POSTFACH_MESSAGES } from '@/data/demoPostfachMessages';
import {
  useIntroV2Phase,
  useIntroV2ReducedMotion,
  useIntroV2Typewriter,
} from '@/components/Intro/introV2Motion';
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

const MELDEN_TEXT = 'Ratten auf dem Drachenspielplatz in Kirkel-Neuhäusel';
const WEGWEISER_TEXT =
  'Ich wurde gekündigt und weiß nicht, was ich jetzt tun muss.';

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
      className="intro-v2-praemie__qr intro-v2-praemie__qr--reveal"
      style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}
      aria-hidden
    >
      {cells.map((on, i) => (
        <span key={i} className={on ? 'intro-v2-praemie__qr-cell--on' : ''} />
      ))}
    </div>
  );
}

function BuergerzugangVisual() {
  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--cold-open" aria-hidden>
      <div className="intro-v2-montage intro-v2-montage--hero">
        <div className="intro-v2-montage__tile intro-v2-montage__tile--trust">
          <ShieldCheck className="intro-v2-montage__trust-icon" aria-hidden />
          <span className="intro-v2-montage__chip">Bürgerzugang</span>
          <span className="intro-v2-montage__line intro-v2-montage__line--wide" />
          <span className="intro-v2-montage__cta">Sicherer Demo-Zugang</span>
        </div>
        <div className="intro-v2-montage__tile intro-v2-montage__tile--photo">
          <img src="/demo-rat-playground.jpg" alt="" className="intro-v2-montage__img" />
          <span className="intro-v2-montage__badge">Melden</span>
        </div>
        <div className="intro-v2-montage__tile intro-v2-montage__tile--postfach">
          <span className="intro-v2-montage__post-title">Meldung eingegangen</span>
          <span className="intro-v2-montage__pill">Verifiziert</span>
        </div>
        <div className="intro-v2-montage__tile intro-v2-montage__tile--beteiligen">
          <span className="intro-v2-montage__chip">Beteiligen</span>
          <span className="intro-v2-montage__ballot-row" />
          <span className="intro-v2-montage__cta">Zustimmen</span>
        </div>
        <div className="intro-v2-montage__tile intro-v2-montage__tile--wahlen">
          <span className="intro-v2-montage__chip">Wahlvorschau</span>
          <span className="intro-v2-montage__cta intro-v2-montage__cta--highlight">Stimmzettel anzeigen</span>
        </div>
        <div className="intro-v2-montage__tile intro-v2-montage__tile--photo">
          <img src="/praemien/naturfreibad-kirkel.jpg" alt="" className="intro-v2-montage__img" />
          <span className="intro-v2-montage__badge">Wallet</span>
        </div>
      </div>
      <div className="intro-v2-trust-bar">
        Sicherer Demo-Zugang · Demo · Offizielle Stellen maßgeblich
      </div>
      <div className="intro-v2-cold-open__veil" />
      <div className="intro-v2-cold-open__clara-glow" />
    </div>
  );
}

function MeldenAktionVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(3, [500, 700, 900], reduced);
  const typed = useIntroV2Typewriter(MELDEN_TEXT, phase >= 2, reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--melden" aria-hidden>
      <div className="intro-v2-melden-flow intro-v2-melden-flow--animated">
        <div
          className={
            'intro-v2-melden-flow__photo' +
            (phase >= 1 ? ' intro-v2-melden-flow__photo--visible' : '')
          }
        >
          <img src="/demo-rat-playground.jpg" alt="" />
          {phase >= 1 ? (
            <span className="intro-v2-melden-flow__photo-tag intro-v2-tap-pulse">Foto hinzugefügt</span>
          ) : null}
        </div>
        <div className="intro-v2-melden-flow__form">
          <span
            className={
              'intro-v2-melden-flow__category' +
              (phase >= 0 ? ' intro-v2-melden-flow__category--active intro-v2-tap-pulse' : '')
            }
          >
            Spielplatz
          </span>
          <div className="intro-v2-melden-flow__input">
            {typed}
            {phase >= 2 && typed.length < MELDEN_TEXT.length ? (
              <span className="intro-v2-typewriter-cursor" />
            ) : null}
          </div>
          <p className="intro-v2-melden-flow__meta">Drachenspielplatz · Kirkel-Neuhäusel</p>
          <div className="intro-v2-melden-flow__footer">
            <span className="intro-v2-melden-flow__status">Entwurf — nicht versendet</span>
            <span
              className={
                'intro-v2-melden-flow__cta' +
                (phase >= 3 ? ' intro-v2-melden-flow__cta--pulse intro-v2-tap-pulse' : '')
              }
            >
              Meldung vorbereiten
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

function PostfachStatusVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [600, 900], reduced);
  const postfachLead = DEMO_POSTFACH_MESSAGES[0];

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--postfach" aria-hidden>
      {phase >= 0 ? (
        <div
          className={
            'intro-v2-postfach-card intro-v2-slide-in' +
            (phase >= 2 ? ' intro-v2-postfach-card--verified' : '')
          }
        >
          <div className="intro-v2-postfach-card__header">
            <div className="min-w-0 flex-1">
              <p className="intro-v2-postfach-card__sender">{postfachLead.sender}</p>
              <h4 className="intro-v2-postfach-card__title">{postfachLead.title}</h4>
            </div>
            <span
              className={
                'intro-v2-postfach-card__badge' +
                (phase >= 2 ? ' intro-v2-postfach-card__badge--pop' : '')
              }
            >
              <ShieldCheck className="intro-v2-postfach-card__badge-icon" aria-hidden />
              {phase >= 2 ? postfachLead.badgeLabel : 'Demo'}
            </span>
          </div>
          <p className="intro-v2-postfach-card__body">{postfachLead.body}</p>
          <div className="intro-v2-postfach-card__meta">
            <span className="intro-v2-postfach-card__status">
              {phase >= 2 ? postfachLead.status : 'Entwurf'}
            </span>
            <span>{postfachLead.receivedAt}</span>
          </div>
          <span
            className={
              'intro-v2-postfach-card__action' +
              (phase >= 1 ? ' intro-v2-tap-pulse' : '')
            }
          >
            {postfachLead.action.label}
          </span>
        </div>
      ) : null}
      <p className="intro-v2-postfach-hint">
        Vorbereitung und Übergabe — ohne echten Behördenversand in der Demo.
      </p>
    </div>
  );
}

function BeteiligenVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [800, 1000], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--beteiligen" aria-hidden>
      <div className="intro-v2-beteiligen-card">
        <span className="intro-v2-beteiligen-card__tag">Kirkel · Beteiligung</span>
        <h4 className="intro-v2-beteiligen-card__title">Radweg Kirkel – Limbach (Lückenschluss)</h4>
        <div className="intro-v2-beteiligen-card__cols">
          <div>
            <span className="intro-v2-beteiligen-card__col-label">Pro</span>
            <p>Sicherheit für Radfahrer und Schulkinder, Nahmobilität.</p>
          </div>
          <div>
            <span className="intro-v2-beteiligen-card__col-label">Contra</span>
            <p>Flächenumwidmung nötig, Bauzeit ca. 6 Monate.</p>
          </div>
        </div>
        <span className="intro-v2-beteiligen-card__sources">Quellen anzeigen · verifiziert</span>
        <div className="intro-v2-beteiligen-card__votes">
          <span
            className={
              'intro-v2-beteiligen-card__vote intro-v2-beteiligen-card__vote--yes' +
              (phase >= 1 ? ' intro-v2-beteiligen-card__vote--chosen intro-v2-tap-pulse' : '')
            }
          >
            Zustimmen
          </span>
          <span className="intro-v2-beteiligen-card__vote">Enthalten</span>
        </div>
        {phase >= 2 ? (
          <div className="intro-v2-beteiligen-card__result intro-v2-fade-up">
            <span>Mitwirkung erfasst</span>
            <span>Mitwirkungspunkt vorgemerkt</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function PraemienWalletVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [700, 900], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--trust" aria-hidden>
      <div
        className={
          'intro-v2-praemie-card intro-v2-praemie-card--animated' +
          (phase >= 1 ? ' intro-v2-praemie-card--selected' : '')
        }
      >
        <p className="intro-v2-praemie-card__eyebrow">Beispielprämie · Kirkel</p>
        <div className="intro-v2-praemie-card__hero">
          <img src="/praemien/naturfreibad-kirkel.jpg" alt="" />
        </div>
        <h4 className="intro-v2-praemie-card__title">Naturfreibad Kirkel</h4>
        <p className="intro-v2-praemie-card__hint">
          Lokale Anerkennung fürs Mitmachen — unabhängig von deiner Entscheidung.
        </p>
        {phase >= 2 ? (
          <div className="intro-v2-praemie-card__wallet intro-v2-wallet-reveal">
            <IntroV2QrMini />
            <span className="intro-v2-praemie-card__wallet-label intro-v2-tap-pulse">
              Zum Wallet hinzufügen
            </span>
          </div>
        ) : (
          <span className="intro-v2-praemie-card__open intro-v2-tap-pulse">Prämie auswählen</span>
        )}
      </div>
    </div>
  );
}

function WahlenVisual() {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(1, [1100], reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--wahlen" aria-hidden>
      <div className="intro-v2-wahlen-crop">
        <div className="intro-v2-wahlen-crop__header">
          <span className="intro-v2-wahlen-crop__label">Wahlvorschau</span>
          <span className="intro-v2-wahlen-crop__neutral">Neutral · verifizierte Quellen</span>
        </div>
        <p className="intro-v2-wahlen-crop__title">Bundestagswahl 2025</p>
        <p className="intro-v2-wahlen-crop__subtitle">Wahlkreis Saarbrücken · Vorschau</p>
        {phase >= 1 ? (
          <div className="intro-v2-wahlen-crop__ballot intro-v2-wahlen-crop__ballot--open intro-v2-fade-up">
            <p className="intro-v2-wahlen-crop__ballot-head">Wahlvorschlag Nr. 1</p>
            {BUNDESTAG_ROWS.map((row) => (
              <div key={row.name} className="intro-v2-wahlen-crop__row">
                <span className="intro-v2-wahlen-crop__circle" />
                <span className="intro-v2-wahlen-crop__name">{row.name}</span>
                <span className="intro-v2-wahlen-crop__partei">{row.partei}</span>
              </div>
            ))}
            <div className="intro-v2-wahlen-crop__sources">
              <span>Offizielle Programme</span>
              <span>Quellen anzeigen</span>
            </div>
          </div>
        ) : (
          <div className="intro-v2-wahlen-crop__ballot intro-v2-wahlen-crop__ballot--teaser">
            <span className="intro-v2-wahlen-crop__ballot-head">Stimmzettel-Vorschau</span>
            <span className="intro-v2-wahlen-crop__ballot-row" />
            <span className="intro-v2-wahlen-crop__ballot-row" />
          </div>
        )}
        <span
          className={
            'intro-v2-wahlen-crop__cta' +
            (phase === 0 ? ' intro-v2-tap-pulse' : ' intro-v2-wahlen-crop__cta--done')
          }
        >
          {phase >= 1 ? 'Stimmzettel geöffnet' : 'Stimmzettel anzeigen'}
        </span>
      </div>
    </div>
  );
}

function WegweiserPlanVisual({ du }: { du: boolean }) {
  const reduced = useIntroV2ReducedMotion();
  const phase = useIntroV2Phase(2, [1200, 800], reduced);
  const typed = useIntroV2Typewriter(WEGWEISER_TEXT, phase >= 0, reduced);

  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--clara" aria-hidden>
      <div className="intro-v2-mock-wegweiser">
        <div className="intro-v2-mock-wegweiser__header">
          <span className="intro-v2-mock-wegweiser__context">Wegweiser · Clara</span>
          <span className="intro-v2-mock-wegweiser__topic">Kündigung &amp; Arbeit</span>
        </div>
        <p className="intro-v2-mock-wegweiser__label">
          {du ? 'Was beschäftigt dich gerade?' : 'Was beschäftigt Sie gerade?'}
        </p>
        <div className="intro-v2-mock-wegweiser__textarea intro-v2-mock-wegweiser__textarea--typed">
          {typed}
          {typed.length < WEGWEISER_TEXT.length ? <span className="intro-v2-typewriter-cursor" /> : null}
        </div>
        <div
          className={
            'intro-v2-mock-wegweiser__cta' +
            (phase >= 1 ? ' intro-v2-mock-wegweiser__cta--active intro-v2-tap-pulse' : '')
          }
        >
          Behördenfahrplan erstellen
        </div>
      </div>
      {phase >= 2 ? (
        <div className="intro-v2-plan-card intro-v2-plan-card--result intro-v2-fade-up">
          <p className="intro-v2-plan-card__eyebrow">Behördenfahrplan · Demo</p>
          <h4 className="intro-v2-plan-card__title">Jobverlust — nächste Schritte</h4>
          <ol className="intro-v2-plan-card__steps">
            <li className="intro-v2-plan-card__step--active">
              Arbeitslosigkeit beim Jobcenter anzeigen
            </li>
            <li>Unterlagen sammeln (Kündigung, Lohnnachweise)</li>
            <li>Fristen im Blick behalten</li>
          </ol>
          <p className="intro-v2-plan-card__hint">Zuständige Stelle · Orientierung</p>
        </div>
      ) : null}
      <div className="intro-v2-clara-pill">
        <span className="intro-v2-clara-pill__dot" />
        Clara
      </div>
    </div>
  );
}

function VertrauenStartVisual() {
  return (
    <div className="intro-v2-visual intro-v2-visual--hero intro-v2-visual--finale" aria-hidden>
      <div className="intro-v2-finale">
        <div className="intro-v2-finale__nav">
          <span>Wegweiser</span>
          <span>Melden</span>
          <span>Beteiligen</span>
          <span>Wahlen</span>
          <span>Postfach</span>
          <span>Prämien</span>
        </div>
        <p className="intro-v2-finale__trust">
          Demo bereitet vor · Offizielle Stellen maßgeblich · Keine echten Anträge
        </p>
        <span className="intro-v2-finale__cta intro-v2-tap-pulse">Direkt zur App</span>
      </div>
    </div>
  );
}

export function IntroOverlayV2Visual({ stepId, du }: Props) {
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
      return <WegweiserPlanVisual du={du} />;
    case 'vertrauen-start':
      return <VertrauenStartVisual />;
    default:
      return null;
  }
}
