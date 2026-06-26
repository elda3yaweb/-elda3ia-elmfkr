import { useState } from 'react';
import { useStore } from '../../lib/store';
import type { LibrarySection, LibraryFolder, LibraryItem } from '../../lib/types';
import {
  Folder, FolderPlus, FilePlus, ChevronLeft, Home, Edit3, Trash2, X,
  FileText, Video as VideoIcon, BookOpen, Crown, Check,
} from 'lucide-react';
import { childFolders, folderItems, folderPath } from '../../lib/library';
import RichEditor from './RichEditor';

const sections: { id: LibrarySection; label: string; icon: any }[] = [
  { id: 'notes', label: 'المذكرات', icon: FileText },
  { id: 'videos', label: 'الفيديوهات', icon: VideoIcon },
  { id: 'articles', label: 'الشرح', icon: BookOpen },
];

export default function AdminLibrary() {
  const store = useStore();
  const { libraryFolders, libraryItems, competitions, upsertLibraryFolder, deleteLibraryFolder, upsertLibraryItem, deleteLibraryItem } = store;
  const [section, setSection] = useState<LibrarySection>('notes');
  const [folderId, setFolderId] = useState<string | null>(null);
  const [editFolder, setEditFolder] = useState<LibraryFolder | null>(null);
  const [editItem, setEditItem] = useState<LibraryItem | null>(null);

  const comps = competitions.map((c) => c.name);
  const folders = childFolders(libraryFolders, section, folderId);
  const items = folderItems(libraryItems, section, folderId);
  const path = folderPath(libraryFolders, folderId);

  const newFolder = (): LibraryFolder => ({
    id: 'lf' + Date.now(), section, name: '', description: '', parentId: folderId, competitions: [], subscribersOnly: false,
  });
  const newItem = (): LibraryItem => ({
    id: 'li' + Date.now(), section, folderId, title: '', description: '',
    kind: section === 'videos' ? 'video' : section === 'articles' ? 'rich' : 'file',
    url: '', html: '', cover: '', competitions: [], subscribersOnly: false, createdAt: new Date().toLocaleString('ar-EG'),
  });

  return (
    <div>
      <h3 className="mb-1 font-display text-lg font-bold">المكتبة — مجلدات داخل مجلدات</h3>
      <p className="mb-4 text-sm text-muted">أنشئ مجلدات بأي عمق (مجلد جوه مجلد جوه مجلد...)، وضع داخل أي مجلد مذكرات أو فيديوهات أو شرح.</p>

      {/* section switch */}
      <div className="mb-5 flex gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--c-text)_5%,transparent)] p-1">
        {sections.map((s) => (
          <button key={s.id} onClick={() => { setSection(s.id); setFolderId(null); }} className={`flex flex-1 items-center justify-center gap-2 rounded-xl py-2 text-sm font-bold transition ${section === s.id ? 'btn-primary' : 'text-muted'}`}>
            <s.icon size={16} /> {s.label}
          </button>
        ))}
      </div>

      {/* breadcrumb + actions */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1 text-sm">
          <button onClick={() => setFolderId(null)} className="inline-flex items-center gap-1 rounded-lg px-2 py-1 font-semibold text-primary hover:bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)]"><Home size={15} /> الجذر</button>
          {path.map((f) => (
            <span key={f.id} className="flex items-center gap-1">
              <ChevronLeft size={14} className="text-muted" />
              <button onClick={() => setFolderId(f.id)} className="rounded-lg px-2 py-1 font-semibold hover:bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)]">{f.name}</button>
            </span>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => setEditFolder(newFolder())} className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm font-bold text-primary"><FolderPlus size={16} /> مجلد</button>
          <button onClick={() => setEditItem(newItem())} className="flex items-center gap-2 rounded-xl btn-primary px-3 py-2 text-sm font-bold"><FilePlus size={16} /> عنصر</button>
        </div>
      </div>

      {/* folders */}
      <div className="space-y-2">
        {folders.map((f) => {
          const count = childFolders(libraryFolders, section, f.id).length + folderItems(libraryItems, section, f.id).length;
          return (
            <div key={f.id} className="flex items-center gap-3 rounded-xl border border-line p-3">
              <button onClick={() => setFolderId(f.id)} className="flex flex-1 items-center gap-3 text-right">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg" style={{ background: 'color-mix(in srgb, var(--c-secondary) 18%, transparent)' }}><Folder size={20} className="text-secondary" /></span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-bold">{f.name} {f.subscribersOnly && <Crown size={12} className="mr-1 inline text-amber-500" />}</span>
                  <span className="block truncate text-xs text-muted">{count} عنصر · {f.competitions.length ? f.competitions.join('، ') : 'كل المسابقات'}</span>
                </span>
              </button>
              <button onClick={() => setEditFolder(f)} className="text-primary"><Edit3 size={16} /></button>
              <button onClick={() => { if (confirm('حذف المجلد وكل ما بداخله؟')) deleteLibraryFolder(f.id); }} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          );
        })}

        {/* items */}
        {items.map((it) => {
          const Icon = it.kind === 'video' ? VideoIcon : it.kind === 'rich' || it.kind === 'link' ? BookOpen : FileText;
          return (
            <div key={it.id} className="flex items-center gap-3 rounded-xl border border-line bg-[color-mix(in_srgb,var(--c-primary)_4%,transparent)] p-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-lg bg-[color-mix(in_srgb,var(--c-primary)_15%,transparent)] text-primary"><Icon size={18} /></span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-bold">{it.title} {it.subscribersOnly && <Crown size={12} className="mr-1 inline text-amber-500" />}</p>
                <p className="truncate text-xs text-muted">{it.kind} · {it.description || 'بدون وصف'}</p>
              </div>
              <button onClick={() => setEditItem(it)} className="text-primary"><Edit3 size={16} /></button>
              <button onClick={() => { if (confirm('حذف؟')) deleteLibraryItem(it.id); }} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          );
        })}

        {folders.length === 0 && items.length === 0 && (
          <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted">المجلد فارغ — أضف مجلداً أو عنصراً.</div>
        )}
      </div>

      {editFolder && <FolderModal folder={editFolder} comps={comps} onClose={() => setEditFolder(null)} onSave={(f) => { upsertLibraryFolder(f); setEditFolder(null); }} />}
      {editItem && <ItemModal item={editItem} comps={comps} onClose={() => setEditItem(null)} onSave={(i) => { upsertLibraryItem(i); setEditItem(null); }} />}
    </div>
  );
}

function CompPicker({ value, comps, onChange }: { value: string[]; comps: string[]; onChange: (v: string[]) => void }) {
  const toggle = (n: string) => onChange(value.includes(n) ? value.filter((x) => x !== n) : [...value, n]);
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-muted">المسابقات (لا شيء = كل المسابقات)</p>
      <div className="space-y-1.5">
        {comps.map((c) => (
          <button key={c} onClick={() => toggle(c)} className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-right text-sm ${value.includes(c) ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] font-semibold text-primary' : 'border-line text-muted'}`}>
            {c} {value.includes(c) && <Check size={16} />}
          </button>
        ))}
      </div>
    </div>
  );
}

function FolderModal({ folder, comps, onClose, onSave }: { folder: LibraryFolder; comps: string[]; onClose: () => void; onSave: (f: LibraryFolder) => void }) {
  const [f, setF] = useState(folder);
  return (
    <Shell title={folder.name ? 'تعديل مجلد' : 'مجلد جديد'} onClose={onClose} onSave={() => f.name.trim() && onSave(f)}>
      <input value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} placeholder="اسم المجلد" className="w-full rounded-xl px-4 py-2.5 outline-none" />
      <input value={f.description} onChange={(e) => setF({ ...f, description: e.target.value })} placeholder="وصف (اختياري)" className="w-full rounded-xl px-4 py-2.5 outline-none" />
      <CompPicker value={f.competitions} comps={comps} onChange={(v) => setF({ ...f, competitions: v })} />
      <label className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm font-semibold">للمشتركين فقط<input type="checkbox" checked={f.subscribersOnly} onChange={(e) => setF({ ...f, subscribersOnly: e.target.checked })} className="h-5 w-5" /></label>
    </Shell>
  );
}

function ItemModal({ item, comps, onClose, onSave }: { item: LibraryItem; comps: string[]; onClose: () => void; onSave: (i: LibraryItem) => void }) {
  const [it, setIt] = useState(item);
  const set = (p: Partial<LibraryItem>) => setIt((x) => ({ ...x, ...p }));
  const onCover = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]; if (!file) return;
    const r = new FileReader(); r.onload = () => set({ cover: r.result as string }); r.readAsDataURL(file);
  };
  return (
    <Shell title={item.title ? 'تعديل عنصر' : 'عنصر جديد'} onClose={onClose} onSave={() => it.title.trim() && onSave(it)} wide>
      <input value={it.title} onChange={(e) => set({ title: e.target.value })} placeholder="العنوان" className="w-full rounded-xl px-4 py-2.5 outline-none" />
      <input value={it.description} onChange={(e) => set({ description: e.target.value })} placeholder="وصف مختصر" className="w-full rounded-xl px-4 py-2.5 outline-none" />

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-muted">نوع المحتوى</span>
        <select value={it.kind} onChange={(e) => set({ kind: e.target.value as LibraryItem['kind'] })} className="w-full rounded-xl px-4 py-2.5 outline-none">
          <option value="file">ملف / رابط تحميل (مذكرة)</option>
          <option value="video">فيديو (embed)</option>
          <option value="rich">شرح مكتوب (محرر نصوص)</option>
          <option value="link">رابط خارجي</option>
        </select>
      </label>

      {it.kind === 'rich' ? (
        <div>
          <p className="mb-1 text-sm font-semibold text-muted">محتوى الشرح</p>
          <RichEditor value={it.html} onChange={(html) => set({ html })} />
        </div>
      ) : (
        <input value={it.url} onChange={(e) => set({ url: e.target.value })} placeholder={it.kind === 'video' ? 'رابط الفيديو (embed)' : it.kind === 'link' ? 'الرابط الخارجي' : 'رابط الملف / التحميل'} className="w-full rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-muted">صورة الغلاف (اختياري)</span>
        <div className="flex items-center gap-3">{it.cover && <img src={it.cover} className="h-12 w-16 rounded-lg object-cover" alt="" />}<input type="file" accept="image/*" onChange={onCover} className="text-sm" /></div>
      </label>

      <CompPicker value={it.competitions} comps={comps} onChange={(v) => set({ competitions: v })} />
      <label className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm font-semibold">للمشتركين فقط<input type="checkbox" checked={it.subscribersOnly} onChange={(e) => set({ subscribersOnly: e.target.checked })} className="h-5 w-5" /></label>
    </Shell>
  );
}

function Shell({ title, children, onClose, onSave, wide }: { title: string; children: React.ReactNode; onClose: () => void; onSave: () => void; wide?: boolean }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className={`max-h-[90vh] w-full overflow-y-auto rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl ${wide ? 'max-w-2xl' : 'max-w-md'}`} onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">{title}</h3><button onClick={onClose} className="text-muted"><X size={22} /></button></div>
        <div className="space-y-3">{children}</div>
        <div className="mt-5 flex gap-3">
          <button onClick={onSave} className="flex-1 rounded-xl btn-primary py-2.5 font-bold">حفظ</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
