import type { ReactNode } from 'react';

type AppStageProps = {
  children: ReactNode;
  /**
   * Zielgröße der „Bühne“ (inkl. Device-Rahmen).
   * Wird nur für die Desktop-Zentrierung/Scale-to-fit benutzt.
   */
  stageWidthPx?: number;
  stageHeightPx?: number;
};

/**
 * Desktop-Stage: zeigt die Mobile-App als zentriertes Preview.
 * - nutzt volle Viewport-Fläche
 * - verhindert äußere Scrollbars
 * - skaliert proportional, damit die Stage vollständig sichtbar bleibt
 */
export function AppStage({
  children,
  stageWidthPx = 414,
  stageHeightPx = 900,
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
      <div className="app-stage-inner">{children}</div>
    </div>
  );
}

