'use client';

import React from 'react';

type LogoVariant = 'light' | 'dark' | 'icon';

type HookAiCivicLogoProps = {
  variant?: LogoVariant;
  className?: string;
  alt?: string;
};

const SRC_BY_VARIANT: Record<LogoVariant, string> = {
  light: '/brand/logo-light.svg',
  dark: '/brand/logo-dark.svg',
  icon: '/brand/icon-only.svg',
};

export default function HookAiCivicLogo({
  variant = 'light',
  className = '',
  alt = 'HookAI Civic',
}: HookAiCivicLogoProps) {
  return (
    <img
      src={SRC_BY_VARIANT[variant]}
      alt={alt}
      className={`block h-auto w-auto object-contain ${className}`}
      loading="eager"
      decoding="async"
    />
  );
}
