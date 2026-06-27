import { useState, useRef } from 'react';
import { useStore } from '../../lib/store';
import type { Question } from '../../lib/types';
import { Plus, Trash2, Edit3, FileQuestion, X, Upload, Link2, Trash, Download } from 'lucide-react';
import { parseQuestionsCSV, fetchGoogleSheetCSV } from '../../lib/importer';

export default function AdminQuestions() {
  const { questions, quizConfigs, upsertQuestion, deleteQuestion, importQuestions, clearBank } = useStore();
  const banks = Array.from(new Set([...quizConfigs.map((q) => q.name), ...questions.map((q) => q.bank)])).filter(Boolean);
  const [bank, setBank] = useState(banks[0] || '');
  const [edit, setEdit] = useState<Question | null>(null);
  const [showImport, setShowImport] = useState(false);

  const list = questions.filter((q) => q.bank === bank);
  const blank = (): Question => ({ id: 'qq' + Date.now(), bank, text: '', image: '', options: ['', '', '', ''], correctIndex: 0, explanation: '' });

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-display text-lg font-bold">بنوك الأسئلة</h3>
        <div className="flex flex-wrap items-center gap-2">
          <select value={bank} onChange={(e) => setBank(e.target.value)} className="rounded-xl px-4 py-2 text-sm outline-none">
            {banks.map((b) => <option key={b} value={b}>{b}</option>)}
          </select>
          <button onClick={() => setShowImport(true)} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-primary"><Upload size={16} /> استيراد</button>
          <button onClick={() => setEdit(blank())} className="flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-bold"><Plus size={16} /> سؤال</button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-3 text-sm">
        <span className="text-muted">بنك "{bank}" يحتوي على <b className="text-primary">{list.length}</b> سؤال. تُسحب عشوائياً والاختيارات تُرتّب عشوائياً كل محاولة.</span>
        {list.length > 0 && (
          <button onClick={() => { if (confirm(`حذف كل أسئلة بنك "${bank}"؟`)) clearBank(bank); }} className="inline-flex items-center gap-1 rounded-lg bg-red-500/12 px-3 py-1 font-bold text-red-500"><Trash size={14} /> مسح البنك كاملاً</button>
        )}
      </div>

      <div className="space-y-2">
        {list.map((q, i) => (
          <div key={q.id} className="rounded-2xl border border-line p-4">
            <div className="flex items-start justify-between gap-3">
              <p className="flex-1 font-semibold"><span className="text-primary">{i + 1}.</span> {q.text}</p>
              <div className="flex gap-1">
                <button onClick={() => setEdit(q)} className="text-primary"><Edit3 size={16} /></button>
                <button onClick={() => { if (confirm('حذف؟')) deleteQuestion(q.id); }} className="text-red-500"><Trash2 size={16} /></button>
              </div>
            </div>
            {q.image && <img src={q.image} className="mt-2 max-h-28 rounded-lg object-contain" alt="" />}
            <div className="mt-2 grid gap-1.5 text-sm sm:grid-cols-2">
              {q.options.map((o, oi) => (
                <span key={oi} className={`rounded-lg px-3 py-1.5 ${oi === q.correctIndex ? 'bg-green-500/15 font-semibold text-green-600' : 'bg-[color-mix(in_srgb,var(--c-text)_5%,transparent)] text-muted'}`}>{['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][oi]}. {o}</span>
              ))}
            </div>
            {q.explanation && <p className="mt-2 text-sm text-muted">📝 {q.explanation}</p>}
          </div>
        ))}
        {list.length === 0 && <div className="rounded-2xl border border-dashed border-line p-10 text-center text-muted"><FileQuestion className="mx-auto mb-2 text-primary" size={40} />لا توجد أسئلة بعد في هذا البنك.</div>}
      </div>

      {edit && <Modal q={edit} onClose={() => setEdit(null)} onSave={(q) => { upsertQuestion(q); setEdit(null); }} />}
      {showImport && <ImportModal bank={bank} banks={banks} onClose={() => setShowImport(false)} onImport={(b, qs, mode) => { importQuestions(b, qs, mode); setShowImport(false); setBank(b); }} />}
    </div>
  );
}

function Modal({ q, onClose, onSave }: { q: Question; onClose: () => void; onSave: (q: Question) => void }) {
  const [d, setD] = useState(q);
  const setOpt = (i: number, v: string) => setD({ ...d, options: d.options.map((o, oi) => (oi === i ? v : o)) });
  const addOpt = () => d.options.length < 8 && setD({ ...d, options: [...d.options, ''] });
  const removeOpt = (i: number) => d.options.length > 2 && setD({ ...d, options: d.options.filter((_, oi) => oi !== i), correctIndex: Math.min(d.correctIndex, d.options.length - 2) });
  const onImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => setD({ ...d, image: r.result as string }); r.readAsDataURL(f);
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">{q.text ? 'تعديل السؤال' : 'سؤال جديد'}</h3><button onClick={onClose} className="text-muted"><X size={22} /></button></div>
        <textarea value={d.text} onChange={(e) => setD({ ...d, text: e.target.value })} placeholder="نص السؤال" rows={2} className="mb-3 w-full rounded-xl px-4 py-2.5 outline-none" />
        <label className="mb-3 block">
          <span className="mb-1 block text-sm font-semibold text-muted">صورة السؤال (اختياري)</span>
          <div className="flex items-center gap-3">{d.image && <img src={d.image} className="h-12 w-16 rounded-lg object-cover" alt="" />}<input type="file" accept="image/*" onChange={onImg} className="text-sm" /></div>
          <input value={d.image} onChange={(e) => setD({ ...d, image: e.target.value })} placeholder="أو الصق رابط الصورة" className="mt-2 w-full rounded-xl px-4 py-2 text-sm outline-none" dir="ltr" />
        </label>
        <p className="mb-2 text-sm font-semibold text-muted">الاختيارات (اضغط الدائرة لتحديد الصحيحة — حتى 8)</p>
        <div className="space-y-2">
          {d.options.map((o, i) => (
            <div key={i} className="flex items-center gap-2">
              <button onClick={() => setD({ ...d, correctIndex: i })} className={`grid h-7 w-7 shrink-0 place-items-center rounded-full border-2 text-xs font-bold ${d.correctIndex === i ? 'border-green-500 bg-green-500 text-white' : 'border-line text-muted'}`}>{['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][i]}</button>
              <input value={o} onChange={(e) => setOpt(i, e.target.value)} placeholder={`الاختيار ${i + 1}`} className="w-full rounded-xl px-4 py-2 outline-none" />
              {d.options.length > 2 && <button onClick={() => removeOpt(i)} className="text-red-500"><X size={16} /></button>}
            </div>
          ))}
        </div>
        {d.options.length < 8 && <button onClick={addOpt} className="mt-2 flex items-center gap-1 text-sm font-semibold text-primary"><Plus size={14} /> إضافة اختيار</button>}
        <textarea value={d.explanation} onChange={(e) => setD({ ...d, explanation: e.target.value })} placeholder="شرح الإجابة (اختياري)" rows={2} className="mt-3 w-full rounded-xl px-4 py-2.5 outline-none" />
        <div className="mt-5 flex gap-3">
          <button onClick={() => onSave(d)} className="flex-1 rounded-xl btn-primary py-2.5 font-bold">حفظ</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function ImportModal({ bank, banks, onClose, onImport }: {
  bank: string; banks: string[];
  onClose: () => void;
  onImport: (bank: string, qs: Omit<Question, 'id' | 'bank'>[], mode: 'replace' | 'append') => void;
}) {
  const [targetBank, setTargetBank] = useState(bank);
  const [newBank, setNewBank] = useState('');
  const [mode, setMode] = useState<'append' | 'replace'>('append');
  const [url, setUrl] = useState('');
  const [preview, setPreview] = useState<Omit<Question, 'id' | 'bank'>[] | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const finalBank = newBank.trim() || targetBank;

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      try { setPreview(parseQuestionsCSV(reader.result as string)); setErr(''); }
      catch (er: any) { setErr(er.message || 'تعذّر قراءة الملف'); }
    };
    reader.readAsText(f, 'utf-8');
  };

  const handleUrl = async () => {
    if (!url.trim()) return;
    setLoading(true); setErr('');
    try {
      const csv = await fetchGoogleSheetCSV(url.trim());
      setPreview(parseQuestionsCSV(csv));
    } catch (er: any) {
      setErr(er.message || 'تعذّر جلب البيانات من الرابط. تأكد أن الشيت منشور/عام.');
    } finally { setLoading(false); }
  };

  const downloadTemplate = () => {
    const header = 'السؤال,رابط صورة السؤال,الاختيار 1,الاختيار 2,الاختيار 3,الاختيار 4,الاختيار 5,الاختيار 6,الاختيار 7,الاختيار 8,الإجابة الصحيحة,الشرح';
    const sample = 'ما عاصمة مصر؟,,القاهرة,الإسكندرية,أسوان,طنطا,,,,,القاهرة,القاهرة هي العاصمة';
    const blob = new Blob(['\ufeff' + header + '\n' + sample], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'نموذج-بنك-الأسئلة.csv'; a.click();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between"><h3 className="font-display text-xl font-bold">استيراد بنك الأسئلة</h3><button onClick={onClose} className="text-muted"><X size={22} /></button></div>

        <div className="mb-4 rounded-xl bg-[color-mix(in_srgb,var(--c-primary)_8%,transparent)] p-3 text-sm">
          <p className="font-semibold">تنسيق الأعمدة الموحّد:</p>
          <p className="mt-1 text-muted" dir="rtl">السؤال · رابط صورة السؤال · الاختيار 1..8 · الإجابة الصحيحة · الشرح</p>
          <button onClick={downloadTemplate} className="mt-2 inline-flex items-center gap-1 font-bold text-primary"><Download size={14} /> تحميل نموذج CSV</button>
        </div>

        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">البنك الهدف</span>
              <select value={targetBank} onChange={(e) => setTargetBank(e.target.value)} className="w-full rounded-xl px-4 py-2.5 outline-none">{banks.map((b) => <option key={b} value={b}>{b}</option>)}</select>
            </label>
            <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">أو بنك جديد</span>
              <input value={newBank} onChange={(e) => setNewBank(e.target.value)} placeholder="اسم بنك جديد" className="w-full rounded-xl px-4 py-2.5 outline-none" />
            </label>
          </div>
          <div className="flex gap-2 text-sm">
            <button onClick={() => setMode('append')} className={`flex-1 rounded-xl py-2 font-bold ${mode === 'append' ? 'btn-primary' : 'border border-line text-muted'}`}>إضافة للموجود</button>
            <button onClick={() => setMode('replace')} className={`flex-1 rounded-xl py-2 font-bold ${mode === 'replace' ? 'btn-primary' : 'border border-line text-muted'}`}>استبدال الكل</button>
          </div>

          {/* Excel/CSV file */}
          <div className="rounded-xl border border-dashed border-line p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Upload size={16} className="text-primary" /> تحميل ملف Excel / CSV من الجهاز</p>
            <input ref={fileRef} type="file" accept=".csv,.tsv,.txt" onChange={handleFile} className="text-sm" />
            <p className="mt-1 text-xs text-muted">احفظ ملف الإكسل بصيغة CSV (UTF-8) ثم ارفعه.</p>
          </div>

          {/* Google Sheet URL */}
          <div className="rounded-xl border border-dashed border-line p-4">
            <p className="mb-2 flex items-center gap-2 text-sm font-semibold"><Link2 size={16} className="text-primary" /> من رابط Google Sheet</p>
            <div className="flex gap-2">
              <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="الصق رابط Google Sheet" className="w-full rounded-xl px-4 py-2 text-sm outline-none" dir="ltr" />
              <button onClick={handleUrl} disabled={loading} className="rounded-xl btn-primary px-4 py-2 text-sm font-bold disabled:opacity-50">{loading ? '...' : 'جلب'}</button>
            </div>
            <p className="mt-1 text-xs text-muted">تأكد أن الشيت "منشور على الويب" أو متاح بالرابط للقراءة.</p>
          </div>

          {err && <div className="rounded-xl bg-red-500/12 px-4 py-3 text-sm font-semibold text-red-500">{err}</div>}

          {preview && (
            <div className="rounded-xl bg-green-500/10 p-3">
              <p className="text-sm font-semibold text-green-600">تم قراءة {preview.length} سؤال جاهزة للاستيراد إلى "{finalBank}".</p>
              <div className="mt-2 max-h-32 space-y-1 overflow-y-auto text-xs text-muted">
                {preview.slice(0, 5).map((q, i) => <p key={i}>• {q.text}</p>)}
                {preview.length > 5 && <p>... و{preview.length - 5} غيرها</p>}
              </div>
            </div>
          )}
        </div>

        <div className="mt-5 flex gap-3">
          <button disabled={!preview || preview.length === 0 || !finalBank} onClick={() => preview && onImport(finalBank, preview, mode)} className="flex-1 rounded-xl btn-primary py-2.5 font-bold disabled:opacity-40">استيراد {preview ? `(${preview.length})` : ''}</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}
