/**
 * Optional launch chime. No bundled MP3s in the repo — avoids 404 noise (UX-004).
 * Drop files under public/audio/ (see README.txt) and wire playOne() here when needed.
 */
export function playDemoLaunchAudio(): void {
  if (typeof window === 'undefined') return;
  /* Visual launch effect remains; sound is optional until assets are added. */
}
