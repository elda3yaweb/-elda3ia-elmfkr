import { useState } from 'react';
import { useStore } from '../../lib/store';
import type { ArticleFolder, Article } from '../../lib/types';
import { Plus, Trash2, Edit3, Folder, FileText, X, ExternalLink } from 'lucide-react';
import RichEditor from './RichEditor';

export default function AdminArticles() {
  const { articleFolders, articles, competitions, upsertArticleFolder, deleteArticleFolder, upsertArticle, deleteArticle } = useStore();
  const comps = competitions.map((c) => c.name);
  const [editFolder, setEditFolder] = useState<ArticleFolder | null>(null);
  const [editArticle, setEditArticle] = useState<Article | null>(null);
  const [activeFolder, setActiveFolder] = useState<string>(articleFolders[0]?.id || '');

  const newFolder = (): ArticleFolder => ({ id: 'f' + Date.now(), name: '', description: '', competition: comps[0] || '' });
  const newArticle = (): Article => ({
    id: 'a' + Date.now(), folderId: activeFolder || articleFolders[0]?.id || '', title: '', cover: '',
    mode: 'rich', html: '', externalUrl: '', competitions: [], subscribersOnly: false, createdAt: new Date().toLocaleString('ar-EG'),
  });

  const folderArticles = articles.filter((a) => a.folderId === activeFolder);

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">الشروحات والمقالات</h3>
      </div>
      <p className="mb-4 text-sm text-muted">نظّم الشروحات في مجلدات، واكتب المقال بمحرر تنسيق كامل أو الصق محتوى منسّق أو أضف رابطاً خارجياً.</p>

      <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
        {/* FOLDERS */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold text-muted">المجلدات</h4>
            <button onClick={() => setEditFolder(newFolder())} className="flex items-center gap-1 rounded-lg btn-primary px-3 py-1.5 text-xs font-bold"><Plus size={14} /> مجلد</button>
          </div>
          {articleFolders.map((f) => (
            <div key={f.id} className={`flex items-center gap-2 rounded-xl border px-3 py-2.5 ${activeFolder === f.id ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)]' : 'border-line'}`}>
              <button onClick={() => setActiveFolder(f.id)} className="flex flex-1 items-center gap-2 text-right">
                <Folder size={18} className="shrink-0 text-secondary" style={{ color: 'var(--c-secondary)' }} />
                <span className="text-sm font-semibold">{f.name || 'بدون اسم'}</span>
              </button>
              <button onClick={() => setEditFolder(f)} className="text-primary"><Edit3 size={15} /></button>
              <button onClick={() => { if (confirm('حذف المجلد وكل مقالاته؟')) deleteArticleFolder(f.id); }} className="text-red-500"><Trash2 size={15} /></button>
            </div>
          ))}
          {articleFolders.length === 0 && <p className="rounded-xl border border-dashed border-line p-4 text-center text-xs text-muted">لا توجد مجلدات. أضف مجلداً.</p>}
        </div>

        {/* ARTICLES */}
        <div>
          <div className="mb-3 flex items-center justify-between">
            <h4 className="text-sm font-bold text-muted">المقالات داخل المجلد</h4>
            <button disabled={!activeFolder} onClick={() => setEditArticle(newArticle())} className="flex items-center gap-1 rounded-lg btn-primary px-3 py-1.5 text-xs font-bold disabled:opacity-40"><Plus size={14} /> مقال جديد</button>
          </div>
          <div className="space-y-2">
            {folderArticles.map((a) => (
              <div key={a.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary">{a.mode === 'link' ? <ExternalLink size={18} /> : <FileText size={18} />}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{a.title || 'بدون عنوان'}</p>
                  <p className="text-xs text-muted">{a.mode === 'link' ? 'رابط خارجي' : 'مقال منسّق'} · {a.competitions.length === 0 ? 'كل المسابقات' : a.competitions.join('، ')}</p>
                </div>
                <button onClick={() => setEditArticle(a)} className="text-primary"><Edit3 size={16} /></button>
                <button onClick={() => { if (confirm('حذف المقال؟')) deleteArticle(a.id); }} className="text-red-500"><Trash2 size={16} /></button>
              </div>
            ))}
            {activeFolder && folderArticles.length === 0 && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">لا توجد مقالات في هذا المجلد بعد.</p>}
            {!activeFolder && <p className="rounded-xl border border-dashed border-line p-6 text-center text-sm text-muted">اختر مجلداً أولاً.</p>}
          </div>
        </div>
      </div>

      {editFolder && <FolderModal folder={editFolder} comps={comps} onClose={() => setEditFolder(null)} onSave={(f) => { upsertArticleFolder(f); setActiveFolder(f.id); setEditFolder(null); }} />}
      {editArticle && <ArticleModal article={editArticle} folders={articleFolders} comps={comps} onClose={() => setEditArticle(null)} onSave={(a) => { upsertArticle(a); setEditArticle(null); }} />}
    </div>
  );
}

function FolderModal({ folder, comps, onClose, onSave }: { folder: ArticleFolder; comps: string[]; onClose: () => void; onSave: (f: ArticleFolder) => void }) {
  const [f, setF] = useState(folder);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">{folder.name ? 'تعديل المجلد' : 'مجلد جديد'}</h3><button onClick={onClose} className="text-muted"><X size={22} /></button></div>
        <div className="space-y-3">
          <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="اسم المجلد" className="w-full rounded-xl px-4 py-2.5 outline-none" />
          <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="وصف مختصر" className="w-full rounded-xl px-4 py-2.5 outline-none" />
          <select value={f.competition} onChange={(e) => setF({ ...f, competition: e.target.value })} className="w-full rounded-xl px-4 py-2.5 outline-none">
            <option value="">كل المسابقات</option>
            {comps.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={() => onSave(f)} className="flex-1 rounded-xl btn-primary py-2.5 font-bold">حفظ</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function ArticleModal({ article, folders, comps, onClose, onSave }: { article: Article; folders: ArticleFolder[]; comps: string[]; onClose: () => void; onSave: (a: Article) => void }) {
  const [a, setA] = useState(article);
  const set = (p: Partial<Article>) => setA((x) => ({ ...x, ...p }));
  const onCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = () => set({ cover: r.result as string }); r.readAsDataURL(file);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">{article.title ? 'تعديل المقال' : 'مقال جديد'}</h3><button onClick={onClose} className="text-muted"><X size={22} /></button></div>

        <div className="space-y-3">
          <input value={a.title} onChange={(e) => set({ title: e.target.value })} placeholder="عنوان المقال" className="w-full rounded-xl px-4 py-2.5 font-bold outline-none" />
          <select value={a.folderId} onChange={(e) => set({ folderId: e.target.value })} className="w-full rounded-xl px-4 py-2.5 outline-none">
            {folders.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
          </select>

          {/* multi competition selector */}
          <div>
            <p className="mb-1.5 text-sm font-semibold text-muted">ربط الشرح بالمسابقات</p>
            <button
              type="button"
              onClick={() => set({ competitions: [] })}
              className={`mb-2 w-full rounded-xl border px-4 py-2.5 text-right text-sm font-bold ${a.competitions.length === 0 ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary' : 'border-line text-muted'}`}
            >
              ✨ كل المسابقات {a.competitions.length === 0 && '✓'}
            </button>
            <div className="grid gap-2 sm:grid-cols-2">
              {comps.map((c) => {
                const on = a.competitions.includes(c);
                return (
                  <button
                    key={c}
                    type="button"
                    onClick={() => set({ competitions: on ? a.competitions.filter((x) => x !== c) : [...a.competitions, c] })}
                    className={`rounded-xl border px-3 py-2 text-right text-sm ${on ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] font-semibold text-primary' : 'border-line text-muted'}`}
                  >
                    {c} {on && '✓'}
                  </button>
                );
              })}
            </div>
            <p className="mt-1.5 text-xs text-muted">اختر “كل المسابقات” ليظهر الشرح للجميع، أو حدّد مسابقات معينة.</p>
          </div>

          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-muted">صورة الغلاف (اختياري)</span>
            <div className="flex items-center gap-3">{a.cover && <img src={a.cover} className="h-12 w-20 rounded-lg object-cover" alt="" />}<input type="file" accept="image/*" onChange={onCover} className="text-sm" /></div>
          </label>

          {/* subscribers only */}
          <label className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
            <span className="text-sm font-semibold">⭐ للمشتركين فقط</span>
            <input type="checkbox" checked={a.subscribersOnly} onChange={(e) => set({ subscribersOnly: e.target.checked })} className="h-5 w-5" />
          </label>

          {/* mode toggle */}
          <div className="flex gap-2 text-sm">
            <button onClick={() => set({ mode: 'rich' })} className={`flex-1 rounded-xl py-2 font-bold ${a.mode === 'rich' ? 'btn-primary' : 'border border-line text-muted'}`}>كتابة / لصق منسّق</button>
            <button onClick={() => set({ mode: 'link' })} className={`flex-1 rounded-xl py-2 font-bold ${a.mode === 'link' ? 'btn-primary' : 'border border-line text-muted'}`}>رابط مقال خارجي</button>
          </div>

          {a.mode === 'link' ? (
            <input value={a.externalUrl} onChange={(e) => set({ externalUrl: e.target.value })} placeholder="https://..." dir="ltr" className="w-full rounded-xl px-4 py-2.5 outline-none" />
          ) : (
            <RichEditor value={a.html} onChange={(html) => set({ html })} />
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button onClick={() => onSave(a)} className="flex-1 rounded-xl btn-primary py-2.5 font-bold">حفظ المقال</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
