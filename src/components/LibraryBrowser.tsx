import { useState } from 'react';
import { useStore } from '../lib/store';
import { motion } from 'framer-motion';
import {
  Folder, FolderOpen, ChevronLeft, Home, FileText, Video as VideoIcon,
  BookOpen, Lock, ExternalLink, Download, X,
} from 'lucide-react';
import type { LibrarySection, LibraryItem } from '../lib/types';
import { childFolders, folderItems, folderPath } from '../lib/library';
import SubscribeModal from './SubscribeModal';
import SearchBar from './SearchBar';

const sectionMeta: Record<LibrarySection, { icon: any; label: string }> = {
  notes: { icon: FileText, label: 'المذكرات' },
  videos: { icon: VideoIcon, label: 'الفيديوهات' },
  articles: { icon: BookOpen, label: 'الشرح' },
};

export default function LibraryBrowser({ section }: { section: LibrarySection }) {
  const { libraryFolders, libraryItems, currentUser, activeCompetition } = useStore();
  const [folderId, setFolderId] = useState<string | null>(null);
  const [openItem, setOpenItem] = useState<LibraryItem | null>(null);
  const [showSub, setShowSub] = useState(false);
  const [search, setSearch] = useState('');

  const isSub = currentUser?.subscription === 'مشترك' || currentUser?.role === 'مسؤل';

  const compMatch = (comps: string[]) => comps.length === 0 || (activeCompetition ? comps.includes(activeCompetition) : true);
  const q = search.trim().toLowerCase();

  const folders = childFolders(libraryFolders, section, folderId)
    .filter((f) => compMatch(f.competitions))
    .filter((f) => !q || f.name.toLowerCase().includes(q) || (f.description || '').toLowerCase().includes(q));
  const items = folderItems(libraryItems, section, folderId)
    .filter((i) => compMatch(i.competitions))
    .filter((i) => !q || i.title.toLowerCase().includes(q) || (i.description || '').toLowerCase().includes(q));
  const path = folderPath(libraryFolders, folderId);
  const Meta = sectionMeta[section];

  const openLockedOr = (locked: boolean, fn: () => void) => (locked ? setShowSub(true) : fn());

  return (
    <div>
      <SearchBar value={search} onChange={setSearch} placeholder={`ابحث في ${Meta.label}...`} />

      {/* breadcrumb */}
      <div className="mb-5 flex flex-wrap items-center gap-1.5 text-sm">
        <button onClick={() => setFolderId(null)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-primary hover:bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)]">
          <Home size={15} /> {Meta.label}
        </button>
        {path.map((f) => (
          <span key={f.id} className="flex items-center gap-1.5">
            <ChevronLeft size={14} className="text-muted" />
            <button onClick={() => setFolderId(f.id)} className="rounded-lg px-2 py-1 font-semibold hover:bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)]">{f.name}</button>
          </span>
        ))}
      </div>

      {folders.length === 0 && items.length === 0 && (
        <div className="rounded-2xl surface-card p-12 text-center text-muted">
          <FolderOpen className="mx-auto mb-3 text-primary" size={48} />
          هذا المجلد فارغ حالياً.
        </div>
      )}

      {/* folders */}
      {folders.length > 0 && (
        <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {folders.map((f, i) => {
            const locked = f.subscribersOnly && !isSub;
            const count = childFolders(libraryFolders, section, f.id).length + folderItems(libraryItems, section, f.id).length;
            return (
              <motion.button
                key={f.id}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                onClick={() => openLockedOr(locked, () => setFolderId(f.id))}
                className="group flex items-center gap-3 rounded-2xl surface-card p-4 text-right transition hover:-translate-y-1"
              >
                <span className="relative grid h-12 w-12 shrink-0 place-items-center rounded-xl" style={{ background: 'color-mix(in srgb, var(--c-secondary) 18%, transparent)' }}>
                  <Folder size={24} className="text-secondary" />
                  {locked && <Lock size={12} className="absolute -bottom-1 -left-1 rounded-full bg-amber-500 p-0.5 text-white" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{f.name}</span>
                  <span className="block truncate text-xs text-muted">{f.description || `${count} عنصر`}</span>
                </span>
                <ChevronLeft className="text-muted transition group-hover:text-primary" size={18} />
              </motion.button>
            );
          })}
        </div>
      )}

      {/* items */}
      {items.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it, i) => {
            const locked = it.subscribersOnly && !isSub;
            return (
              <motion.div
                key={it.id}
                initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}
                className="overflow-hidden rounded-2xl surface-card"
              >
                {it.kind === 'video' && !locked ? (
                  <iframe src={it.url} className="aspect-video w-full" allowFullScreen title={it.title} />
                ) : (
                  <div className="relative grid h-32 place-items-center bg-[color-mix(in_srgb,var(--c-primary)_14%,transparent)]">
                    {it.cover ? <img src={it.cover} className={`h-full w-full object-cover ${locked ? 'opacity-50 grayscale' : ''}`} alt="" /> : <Meta.icon size={40} className="text-primary opacity-60" />}
                    {locked && <div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-[2px]"><Lock size={32} className="text-white" /></div>}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-display text-base font-bold">{it.title}</h3>
                  {it.description && <p className="mt-1 text-sm text-muted">{it.description}</p>}
                  <div className="mt-3">
                    {locked ? (
                      <button onClick={() => setShowSub(true)} className="flex w-full items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold text-white" style={{ background: 'var(--c-secondary)' }}>
                        <Lock size={16} /> اشترك للعرض
                      </button>
                    ) : it.kind === 'rich' ? (
                      <button onClick={() => setOpenItem(it)} className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-2 text-sm font-bold"><BookOpen size={16} /> قراءة الشرح</button>
                    ) : it.kind === 'link' ? (
                      <a href={it.url} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-2 text-sm font-bold"><ExternalLink size={16} /> فتح الرابط</a>
                    ) : it.kind === 'file' ? (
                      <a href={it.url} target="_blank" rel="noreferrer" className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-2 text-sm font-bold"><Download size={16} /> تحميل</a>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* rich content reader */}
      {openItem && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4" onClick={() => setOpenItem(null)}>
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="max-h-[88vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-[var(--c-surface)] shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line p-5">
              <h2 className="font-display text-xl font-bold">{openItem.title}</h2>
              <button onClick={() => setOpenItem(null)} className="text-muted"><X size={22} /></button>
            </div>
            {openItem.cover && <img src={openItem.cover} className="max-h-64 w-full object-cover" alt="" />}
            <div className="prose-rtl p-6 leading-relaxed" dangerouslySetInnerHTML={{ __html: openItem.html }} />
          </motion.div>
        </div>
      )}

      {showSub && <SubscribeModal onClose={() => setShowSub(false)} />}
    </div>
  );
}
