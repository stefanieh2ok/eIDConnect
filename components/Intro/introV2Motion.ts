'use client';

import { useEffect, useRef, useState } from 'react';

export function useIntroV2ReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== 'function') {
      setReduced(false);
      return;
    }
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const apply = () => setReduced(mq.matches);
    apply();
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  return reduced;
}

export function useIntroV2Typewriter(
  text: string,
  active: boolean,
  reduced: boolean,
  msPerChar = 26,
): string {
  const [out, setOut] = useState(reduced ? text : '');

  useEffect(() => {
    if (!active) {
      setOut('');
      return;
    }
    if (reduced) {
      setOut(text);
      return;
    }
    setOut('');
    let i = 0;
    const id = window.setInterval(() => {
      i += 1;
      setOut(text.slice(0, i));
      if (i >= text.length) window.clearInterval(id);
    }, msPerChar);
    return () => window.clearInterval(id);
  }, [text, active, reduced, msPerChar]);

  return out;
}

/** Advances phase 0..maxPhase using cumulative delays (ms) between steps. */
export function useIntroV2Phase(
  maxPhase: number,
  delays: number[],
  reduced: boolean,
): number {
  const [phase, setPhase] = useState(reduced ? maxPhase : 0);
  const delaysRef = useRef(delays);
  delaysRef.current = delays;
  const delaysKey = delays.join(',');

  useEffect(() => {
    if (reduced) {
      setPhase(maxPhase);
      return;
    }
    setPhase(0);
    const timers: number[] = [];
    let acc = 0;
    const steps = delaysRef.current;
    for (let p = 1; p <= maxPhase; p += 1) {
      acc += steps[p - 1] ?? 700;
      timers.push(window.setTimeout(() => setPhase(p), acc));
    }
    return () => timers.forEach((t) => window.clearTimeout(t));
  }, [maxPhase, delaysKey, reduced]);

  return phase;
}
