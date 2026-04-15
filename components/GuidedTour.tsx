'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';

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

      {/* Tooltip-Karte – unter dem Spotlight; Höhe nutzt verfügbaren Viewport (kein 220px-Cutoff) */}
      <div
        className="absolute left-4 right-4 z-[131] mx-auto flex max-h-[min(78dvh,calc(100dvh-5.5rem))] max-w-sm flex-col"
        style={
          rect
            ? {
                top:
                  typeof window !== 'undefined' &&
                  (rect.top + rect.height) + 280 > window.innerHeight - 72
                    ? Math.max(12, rect.top - 280)
                    : (rect.top + rect.height) + 12,
              }
            : { top: '50%', transform: 'translateY(-50%)' }
        }
      >
        <div className="flex max-h-[min(78dvh,calc(100dvh-5.5rem))] min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-gray-200/80 bg-white shadow-2xl">
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 pb-3 pt-5 [scrollbar-gutter:stable]">
            <div className="flex items-center gap-2 mb-2">
              <span className="flex items-center justify-center w-8 h-8 rounded-lg bg-blue-100 text-blue-600">
                <Sparkles className="w-4 h-4" />
              </span>
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

          <div className="px-5 pb-4 pt-2 flex items-center justify-between gap-3">
            <button
              onClick={() => onComplete()}
              className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              Überspringen
            </button>
            <div className="flex items-center gap-2">
              {stepIndex > 0 && (
                <button
                  onClick={goBack}
                  className="p-2 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                  aria-label="Zurück"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              )}
              <button
                onClick={goNext}
                className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl font-bold text-sm text-white transition-opacity hover:opacity-90"
                style={{ background: 'var(--gov-btn, #0066cc)' }}
              >
                {stepIndex >= steps.length - 1 ? 'Fertig' : 'Weiter'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
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

export default GuidedTour;
