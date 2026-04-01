import type { ReactNode } from 'react';

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
  stageHeightPx = 850,
}: AppStageProps) {
  return (
    <div
      className="app-stage-root"
      style={
        {
          ['--stage-w' as any]: `${stageWidthPx}px`,
          ['--stage-h' as any]: `${stageHeightPx}px`,
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

