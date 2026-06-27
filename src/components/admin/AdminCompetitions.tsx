import { useState } from 'react';
import { useStore } from '../../lib/store';
import type { Competition } from '../../lib/types';
import { Plus, Trash2, Edit3, Trophy } from 'lucide-react';

export default function AdminCompetitions() {
  const { competitions, upsertCompetition, deleteCompetition } = useStore();
  const [edit, setEdit] = useState<Competition | null>(null);

  const blank = (): Competition => ({ id: 'c' + Date.now(), name: '', description: '', image: '', active: true });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">المسابقات ({competitions.length})</h3>
        <button onClick={() => setEdit(blank())} className="flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-bold"><Plus size={16} /> إضافة مسابقة</button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {competitions.map((c) => (
          <div key={c.id} className="flex items-center gap-3 rounded-2xl border border-line p-4">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl btn-primary"><Trophy size={22} /></div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-bold">{c.name}</p>
              <p className="truncate text-sm text-muted">{c.description}</p>
              <span className={`text-xs font-bold ${c.active ? 'text-green-600' : 'text-red-500'}`}>{c.active ? 'مفعّلة' : 'معطّلة'}</span>
            </div>
            <button onClick={() => setEdit(c)} className="text-primary"><Edit3 size={18} /></button>
            <button onClick={() => { if (confirm('حذف؟')) deleteCompetition(c.id); }} className="text-red-500"><Trash2 size={18} /></button>
          </div>
        ))}
      </div>

      {edit && <Modal comp={edit} onClose={() => setEdit(null)} onSave={(c) => { upsertCompetition(c); setEdit(null); }} />}
    </div>
  );
}

function Modal({ comp, onClose, onSave }: { comp: Competition; onClose: () => void; onSave: (c: Competition) => void }) {
  const [c, setC] = useState(comp);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 font-display text-xl font-bold">{comp.name ? 'تعديل المسابقة' : 'مسابقة جديدة'}</h3>
        <div className="space-y-3">
          <input value={c.name} onChange={(e) => setC({ ...c, name: e.target.value })} placeholder="اسم المسابقة" className="w-full rounded-xl px-4 py-2.5 outline-none" />
          <textarea value={c.description} onChange={(e) => setC({ ...c, description: e.target.value })} placeholder="الوصف" rows={3} className="w-full rounded-xl px-4 py-2.5 outline-none" />
          <label className="flex items-center justify-between rounded-xl border border-line px-4 py-3 text-sm font-semibold">
            مفعّلة
            <input type="checkbox" checked={c.active} onChange={(e) => setC({ ...c, active: e.target.checked })} className="h-5 w-5" />
          </label>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={() => onSave(c)} className="flex-1 rounded-xl btn-primary py-2.5 font-bold">حفظ</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
