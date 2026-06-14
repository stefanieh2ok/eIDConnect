'use client';

/**
 * Fängt Fehler im Root-Layout ab (error.tsx reicht dafür nicht). Eigenes html/body nötig.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="de">
      <body style={{ margin: 0, fontFamily: 'system-ui, sans-serif', padding: '1.5rem', color: '#1A2B45' }}>
        <h1 style={{ fontSize: '1.125rem' }}>Schwerer Anwendungsfehler</h1>
        <p style={{ color: '#57534e', fontSize: '0.875rem', maxWidth: '32rem', lineHeight: 1.5 }}>
          Bitte <code>.next</code> löschen und den Dev-Server neu starten. Parallel <code>npm run build</code> und{' '}
          <code>npm run dev</code> vermeiden.
        </p>
        {process.env.NODE_ENV === 'development' ? (
          <pre style={{ fontSize: '11px', overflow: 'auto', color: '#78716c' }}>{error.message}</pre>
        ) : null}
        <button
          type="button"
          onClick={() => reset()}
          style={{
            marginTop: '1rem',
            padding: '0.5rem 1rem',
            borderRadius: '0.5rem',
            border: '1px solid #94a3b8',
            background: '#f8fafc',
            cursor: 'pointer',
            fontWeight: 600,
          }}
        >
          Neu laden
        </button>
      </body>
    </html>
  );
}
