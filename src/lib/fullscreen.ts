// Cross-browser fullscreen helpers + enforcement

export function isFullscreen(): boolean {
  const d = document as any;
  return !!(
    document.fullscreenElement ||
    d.webkitFullscreenElement ||
    d.mozFullScreenElement ||
    d.msFullscreenElement
  );
}

export async function requestFullscreen(): Promise<void> {
  const el = document.documentElement as any;
  try {
    if (el.requestFullscreen) await el.requestFullscreen();
    else if (el.webkitRequestFullscreen) await el.webkitRequestFullscreen();
    else if (el.mozRequestFullScreen) await el.mozRequestFullScreen();
    else if (el.msRequestFullscreen) await el.msRequestFullscreen();
  } catch {
    /* may be blocked until a user gesture */
  }
}
