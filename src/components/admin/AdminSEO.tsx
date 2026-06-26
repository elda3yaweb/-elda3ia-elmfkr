import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Section, TextField, AreaField, SaveBar } from './ui';
import { Search, Globe } from 'lucide-react';

export default function AdminSEO() {
  const { settings, updateSettings } = useStore();
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);
  const set = (p: Partial<typeof s>) => { setS((x) => ({ ...x, ...p })); setSaved(false); };
  const save = () => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const onImg = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => set({ seoImage: r.result as string }); r.readAsDataURL(f);
  };

  return (
    <div>
      <div className="mb-5 flex items-center gap-2 rounded-2xl bg-[color-mix(in_srgb,var(--c-accent)_12%,transparent)] p-4">
        <Search className="text-accent" size={24} />
        <p className="text-sm font-semibold">إعدادات تحسين محركات البحث (SEO) ومعاينة المنصة عند مشاركتها على وسائل التواصل.</p>
      </div>

      <Section title="بيانات SEO الأساسية">
        <TextField label="عنوان الصفحة (Title)" value={s.seoTitle} onChange={(v) => set({ seoTitle: v })} />
        <AreaField label="وصف الميتا (Description)" value={s.seoDescription} onChange={(v) => set({ seoDescription: v })} />
        <TextField label="الكلمات المفتاحية (مفصولة بفاصلة)" value={s.seoKeywords} onChange={(v) => set({ seoKeywords: v })} />
        <TextField label="اسم المؤلف / الجهة" value={s.seoAuthor} onChange={(v) => set({ seoAuthor: v })} />
      </Section>

      <Section title="صورة المشاركة (Open Graph)">
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-muted">الصورة التي تظهر عند مشاركة الرابط</span>
          <div className="flex items-center gap-3">
            {s.seoImage && <img src={s.seoImage} className="h-16 w-28 rounded-lg object-cover" alt="" />}
            <input type="file" accept="image/*" onChange={onImg} className="text-sm" />
          </div>
          <input value={s.seoImage} onChange={(e) => set({ seoImage: e.target.value })} placeholder="أو رابط الصورة" className="mt-2 w-full rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
        </label>
      </Section>

      {/* Live preview */}
      <Section title="معاينة نتيجة البحث">
        <div className="rounded-2xl border border-line p-4">
          <div className="flex items-center gap-2 text-xs text-muted"><Globe size={14} /> elda3ia-elmofker</div>
          <p className="mt-1 text-lg font-bold text-blue-600 line-clamp-1">{s.seoTitle || s.platformName}</p>
          <p className="text-sm text-muted line-clamp-2">{s.seoDescription}</p>
        </div>
      </Section>

      <SaveBar onSave={save} saved={saved} />
    </div>
  );
}
