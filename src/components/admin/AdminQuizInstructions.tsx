import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Section, TextField, Toggle, SaveBar } from './ui';
import { Plus, Trash2, ListChecks } from 'lucide-react';

export default function AdminQuizInstructions() {
  const { settings, updateSettings } = useStore();
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const set = (p: Partial<typeof s>) => { setS((x) => ({ ...x, ...p })); setSaved(false); };
  const save = () => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const upd = (i: number, v: string) => set({ quizInstructions: s.quizInstructions.map((x, xi) => (xi === i ? v : x)) });
  const add = () => set({ quizInstructions: [...s.quizInstructions, ''] });
  const del = (i: number) => set({ quizInstructions: s.quizInstructions.filter((_, xi) => xi !== i) });

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)] p-4">
        <ListChecks className="text-primary" size={24} />
        <p className="text-sm font-semibold">هذه التعليمات تظهر للمتسابق فقط عند الضغط على "ابدأ الاختبار"، ولا تظهر في أي قسم آخر.</p>
      </div>

      <Section title="إعدادات شاشة تعليمات الاختبار">
        <Toggle label="تفعيل شاشة التعليمات قبل الاختبار" value={s.quizInstructionsEnabled} onChange={(v) => set({ quizInstructionsEnabled: v })} />
        <TextField label="عنوان الشاشة" value={s.quizInstructionsTitle} onChange={(v) => set({ quizInstructionsTitle: v })} />
      </Section>

      <Section title="بنود التعليمات">
        {s.quizInstructions.map((ins, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full btn-primary text-sm font-bold">{i + 1}</span>
            <input value={ins} onChange={(e) => upd(i, e.target.value)} placeholder={`البند ${i + 1}`} className="w-full rounded-xl px-4 py-2.5 outline-none" />
            <button onClick={() => del(i)} className="text-red-500"><Trash2 size={18} /></button>
          </div>
        ))}
        <button onClick={add} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary"><Plus size={16} /> إضافة بند</button>
      </Section>

      <Section title="سؤال الاستعداد والأزرار">
        <TextField label="سؤال الاستعداد (يظهر في مربع مميّز)" value={s.quizReadinessQuestion} onChange={(v) => set({ quizReadinessQuestion: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TextField label="نص زر البدء" value={s.quizStartYesLabel} onChange={(v) => set({ quizStartYesLabel: v })} />
          <TextField label="نص زر الإلغاء" value={s.quizStartCancelLabel} onChange={(v) => set({ quizStartCancelLabel: v })} />
        </div>
      </Section>

      <SaveBar onSave={save} saved={saved} />
    </div>
  );
}
