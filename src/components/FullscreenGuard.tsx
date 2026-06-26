import { useEffect, useState, useCallback } from 'react';
import { useStore } from '../lib/store';
import { isFullscreen, requestFullscreen } from '../lib/fullscreen';
import { Maximize, AlertTriangle } from 'lucide-react';

/**
 * Enforces fullscreen once the journey has started.
 * If the user leaves fullscreen for ANY reason (Esc, error, alert, tab switch back),
 * an overlay blocks the app and re-enters fullscreen — works on any browser.
 * Browsers require a user gesture to re-enter, so we show a tap-to-continue overlay.
 */
export default function FullscreenGuard() {
  const hasEnteredJourney = useStore((s) => s.hasEnteredJourney);
  const [needsFs, setNeedsFs] = useState(false);

  const check = useCallback(() => {
    if (!hasEnteredJourney) { setNeedsFs(false); return; }
    setNeedsFs(!isFullscreen());
  }, [hasEnteredJourney]);

  useEffect(() => {
    if (!hasEnteredJourney) return;
    // initial check
    check();
    // try to auto re-enter shortly after entering journey
    const t = setTimeout(() => { if (!isFullscreen()) requestFullscreen().then(check); }, 300);

    const onChange = () => check();
    const onVisibility = () => { if (document.visibilityState === 'visible') check(); };
    document.addEventListener('fullscreenchange', onChange);
    document.addEventListener('webkitfullscreenchange', onChange as any);
    document.addEventListener('mozfullscreenchange', onChange as any);
    document.addEventListener('MSFullscreenChange', onChange as any);
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('focus', onChange);
    window.addEventListener('resize', onChange);

    return () => {
      clearTimeout(t);
      document.removeEventListener('fullscreenchange', onChange);
      document.removeEventListener('webkitfullscreenchange', onChange as any);
      document.removeEventListener('mozfullscreenchange', onChange as any);
      document.removeEventListener('MSFullscreenChange', onChange as any);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('focus', onChange);
      window.removeEventListener('resize', onChange);
    };
  }, [hasEnteredJourney, check]);

  const reEnter = async () => {
    await requestFullscreen();
    setTimeout(check, 200);
  };

  if (!hasEnteredJourney || !needsFs) return null;

  return (
    <div className="fixed inset-0 z-[200] grid place-items-center bg-black/90 p-6 text-center text-white backdrop-blur-sm">
      <div>
        <div className="mx-auto mb-5 grid h-20 w-20 place-items-center rounded-full bg-amber-500/20">
          <AlertTriangle size={44} className="text-amber-400" />
        </div>
        <h2 className="font-display text-2xl font-extrabold">وضع ملء الشاشة مطلوب</h2>
        <p className="mx-auto mt-3 max-w-sm text-white/80">
          المنصة تعمل في وضع ملء الشاشة فقط. للمتابعة، اضغط الزر أدناه للعودة إلى ملء الشاشة.
        </p>
        <button
          onClick={reEnter}
          className="mt-7 inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-bold text-black transition hover:scale-105"
        >
          <Maximize size={24} /> العودة لملء الشاشة
        </button>
      </div>
    </div>
  );
}
