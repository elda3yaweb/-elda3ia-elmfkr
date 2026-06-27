import { useStore } from '../lib/store';

/**
 * Watermark overlay — sits ABOVE page content (cards, questions) but is
 * non-interactive, so it appears everywhere on the platform from top to
 * bottom, including over white surfaces. A separate <CertificateWatermark/>
 * is embedded inside the certificate so it prints on it too.
 */
export default function Watermark() {
  const settings = useStore((s) => s.settings);
  if (!settings.watermarkEnabled) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[15] overflow-hidden select-none" aria-hidden>
      <div
        className="absolute inset-0 grid h-full w-full"
        style={{
          opacity: settings.watermarkOpacity,
          gridTemplateColumns: 'repeat(4, 1fr)',
          gridTemplateRows: 'repeat(7, 1fr)',
        }}
      >
        {Array.from({ length: 28 }).map((_, i) =>
          settings.watermarkType === 'image' && settings.watermarkImage ? (
            <div key={i} className="flex items-center justify-center">
              <img src={settings.watermarkImage} alt="" className="max-h-16 -rotate-[20deg] object-contain" />
            </div>
          ) : (
            <div
              key={i}
              className="flex items-center justify-center -rotate-[20deg] whitespace-nowrap font-display text-xl font-bold sm:text-2xl"
              style={{ color: 'var(--c-primary)' }}
            >
              {settings.watermarkText}
            </div>
          )
        )}
      </div>
    </div>
  );
}

/** Embedded watermark for the certificate (so it appears + prints on it). */
export function CertificateWatermark() {
  const settings = useStore((s) => s.settings);
  if (!settings.watermarkEnabled) return null;
  return (
    <div className="pointer-events-none absolute inset-0 z-[1] grid select-none overflow-hidden"
      style={{ opacity: Math.min(0.12, settings.watermarkOpacity + 0.04), gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(4, 1fr)' }} aria-hidden>
      {Array.from({ length: 12 }).map((_, i) =>
        settings.watermarkType === 'image' && settings.watermarkImage ? (
          <div key={i} className="flex items-center justify-center"><img src={settings.watermarkImage} alt="" className="max-h-14 -rotate-[20deg] object-contain" /></div>
        ) : (
          <div key={i} className="flex items-center justify-center -rotate-[20deg] whitespace-nowrap font-display text-lg font-bold" style={{ color: settings.lightPrimary }}>
            {settings.watermarkText}
          </div>
        )
      )}
    </div>
  );
}
