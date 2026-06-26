import { useState, useRef } from 'react';
import { useStore } from '../../lib/store';
import type { Contestant } from '../../lib/types';
import { Edit3, Trash2, Ban, CheckCircle2, PauseCircle, Crown, Search, X, Fingerprint, MessageCircle, Upload, Link2, Download, Plus } from 'lucide-react';
import { waLink } from '../../lib/utils';
import { parseContestantsCSV, fetchGoogleSheetCSV } from '../../lib/importer';

export default function AdminContestants() {
  const { contestants, upsertContestant, deleteContestant, competitions, importContestants } = useStore();
  const [q, setQ] = useState('');
  const [editing, setEditing] = useState<Contestant | null>(null);
  const [showImport, setShowImport] = useState(false);

  const newBlank = (): Contestant => ({
    id: 'NEW', fullName: '', email: '', phone: '', gender: 'ذكر', secretCode: '123',
    allowedAttempts: 10, status: 'نشط', competitions: [], sendStatus: 'لا',
    subscription: 'مجاني', deviceFingerprint: '', photoUrl: '', note: '',
    registeredAt: new Date().toLocaleString('ar-EG'), role: 'متسابق',
  });

  const list = contestants.filter(
    (c) => c.fullName.includes(q) || c.email.includes(q) || c.id.includes(q) || c.phone.includes(q)
  );

  const statusBadge = (s: Contestant['status']) =>
    s === 'نشط' ? 'bg-green-500/15 text-green-600' : s === 'محظور' ? 'bg-red-500/15 text-red-500' : 'bg-amber-500/15 text-amber-600';

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">بيانات المتسابقين ({list.length})</h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-line px-3 py-2">
            <Search size={16} className="text-muted" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="بحث..." className="w-32 bg-transparent text-sm outline-none" />
          </div>
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-primary"><Upload size={16} /> استيراد</button>
          <button onClick={() => setEditing(newBlank())} className="flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-bold"><Plus size={16} /> متسابق</button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[900px] text-right text-sm">
          <thead className="bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)] text-primary">
            <tr>
              <th className="p-3">الرقم</th><th className="p-3">الاسم</th><th className="p-3">التواصل</th>
              <th className="p-3">النوع</th><th className="p-3">المحاولات</th><th className="p-3">الاشتراك</th>
              <th className="p-3">الحالة</th><th className="p-3">الإرسال</th><th className="p-3">إجراءات</th>
            </tr>
          </thead>
          <tbody>
            {list.map((c) => (
              <tr key={c.id} className="border-t border-line">
                <td className="p-3 font-mono text-xs">{c.id}{c.role === 'مسؤل' && <Crown size={12} className="mr-1 inline text-amber-500" />}</td>
                <td className="p-3 font-semibold">{c.fullName}<div className="text-xs font-normal text-muted">{c.email}</div></td>
                <td className="p-3">
                  {c.phone ? <a href={waLink(c.phone)} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-green-600"><MessageCircle size={14} />{c.phone}</a> : '—'}
                </td>
                <td className="p-3">{c.gender}</td>
                <td className="p-3">{c.subscription === 'مشترك' ? '∞' : c.allowedAttempts}</td>
                <td className="p-3">{c.subscription}</td>
                <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${statusBadge(c.status)}`}>{c.status}</span></td>
                <td className="p-3">{c.sendStatus || '—'}</td>
                <td className="p-3">
                  <div className="flex gap-1">
                    <button onClick={() => setEditing(c)} title="تعديل" className="grid h-8 w-8 place-items-center rounded-lg text-primary hover:bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)]"><Edit3 size={15} /></button>
                    {c.status !== 'نشط' && <button onClick={() => upsertContestant({ ...c, status: 'نشط' })} title="تفعيل" className="grid h-8 w-8 place-items-center rounded-lg text-green-600 hover:bg-green-500/10"><CheckCircle2 size={15} /></button>}
                    {c.status !== 'محظور' && <button onClick={() => upsertContestant({ ...c, status: 'محظور' })} title="حظر" className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-500/10"><Ban size={15} /></button>}
                    {c.status !== 'موقوف' && <button onClick={() => upsertContestant({ ...c, status: 'موقوف' })} title="إيقاف" className="grid h-8 w-8 place-items-center rounded-lg text-amber-600 hover:bg-amber-500/10"><PauseCircle size={15} /></button>}
                    {c.role !== 'مسؤل' && <button onClick={() => { if (confirm('حذف هذا المتسابق؟')) deleteContestant(c.id); }} title="حذف" className="grid h-8 w-8 place-items-center rounded-lg text-red-500 hover:bg-red-500/10"><Trash2 size={15} /></button>}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <EditModal
          contestant={editing}
          competitions={competitions.map((c) => c.name)}
          onClose={() => setEditing(null)}
          onSave={(c) => {
            if (c.id === 'NEW') {
              const year = new Date().getFullYear();
              const prefix = `M-${year}-`;
              const nums = contestants.map((x) => x.id).filter((id) => id.startsWith(prefix)).map((id) => parseInt(id.split('-')[2], 10)).filter((n) => !isNaN(n));
              c = { ...c, id: prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0') };
            }
            upsertContestant(c); setEditing(null);
          }}
        />
      )}
      {showImport && (
        <ContestantsImport
          onClose={() => setShowImport(false)}
          onImport={(rows) => { const n = importContestants(rows); alert(`تم استيراد ${n} متسابق جديد`); setShowImport(false); }}
        />
      )}
    </div>
  );
}

function ContestantsImport({ onClose, onImport }: { onClose: () => void; onImport: (rows: Partial<Contestant>[]) => void }) {
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<Partial<Contestant>[] | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => { try { setPreview(parseContestantsCSV(reader.result as string)); setErr(''); } catch (er: any) { setErr(er.message); } };
    reader.readAsText(f, 'utf-8');
  };
  const handleUrl = async () => {
    if (!url.trim()) return; setLoading(true); setErr('');
    try { setPreview(parseContestantsCSV(await fetchGoogleSheetCSV(url.trim()))); }
    catch (er: any) { setErr(er.message); } finally { setLoading(false); }
  };
  const downloadTemplate = () => {
    const header = 'الاسم رباعي,البريد الإلكتروني,رقم الموبايل,النوع,الكود السري,الاشتراك,المسابقات';
    const sample = 'محمد أحمد علي حسن,m@example.com,201000000000,ذكر,1234,مجاني,مسابقة السيرة النبوية؛مسابقة علوم القرآن';
    const blob = new Blob(['\ufeff' + header + '\n' + sample], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'نموذج-المتسابقين.csv'; a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">استيراد المتسابقين</h3><button onClick={onClose} className="text-muted"><X size={22} /></button></div>
        <div className="mb-4 rounded-xl bg-[color-mix(in_srgb,var(--c-primary)_8%,transparent)] p-3 text-sm">
          <p className="font-semibold">الأعمدة: الاسم · البريد · الموبايل · النوع · الكود · الاشتراك · المسابقات (افصل بـ ؛)</p>
          <button onClick={downloadTemplate} className="mt-2 inline-flex items-center gap-1 font-bold text-primary"><Download size={14} /> تحميل نموذج CSV</button>
        </div>
        <div className="space-y-3">
          <div className="rounded-xl border border-dashed border-line p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Upload size={16} className="text-primary" /> ملف Excel / CSV</p>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFile} className="text-sm" />
          </div>
          <div className="rounded-xl border border-dashed border-line p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Link2 size={16} className="text-primary" /> من رابط Google Sheet</p>
            <div className="flex gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="رابط الشيت" className="w-full rounded-xl px-4 py-2 text-sm outline-none" dir="ltr" />
              <button onClick={handleUrl} disabled={loading} className="rounded-xl btn-primary px-4 py-2 text-sm font-bold disabled:opacity-50">{loading ? '...' : 'جلب'}</button>
            </div>
          </div>
          {err && <div className="rounded-xl bg-red-500/12 px-4 py-3 text-sm font-semibold text-red-500">{err}</div>}
          {preview && <div className="rounded-xl bg-green-500/10 p-3 text-sm font-semibold text-green-600">تم قراءة {preview.length} متسابق جاهزين للاستيراد.</div>}
        </div>
        <div className="mt-5 flex gap-3">
          <button disabled={!preview} onClick={() => preview && onImport(preview)} className="flex-1 rounded-xl btn-primary py-2.5 font-bold disabled:opacity-40">استيراد {preview ? `(${preview.length})` : ''}</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function EditModal({ contestant, competitions, onClose, onSave }: {
  contestant: Contestant; competitions: string[]; onClose: () => void; onSave: (c: Contestant) => void;
}) {
  const [c, setC] = useState<Contestant>(contestant);
  const set = (p: Partial<Contestant>) => setC((x) => ({ ...x, ...p }));
  const toggleComp = (n: string) => set({ competitions: c.competitions.includes(n) ? c.competitions.filter((x) => x !== n) : [...c.competitions, n] });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-xl font-bold">تعديل: {c.fullName}</h3>
          <button onClick={onClose} className="text-muted"><X size={22} /></button>
        </div>
        <div className="space-y-3">
          <In label="الاسم رباعي" value={c.fullName} onChange={(v) => set({ fullName: v })} />
          <In label="البريد" value={c.email} onChange={(v) => set({ email: v })} />
          <In label="رقم الواتساب" value={c.phone} onChange={(v) => set({ phone: v })} />
          <In label="الرقم السري" value={c.secretCode} onChange={(v) => set({ secretCode: v })} />
          <In label="عدد المحاولات المسموحة" value={String(c.allowedAttempts)} onChange={(v) => set({ allowedAttempts: Number(v) || 0 })} />
          <In label="الملاحظة" value={c.note} onChange={(v) => set({ note: v })} />
          <div className="grid grid-cols-2 gap-3">
            <Sel label="النوع" value={c.gender} options={['ذكر', 'أنثى']} onChange={(v) => set({ gender: v as any })} />
            <Sel label="الاشتراك" value={c.subscription} options={['مجاني', 'مشترك']} onChange={(v) => set({ subscription: v as any })} />
            <Sel label="الحالة" value={c.status} options={['نشط', 'محظور', 'موقوف']} onChange={(v) => set({ status: v as any })} />
            <Sel label="حالة الإرسال" value={c.sendStatus || 'لا'} options={['نعم', 'لا']} onChange={(v) => set({ sendStatus: v as any })} />
            <Sel label="الدور" value={c.role} options={['متسابق', 'مسؤل', 'زائر']} onChange={(v) => set({ role: v as any })} />
          </div>
          <div>
            <p className="mb-1 text-sm font-semibold text-muted">المسابقات</p>
            <div className="space-y-1.5">
              {competitions.map((n) => (
                <button key={n} onClick={() => toggleComp(n)} className={`block w-full rounded-lg border px-3 py-2 text-right text-sm ${c.competitions.includes(n) ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary' : 'border-line text-muted'}`}>{n}</button>
              ))}
            </div>
          </div>
          <div className="rounded-xl bg-[color-mix(in_srgb,var(--c-text)_5%,transparent)] p-3">
            <p className="flex items-center gap-2 text-sm font-semibold"><Fingerprint size={16} className="text-primary" /> بصمة الجهاز</p>
            <p className="mt-1 break-all font-mono text-xs text-muted">{c.deviceFingerprint || 'لم يسجّل بعد'}</p>
            {c.deviceFingerprint && <button onClick={() => set({ deviceFingerprint: '' })} className="mt-2 rounded-lg border border-line px-3 py-1 text-xs font-bold text-red-500">مسح البصمة (للسماح بجهاز جديد)</button>}
          </div>
          <p className="text-xs text-muted">تاريخ التسجيل: {c.registeredAt}</p>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={() => onSave(c)} className="flex-1 rounded-xl btn-primary py-2.5 font-bold">حفظ</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function In({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl px-4 py-2.5 outline-none" />
    </label>
  );
}
function Sel({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl px-4 py-2.5 outline-none">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}
