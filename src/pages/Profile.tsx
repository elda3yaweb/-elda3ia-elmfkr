import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, Lock, Save, Image as ImageIcon, Mars, Venus, Check, LogOut } from 'lucide-react';
import type { Gender } from '../lib/types';
import { isValidEmail } from '../lib/utils';
import { isLiveMode, uploadPhoto } from '../lib/api';
import Layout from '../components/Layout';

export default function Profile() {
  const { currentUser, updateProfile, logout, competitions } = useStore();
  const navigate = useNavigate();
  if (!currentUser) { navigate('/auth'); return null; }

  const [fullName, setFullName] = useState(currentUser.fullName);
  const [email, setEmail] = useState(currentUser.email);
  const [phone, setPhone] = useState(currentUser.phone);
  const [code, setCode] = useState(currentUser.secretCode);
  const [gender, setGender] = useState<Gender>(currentUser.gender);
  const [photo, setPhoto] = useState(currentUser.photoUrl);
  const [comps, setComps] = useState<string[]>(currentUser.competitions);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result as string;
      setPhoto(base64);
      // upload to Drive if live mode is on
      if (isLiveMode()) {
        const url = await uploadPhoto(`${currentUser.id}-${currentUser.fullName}.png`, base64);
        if (url) setPhoto(url);
      }
    };
    reader.readAsDataURL(f);
  };

  const toggleComp = (n: string) => setComps((p) => (p.includes(n) ? p.filter((c) => c !== n) : [...p, n]));

  const isGuest = currentUser.role === 'زائر';

  const saveGuestComp = (name: string) => {
    updateProfile({ competitions: [name] });
    useStore.getState().setActiveCompetition(name);
    setComps([name]);
    setMsg({ ok: true, text: 'تم تغيير المسابقة' });
  };

  const save = () => {
    if (fullName.trim().split(/\s+/).filter(Boolean).length < 3) return setMsg({ ok: false, text: 'الاسم يجب أن يكون ثلاثياً على الأقل' });
    if (!isValidEmail(email)) return setMsg({ ok: false, text: 'بريد إلكتروني غير صحيح' });
    if (comps.length === 0) return setMsg({ ok: false, text: 'اختر مسابقة واحدة على الأقل' });
    updateProfile({ fullName, email, phone, secretCode: code, gender, photoUrl: photo, competitions: comps });
    setMsg({ ok: true, text: 'تم حفظ البيانات وتحديثها في السجل بنجاح' });
  };

  return (
    <Layout>
      <div className="mx-auto max-w-2xl px-4 py-10">
        <div className="mb-8 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><User size={26} /></div>
            <div>
              <h1 className="font-display text-3xl font-extrabold">الملف الشخصي</h1>
              <p className="text-muted">رقمك: {currentUser.id} · {currentUser.role}</p>
            </div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-red-500 hover:border-red-500">
            <LogOut size={16} /> خروج
          </button>
        </div>

        {/* ===== GUEST: can ONLY change competition ===== */}
        {isGuest ? (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 rounded-3xl surface-card p-7">
            {msg && <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.ok ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>{msg.text}</div>}
            <div className="rounded-2xl bg-[color-mix(in_srgb,var(--c-secondary)_12%,transparent)] p-4 text-sm font-semibold text-secondary">
              أنت تتصفح كزائر — يمكنك فقط تغيير المسابقة. لإنشاء حساب كامل بكل المميزات، سجّل حساباً جديداً.
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold text-muted">اختر المسابقة</p>
              <div className="space-y-2">
                {competitions.filter((c) => c.active).map((c) => (
                  <button key={c.id} onClick={() => saveGuestComp(c.name)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-3 text-sm ${comps.includes(c.name) ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] font-semibold text-primary' : 'border-line text-muted'}`}>
                    {c.name} {comps.includes(c.name) && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={() => { logout(); navigate('/'); }} className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 font-bold text-red-500 hover:border-red-500"><LogOut size={18} /> تسجيل الخروج</button>
          </motion.div>
        ) : (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-5 rounded-3xl surface-card p-7">
          {msg && <div className={`rounded-xl px-4 py-3 text-sm font-semibold ${msg.ok ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>{msg.text}</div>}

          {/* photo */}
          <div className="flex flex-col items-center gap-3">
            {photo ? <img src={photo} className="h-24 w-24 rounded-full object-cover ring-4 ring-primary" alt="" /> : <span className="grid h-24 w-24 place-items-center rounded-full btn-primary text-3xl font-bold">{currentUser.fullName.charAt(0)}</span>}
            <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm text-muted hover:text-primary">
              <ImageIcon size={16} /> تغيير الصورة (تُرفع على درايف)
              <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
            </label>
          </div>

          <Field icon={<User size={18} />} label="الاسم رباعي"><input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full bg-transparent outline-none" /></Field>
          <Field icon={<Mail size={18} />} label="البريد الإلكتروني"><input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-transparent outline-none" /></Field>
          <Field icon={<Phone size={18} />} label="رقم الواتساب"><input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="numeric" className="w-full bg-transparent outline-none" /></Field>
          <Field icon={<Lock size={18} />} label="الرقم السري"><input value={code} onChange={(e) => setCode(e.target.value)} className="w-full bg-transparent outline-none" /></Field>

          <div>
            <p className="mb-2 text-sm font-semibold text-muted">النوع</p>
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setGender('ذكر')} className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 ${gender === 'ذكر' ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary' : 'border-line text-muted'}`}><Mars size={24} /> ذكر</button>
              <button onClick={() => setGender('أنثى')} className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 ${gender === 'أنثى' ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary' : 'border-line text-muted'}`}><Venus size={24} /> أنثى</button>
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-semibold text-muted">المسابقات</p>
            <div className="space-y-2">
              {competitions.filter((c) => c.active).map((c) => (
                <button key={c.id} onClick={() => toggleComp(c.name)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${comps.includes(c.name) ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] font-semibold text-primary' : 'border-line text-muted'}`}>
                  {c.name} {comps.includes(c.name) && <Check size={18} />}
                </button>
              ))}
            </div>
          </div>

          <button onClick={save} className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3 font-bold"><Save size={20} /> حفظ التعديلات</button>
        </motion.div>
        )}
      </div>
    </Layout>
  );
}

function Field({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-1.5 text-sm font-semibold text-muted">{label}</p>
      <div className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
        <span className="text-muted">{icon}</span>{children}
      </div>
    </div>
  );
}
