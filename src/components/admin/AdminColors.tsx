import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Section, ColorField, SaveBar } from './ui';
import { Sun, Moon } from 'lucide-react';

export default function AdminColors() {
  const { settings, updateSettings } = useStore();
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const set = (patch: Partial<typeof s>) => { setS((p) => ({ ...p, ...patch })); setSaved(false); };
  const save = () => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div>
      <p className="mb-5 text-sm text-muted">تحكم كامل في ألوان المنصة في وضع النهار ووضع الليل. التغييرات تُطبّق فوراً بعد الحفظ.</p>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-line p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Sun size={20} className="text-amber-500" /> وضع النهار</h3>
          <div className="space-y-3">
            <ColorField label="اللون الأساسي" value={s.lightPrimary} onChange={(v) => set({ lightPrimary: v })} />
            <ColorField label="اللون الثانوي" value={s.lightSecondary} onChange={(v) => set({ lightSecondary: v })} />
            <ColorField label="لون التمييز" value={s.lightAccent} onChange={(v) => set({ lightAccent: v })} />
            <ColorField label="الخلفية" value={s.lightBg} onChange={(v) => set({ lightBg: v })} />
            <ColorField label="السطح (البطاقات)" value={s.lightSurface} onChange={(v) => set({ lightSurface: v })} />
            <ColorField label="لون النص" value={s.lightText} onChange={(v) => set({ lightText: v })} />
            <ColorField label="النص الباهت" value={s.lightMuted} onChange={(v) => set({ lightMuted: v })} />
          </div>
        </div>

        <div className="rounded-2xl border border-line p-5">
          <h3 className="mb-4 flex items-center gap-2 font-display text-lg font-bold"><Moon size={20} className="text-indigo-400" /> وضع الليل</h3>
          <div className="space-y-3">
            <ColorField label="اللون الأساسي" value={s.darkPrimary} onChange={(v) => set({ darkPrimary: v })} />
            <ColorField label="اللون الثانوي" value={s.darkSecondary} onChange={(v) => set({ darkSecondary: v })} />
            <ColorField label="لون التمييز" value={s.darkAccent} onChange={(v) => set({ darkAccent: v })} />
            <ColorField label="الخلفية" value={s.darkBg} onChange={(v) => set({ darkBg: v })} />
            <ColorField label="السطح (البطاقات)" value={s.darkSurface} onChange={(v) => set({ darkSurface: v })} />
            <ColorField label="لون النص" value={s.darkText} onChange={(v) => set({ darkText: v })} />
            <ColorField label="النص الباهت" value={s.darkMuted} onChange={(v) => set({ darkMuted: v })} />
          </div>
        </div>
      </div>

      <SaveBar onSave={save} saved={saved} />
    </div>
  );
}
