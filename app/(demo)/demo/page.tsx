import Link from 'next/link';
import { redirect } from 'next/navigation';
import { APP_DISPLAY_NAME } from '@/lib/branding';
import { IphoneFrame } from '@/components/ui/IphoneFrame';

type PageProps = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/**
 * Demo-Einstiegsseite unter /demo (ohne demoId).
 * Bei ?token=xxx → Weiterleitung an NDA-Gate unter /demo/access.
 * Sonst: Hinweis auf personalisierten Link.
 */
export default async function DemoEntryPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const token = typeof params?.token === 'string' ? params.token : (Array.isArray(params?.token) ? params.token[0] : null);
  if (token?.trim()) {
    redirect(`/demo/access?token=${encodeURIComponent(token.trim())}`);
  }

  return (
    <IphoneFrame>
      <div className="flex h-full min-h-0 w-full flex-col items-center justify-center rounded-b-[1.75rem] px-4 pb-8 text-center">
        <div className="w-full max-w-[360px] rounded-2xl border border-neutral-200 bg-white/75 p-6 text-neutral-900 shadow-lg backdrop-blur-xl">
          <h1 className="text-xl font-semibold text-neutral-900">{APP_DISPLAY_NAME}</h1>
          <p className="mt-2 text-sm text-neutral-800">
            Für den Zugang zur Demo benötigen Sie einen personalisierten Link aus der Zugangsanfrage.
          </p>
          <Link
            href="/"
            className="mt-6 inline-block rounded-lg bg-white/90 px-4 py-2 text-sm font-medium text-[#003366] hover:bg-white"
          >
            Zur Startseite
          </Link>
        </div>
      </div>
    </IphoneFrame>
  );
}
