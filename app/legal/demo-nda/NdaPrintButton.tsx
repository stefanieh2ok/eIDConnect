'use client';

export function NdaPrintButton() {
  return (
    <button
      type="button"
      onClick={() => typeof window !== 'undefined' && window.print()}
      className="rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700 print:hidden"
    >
      Drucken / Als PDF speichern
    </button>
  );
}
