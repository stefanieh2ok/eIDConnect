'use client';

import React from 'react';
import Image from 'next/image';

type LogoVariant = 'light' | 'dark' | 'onBlue' | 'icon';

type HookAiCivicLogoProps = {
  variant?: LogoVariant;
  className?: string;
  alt?: string;
};

const SRC_BY_VARIANT: Record<LogoVariant, string> = {
  light: '/brand/logo-light.svg?v=20260428c',
  dark: '/brand/logo-dark.svg?v=20260428c',
  onBlue: '/brand/logo-on-blue.svg?v=20260430',
  icon: '/brand/icon-only.svg?v=20260428c',
};

const DIMENSIONS_BY_VARIANT: Record<LogoVariant, { width: number; height: number }> = {
  light: { width: 980, height: 220 },
  dark: { width: 600, height: 140 },
  onBlue: { width: 980, height: 220 },
  icon: { width: 512, height: 512 },
};

export default function HookAiCivicLogo({
  variant = 'light',
  className = '',
  alt = 'HookAI Civic',
}: HookAiCivicLogoProps) {
  const dimensions = DIMENSIONS_BY_VARIANT[variant];
  return (
    <Image
      src={SRC_BY_VARIANT[variant]}
      alt={alt}
      width={dimensions.width}
      height={dimensions.height}
      className={`block h-auto w-auto object-contain ${className}`}
      priority
      unoptimized
    />
  );
}
