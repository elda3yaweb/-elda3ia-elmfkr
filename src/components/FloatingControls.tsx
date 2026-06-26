import { useState } from 'react';
import { useStore } from '../lib/store';
import * as Icons from 'lucide-react';
import { Sun, Moon, Plus, X } from 'lucide-react';

function SocialIcon({ name }: { name: string }) {
  const Cmp = (Icons as Record<string, any>)[name] || Icons.Link;
  return <Cmp size={20} />;
}

export default function FloatingControls() {
  const { settings, theme, toggleTheme } = useStore();
  const [open, setOpen] = useState(false);

  const primary = settings.social.filter((s) => s.primary).slice(0, 2);
  const extra = settings.social.filter((s) => !s.primary);

  return (
    <div className="fixed bottom-6 left-6 z-40 flex flex-col items-center gap-3">
      {/* extra icons reveal */}
      <div
        className={`flex flex-col items-center gap-3 transition-all duration-500 ${
          open ? 'opacity-100 translate-y-0' : 'pointer-events-none opacity-0 translate-y-6'
        }`}
      >
        {extra.map((s, i) => (
          <a
            key={s.id}
            href={s.url}
            target="_blank"
            rel="noreferrer"
            title={s.name}
            className="grid h-11 w-11 place-items-center rounded-full surface-card text-primary transition-transform hover:scale-110"
            style={{ transitionDelay: open ? `${i * 40}ms` : '0ms' }}
          >
            <SocialIcon name={s.icon} />
          </a>
        ))}
      </div>

      {/* primary social (always visible) */}
      {primary.map((s) => (
        <a
          key={s.id}
          href={s.url}
          target="_blank"
          rel="noreferrer"
          title={s.name}
          className="grid h-11 w-11 place-items-center rounded-full surface-card text-primary transition-transform hover:scale-110"
        >
          <SocialIcon name={s.icon} />
        </a>
      ))}

      {/* toggle extra icons */}
      {extra.length > 0 && (
        <button
          onClick={() => setOpen((o) => !o)}
          title={open ? 'إخفاء' : 'المزيد'}
          className="grid h-11 w-11 place-items-center rounded-full btn-primary shadow-lg transition-transform hover:scale-110"
        >
          {open ? <X size={20} /> : <Plus size={20} />}
        </button>
      )}

      {/* day/night toggle */}
      <button
        onClick={toggleTheme}
        title={theme === 'light' ? 'الوضع الليلي' : 'الوضع النهاري'}
        className="grid h-14 w-14 place-items-center rounded-full btn-primary glow shadow-xl transition-transform hover:scale-110"
      >
        {theme === 'light' ? <Moon size={24} /> : <Sun size={24} />}
      </button>
    </div>
  );
}
