'use client';

import React from 'react';
import { APP_DISPLAY_NAME, APP_TAGLINE } from '@/lib/branding';
import HookAiCivicLogo from '@/components/ui/HookAiCivicLogo';

type ProductIdentityHeaderProps = {
  className?: string;
};

export default function ProductIdentityHeader({ className = '' }: ProductIdentityHeaderProps) {
  return (
    <div className={`min-w-0 text-left ${className}`}>
      <HookAiCivicLogo variant="light" alt={APP_DISPLAY_NAME} className="h-7 w-auto max-w-[178px]" />
      <p className="t-app-subtitle mt-0.5 whitespace-nowrap text-[10px] leading-tight sm:text-[10.5px] text-left">
        {APP_TAGLINE}
      </p>
    </div>
  );
}
