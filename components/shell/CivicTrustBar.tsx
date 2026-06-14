'use client';

import React from 'react';
import { CheckCircle, BookOpen, Lock, MessageCircle } from 'lucide-react';

type CivicTrustBarProps = {
  onOpenSecurity?: () => void;
  className?: string;
};

const TRUST_ITEMS = [
  { id: 'security', label: 'Sicherheit & Zugang', icon: CheckCircle },
  { id: 'sources', label: 'Quellen', icon: BookOpen },
  { id: 'privacy', label: 'Datenschutz', icon: Lock },
  { id: 'clara', label: 'Clara', icon: MessageCircle },
] as const;

export function CivicTrustBar({ onOpenSecurity, className = '' }: CivicTrustBarProps) {
  return (
    <nav
      className={`civic-trust-bar ${className}`.trim()}
      aria-label="Vertrauen und Transparenz"
    >
      {TRUST_ITEMS.map((item) => {
        const Icon = item.icon;
        const isSecurity = item.id === 'security';
        return (
          <button
            key={item.id}
            type="button"
            className="civic-trust-bar__item"
            onClick={isSecurity ? onOpenSecurity : undefined}
            aria-label={item.label}
            title={item.label}
          >
            <Icon className="civic-trust-bar__icon" size={14} aria-hidden />
            <span className="civic-trust-bar__label">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
