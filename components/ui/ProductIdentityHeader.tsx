'use client';

import React from 'react';
import { APP_DISPLAY_NAME, APP_TAGLINE } from '@/lib/branding';

type ProductIdentityHeaderProps = {
  className?: string;
};

export default function ProductIdentityHeader({ className = '' }: ProductIdentityHeaderProps) {
  return (
    <div className={`min-w-0 text-left ${className}`}>
      <div className="t-app-title truncate leading-none text-[#003366]">{APP_DISPLAY_NAME}</div>
      <p className="t-app-subtitle mt-0.5 whitespace-nowrap text-[10px] leading-tight sm:text-[10.5px] text-left">
        {APP_TAGLINE}
      </p>
    </div>
  );
}
