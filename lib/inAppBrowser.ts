/**
 * Erkennung gängiger Messenger-In-App-Browser (WhatsApp, Instagram, Facebook, LINE).
 * Diese WebViews sind für WebRTC / Speech / Storage oft restriktiver als Safari/Chrome.
 */
const MESSENGER_IN_APP_UA =
  /WhatsApp|Instagram|FBAN|FBAV|FBIOS|FB_IAB|Line\/|Line\;|MessengerForiOS|messenger\.com\/iab/i;

export function isMessengerInAppBrowser(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent || '';
  return MESSENGER_IN_APP_UA.test(ua);
}
