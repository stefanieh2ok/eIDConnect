'use client';

import React from 'react';
import { Info } from 'lucide-react';
import { CLARA_DEMO_VISIBILITY_BANNER } from '@/lib/claraCaseGuidance';

type Props = {
  className?: string;
};

/** Visible demo/mock status — calm, readable, not alarmist. */
export function DemoDataBanner({ className = '' }: Props) {
  return (
    <div
      role="status"
      className={'demo-data-banner ' + className}
    >
      <Info className="demo-data-banner__icon" aria-hidden />
      <p className="demo-data-banner__text">{CLARA_DEMO_VISIBILITY_BANNER}</p>
    </div>
  );
}
