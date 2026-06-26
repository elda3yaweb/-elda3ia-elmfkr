import { useStore } from '../lib/store';
import { BookOpen, Sun, Moon, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { waLink } from '../lib/utils';

export default function Header() {
  const { settings, theme, toggleTheme, currentUser, logout, activeCompetition, setActiveCompetition, exitJourney } = useStore();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, []);

  const userComps = currentUser?.competitions || [];
  const cycleComp = (dir: number) => {
    if (userComps.length < 2 || !activeCompetition) return;
    const idx = userComps.indexOf(activeCompetition);
    const next = (idx + dir + userComps.length) % userComps.length;
    setActiveCompetition(userComps[next]);
  };

  return (
    <header className="relative z-20 w-full border-b border-line surface-card">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
        {/* Logo + names */}
        <div
          className="flex cursor-pointer items-center gap-3"
          onClick={() => { exitJourney(); navigate('/'); }}
        >
          {settings.logoUrl ? (
            <img
              src={settings.logoUrl}
              alt="logo"
              className="h-12 w-12 rounded-xl object-cover ring-2"
              style={{ boxShadow: '0 0 0 2px var(--c-primary)' }}
              onError={(e) => ((e.target as HTMLImageElement).style.display = 'none')}
            />
          ) : (
            <div className="grid h-12 w-12 place-items-center rounded-xl btn-primary">
              <BookOpen size={26} />
            </div>
          )}
          <div className="leading-tight">
            <h1 className="font-display text-lg font-bold sm:text-xl">{settings.platformName}</h1>
            <p className="text-xs text-muted sm:text-sm">{settings.subSlogan}</p>
          </div>
        </div>

        {/* Right side: welcome bar / theme */}
        <div className="flex items-center gap-2 sm:gap-4">
          {currentUser && (
            <div className="hidden items-center gap-3 rounded-full surface-card px-4 py-1.5 md:flex">
              {/* competition switch (left) */}
              {userComps.length > 1 && (
                <div className="flex items-center gap-1">
                  <button onClick={() => cycleComp(-1)} className="text-primary hover:scale-110 transition">
                    <ChevronRight size={18} />
                  </button>
                  <span className="max-w-40 truncate text-sm font-semibold text-primary">{activeCompetition}</span>
                  <button onClick={() => cycleComp(1)} className="text-primary hover:scale-110 transition">
                    <ChevronLeft size={18} />
                  </button>
                </div>
              )}
              {userComps.length === 1 && (
                <span className="max-w-40 truncate text-sm font-semibold text-primary">{activeCompetition}</span>
              )}
              <span className="h-5 w-px" style={{ background: 'color-mix(in srgb, var(--c-text) 18%, transparent)' }} />
              {/* welcome name (right) */}
              <div className="relative" ref={menuRef}>
                <button
                  onClick={() => setMenuOpen((o) => !o)}
                  className="flex items-center gap-2 text-sm font-semibold"
                >
                  {currentUser.photoUrl ? (
                    <img src={currentUser.photoUrl} className="h-7 w-7 rounded-full object-cover" alt="" />
                  ) : (
                    <span className="grid h-7 w-7 place-items-center rounded-full btn-primary text-xs">
                      {currentUser.fullName.charAt(0)}
                    </span>
                  )}
                  <span>مرحباً: {currentUser.fullName.split(' ')[0]}</span>
                </button>
                {menuOpen && (
                  <div className="absolute left-0 top-full mt-2 w-48 overflow-hidden rounded-xl surface-card py-1 shadow-xl">
                    <button
                      onClick={() => { setMenuOpen(false); navigate('/profile'); }}
                      className="block w-full px-4 py-2 text-right text-sm hover:bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)]"
                    >
                      تعديل البيانات
                    </button>
                    {currentUser.role === 'مسؤل' && (
                      <button
                        onClick={() => { setMenuOpen(false); navigate('/admin'); }}
                        className="block w-full px-4 py-2 text-right text-sm hover:bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)]"
                      >
                        لوحة التحكم
                      </button>
                    )}
                    {currentUser.phone && (
                      <a
                        href={waLink(currentUser.phone)} target="_blank" rel="noreferrer"
                        className="block w-full px-4 py-2 text-right text-sm hover:bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)]"
                      >
                        تواصل واتساب
                      </a>
                    )}
                    <button
                      onClick={() => { setMenuOpen(false); logout(); navigate('/'); }}
                      className="block w-full px-4 py-2 text-right text-sm text-red-500 hover:bg-red-500/10"
                    >
                      تسجيل الخروج
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          <button
            onClick={toggleTheme}
            title="تبديل الوضع"
            className="grid h-10 w-10 place-items-center rounded-full surface-card text-primary transition hover:scale-110"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
        </div>
      </div>

      {/* mobile welcome row */}
      {currentUser && (
        <div className="flex items-center justify-between border-t border-line px-4 py-2 text-sm md:hidden">
          <span className="font-semibold">مرحباً: {currentUser.fullName.split(' ')[0]}</span>
          <div className="flex items-center gap-2">
            {userComps.length > 1 && (
              <button onClick={() => cycleComp(-1)} className="text-primary"><ChevronRight size={16} /></button>
            )}
            <span className="max-w-32 truncate font-semibold text-primary">{activeCompetition}</span>
            {userComps.length > 1 && (
              <button onClick={() => cycleComp(1)} className="text-primary"><ChevronLeft size={16} /></button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
