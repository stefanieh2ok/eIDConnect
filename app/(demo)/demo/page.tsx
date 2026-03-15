import Link from 'next/link';

/**
 * Demo-Einstiegsseite unter /demo (ohne demoId).
 * Leitet Nutzer zum Zugangslink oder zur Startseite.
 */
export default function DemoEntryPage() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 bg-neutral-100 text-neutral-900">
      <h1 className="text-xl font-semibold">eIDConnect Demo</h1>
      <p className="mt-2 text-sm text-neutral-600 text-center max-w-md">
        Für den Zugang zur Demo benötigst du einen personalisierten Link aus der Zugangsanfrage.
      </p>
      <Link
        href="/"
        className="mt-6 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
      >
        Zur Startseite
      </Link>
    </div>
  );
}
