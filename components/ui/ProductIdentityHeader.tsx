'use client';

import React from 'react';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import HookAiCivicLogo from '@/components/ui/HookAiCivicLogo';

type ProductIdentityHeaderProps = {
  className?: string;
  variant?: 'light' | 'dark';
  align?: 'left' | 'center';
};

export default function ProductIdentityHeader({
  className = '',
  variant = 'light',
  align = 'left',
}: ProductIdentityHeaderProps) {
  const isDark = variant === 'dark';
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  return (
    <div className={`min-w-0 ${className}`}>
      <div className={`flex flex-col ${alignClass}`}>
        <HookAiCivicLogo
          variant={isDark ? 'dark' : 'light'}
          alt={APP_DISPLAY_NAME}
          className={isDark ? 'h-[24px] w-auto max-w-[174px]' : 'h-[22px] w-auto max-w-[164px]'}
        />
      </div>
    </div>
  );
}
