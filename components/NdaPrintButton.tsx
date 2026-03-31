'use client';

export default function NdaPrintButton() {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      className="rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-md transition-opacity hover:opacity-95"
      style={{ background: 'linear-gradient(135deg, #003366 0%, #0055A4 100%)' }}
    >
      PDF drucken
    </button>
  );
}
