'use client';

import React from 'react';
import { APP_DISPLAY_NAME, APP_TAGLINE } from '@/lib/branding';

type ProductIdentityHeaderProps = {
  className?: string;
};

export default function ProductIdentityHeader({ className = '' }: ProductIdentityHeaderProps) {
  return (
    <div className={`min-w-0 text-left ${className}`}>
      <img
        src="/logo.svg"
        alt={APP_DISPLAY_NAME}
        className="h-8 w-auto max-w-[190px] object-contain"
        loading="eager"
        decoding="async"
      />
      <p className="t-app-subtitle mt-0.5 whitespace-nowrap text-[10px] leading-tight sm:text-[10.5px] text-left">
        {APP_TAGLINE}
      </p>
    </div>
  );
}
