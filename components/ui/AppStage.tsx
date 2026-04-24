'use client';

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react';

/** Muss mit Desktop-Regeln in app/globals.css (.app-stage-*) übereinstimmen */
const DESKTOP_PREVIEW_MIN_WIDTH_PX = 900;

type AppStageProps = {
  children: ReactNode;
  /**
   * Unskalierte Zielgröße der App (Device + Rahmen), nur für Desktop-Scale-to-fit.
   * Sollte zur realen IphoneFrame-Fläche passen (ca. 390 × 393/852).
   */
  stageWidthPx?: number;
  stageHeightPx?: number;
};

/**
 * Desktop: zentrierte Preview-Bühne, skaliert so, dass die komplette Mobile-App
 * im Viewport bleibt (Layout-Box = skalierte Größe, kein Abschneiden durch transform).
 * Mobile: nur Vollflächen-Container, keine zusätzliche „Desktop-Logik“.
 */
export function AppStage({
  children,
  stageWidthPx = 390,
  /** Etwas Luft für Rahmen & Home-Indikator (393×852-Logik + Rand) */
  stageHeightPx = 880,
}: AppStageProps) {
  /** Zusätzliche Verkleinerung nur bei Bedarf; 1 = reines scale-to-fit in den Stage-Viewport */
  const DESKTOP_PRESENTATION_FACTOR = 1;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [desktopScale, setDesktopScale] = useState(1);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    let rafId: number | null = null;
    let lastScale = -1;

    const computeScale = () => {
      const rect = root.getBoundingClientRect();
      const isDesktop = window.matchMedia(`(min-width: ${DESKTOP_PREVIEW_MIN_WIDTH_PX}px)`).matches;
      let next: number;
      if (!isDesktop) {
        next = 1;
      } else {
        const availableWidth = Math.max(0, rect.width - 48);
        const availableHeight = Math.max(0, rect.height - 48);
        const scaleX = availableWidth / stageWidthPx;
        const scaleY = availableHeight / stageHeightPx;
        const finalScale = Math.min(scaleX, scaleY, 1) * DESKTOP_PRESENTATION_FACTOR;
        next = Number.isFinite(finalScale) && finalScale > 0 ? finalScale : 1;
      }
      // Mikro-Jitter durch sub-pixel Breiten-Änderungen (z. B. Scrollbar-Gutter,
      // Browser-UI) vermeiden: erst ab 0.3 % Differenz neu rendern.
      if (Math.abs(next - lastScale) < 0.003) return;
      lastScale = next;
      setDesktopScale(next);
    };

    const scheduleCompute = () => {
      if (rafId != null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        computeScale();
      });
    };

    const ro = new ResizeObserver(scheduleCompute);
    ro.observe(root);
    computeScale();
    window.addEventListener('resize', scheduleCompute);
    return () => {
      if (rafId != null) window.cancelAnimationFrame(rafId);
      ro.disconnect();
      window.removeEventListener('resize', scheduleCompute);
    };
  }, [stageWidthPx, stageHeightPx]);

  return (
    <div
      ref={rootRef}
      className="app-stage-root"
      style={
        {
          ['--stage-w' as any]: `${stageWidthPx}px`,
          ['--stage-h' as any]: `${stageHeightPx}px`,
          ['--desktop-scale' as any]: desktopScale,
          // Ersetzt den bläulichen Radial-Gradient aus globals.css — reines Weiß hinter dem Device.
          background: '#ffffff',
        } as any
      }
    >
      <div className="app-stage-inner">
        <div className="app-stage-scale">
          <div className="app-stage-content">{children}</div>
        </div>
      </div>
    </div>
  );
}

