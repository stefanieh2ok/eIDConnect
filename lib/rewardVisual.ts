/** Shared Prämien card visuals (Leaderboard + Intro trailer). */
export type RewardVisual = {
  label: string;
  className: string;
  imageSrc?: string;
  imageAlt?: string;
  db?: boolean;
  cinestar?: boolean;
};

export function rewardVisual(name: string): RewardVisual {
  const n = name.toLowerCase();
  if (n.includes('deutsche bahn')) {
    return { label: 'DB', className: 'border-red-200 bg-white text-red-700', db: true };
  }
  if (n.includes('cinestar')) {
    return {
      label: '',
      className: 'border-violet-200 bg-gradient-to-b from-violet-50 to-white text-violet-900',
      cinestar: true,
    };
  }
  if (n.includes('kino')) {
    return { label: 'KINO', className: 'border-violet-100 bg-violet-50 text-violet-700' };
  }
  if (n.includes('museum')) {
    return {
      label: 'RM',
      className: 'border-amber-100 bg-amber-50 text-amber-800',
      imageSrc: '/praemien/saarlandmuseum-moderne-galerie.jpg',
      imageAlt: 'Innenraum Saarlandmuseum Moderne Galerie',
    };
  }
  if (n.includes('freibad') || n.includes('bad')) {
    return {
      label: 'NF',
      className: 'border-cyan-100 bg-cyan-50 text-cyan-800',
      imageSrc: '/praemien/naturfreibad-kirkel.jpg',
      imageAlt: 'Naturfreibad Kirkel',
    };
  }
  return { label: 'PR', className: 'border-slate-200 bg-slate-50 text-slate-700' };
}

export function isNaturfreibadBenefit(name: string): boolean {
  return /naturfreibad|freibad/i.test(name);
}

/** Intro trailer + walkthrough demo voucher (no real redemption). */
export const KIRKEL_DEMO_VOUCHER_CODE = 'HC-KIRKEL-2026-1270';
