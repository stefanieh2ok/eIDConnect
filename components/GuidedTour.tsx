'use client';

import React, { useCallback, useEffect, useState } from 'react';

export type TourStep = {
  id: string;
  targetId: string;
  title: string;
  body: string;
  /** Tab wechseln, damit Ziel sichtbar ist */
  switchToTab?: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
};

type GuidedTourProps = {
  steps: TourStep[];
  onComplete: () => void;
  onStepChange?: (stepIndex: number) => void;
};

const OVERLAY_Z = 130;

export function GuidedTour({ steps, onComplete, onStepChange }: GuidedTourProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);
  const step = steps[stepIndex];

  const updateTargetRect = useCallback(() => {
    if (!step?.targetId || typeof document === 'undefined') return;
    const el = document.getElementById(step.targetId);
    if (el) {
      setTargetRect(el.getBoundingClientRect());
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      setTargetRect(null);
    }
  }, [step?.targetId]);


  useEffect(() => {
    onStepChange?.(stepIndex);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onComplete();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onComplete]);

  useEffect(() => {
    updateTargetRect();
    const ro = new ResizeObserver(updateTargetRect);
    const el = step?.targetId ? document.getElementById(step.targetId) : null;
    if (el) ro.observe(el);
    window.addEventListener('scroll', updateTargetRect, true);
    const t = setTimeout(updateTargetRect, 100);
    return () => {
      ro.disconnect();
      window.removeEventListener('scroll', updateTargetRect, true);
      clearTimeout(t);
    };
  }, [step?.targetId, stepIndex, updateTargetRect]);

  const goNext = () => {
    if (stepIndex >= steps.length - 1) {
      onComplete();
    } else {
      const nextIndex = stepIndex + 1;
      onStepChange?.(nextIndex);
      setStepIndex(nextIndex);
    }
  };

  const goBack = () => {
    const prevIndex = Math.max(0, stepIndex - 1);
    onStepChange?.(prevIndex);
    setStepIndex(prevIndex);
  };

  if (!step) return null;

  const pad = 8;
  const rect = targetRect
    ? {
        top: targetRect.top - pad,
        left: targetRect.left - pad,
        width: targetRect.width + pad * 2,
        height: targetRect.height + pad * 2,
      }
    : null;

  return (
    <div
      className="fixed inset-0 z-[130]"
      style={{ isolation: 'isolate' }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="tour-title"
      aria-describedby="tour-body"
    >
      {/* Dunkler Overlay mit Spotlight-Loch */}
      <div
        className="absolute inset-0 transition-opacity duration-300"
        style={{
          background: 'rgba(0,0,0,0.72)',
          backdropFilter: 'blur(2px)',
        }}
      >
        {rect && (
          <div
            className="absolute transition-all duration-300 ease-out"
            style={{
              top: rect.top,
              left: rect.left,
              width: rect.width,
              height: rect.height,
              boxShadow: '0 0 0 9999px rgba(0,0,0,0.72)',
              borderRadius: 14,
              pointerEvents: 'none',
            }}
          />
        )}
        {rect && (
          <div
            className="absolute transition-all duration-300 ease-out"
            style={{
              top: rect.top - 2,
              left: rect.left - 2,
              width: rect.width + 4,
              height: rect.height + 4,
              border: '2px solid rgba(37, 99, 235, 0.9)',
              borderRadius: 16,
              boxShadow: '0 0 0 1px rgba(255,255,255,0.2) inset, 0 0 24px rgba(37, 99, 235, 0.4)',
              pointerEvents: 'none',
            }}
          />
        )}
      </div>

      {/* Tooltip-Karte – unter dem Spotlight; bei wenig Platz darüber */}
      <div
        className="absolute left-4 right-4 z-[131] mx-auto max-w-sm"
        style={
          rect
            ? {
                top:
                  typeof window !== 'undefined' && (rect.top + rect.height) + 220 > window.innerHeight - 60
                    ? Math.max(12, rect.top - 212)
                    : (rect.top + rect.height) + 12,
                maxHeight: 220,
              }
            : { top: '50%', transform: 'translateY(-50%)' }
        }
      >
        <div className="bg-white rounded-2xl shadow-2xl border border-gray-200/80 overflow-hidden">
          <div className="px-5 pt-5 pb-3">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-semibold text-blue-600">
                Schritt {stepIndex + 1} von {steps.length}
              </span>
            </div>
            <h3 id="tour-title" className="text-lg font-bold text-gray-900 mb-1">
              {step.title}
            </h3>
            <p id="tour-body" className="text-sm text-gray-600 leading-relaxed">
              {step.body}
            </p>
          </div>

          <div className="flex gap-2 px-5 pb-4 pt-2">
            <button
              type="button"
              onClick={() => {
                if (stepIndex === 0) onComplete();
                else goBack();
              }}
              className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-neutral-800 bg-black px-3 text-sm font-semibold text-white shadow-sm transition hover:bg-neutral-900 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
            >
              Zurück
            </button>
            <button
              type="button"
              onClick={goNext}
              className="inline-flex min-h-[44px] min-w-0 flex-1 items-center justify-center rounded-xl border border-[#004a99] px-4 text-sm font-bold text-white shadow-md transition hover:opacity-95 active:scale-[0.99] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
              style={{
                background: 'linear-gradient(135deg, var(--gov-primary, #003366) 0%, var(--gov-primary-mid, #0055a4) 100%)',
              }}
            >
              {stepIndex >= steps.length - 1 ? 'Fertig' : 'Weiter'}
            </button>
          </div>
        </div>
      </div>

      {/* Progress-Dots */}
      <div
        className="absolute left-0 right-0 flex justify-center gap-1.5 z-[131]"
        style={{ bottom: 'max(1rem, env(safe-area-inset-bottom, 1rem))' }}
      >
        {steps.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              i === stepIndex ? 'w-6 bg-blue-500' : i < stepIndex ? 'w-1.5 bg-blue-300' : 'w-1.5 bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
