import { useStore } from '../lib/store';
import * as Icons from 'lucide-react';
import { Link } from 'react-router-dom';

function SocialIcon({ name }: { name: string }) {
  const Cmp = (Icons as Record<string, any>)[name] || Icons.Link;
  return <Cmp size={18} />;
}

export default function Footer() {
  const settings = useStore((s) => s.settings);
  return (
    <footer className="relative z-20 mt-auto border-t border-line surface-card">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-6 sm:flex-row sm:justify-between">
        <p className="text-center text-sm text-muted sm:text-right">{settings.copyright}</p>

        <div className="flex items-center gap-3">
          <Link to="/instructions" className="text-sm text-muted hover:text-primary transition">التعليمات</Link>
          <span className="text-muted">·</span>
          <Link to="/comments" className="text-sm text-muted hover:text-primary transition">التعليقات</Link>
        </div>

        <div className="flex items-center gap-2">
          {settings.social.map((s) => (
            <a
              key={s.id}
              href={s.url}
              target="_blank"
              rel="noreferrer"
              title={s.name}
              className="grid h-9 w-9 place-items-center rounded-full bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary transition hover:scale-110"
            >
              <SocialIcon name={s.icon} />
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
