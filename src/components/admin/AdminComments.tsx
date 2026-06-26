import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Check, X, Trash2, Clock, Crown, Save } from 'lucide-react';

export default function AdminComments() {
  const { comments, approveComment, deleteComment, toggleCommentVip, settings, updateSettings } = useStore();
  const pending = comments.filter((c) => !c.approved);
  const approved = comments.filter((c) => c.approved);

  const [title, setTitle] = useState(settings.commentsTitle);
  const [enabled, setEnabled] = useState(settings.commentsEnabled);
  const [saved, setSaved] = useState(false);
  const saveSettings = () => { updateSettings({ commentsTitle: title, commentsEnabled: enabled }); setSaved(true); setTimeout(() => setSaved(false), 2500); };

  const Row = ({ c, isPending }: { c: typeof comments[0]; isPending: boolean }) => (
    <div className={`flex items-start gap-3 rounded-2xl border p-4 ${c.vip ? 'border-amber-400/60 bg-amber-400/5' : 'border-line'}`}>
      <div className="flex-1">
        <p className="flex items-center gap-2 font-bold">
          {c.name}
          {c.vip && <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-l from-amber-500 to-amber-300 px-2 py-0.5 text-[0.6rem] font-black text-amber-950"><Crown size={11} /> VIP</span>}
        </p>
        <p className="text-xs text-muted">{c.date}</p>
        <p className="mt-1 text-sm">{c.text}</p>
      </div>
      <button
        onClick={() => toggleCommentVip(c.id, !c.vip)}
        title={c.vip ? 'إلغاء VIP' : 'تعيين VIP'}
        className={`grid h-9 w-9 place-items-center rounded-lg ${c.vip ? 'bg-amber-500/20 text-amber-600' : 'bg-[color-mix(in_srgb,var(--c-text)_8%,transparent)] text-muted'}`}
      >
        <Crown size={17} />
      </button>
      {isPending ? (
        <button onClick={() => approveComment(c.id, true)} title="موافقة" className="grid h-9 w-9 place-items-center rounded-lg bg-green-500/15 text-green-600"><Check size={18} /></button>
      ) : (
        <button onClick={() => approveComment(c.id, false)} title="إخفاء" className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-600"><X size={18} /></button>
      )}
      <button onClick={() => { if (confirm('حذف التعليق؟')) deleteComment(c.id); }} className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/15 text-red-500"><Trash2 size={18} /></button>
    </div>
  );

  return (
    <div>
      {/* section settings */}
      <div className="mb-6 rounded-2xl border border-line p-4">
        <h3 className="mb-3 font-display text-lg font-bold">إعدادات قسم التعليقات</h3>
        <div className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-muted">اسم القسم (يمكن تغييره لأي اسم)</span>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full rounded-xl px-4 py-2.5 outline-none" />
          </label>
          <label className="flex items-end gap-2 pb-1">
            <input type="checkbox" checked={enabled} onChange={(e) => setEnabled(e.target.checked)} className="h-5 w-5" />
            <span className="text-sm font-semibold">إظهار القسم</span>
          </label>
        </div>
        <div className="mt-3 flex items-center gap-3">
          <button onClick={saveSettings} className="flex items-center gap-2 rounded-xl btn-primary px-5 py-2 text-sm font-bold"><Save size={16} /> حفظ</button>
          {saved && <span className="text-sm font-semibold text-green-600">✓ تم الحفظ</span>}
        </div>
      </div>

      <div className="mb-6">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-amber-600"><Clock size={18} /> بانتظار الموافقة ({pending.length})</h4>
        {pending.length === 0 ? <p className="text-sm text-muted">لا توجد تعليقات معلقة.</p> : (
          <div className="space-y-2">{pending.map((c) => <Row key={c.id} c={c} isPending />)}</div>
        )}
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-600"><Check size={18} /> منشورة ({approved.length})</h4>
        <div className="space-y-2">{approved.map((c) => <Row key={c.id} c={c} isPending={false} />)}</div>
      </div>
    </div>
  );
}
