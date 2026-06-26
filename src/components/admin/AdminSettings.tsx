import { useState } from 'react';
import { useStore } from '../../lib/store';
import { Section, TextField, AreaField, NumField, Toggle, SaveBar, ColorField, Slider } from './ui';
import type { SocialIcon } from '../../lib/types';
import { Plus, Trash2 } from 'lucide-react';

export default function AdminSettings() {
  const { settings, updateSettings } = useStore();
  const [s, setS] = useState(settings);
  const [saved, setSaved] = useState(false);

  const set = (patch: Partial<typeof s>) => { setS((p) => ({ ...p, ...patch })); setSaved(false); };
  const save = () => { updateSettings(s); setSaved(true); setTimeout(() => setSaved(false), 3000); };

  const updateSocial = (id: string, patch: Partial<SocialIcon>) =>
    set({ social: s.social.map((x) => (x.id === id ? { ...x, ...patch } : x)) });
  const addSocial = () =>
    set({ social: [...s.social, { id: 's' + Date.now(), name: 'جديد', url: '', icon: 'Link', primary: false }] });
  const delSocial = (id: string) => set({ social: s.social.filter((x) => x.id !== id) });

  const onImg = (key: 'logoUrl' | 'watermarkImage', e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f) return;
    const r = new FileReader(); r.onload = () => set({ [key]: r.result as string } as any); r.readAsDataURL(f);
  };

  return (
    <div>
      <Section title="هوية المنصة">
        <TextField label="اسم المنصة" value={s.platformName} onChange={(v) => set({ platformName: v })} />
        <TextField label="الشعار الفرعي" value={s.subSlogan} onChange={(v) => set({ subSlogan: v })} />
        <TextField label="حقوق الملكية (الفوتر)" value={s.copyright} onChange={(v) => set({ copyright: v })} />
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-muted">الشعار (Logo)</span>
          <div className="flex items-center gap-3">
            {s.logoUrl && <img src={s.logoUrl} className="h-12 w-12 rounded-lg object-cover" alt="" />}
            <input type="file" accept="image/*" onChange={(e) => onImg('logoUrl', e)} className="text-sm" />
          </div>
          <input value={s.logoUrl} onChange={(e) => set({ logoUrl: e.target.value })} placeholder="أو رابط الصورة" className="mt-2 w-full rounded-xl px-4 py-2.5 outline-none" dir="ltr" />
        </label>
      </Section>

      <Section title="شاشة الترحيب">
        <TextField label="العنوان" value={s.welcomeTitle} onChange={(v) => set({ welcomeTitle: v })} />
        <AreaField label="الوصف (يمكن وضع أسطر متعددة وأرقام ورموز وإيموجي 🌿✅1.2.3 — كل سطر يظهر منفصلاً)" value={s.welcomeDescription} onChange={(v) => set({ welcomeDescription: v })} rows={6} />
        <TextField label="رابط فيديو الترحيب (أي رابط يوتيوب أو فيميو أو درايف)" value={s.welcomeVideoUrl} onChange={(v) => set({ welcomeVideoUrl: v })} placeholder="مثال: https://youtu.be/xxxx أو https://www.youtube.com/watch?v=xxxx" />
        <TextField label="نص زر البدء" value={s.welcomeButtonText} onChange={(v) => set({ welcomeButtonText: v })} />
      </Section>

      <Section title="شريط الإعلان المتحرك">
        <Toggle label="تفعيل شريط الإعلان" value={s.announcementEnabled} onChange={(v) => set({ announcementEnabled: v })} />
        <AreaField label="نص الإعلان" value={s.announcementText} onChange={(v) => set({ announcementText: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <ColorField label="لون النص" value={s.announcementColor} onChange={(v) => set({ announcementColor: v })} />
          <ColorField label="لون الخلفية" value={s.announcementBg} onChange={(v) => set({ announcementBg: v })} />
          <NumField label="السرعة (ثانية)" value={s.announcementSpeed} onChange={(v) => set({ announcementSpeed: v })} />
          <NumField label="حجم الخط (px)" value={s.announcementFontSize} onChange={(v) => set({ announcementFontSize: v })} />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-muted">اتجاه الكتابة</span>
            <select value={s.announcementDirection} onChange={(e) => set({ announcementDirection: e.target.value as 'rtl' | 'ltr' })} className="w-full rounded-xl px-4 py-2.5 outline-none">
              <option value="rtl">من اليمين لليسار</option>
              <option value="ltr">من اليسار لليمين</option>
            </select>
          </label>
          <Toggle label="عرض رأسي (عمودي على الجانب)" value={s.announcementVertical} onChange={(v) => set({ announcementVertical: v })} />
        </div>
      </Section>

      <Section title="العلامة المائية (Watermark)">
        <Toggle label="تفعيل العلامة المائية" value={s.watermarkEnabled} onChange={(v) => set({ watermarkEnabled: v })} />
        <label className="block">
          <span className="mb-1 block text-sm font-semibold text-muted">النوع</span>
          <select value={s.watermarkType} onChange={(e) => set({ watermarkType: e.target.value as 'text' | 'image' })} className="w-full rounded-xl px-4 py-2.5 outline-none">
            <option value="text">نص</option>
            <option value="image">صورة</option>
          </select>
        </label>
        {s.watermarkType === 'text' ? (
          <TextField label="نص العلامة" value={s.watermarkText} onChange={(v) => set({ watermarkText: v })} />
        ) : (
          <label className="block">
            <span className="mb-1 block text-sm font-semibold text-muted">صورة العلامة</span>
            <div className="flex items-center gap-3">
              {s.watermarkImage && <img src={s.watermarkImage} className="h-10 object-contain" alt="" />}
              <input type="file" accept="image/*" onChange={(e) => onImg('watermarkImage', e)} className="text-sm" />
            </div>
          </label>
        )}
        <Slider
          label="درجة شفافية العلامة المائية"
          value={s.watermarkOpacity}
          onChange={(v) => set({ watermarkOpacity: v })}
          min={0.01}
          max={0.5}
          step={0.01}
          format={(v) => `${Math.round(v * 100)}%`}
        />
      </Section>

      <Section title="أيقونات التواصل">
        <p className="text-sm text-muted">حدّد أيقونتين فقط كـ "أساسية" لتظهر دائماً، والباقي يظهر بزر السهم. (أسماء الأيقونات من lucide مثل Facebook, Youtube, Instagram, Twitter, Send, MessageCircle, Link)</p>
        {s.social.map((soc) => (
          <div key={soc.id} className="grid grid-cols-1 gap-2 rounded-xl border border-line p-3 sm:grid-cols-[1fr_1fr_1fr_auto_auto]">
            <input value={soc.name} onChange={(e) => updateSocial(soc.id, { name: e.target.value })} placeholder="الاسم" className="rounded-lg px-3 py-2 text-sm outline-none" />
            <input value={soc.icon} onChange={(e) => updateSocial(soc.id, { icon: e.target.value })} placeholder="أيقونة" className="rounded-lg px-3 py-2 text-sm outline-none" dir="ltr" />
            <input value={soc.url} onChange={(e) => updateSocial(soc.id, { url: e.target.value })} placeholder="الرابط" className="rounded-lg px-3 py-2 text-sm outline-none" dir="ltr" />
            <button onClick={() => updateSocial(soc.id, { primary: !soc.primary })} className={`rounded-lg px-3 py-2 text-xs font-bold ${soc.primary ? 'btn-primary' : 'border border-line text-muted'}`}>{soc.primary ? 'أساسية' : 'مخفية'}</button>
            <button onClick={() => delSocial(soc.id)} className="grid place-items-center rounded-lg text-red-500"><Trash2 size={16} /></button>
          </div>
        ))}
        <button onClick={addSocial} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-semibold text-primary"><Plus size={16} /> إضافة أيقونة</button>
      </Section>

      <SaveBar onSave={save} saved={saved} />
    </div>
  );
}
