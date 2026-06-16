'use client';

import React from 'react';
import type { DocumentPacketCard } from '@/lib/documents/documentPacketResolver';

type Props = {
  cards: DocumentPacketCard[];
  du?: boolean;
  onCardAction: (card: DocumentPacketCard) => void;
};

const STATUS_LABEL: Record<DocumentPacketCard['status'], string> = {
  available: 'Verfügbar',
  demo: 'Demo',
  coming_soon: 'Folgt',
  external: 'Extern',
};

export function CaseDocumentPacketSection({ cards, du = true, onCardAction }: Props) {
  if (!cards.length) return null;

  return (
    <section
      className="civic-case-plan__section civic-case-plan__section--documents"
      aria-labelledby="plan-document-packet"
    >
      <div className="civic-case-plan__section-head">
        <h3 id="plan-document-packet" className="civic-case-plan__section-title">
          {du ? 'Dein Dokumentenpaket' : 'Ihr Dokumentenpaket'}
        </h3>
        <p className="civic-case-plan__section-lead">
          {du
            ? 'Vorbereitungsunterlagen — Demo-Inhalte sind klar gekennzeichnet.'
            : 'Vorbereitungsunterlagen — Demo-Inhalte sind klar gekennzeichnet.'}
        </p>
      </div>
      <ul className="civic-doc-packet__list">
        {cards.map((card) => {
          const disabled = card.status === 'coming_soon';
          return (
            <li key={card.id}>
              <button
                type="button"
                className={
                  'civic-doc-packet__card' +
                  (disabled ? ' civic-doc-packet__card--disabled' : '')
                }
                disabled={disabled}
                onClick={() => onCardAction(card)}
              >
                <span className="civic-doc-packet__card-main">
                  <span className="civic-doc-packet__title">{card.title}</span>
                  <span className="civic-doc-packet__desc">{card.description}</span>
                </span>
                <span className="civic-doc-packet__meta">
                  <span
                    className={
                      'civic-doc-packet__status civic-doc-packet__status--' + card.status
                    }
                  >
                    {STATUS_LABEL[card.status]}
                  </span>
                  <span className="civic-doc-packet__source">{card.source}</span>
                  {!disabled ? (
                    <span className="civic-doc-packet__action">{card.actionLabel}</span>
                  ) : null}
                </span>
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
