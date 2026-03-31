'use client';

import React from 'react';

type IphoneFrameProps = {
  children: React.ReactNode;
  /** Hintergrund hinter dem Gerät (z. B. Governikus-Gradient) */
  outerClassName?: string;
  outerStyle?: React.CSSProperties;
  /** Wenn true: füllt flex-Parent (z. B. Demo-Layout) statt voller Viewport */
  fillContainer?: boolean;
};

/**
 * Konsistentes „iPhone“-Layout für Demo/Onboarding (Notch + abgerundeter Rahmen).
 * Inhalt sollte selbst flex-1 + overflow handhaben.
 */
export function IphoneFrame({
  children,
  outerClassName = '',
  outerStyle,
  fillContainer = false,
}: IphoneFrameProps) {
  return (
    <div
      className={`flex w-full flex-col items-center justify-center px-4 py-4 ${
        fillContainer ? 'min-h-0 flex-1' : 'min-h-[100dvh]'
      } ${outerClassName}`}
      style={
        outerStyle ?? {
          background:
            // Außen-Hintergrund: hell/neutral statt Blau (Kontrast für Inhalte).
            'radial-gradient(ellipse at 50% 15%, #f3f7ff 0%, #e9f0ff 35%, #ffffff 75%, #f6f7fb 100%)',
        }
      }
    >
      <div
        className="relative flex w-full flex-col overflow-hidden rounded-[2.5rem] border-[10px] border-[#1c1c1e] shadow-[0_22px_64px_rgba(0,0,0,0.45)]"
        style={{
          // Einheitliches Device-Preset für Dev + Vercel (ohne Host-Sonderfälle).
          // Dadurch bleibt die Darstellung konsistent und iPhone-proportional.
          width: 'min(270px, calc(100vw - 2.5rem))',
          aspectRatio: '393 / 852',
          maxHeight: '860px',
          background:
            // Light „tech“ base, aber nicht so grell, damit Content-Kontrast stimmt.
            'radial-gradient(ellipse at 50% 0%, rgba(0,85,164,0.30) 0%, rgba(10,61,107,0.18) 35%, rgba(225,235,250,0.62) 70%, rgba(255,255,255,0.94) 100%)',
        }}
      >
        {/* Subtle glass overlay inside the device */}
        <div
          className="pointer-events-none absolute inset-0 opacity-65"
          style={{
            background:
              // Mehr „frosted“ als „Farbverlauf“: verteilt Licht, aber lässt Karten lesbarer.
              'linear-gradient(180deg, rgba(255,255,255,0.40) 0%, rgba(255,255,255,0.14) 38%, rgba(0,51,102,0.05) 100%)',
          }}
        />

        {/* Dynamic Island */}
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 h-7 w-[126px] -translate-x-1/2 rounded-full bg-black/90 ring-1 ring-white/10" />
        <div className="relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden pt-10">
          {children}
        </div>
        {/* Home-Indikator */}
        <div className="relative z-10 flex flex-shrink-0 justify-center pb-2 pt-1">
          <div className="h-1 w-[134px] rounded-full bg-white/20" />
        </div>
      </div>
    </div>
  );
}
