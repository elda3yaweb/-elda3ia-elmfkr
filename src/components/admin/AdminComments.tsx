import { useStore } from '../../lib/store';
import { Check, X, Trash2, Clock } from 'lucide-react';

export default function AdminComments() {
  const { comments, approveComment, deleteComment } = useStore();
  const pending = comments.filter((c) => !c.approved);
  const approved = comments.filter((c) => c.approved);

  return (
    <div>
      <h3 className="mb-4 font-display text-lg font-bold">إدارة التعليقات</h3>

      <div className="mb-6">
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-amber-600"><Clock size={18} /> بانتظار المراجعة ({pending.length})</h4>
        {pending.length === 0 ? <p className="text-sm text-muted">لا توجد تعليقات معلقة.</p> : (
          <div className="space-y-2">
            {pending.map((c) => (
              <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-line p-4">
                <div className="flex-1"><p className="font-bold">{c.name}</p><p className="text-xs text-muted">{c.date}</p><p className="mt-1 text-sm">{c.text}</p></div>
                <button onClick={() => approveComment(c.id, true)} className="grid h-9 w-9 place-items-center rounded-lg bg-green-500/15 text-green-600"><Check size={18} /></button>
                <button onClick={() => deleteComment(c.id)} className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/15 text-red-500"><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h4 className="mb-3 flex items-center gap-2 font-semibold text-green-600"><Check size={18} /> منشورة ({approved.length})</h4>
        <div className="space-y-2">
          {approved.map((c) => (
            <div key={c.id} className="flex items-start gap-3 rounded-2xl border border-line p-4">
              <div className="flex-1"><p className="font-bold">{c.name}</p><p className="text-xs text-muted">{c.date}</p><p className="mt-1 text-sm">{c.text}</p></div>
              <button onClick={() => approveComment(c.id, false)} title="إخفاء" className="grid h-9 w-9 place-items-center rounded-lg bg-amber-500/15 text-amber-600"><X size={18} /></button>
              <button onClick={() => deleteComment(c.id)} className="grid h-9 w-9 place-items-center rounded-lg bg-red-500/15 text-red-500"><Trash2 size={18} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
