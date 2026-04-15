import { ReactNode } from 'react';

/**
 * „iPhone“-Rahmen: Grau außen (immer sichtbar durch Padding), weiße Gerätefläche max. 430px,
 * abgerundet und mit Rand – auch auf schmalen Screens, wo sonst kein Grau neben der Spalte wäre.
 */
export function PhoneStage({ children }: { children: ReactNode }) {
  return (
    <div className="box-border flex min-h-[100dvh] w-full flex-1 flex-col bg-slate-200 px-3 py-3 sm:px-5 sm:py-5">
      <div
        className="mx-auto flex min-h-0 w-full max-w-[430px] max-h-[min(852px,calc(100dvh-1.5rem))] flex-1 flex-col overflow-hidden rounded-[2rem] border-[3px] border-slate-400/35 bg-white shadow-[0_0_0_1px_rgba(15,23,42,0.06),0_25px_50px_-12px_rgba(0,0,0,0.2)]"
      >
        {children}
      </div>
    </div>
  );
}
