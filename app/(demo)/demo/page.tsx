import Link from 'next/link';
import { redirect } from 'next/navigation';
import { PhoneStage } from '@/components/layout/PhoneStage';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * Demo-Einstiegsseite unter /demo (ohne demoId).
 * Bei ?token=xxx → Weiterleitung an /api/demo/enter (Kirkel-Links aus demo_tokens).
 * Sonst: Hinweis auf personalisierten Link.
 */
export default async function DemoEntryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = typeof params?.token === 'string' ? params.token : (Array.isArray(params?.token) ? params.token[0] : null);
  if (token?.trim()) {
    redirect(`/api/demo/enter?token=${encodeURIComponent(token.trim())}`);
  }

  return (
    <PhoneStage>
      <div className="flex min-h-dvh flex-col items-center justify-center gap-4 px-6 py-10 text-center text-neutral-900">
        <h1 className="text-xl font-semibold">{process.env.NEXT_PUBLIC_APP_NAME || 'eIDConnect'}</h1>
        <p className="text-sm text-neutral-600 max-w-md">
          Für den Zugang zur Demo benötigen Sie einen personalisierten Link aus der Zugangsanfrage.
        </p>
        <Link
          href="/"
          className="mt-2 rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
        >
          Zur Startseite
        </Link>
      </div>
    </PhoneStage>
  );
}
