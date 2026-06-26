import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { BookText, FolderOpen, Folder, ArrowRight, ExternalLink, FileText, Calendar, Lock, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import SubscribeModal from '../components/SubscribeModal';

export default function Articles() {
  const { currentUser, articleFolders, articles, activeCompetition } = useStore();
  const navigate = useNavigate();
  const [openFolder, setOpenFolder] = useState<string | null>(null);
  const [reading, setReading] = useState<string | null>(null);
  const [showSub, setShowSub] = useState(false);
  if (!currentUser) { navigate('/auth'); return null; }

  const isSub = currentUser.subscription === 'مشترك' || currentUser.role === 'مسؤل';
  const isLocked = (item: { subscribersOnly?: boolean }) => !!item.subscribersOnly && !isSub;
  const openArticle = (a: { id: string; subscribersOnly?: boolean }) => {
    if (isLocked(a)) { setShowSub(true); return; }
    setReading(a.id);
  };

  // an article is visible if it targets all competitions ([]) or includes the active one
  const articleVisible = (a: { competitions: string[] }) =>
    a.competitions.length === 0 || !activeCompetition || a.competitions.includes(activeCompetition);

  // a folder shows if it has at least one visible article (or matches folder competition)
  const visibleFolders = articleFolders.filter((f) => {
    const hasVisible = articles.some((a) => a.folderId === f.id && articleVisible(a));
    const folderMatches = !f.competition || !activeCompetition || f.competition === activeCompetition;
    return hasVisible || folderMatches;
  });

  const article = articles.find((a) => a.id === reading);

  // ===== READER =====
  if (article) {
    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <button onClick={() => setReading(null)} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold hover:border-primary">
            <ArrowRight size={16} /> رجوع
          </button>
          <motion.article initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="overflow-hidden rounded-3xl surface-card">
            {article.cover && <img src={article.cover} className="h-56 w-full object-cover" alt="" />}
            <div className="p-7 sm:p-9">
              <p className="mb-2 inline-flex items-center gap-1.5 text-xs text-muted"><Calendar size={13} /> {article.createdAt}</p>
              <h1 className="font-display text-3xl font-extrabold leading-tight">{article.title}</h1>
              <p className="mt-1 text-sm text-primary">{article.competitions.length === 0 ? 'متاح لكل المسابقات' : article.competitions.join('، ')}</p>
              <div className="my-5 h-px bg-line" />
              {article.mode === 'link' ? (
                <div className="rounded-2xl bg-[color-mix(in_srgb,var(--c-primary)_8%,transparent)] p-6 text-center">
                  <p className="mb-4 text-muted">هذا المقال متاح على رابط خارجي.</p>
                  <a href={article.externalUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-xl btn-primary px-6 py-3 font-bold">
                    فتح المقال <ExternalLink size={18} />
                  </a>
                </div>
              ) : (
                <div className="article-content" dangerouslySetInnerHTML={{ __html: article.html }} />
              )}
            </div>
          </motion.article>
        </div>
      </Layout>
    );
  }

  // ===== FOLDER CONTENTS =====
  if (openFolder) {
    const folder = articleFolders.find((f) => f.id === openFolder);
    const list = articles.filter((a) => a.folderId === openFolder && articleVisible(a));
    return (
      <Layout>
        <div className="mx-auto max-w-5xl px-4 py-10">
          <button onClick={() => setOpenFolder(null)} className="mb-6 inline-flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold hover:border-primary">
            <ArrowRight size={16} /> كل المجلدات
          </button>
          <div className="mb-8 flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><FolderOpen size={26} /></div>
            <div>
              <h1 className="font-display text-3xl font-extrabold">{folder?.name}</h1>
              <p className="text-muted">{folder?.description}</p>
            </div>
          </div>
          {list.length === 0 ? (
            <div className="rounded-2xl surface-card p-12 text-center text-muted">لا توجد مقالات في هذا المجلد بعد.</div>
          ) : (
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {list.map((a, i) => (
                <motion.button
                  key={a.id}
                  initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -5 }}
                  onClick={() => openArticle(a)}
                  className="group flex flex-col overflow-hidden rounded-2xl surface-card text-right"
                >
                  <div className="relative h-32 overflow-hidden bg-[color-mix(in_srgb,var(--c-primary)_14%,transparent)]">
                    {a.cover ? <img src={a.cover} className={`h-full w-full object-cover ${isLocked(a) ? 'opacity-50 grayscale' : ''}`} alt="" /> : <div className="grid h-full place-items-center text-primary opacity-50"><FileText size={40} /></div>}
                    {a.mode === 'link' && <span className="absolute right-2 top-2 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-bold text-white" style={{ background: 'var(--c-secondary)' }}><ExternalLink size={11} /> رابط</span>}
                    {a.subscribersOnly && <span className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full bg-amber-500 px-2.5 py-1 text-xs font-bold text-white"><Crown size={11} /> مشتركين</span>}
                    {isLocked(a) && <div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-[2px]"><Lock size={32} className="text-white" /></div>}
                  </div>
                  <div className="flex-1 p-4">
                    <h3 className="font-display text-lg font-bold leading-tight">{a.title}</h3>
                    <p className="mt-2 text-xs text-muted">{a.createdAt}</p>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </div>
      </Layout>
    );
  }

  // ===== FOLDERS GRID =====
  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><BookText size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">الشروحات والمقالات</h1>
            <p className="text-muted">مقالات وشروحات منظّمة في مجلدات</p>
          </div>
        </div>

        {visibleFolders.length === 0 ? (
          <div className="rounded-2xl surface-card p-12 text-center text-muted">لا توجد شروحات متاحة حالياً.</div>
        ) : (
          <AnimatePresence>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {visibleFolders.map((f, i) => {
                const count = articles.filter((a) => a.folderId === f.id && articleVisible(a)).length;
                return (
                  <motion.button
                    key={f.id}
                    initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                    whileHover={{ y: -5 }}
                    onClick={() => setOpenFolder(f.id)}
                    className="group flex items-start gap-4 rounded-2xl surface-card p-6 text-right"
                  >
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl text-white transition group-hover:scale-110" style={{ background: 'var(--c-secondary)' }}>
                      <Folder size={28} />
                    </div>
                    <div>
                      <h3 className="font-display text-lg font-bold">{f.name}</h3>
                      <p className="text-sm text-muted">{f.description}</p>
                      <p className="mt-1 text-xs font-bold text-primary">{count} مقال</p>
                    </div>
                  </motion.button>
                );
              })}
            </div>
          </AnimatePresence>
        )}
      </div>
      {showSub && <SubscribeModal onClose={() => setShowSub(false)} />}
    </Layout>
  );
}
