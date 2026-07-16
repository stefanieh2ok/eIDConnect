/**
 * Präsentations-Wasserzeichen für Demo-/Device-Rahmen — nicht Teil der Live-App-Oberfläche.
 */
export function ConfidentialDeviceWatermark() {
  return (
    <div className="app-confidential-watermark app-device-chrome-watermark" aria-hidden>
      <span className="app-confidential-watermark__line top-[16%] text-[18px]">HookAI · Confidential</span>
      <span className="app-confidential-watermark__line top-[44%] text-[18px]">HookAI · Confidential</span>
      <span className="app-confidential-watermark__line top-[72%] text-[18px]">HookAI · Confidential</span>
    </div>
  );
}
