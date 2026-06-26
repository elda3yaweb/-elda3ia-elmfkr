import { useState } from 'react';
import { useStore } from '../../lib/store';
import type { NoteItem, VideoItem } from '../../lib/types';
import { Plus, Trash2, Edit3, FileText, Video, X, Sparkles, Globe, Loader2, Crown } from 'lucide-react';
import { fetchLinkMeta, toEmbedUrl } from '../../lib/linkMeta';

export default function AdminContent() {
  const { notes, videos, competitions, upsertNote, deleteNote, upsertVideo, deleteVideo } = useStore();
  const [editNote, setEditNote] = useState<NoteItem | null>(null);
  const [editVid, setEditVid] = useState<VideoItem | null>(null);
  const comps = competitions.map((c) => c.name);

  const compLabel = (arr: string[]) => (arr.length === 0 ? 'كل المسابقات' : arr.join(' · '));

  return (
    <div className="space-y-8">
      {/* ===== NOTES ===== */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold"><FileText size={20} /> المذكرات ({notes.length})</h3>
          <button onClick={() => setEditNote({ id: 'n' + Date.now(), title: '', description: '', fileUrl: '', thumbnail: '', competitions: [], subscribersOnly: false })} className="flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-bold"><Plus size={16} /> مذكرة</button>
        </div>
        <div className="space-y-2">
          {notes.map((n) => (
            <div key={n.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
              {n.thumbnail && <img src={n.thumbnail} className="h-10 w-10 rounded-lg object-cover" alt="" />}
              <div className="flex-1"><p className="flex items-center gap-2 font-bold">{n.title}{n.subscribersOnly && <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600"><Crown size={10} /> مشتركين</span>}</p><p className="text-xs text-muted">{n.description} · {compLabel(n.competitions)}</p></div>
              <button onClick={() => setEditNote(n)} className="text-primary"><Edit3 size={16} /></button>
              <button onClick={() => { if (confirm('حذف؟')) deleteNote(n.id); }} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {/* ===== VIDEOS ===== */}
      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold"><Video size={20} /> الفيديوهات ({videos.length})</h3>
          <button onClick={() => setEditVid({ id: 'v' + Date.now(), title: '', description: '', url: '', thumbnail: '', competitions: [], subscribersOnly: false })} className="flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-bold"><Plus size={16} /> فيديو</button>
        </div>
        <div className="space-y-2">
          {videos.map((v) => (
            <div key={v.id} className="flex items-center gap-3 rounded-2xl border border-line p-3">
              {v.thumbnail && <img src={v.thumbnail} className="h-10 w-16 rounded-lg object-cover" alt="" />}
              <div className="flex-1"><p className="flex items-center gap-2 font-bold">{v.title}{v.subscribersOnly && <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-500/15 px-2 py-0.5 text-[10px] font-bold text-amber-600"><Crown size={10} /> مشتركين</span>}</p><p className="text-xs text-muted">{v.description} · {compLabel(v.competitions)}</p></div>
              <button onClick={() => setEditVid(v)} className="text-primary"><Edit3 size={16} /></button>
              <button onClick={() => { if (confirm('حذف؟')) deleteVideo(v.id); }} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      {editNote && (
        <NoteModal note={editNote} comps={comps} onClose={() => setEditNote(null)} onSave={(n) => { upsertNote(n); setEditNote(null); }} />
      )}
      {editVid && (
        <VideoModal vid={editVid} comps={comps} onClose={() => setEditVid(null)} onSave={(v) => { upsertVideo(v); setEditVid(null); }} />
      )}
    </div>
  );
}

// ===== shared competition multi-picker =====
function CompetitionPicker({ value, comps, onChange }: { value: string[]; comps: string[]; onChange: (v: string[]) => void }) {
  const all = value.length === 0;
  const toggle = (c: string) => onChange(value.includes(c) ? value.filter((x) => x !== c) : [...value, c]);
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-muted">المسابقات (اختر واحدة أو أكثر، أو اتركها للكل)</p>
      <button
        onClick={() => onChange([])}
        className={`mb-2 flex w-full items-center justify-center gap-2 rounded-xl border-2 py-2 text-sm font-bold ${all ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary' : 'border-line text-muted'}`}
      >
        <Globe size={16} /> كل المسابقات
      </button>
      <div className="grid grid-cols-1 gap-1.5">
        {comps.map((c) => (
          <button key={c} onClick={() => toggle(c)} className={`rounded-lg border px-3 py-2 text-right text-sm ${value.includes(c) ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] font-semibold text-primary' : 'border-line text-muted'}`}>
            {c} {value.includes(c) && '✓'}
          </button>
        ))}
      </div>
    </div>
  );
}

function ModalShell({ title, onClose, onSave, children }: { title: string; onClose: () => void; onSave: () => void; children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-md overflow-y-auto rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
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

function NoteModal({ note, comps, onClose, onSave }: { note: NoteItem; comps: string[]; onClose: () => void; onSave: (n: NoteItem) => void }) {
  const [d, setD] = useState(note);
  const [loading, setLoading] = useState(false);
  const autofill = async () => {
    if (!d.fileUrl.trim()) return;
    setLoading(true);
    try {
      const m = await fetchLinkMeta(d.fileUrl.trim());
      setD((x) => ({ ...x, title: x.title || m.title, description: x.description || m.description, thumbnail: x.thumbnail || m.thumbnail }));
    } finally { setLoading(false); }
  };
  return (
    <ModalShell title={note.title ? 'تعديل مذكرة' : 'مذكرة جديدة'} onClose={onClose} onSave={() => onSave(d)}>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-muted">رابط الملف / المقال</span>
        <div className="flex gap-2">
          <input value={d.fileUrl} onChange={(e) => setD({ ...d, fileUrl: e.target.value })} placeholder="https://..." className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
          <button onClick={autofill} disabled={loading} title="جلب البيانات من الرابط" className="flex shrink-0 items-center gap-1 rounded-xl btn-primary px-3 text-sm font-bold disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} جلب
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">اكتب البيانات يدوياً، أو الصق الرابط واضغط "جلب" لملء العنوان والوصف والصورة تلقائياً.</p>
      </label>
      <input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="العنوان" className="w-full rounded-xl px-4 py-2.5 outline-none" />
      <textarea value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} placeholder="الوصف" rows={2} className="w-full rounded-xl px-4 py-2.5 outline-none" />
      <input value={d.thumbnail} onChange={(e) => setD({ ...d, thumbnail: e.target.value })} placeholder="رابط صورة المعاينة (اختياري)" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
      {d.thumbnail && <img src={d.thumbnail} className="h-24 w-full rounded-xl object-cover" alt="" />}
      <CompetitionPicker value={d.competitions} comps={comps} onChange={(v) => setD({ ...d, competitions: v })} />
      <SubToggle value={d.subscribersOnly} onChange={(b) => setD({ ...d, subscribersOnly: b })} />
    </ModalShell>
  );
}

function SubToggle({ value, onChange }: { value: boolean; onChange: (b: boolean) => void }) {
  return (
    <label className="flex items-center justify-between rounded-xl border border-line px-4 py-3">
      <span className="flex items-center gap-2 text-sm font-semibold"><Crown size={16} className="text-amber-500" /> للمشتركين فقط</span>
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} className="h-5 w-5" />
    </label>
  );
}

function VideoModal({ vid, comps, onClose, onSave }: { vid: VideoItem; comps: string[]; onClose: () => void; onSave: (v: VideoItem) => void }) {
  const [d, setD] = useState(vid);
  const [loading, setLoading] = useState(false);
  const autofill = async () => {
    if (!d.url.trim()) return;
    setLoading(true);
    try {
      const m = await fetchLinkMeta(d.url.trim());
      setD((x) => ({ ...x, title: x.title || m.title, description: x.description || m.description, thumbnail: x.thumbnail || m.thumbnail }));
    } finally { setLoading(false); }
  };
  const previewUrl = d.url ? toEmbedUrl(d.url) : '';
  return (
    <ModalShell title={vid.title ? 'تعديل فيديو' : 'فيديو جديد'} onClose={onClose} onSave={() => onSave({ ...d, url: toEmbedUrl(d.url) })}>
      <label className="block">
        <span className="mb-1 block text-sm font-semibold text-muted">رابط الفيديو</span>
        <div className="flex gap-2">
          <input value={d.url} onChange={(e) => setD({ ...d, url: e.target.value })} placeholder="رابط يوتيوب / فيميو / درايف" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
          <button onClick={autofill} disabled={loading} title="جلب البيانات من الرابط" className="flex shrink-0 items-center gap-1 rounded-xl btn-primary px-3 text-sm font-bold disabled:opacity-50">
            {loading ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} جلب
          </button>
        </div>
        <p className="mt-1 text-xs text-muted">يتم تحويل الرابط تلقائياً لصيغة العرض. اضغط "جلب" لملء العنوان والوصف والصورة من الرابط.</p>
      </label>
      {previewUrl && <iframe src={previewUrl} className="aspect-video w-full rounded-xl" title="معاينة" allowFullScreen />}
      <input value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder="العنوان" className="w-full rounded-xl px-4 py-2.5 outline-none" />
      <textarea value={d.description} onChange={(e) => setD({ ...d, description: e.target.value })} placeholder="الوصف" rows={2} className="w-full rounded-xl px-4 py-2.5 outline-none" />
      <CompetitionPicker value={d.competitions} comps={comps} onChange={(v) => setD({ ...d, competitions: v })} />
      <SubToggle value={d.subscribersOnly} onChange={(b) => setD({ ...d, subscribersOnly: b })} />
    </ModalShell>
  );
}
