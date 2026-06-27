import { useState } from 'react';
import { useStore } from '../../lib/store';
import type { SheetSource } from '../../lib/types';
import { Plus, Trash2, Database, ExternalLink } from 'lucide-react';
import { DRIVE_FOLDER_URL } from '../../lib/defaults';

export default function AdminSheets() {
  const { settings, updateSettings } = useStore();
  const [list, setList] = useState<SheetSource[]>(settings.sheetSources);
  const [saved, setSaved] = useState(false);

  const add = () => { setList([...list, { id: 'src' + Date.now(), label: 'شيت جديد', url: '', type: 'other' }]); setSaved(false); };
  const upd = (id: string, p: Partial<SheetSource>) => { setList(list.map((x) => (x.id === id ? { ...x, ...p } : x))); setSaved(false); };
  const del = (id: string) => { setList(list.filter((x) => x.id !== id)); setSaved(false); };
  const save = () => { updateSettings({ sheetSources: list }); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div>
      <h3 className="mb-2 font-display text-lg font-bold">روابط الشيتات والدرايف</h3>
      <p className="mb-4 text-sm text-muted">أضف روابط Google Sheets جديدة لربطها بالمنصة. تظهر هذه الروابط في لوحة التحكم للوصول السريع.</p>

      <a href={DRIVE_FOLDER_URL} target="_blank" rel="noreferrer" className="mb-4 flex items-center gap-3 rounded-xl border border-line px-4 py-3 text-sm font-semibold hover:border-primary">
        <Database size={18} className="text-primary" /> مجلد الصور (Google Drive) <ExternalLink size={14} className="text-muted" />
      </a>

      <div className="space-y-3">
        {list.map((src) => (
          <div key={src.id} className="grid gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_1.5fr_auto_auto]">
            <input value={src.label} onChange={(e) => upd(src.id, { label: e.target.value })} placeholder="اسم الشيت" className="rounded-lg px-3 py-2 text-sm outline-none" />
            <input value={src.url} onChange={(e) => upd(src.id, { url: e.target.value })} placeholder="الرابط" className="rounded-lg px-3 py-2 text-sm outline-none" dir="ltr" />
            <select value={src.type} onChange={(e) => upd(src.id, { type: e.target.value as any })} className="rounded-lg px-3 py-2 text-sm outline-none">
              <option value="settings">إعدادات</option><option value="competitions">مسابقات</option>
              <option value="names">أسماء</option><option value="questions">أسئلة</option><option value="other">أخرى</option>
            </select>
            <div className="flex items-center gap-1">
              {src.url && <a href={src.url} target="_blank" rel="noreferrer" className="text-primary"><ExternalLink size={16} /></a>}
              <button onClick={() => del(src.id)} className="text-red-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>
      <button onClick={add} className="mt-3 flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary"><Plus size={16} /> إضافة شيت</button>

      <div className="sticky bottom-0 mt-6 flex items-center gap-3 border-t border-line bg-[var(--c-surface)] pt-4">
        <button onClick={save} className="rounded-xl btn-primary px-6 py-2.5 font-bold">حفظ</button>
        {saved && <span className="text-sm font-semibold text-green-600">✓ تم الحفظ</span>}
      </div>
    </div>
  );
}
