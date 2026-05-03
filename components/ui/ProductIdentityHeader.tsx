'use client';

import React from 'react';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import HookAiCivicLogo from '@/components/ui/HookAiCivicLogo';

type ProductIdentityHeaderProps = {
  className?: string;
  variant?: 'light' | 'dark' | 'onBlue';
  align?: 'left' | 'center';
};

export default function ProductIdentityHeader({
  className = '',
  variant = 'light',
  align = 'left',
}: ProductIdentityHeaderProps) {
  const isDark = variant === 'dark';
  const isOnBlue = variant === 'onBlue';
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';

  const logoVariant = isOnBlue ? 'onBlue' : isDark ? 'dark' : 'light';
  const logoClass = isDark
    ? 'h-[28px] w-auto max-w-[200px] sm:h-[30px] sm:max-w-[220px]'
    : isOnBlue
      ? 'h-[26px] w-auto max-w-[200px] sm:h-[30px] sm:max-w-[220px]'
      : 'h-[36px] w-auto max-w-[min(300px,calc(100vw-10.5rem))] sm:h-[38px] sm:max-w-[320px]';

  return (
    <div className={`min-w-0 ${className}`}>
      <div className={`flex flex-col ${alignClass}`}>
        <HookAiCivicLogo variant={logoVariant} alt={APP_DISPLAY_NAME} className={logoClass} />
      </div>
    </div>
  );
}
