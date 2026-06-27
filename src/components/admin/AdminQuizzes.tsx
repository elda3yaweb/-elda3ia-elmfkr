import { useState } from 'react';
import { useStore } from '../../lib/store';
import type { QuizConfig } from '../../lib/types';
import { Plus, Trash2, Edit3, Link2 } from 'lucide-react';
import { buildDefaultLink } from '../../lib/utils';

export default function AdminQuizzes() {
  const { quizConfigs, upsertQuiz, deleteQuiz, competitions, questions } = useStore();
  const [edit, setEdit] = useState<QuizConfig | null>(null);

  const base = window.location.origin;
  const blank = (): QuizConfig => ({
    id: 'q' + Date.now(), name: '', image: '', questionCount: 10, duration: 15,
    status: 'متاح', competitions: competitions[0] ? [competitions[0].name] : [], subscribersOnly: false,
    passPercent: 60, defaultLink: '',
  });

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-display text-lg font-bold">إعدادات الاختبارات ({quizConfigs.length})</h3>
        <button onClick={() => setEdit(blank())} className="flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-bold"><Plus size={16} /> اختبار جديد</button>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line">
        <table className="w-full min-w-[800px] text-right text-sm">
          <thead className="bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)] text-primary">
            <tr><th className="p-3">الاسم</th><th className="p-3">أسئلة</th><th className="p-3">بنك</th><th className="p-3">الوقت</th><th className="p-3">النجاح</th><th className="p-3">المسابقة</th><th className="p-3">مشترك</th><th className="p-3">الحالة</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {quizConfigs.map((q) => {
              const bankSize = questions.filter((x) => x.bank === q.name).length;
              return (
                <tr key={q.id} className="border-t border-line">
                  <td className="p-3 font-semibold">{q.name}</td>
                  <td className="p-3">{q.questionCount}</td>
                  <td className="p-3">{bankSize} سؤال</td>
                  <td className="p-3">{q.duration}د</td>
                  <td className="p-3">{q.passPercent}%</td>
                  <td className="p-3 text-xs">{q.competitions.join('، ')}</td>
                  <td className="p-3">{q.subscribersOnly ? 'نعم' : 'لا'}</td>
                  <td className="p-3"><span className={`rounded-full px-2 py-1 text-xs font-bold ${q.status === 'متاح' ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>{q.status}</span></td>
                  <td className="p-3"><div className="flex gap-1"><button onClick={() => setEdit(q)} className="text-primary"><Edit3 size={16} /></button><button onClick={() => { if (confirm('حذف؟')) deleteQuiz(q.id); }} className="text-red-500"><Trash2 size={16} /></button></div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {edit && <Modal quiz={edit} comps={competitions.map((c) => c.name)} base={base} onClose={() => setEdit(null)} onSave={(q) => { upsertQuiz(q); setEdit(null); }} />}
    </div>
  );
}

function Modal({ quiz, comps, base, onClose, onSave }: { quiz: QuizConfig; comps: string[]; base: string; onClose: () => void; onSave: (q: QuizConfig) => void }) {
  const [q, setQ] = useState(quiz);
  const set = (p: Partial<QuizConfig>) => setQ((x) => ({ ...x, ...p }));
  const link = q.defaultLink || buildDefaultLink(base, q.name || 'quiz');

  const onImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => set({ image: r.result as string }); r.readAsDataURL(f);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-[var(--c-surface)] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <h3 className="mb-4 font-display text-xl font-bold">{quiz.name ? 'تعديل الاختبار' : 'اختبار جديد'}</h3>
        <div className="space-y-3">
          <In label="اسم الاختبار / بنك الأسئلة" value={q.name} onChange={(v) => set({ name: v })} />
          <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">صورة الاختبار</span>
            <div className="flex items-center gap-3">{q.image && <img src={q.image} className="h-12 w-16 rounded-lg object-cover" alt="" />}<input type="file" accept="image/*" onChange={onImg} className="text-sm" /></div>
          </label>
          <div className="grid grid-cols-2 gap-3">
            <NumIn label="عدد الأسئلة (تُسحب عشوائياً)" value={q.questionCount} onChange={(v) => set({ questionCount: v })} />
            <NumIn label="وقت الاختبار (دقيقة)" value={q.duration} onChange={(v) => set({ duration: v })} />
            <NumIn label="نسبة النجاح %" value={q.passPercent} onChange={(v) => set({ passPercent: v })} />
            <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">الحالة</span>
              <select value={q.status} onChange={(e) => set({ status: e.target.value as any })} className="w-full rounded-xl px-4 py-2.5 outline-none"><option value="متاح">متاح</option><option value="غير متاح">غير متاح</option></select>
            </label>
            <label className="flex items-center justify-between rounded-xl border border-line px-4 py-2.5 text-sm font-semibold">للمشتركين فقط<input type="checkbox" checked={q.subscribersOnly} onChange={(e) => set({ subscribersOnly: e.target.checked })} className="h-5 w-5" /></label>
          </div>
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <p className="text-sm font-semibold text-muted">المسابقات (اختر الكل أو واحدة أو أكثر)</p>
              <div className="flex gap-2 text-xs">
                <button onClick={() => set({ competitions: [...comps] })} className="rounded-lg bg-[color-mix(in_srgb,var(--c-primary)_14%,transparent)] px-3 py-1 font-bold text-primary">تحديد الكل</button>
                <button onClick={() => set({ competitions: [] })} className="rounded-lg border border-line px-3 py-1 font-bold text-muted">إلغاء الكل</button>
              </div>
            </div>
            <div className="space-y-1.5">
              {comps.map((c) => {
                const on = q.competitions.includes(c);
                return (
                  <button key={c} onClick={() => set({ competitions: on ? q.competitions.filter((x) => x !== c) : [...q.competitions, c] })}
                    className={`block w-full rounded-lg border px-3 py-2 text-right text-sm ${on ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] font-semibold text-primary' : 'border-line text-muted'}`}>
                    {c} {on && '✓'}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="rounded-xl bg-[color-mix(in_srgb,var(--c-primary)_8%,transparent)] p-3">
            <p className="flex items-center gap-2 text-sm font-semibold"><Link2 size={16} className="text-primary" /> الرابط الافتراضي</p>
            <p className="mt-1 break-all font-mono text-xs text-primary" dir="ltr">{link}</p>
          </div>
        </div>
        <div className="mt-5 flex gap-3">
          <button onClick={() => onSave({ ...q, defaultLink: link })} className="flex-1 rounded-xl btn-primary py-2.5 font-bold">حفظ</button>
          <button onClick={onClose} className="flex-1 rounded-xl border border-line py-2.5 font-bold">إلغاء</button>
        </div>
      </div>
    </div>
  );
}

function In({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">{label}</span><input value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-xl px-4 py-2.5 outline-none" /></label>;
}
function NumIn({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">{label}</span><input type="number" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full rounded-xl px-4 py-2.5 outline-none" /></label>;
}
