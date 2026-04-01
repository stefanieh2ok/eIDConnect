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
  /** Etwas Luft für Rahmen, Home-Indikator, Schatten (393×852-Logik + Rand) */
  stageHeightPx = 880,
}: AppStageProps) {
  /** Zusätzliche Verkleinerung nur bei Bedarf; 1 = reines scale-to-fit in den Stage-Viewport */
  const DESKTOP_PRESENTATION_FACTOR = 1;
  const rootRef = useRef<HTMLDivElement | null>(null);
  const [desktopScale, setDesktopScale] = useState(1);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const computeScale = () => {
      const rect = root.getBoundingClientRect();
      const isDesktop = window.matchMedia(`(min-width: ${DESKTOP_PREVIEW_MIN_WIDTH_PX}px)`).matches;
      if (!isDesktop) {
        setDesktopScale(1);
        return;
      }
      const availableWidth = Math.max(0, rect.width - 48);
      const availableHeight = Math.max(0, rect.height - 48);
      const scaleX = availableWidth / stageWidthPx;
      const scaleY = availableHeight / stageHeightPx;
      const finalScale = Math.min(scaleX, scaleY, 1) * DESKTOP_PRESENTATION_FACTOR;
      setDesktopScale(Number.isFinite(finalScale) && finalScale > 0 ? finalScale : 1);
    };

    const ro = new ResizeObserver(computeScale);
    ro.observe(root);
    computeScale();
    window.addEventListener('resize', computeScale);
    return () => {
      ro.disconnect();
      window.removeEventListener('resize', computeScale);
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

