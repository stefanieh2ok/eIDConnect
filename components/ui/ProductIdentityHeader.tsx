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
    ? 'h-[24px] w-auto max-w-[174px]'
    : isOnBlue
      ? 'h-[20px] w-auto max-w-[156px] sm:h-[22px] sm:max-w-[168px]'
      : 'h-[22px] w-auto max-w-[164px]';

  return (
    <div className={`min-w-0 ${className}`}>
      <div className={`flex flex-col ${alignClass}`}>
        <HookAiCivicLogo variant={logoVariant} alt={APP_DISPLAY_NAME} className={logoClass} />
      </div>
    </div>
  );
}
