'use client';

import React from 'react';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import HookAiCivicLogo from '@/components/ui/HookAiCivicLogo';

type ProductIdentityHeaderProps = {
  className?: string;
  variant?: 'light' | 'dark' | 'onBlue';
  align?: 'left' | 'center';
  /** Header: nur Wortmarke (ohne Piktogramm). Sonst volles Logo. */
  presentation?: 'full' | 'wordmark';
};

export default function ProductIdentityHeader({
  className = '',
  variant = 'light',
  align = 'left',
  presentation = 'full',
}: ProductIdentityHeaderProps) {
  const isDark = variant === 'dark';
  const isOnBlue = variant === 'onBlue';
  const alignClass = align === 'center' ? 'text-center items-center' : 'text-left items-start';
  const isWordmark = presentation === 'wordmark';

  const logoVariant = isWordmark
    ? isOnBlue
      ? 'wordmarkOnBlue'
      : isDark
        ? 'wordmarkDark'
        : 'wordmarkLight'
    : isOnBlue
      ? 'onBlue'
      : isDark
        ? 'dark'
        : 'light';

  const logoClass = isWordmark
    ? 'app-shell-brand-wordmark'
    : isDark
      ? 'app-shell-brand-full h-[28px] w-auto max-w-[200px] sm:h-[30px] sm:max-w-[220px]'
      : isOnBlue
        ? 'app-shell-brand-full h-[26px] w-auto max-w-[200px] sm:h-[30px] sm:max-w-[220px]'
        : 'app-shell-brand-full h-[30px] w-auto max-w-[min(260px,calc(100vw-11.5rem))] min-[390px]:h-[34px] min-[390px]:max-w-[min(280px,calc(100vw-12rem))] min-[430px]:h-[36px] min-[430px]:max-w-[min(300px,calc(100vw-13rem))]';

  return (
    <div
      className={`product-identity-header min-w-0 ${isWordmark ? 'product-identity-header--wordmark' : ''} ${className}`}
    >
      <div className={`flex flex-col ${alignClass}`}>
        {!isWordmark ? (
          <span className="app-shell-brand-short" aria-label={APP_DISPLAY_NAME}>
            Civic
          </span>
        ) : null}
        <HookAiCivicLogo variant={logoVariant} alt={APP_DISPLAY_NAME} className={logoClass} />
      </div>
    </div>
  );
}
