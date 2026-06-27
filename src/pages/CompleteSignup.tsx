import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Phone, Lock, Check, Mars, Venus, ShieldCheck } from 'lucide-react';
import type { Gender } from '../lib/types';
import Layout from '../components/Layout';

interface GProfile { name: string; email: string; picture: string; gender: Gender }

export default function CompleteSignup() {
  const { registerGoogle, competitions } = useStore();
  const navigate = useNavigate();
  const location = useLocation();
  const profile = (location.state as { profile?: GProfile } | null)?.profile;

  if (!profile) { navigate('/auth'); return null; }

  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [gender, setGender] = useState<Gender>(profile.gender || 'ذكر');
  const [comps, setComps] = useState<string[]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const activeComps = competitions.filter((c) => c.active);
  const toggleComp = (n: string) => setComps((p) => (p.includes(n) ? p.filter((c) => c !== n) : [...p, n]));

  const submit = () => {
    if (!/^\d{6,}$/.test(phone.replace(/[^\d]/g, ''))) return setMsg({ ok: false, text: 'برجاء إدخال رقم واتساب صحيح' });
    if (!code) return setMsg({ ok: false, text: 'برجاء إدخال الرقم السري الذي ستدخل به لاحقاً' });
    if (comps.length === 0) return setMsg({ ok: false, text: 'برجاء اختيار مسابقة واحدة على الأقل' });

    const r = registerGoogle(profile.name, profile.email, profile.picture, phone, gender, comps, code);
    setMsg({ ok: r.ok, text: r.msg });
    if (r.ok) setTimeout(() => navigate('/home'), 800);
  };

  return (
    <Layout>
      <div className="mx-auto max-w-lg px-4 py-12">
        <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="rounded-3xl surface-card p-7 shadow-2xl">
          {/* pulled from Google */}
          <div className="mb-6 flex items-center gap-4 rounded-2xl bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)] p-4">
            <img src={profile.picture} className="h-14 w-14 rounded-full object-cover ring-2 ring-primary" alt="" />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-1.5 truncate font-bold"><ShieldCheck size={16} className="text-green-600" /> {profile.name}</p>
              <p className="truncate text-sm text-muted" dir="ltr">{profile.email}</p>
            </div>
            <GoogleG />
          </div>

          <h1 className="font-display text-2xl font-extrabold">إكمال التسجيل</h1>
          <p className="mt-1 text-sm text-muted">تم سحب الاسم والبريد والصورة من جوجل تلقائياً. أكمل البيانات التالية.</p>

          {msg && <div className={`mt-4 rounded-xl px-4 py-3 text-sm font-semibold ${msg.ok ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>{msg.text}</div>}

          <div className="mt-5 space-y-4">
            <Field icon={<Phone size={18} />}>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الواتساب" inputMode="numeric" className="w-full bg-transparent outline-none" />
            </Field>
            <Field icon={<Lock size={18} />}>
              <input value={code} onChange={(e) => setCode(e.target.value)} placeholder="الرقم السري (للدخول لاحقاً)" className="w-full bg-transparent outline-none" />
            </Field>

            <div>
              <p className="mb-2 text-sm font-semibold text-muted">النوع</p>
              <div className="grid grid-cols-2 gap-3">
                <button onClick={() => setGender('ذكر')} className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 ${gender === 'ذكر' ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary' : 'border-line text-muted'}`}><Mars size={24} /> ذكر</button>
                <button onClick={() => setGender('أنثى')} className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-3 ${gender === 'أنثى' ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary' : 'border-line text-muted'}`}><Venus size={24} /> أنثى</button>
              </div>
            </div>

            <div>
              <p className="mb-2 text-sm font-semibold text-muted">المسابقات (يمكن اختيار أكثر من واحدة)</p>
              <div className="space-y-2">
                {activeComps.map((c) => (
                  <button key={c.id} onClick={() => toggleComp(c.name)} className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm ${comps.includes(c.name) ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] font-semibold text-primary' : 'border-line text-muted'}`}>
                    {c.name} {comps.includes(c.name) && <Check size={18} />}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={submit} className="flex w-full items-center justify-center gap-2 rounded-2xl btn-primary py-3.5 text-lg font-bold">
              <Check size={20} /> حفظ وإنشاء الحساب
            </button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
      <span className="text-muted">{icon}</span>{children}
    </div>
  );
}

function GoogleG() {
  return (
    <svg width="22" height="22" viewBox="0 0 48 48" className="shrink-0">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.5 29.4 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.5 29.4 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.6 2.4-7.4 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.3 5.3c-.4.4 6.9-5 6.9-15.2 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
