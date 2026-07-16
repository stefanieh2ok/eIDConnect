'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { ModuleScreenHeader } from '@/components/shell/ModuleScreenHeader';
import { CivicAppPage } from '@/components/shell/CivicAppPage';
import { CIVIC_MODULE_SCREEN_TITLES } from '@/lib/civicScreenTitles';
import {
  DEMO_POSTFACH_MESSAGES,
  POSTFACH_DEMO_DISCLAIMER,
  POSTFACH_UI_CAPTION,
  type DemoPostfachMessage,
  type PostfachBadgeKind,
} from '@/data/demoPostfachMessages';
import { statusPillClass, type CivicStatusTone } from '@/lib/civicStatus';
import type { Section } from '@/types';

type PostfachSectionProps = {
  embeddedInWalkthrough?: boolean;
};

function badgeTone(kind: PostfachBadgeKind): CivicStatusTone {
  switch (kind) {
    case 'verifiziert':
      return 'mint';
    case 'demo':
      return 'neutral';
    case 'orientierung':
      return 'civic';
    default:
      return 'neutral';
  }
}

function PostfachMessageCard({
  message,
  onAction,
}: {
  message: DemoPostfachMessage;
  onAction: (section: Section) => void;
}) {
  const badgeClass = statusPillClass(badgeTone(message.badge));

  const handleAction = () => {
    if (message.action.type === 'section') {
      onAction(message.action.section);
    }
  };

  return (
    <article className="postfach-message-card" aria-labelledby={`postfach-title-${message.id}`}>
      <div className="postfach-message-card__header">
        <div className="min-w-0 flex-1">
          <p className="postfach-message-card__sender">{message.sender}</p>
          <h3 id={`postfach-title-${message.id}`} className="postfach-message-card__title">
            {message.title}
          </h3>
        </div>
        <span className={badgeClass}>{message.badgeLabel}</span>
      </div>
      <p className="postfach-message-card__body">{message.body}</p>
      <div className="postfach-message-card__footer">
        <span className="postfach-message-card__status">{message.status}</span>
        <span className="postfach-message-card__date">{message.receivedAt}</span>
      </div>
      {message.action.type === 'section' ? (
        <button type="button" className="postfach-message-card__action" onClick={handleAction}>
          {message.action.label}
        </button>
      ) : null}
    </article>
  );
}

export default function PostfachSection({ embeddedInWalkthrough = false }: PostfachSectionProps) {
  const { dispatch } = useApp();

  const navigate = (section: Section) => {
    if (embeddedInWalkthrough) return;
    dispatch({ type: 'SET_ACTIVE_SECTION', payload: section });
    requestAnimationFrame(() => {
      document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' });
    });
  };

  return (
    <CivicAppPage
      className={embeddedInWalkthrough ? ' postfach-section--walkthrough' : ''}
      id="postfach-screen"
    >
      <ModuleScreenHeader
        title={CIVIC_MODULE_SCREEN_TITLES.postfach ?? 'Postfach'}
        id="postfach-screen-title"
        metaLabel={POSTFACH_UI_CAPTION}
        metaLabelWrap
      />
      {embeddedInWalkthrough ? (
        <p className="postfach-section__disclaimer">{POSTFACH_DEMO_DISCLAIMER}</p>
      ) : null}

      <div className="postfach-section__list" role="list">
        {DEMO_POSTFACH_MESSAGES.map((message) => (
          <div key={message.id} role="listitem">
            <PostfachMessageCard message={message} onAction={navigate} />
          </div>
        ))}
      </div>
    </CivicAppPage>
  );
}
