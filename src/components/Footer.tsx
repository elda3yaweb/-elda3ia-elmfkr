import { useStore } from '../lib/store';
import { Link } from 'react-router-dom';
import { MessageSquare } from 'lucide-react';

export default function Footer() {
  const settings = useStore((s) => s.settings);
  const showComments = settings.commentsEnabled;

  return (
    <footer className="relative z-20 mt-auto border-t border-line surface-card">
      <div className="mx-auto max-w-7xl px-4 py-6">
        {showComments && (
          <div className="mb-4 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/comments"
              className="inline-flex items-center gap-2 rounded-full bg-[color-mix(in_srgb,var(--c-secondary)_14%,transparent)] px-5 py-2 text-sm font-bold text-secondary transition hover:scale-105"
            >
              <MessageSquare size={16} /> {settings.commentsTitle}
            </Link>
          </div>
        )}

        <p className="text-center text-sm text-muted">{settings.copyright}</p>
      </div>
    </footer>
  );
}
