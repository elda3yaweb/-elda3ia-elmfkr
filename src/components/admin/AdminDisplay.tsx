import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Section, NumField, AreaField, Toggle, SaveBar } from './ui';

export default function AdminDisplay() {
  const { settings, updateSettings } = useStore();
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const set = (p: Partial<typeof s>) => { setS((x) => ({ ...x, ...p })); setSaved(false); };
  const save = () => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  return (
    <div>
      <Section title="شكل العرض">
        <NumField label="عدد كروت الاختبارات بالصف (1-4)" value={s.cardColumns} onChange={(v) => set({ cardColumns: Math.min(4, Math.max(1, v)) })} />
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-muted">شكل عرض اختيارات الأسئلة (على الشاشات الكبيرة)</span>
          <select value={s.optionsLayout} onChange={(e) => set({ optionsLayout: e.target.value as any })} className="w-full rounded-xl px-4 py-2.5 outline-none">
            <option value="grid">شبكة (اثنان قصاد بعض)</option>
            <option value="list">قائمة (تحت بعض)</option>
          </select>
        </label>
        <AreaField label="نص يظهر في الصفحة الرئيسية" value={s.homeHeroText} onChange={(v) => set({ homeHeroText: v })} />
      </Section>

      <Section title="الأقسام الظاهرة">
        <Toggle label="إظهار قسم الإحصائيات" value={s.showStats} onChange={(v) => set({ showStats: v })} />
        <Toggle label="إظهار لوحة الشرف" value={s.showLeaderboard} onChange={(v) => set({ showLeaderboard: v })} />
        <Toggle label="إظهار التعليقات" value={s.commentsEnabled} onChange={(v) => set({ commentsEnabled: v })} />
      </Section>

      <Section title="الوضع الافتراضي">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-muted">الوضع عند فتح المنصة</span>
          <select value={s.defaultTheme} onChange={(e) => set({ defaultTheme: e.target.value as any })} className="w-full rounded-xl px-4 py-2.5 outline-none">
            <option value="light">وضع النهار</option>
            <option value="dark">وضع الليل</option>
          </select>
        </label>
      </Section>

      <SaveBar onSave={save} saved={saved} />
    </div>
  );
}
