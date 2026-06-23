import { isDevLocalAccessEnabled } from '@/lib/security/dev-local-access';

const DEFAULT_DEMO_ID = process.env.DEMO_ACCESS_DEFAULT_ID ?? 'eidconnect-v1';

/** Lokaler Dev-Einstieg ohne NDA/Admin-Secret — nur NODE_ENV=development. */
export function isDevDemoAutoEnterEnabled(): boolean {
  return isDevLocalAccessEnabled();
}

export function getDevDemoEnterPath(demoId: string = DEFAULT_DEMO_ID): string {
  return `/api/dev/enter-demo?demo_id=${encodeURIComponent(demoId)}`;
}

export function getDefaultDemoId(): string {
  return DEFAULT_DEMO_ID;
}
