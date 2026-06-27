import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Section, TextField, AreaField, SaveBar } from './ui';
import { Plus, Trash2, Crown } from 'lucide-react';

export default function AdminSubscription() {
  const { settings, updateSettings } = useStore();
  const [s, setS] = useState(() => ({
    ...settings,
    subscriptionFeatures: Array.isArray(settings.subscriptionFeatures) ? settings.subscriptionFeatures : [],
  }));
  const [saved, setSaved] = useState(false);
  const set = (p: Partial<typeof s>) => { setS((x) => ({ ...x, ...p })); setSaved(false); };
  const save = () => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const updFeature = (i: number, v: string) => set({ subscriptionFeatures: s.subscriptionFeatures.map((f, fi) => (fi === i ? v : f)) });
  const addFeature = () => set({ subscriptionFeatures: [...s.subscriptionFeatures, ''] });
  const delFeature = (i: number) => set({ subscriptionFeatures: s.subscriptionFeatures.filter((_, fi) => fi !== i) });

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--c-secondary)_12%,transparent)] p-4">
        <Crown className="text-secondary" size={24} />
        <p className="text-sm font-semibold">هذه البيانات تظهر للمستخدمين المجانيين عند محاولة فتح اختبار مخصص للمشتركين.</p>
      </div>

      <Section title="بيانات الاشتراك">
        <TextField label="عنوان نافذة الاشتراك" value={s.subscriptionTitle} onChange={(v) => set({ subscriptionTitle: v })} />
        <TextField label="السعر" value={s.subscriptionPrice} onChange={(v) => set({ subscriptionPrice: v })} />
      </Section>

      <Section title="مميزات الاشتراك">
        {s.subscriptionFeatures.map((f, i) => (
          <div key={i} className="flex items-center gap-2">
            <input value={f} onChange={(e) => updFeature(i, e.target.value)} placeholder={`الميزة ${i + 1}`} className="w-full rounded-xl px-4 py-2.5 outline-none" />
            <button onClick={() => delFeature(i)} className="text-red-500"><Trash2 size={18} /></button>
          </div>
        ))}
        <button onClick={addFeature} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary"><Plus size={16} /> إضافة ميزة</button>
      </Section>

      <Section title="طريقة الدفع والتواصل">
        <AreaField label="بيانات الدفع (تظهر كما هي)" value={s.subscriptionPaymentInfo} onChange={(v) => set({ subscriptionPaymentInfo: v })} rows={5} />
        <TextField label="رقم واتساب الاشتراك (بكود الدولة بدون +)" value={s.subscriptionWhatsapp} onChange={(v) => set({ subscriptionWhatsapp: v })} />
      </Section>

      <SaveBar onSave={save} saved={saved} />
    </div>
  );
}
