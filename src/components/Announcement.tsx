import { useStore } from '../lib/store';

export default function Announcement() {
  const s = useStore((st) => st.settings);
  if (!s.announcementEnabled || !s.announcementText) return null;

  const anim = s.announcementVertical
    ? 'marquee-vertical'
    : s.announcementDirection === 'rtl'
    ? 'marquee-rtl'
    : 'marquee-ltr';

  if (s.announcementVertical) {
    return (
      <div
        className="fixed top-0 bottom-0 left-0 z-30 w-10 overflow-hidden flex items-center justify-center"
        style={{ background: s.announcementBg }}
      >
        <div
          className="whitespace-nowrap font-semibold"
          style={{
            color: s.announcementColor,
            fontSize: s.announcementFontSize,
            writingMode: 'vertical-rl',
            animation: `${anim} ${s.announcementSpeed}s linear infinite`,
          }}
        >
          {s.announcementText}
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative z-30 w-full overflow-hidden py-2"
      style={{ background: s.announcementBg }}
    >
      <div
        className="whitespace-nowrap font-semibold inline-block"
        style={{
          color: s.announcementColor,
          fontSize: s.announcementFontSize,
          animation: `${anim} ${s.announcementSpeed}s linear infinite`,
        }}
      >
        {s.announcementText}
      </div>
    </div>
  );
}
