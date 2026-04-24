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
  // Einheitliches Device mit Frame (Desktop + Mobile), mobile skaliert nur responsiv.
  const DEVICE_WIDTH_PX = 390;

  return (
    <div
      className={`app-device-shell flex w-full flex-col items-center justify-center shadow-none ring-0 [filter:none] ${
        fillContainer ? 'min-h-0 flex-1' : 'h-full min-h-0'
      } ${outerClassName}`}
      style={
        outerStyle ?? {
          background:
            // Außen-Hintergrund: hell/neutral statt Blau (Kontrast für Inhalte).
            'transparent',
        }
      }
    >
      <div
        className="app-device-frame relative flex w-full flex-col overflow-hidden rounded-[2.75rem] border-[12px] border-[#1c1c1e] shadow-none ring-0 [filter:none]"
        style={{
          width: `min(${DEVICE_WIDTH_PX}px, calc(100% - 0.75rem))`,
          aspectRatio: '393 / 852',
          maxHeight: 'min(852px, calc(100% - 0.75rem))',
          // Ruhiger App-Flächen-Ton, kein heller Insel-Fleck in der Mitte
          background: '#F7F9FC',
          boxShadow: 'none',
        }}
      >
        {/* Ehem. starker Glas-Overlay: wirkte als grauer/weißer Nebel; entfernt für sauberen Look. */}

        {/* Dynamic Island */}
        <div className="app-device-notch pointer-events-none absolute left-1/2 top-3 z-20 h-7 w-[126px] -translate-x-1/2 rounded-full bg-black" />
        <div className="app-device-content relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden pt-10">
          {children}
        </div>
        {/* Home-Indikator */}
        <div className="app-device-home relative z-10 flex flex-shrink-0 justify-center pb-2 pt-1">
          <div className="h-1 w-[134px] rounded-full bg-black/12" />
        </div>
      </div>
    </div>
  );
}
