import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, Mail, Phone, Lock, LogIn, UserPlus, Eye, EyeOff,
  Users, KeyRound, Mars, Venus, Check, Image as ImageIcon,
} from 'lucide-react';
import type { Gender } from '../lib/types';
import { isValidEmail } from '../lib/utils';
import { googleSignIn } from '../lib/google';
import Layout from '../components/Layout';

type Mode = 'login' | 'register' | 'forgot' | 'guest';

export default function Auth() {
  const { login, register, loginGuest, registerGoogle, resetPassword, competitions, settings } = useStore();
  const navigate = useNavigate();
  const [mode, setMode] = useState<Mode>('login');
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [showPw, setShowPw] = useState(false);

  // login
  const [identifier, setIdentifier] = useState('');
  const [loginCode, setLoginCode] = useState('');

  // register
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [gender, setGender] = useState<Gender>('ذكر');
  const [selectedComps, setSelectedComps] = useState<string[]>([]);
  const [photo, setPhoto] = useState('');

  // forgot
  const [forgotEmail, setForgotEmail] = useState('');

  // guest-extra (after google-like login)
  const activeComps = competitions.filter((c) => c.active);

  const handleLogin = () => {
    setMsg(null);
    if (!identifier || !loginCode) return setMsg({ ok: false, text: 'برجاء إدخال البيانات' });
    const r = login(identifier, loginCode);
    setMsg({ ok: r.ok, text: r.msg });
    if (r.ok) setTimeout(() => navigate('/home'), 600);
  };

  const handleGuest = () => {
    const r = loginGuest();
    setMsg({ ok: r.ok, text: r.msg });
    if (r.ok) setTimeout(() => navigate('/guest-setup'), 600);
  };

  const handleRegister = () => {
    setMsg(null);
    const words = fullName.trim().split(/\s+/).filter(Boolean);
    if (words.length < 3) return setMsg({ ok: false, text: 'الاسم يجب أن يكون ثلاثياً على الأقل' });
    if (!isValidEmail(email)) return setMsg({ ok: false, text: 'برجاء إدخال بريد إلكتروني صحيح' });
    if (!/^\d{6,}$/.test(phone.replace(/[^\d]/g, ''))) return setMsg({ ok: false, text: 'برجاء إدخال رقم واتساب صحيح' });
    if (!code) return setMsg({ ok: false, text: 'برجاء إدخال الرقم السري' });
    if (selectedComps.length === 0) return setMsg({ ok: false, text: 'برجاء اختيار مسابقة واحدة على الأقل' });

    const r = register({ fullName, email, phone, secretCode: code, gender, competitions: selectedComps, photoUrl: photo });
    setMsg({ ok: r.ok, text: r.ok ? `تم إنشاء حسابك — رقمك التسلسلي: ${r.id}` : r.msg });
    if (r.ok) setTimeout(() => navigate('/home'), 1000);
  };

  const handleGoogle = async () => {
    setMsg(null);
    const comps = selectedComps.length ? selectedComps : [activeComps[0]?.name || ''];
    // try REAL Google Sign-In if a Client ID is configured
    if (settings.googleClientId) {
      try {
        const profile = await googleSignIn(settings.googleClientId);
        const r = registerGoogle(profile.name, profile.email, profile.picture, phone, gender, comps);
        setMsg({ ok: r.ok, text: r.msg });
        if (r.ok) setTimeout(() => navigate('/home'), 800);
        return;
      } catch (e: any) {
        setMsg({ ok: false, text: e?.message || 'تعذّر تسجيل الدخول بجوجل' });
        return;
      }
    }
    // fallback demo mode (no Client ID configured)
    const r = registerGoogle(
      'ضيف جوجل المسجل', 'google.user@gmail.com',
      'https://api.dicebear.com/7.x/initials/svg?seed=Google',
      phone, gender, comps
    );
    setMsg({ ok: r.ok, text: r.msg + ' (وضع تجريبي — أضف Client ID لتفعيل جوجل الحقيقي)' });
    if (r.ok) setTimeout(() => navigate('/home'), 800);
  };

  const handleForgot = () => {
    const r = resetPassword(forgotEmail);
    setMsg({ ok: r.ok, text: r.msg });
  };

  const onPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPhoto(reader.result as string);
    reader.readAsDataURL(f);
  };

  const toggleComp = (name: string) =>
    setSelectedComps((p) => (p.includes(name) ? p.filter((c) => c !== name) : [...p, name]));

  return (
    <Layout>
      <div className="relative flex items-center justify-center px-4 py-12">
        <div className="arabesque pointer-events-none absolute inset-0 opacity-30" />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative z-10 w-full max-w-lg rounded-3xl surface-card p-7 shadow-2xl"
        >
          {/* Tabs */}
          <div className="mb-6 flex rounded-2xl bg-[color-mix(in_srgb,var(--c-text)_6%,transparent)] p-1 text-sm font-semibold">
            {([['login', 'دخول'], ['register', 'حساب جديد'], ['guest', 'زائر']] as [Mode, string][]).map(([m, label]) => (
              <button
                key={m}
                onClick={() => { setMode(m); setMsg(null); }}
                className={`flex-1 rounded-xl py-2 transition ${mode === m || (m === 'guest' && mode === 'guest') ? 'btn-primary' : 'text-muted'}`}
              >
                {label}
              </button>
            ))}
          </div>

          {msg && (
            <div className={`mb-4 rounded-xl px-4 py-3 text-sm font-medium ${msg.ok ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>
              {msg.text}
            </div>
          )}

          <AnimatePresence mode="wait">
            {/* ===== LOGIN ===== */}
            {mode === 'login' && (
              <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h2 className="font-display text-2xl font-bold">تسجيل الدخول</h2>
                <Field icon={<User size={18} />}>
                  <input value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="الاسم أو الإيميل أو رقم التليفون" className="w-full bg-transparent outline-none" />
                </Field>
                <Field icon={<Lock size={18} />}>
                  <input type={showPw ? 'text' : 'password'} value={loginCode} onChange={(e) => setLoginCode(e.target.value)} placeholder="الرقم السري" className="w-full bg-transparent outline-none" />
                  <button onClick={() => setShowPw((s) => !s)} className="text-muted">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </Field>
                <button onClick={handleLogin} className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3 font-bold">
                  <LogIn size={20} /> دخول
                </button>
                <div className="flex items-center justify-between text-sm">
                  <button onClick={() => { setMode('forgot'); setMsg(null); }} className="text-primary hover:underline">نسيت الرقم السري؟</button>
                  <button onClick={() => { setMode('register'); setMsg(null); }} className="text-muted hover:text-primary">إنشاء حساب</button>
                </div>
              </motion.div>
            )}

            {/* ===== GUEST ===== */}
            {mode === 'guest' && (
              <motion.div key="guest" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4 text-center">
                <div className="mx-auto grid h-16 w-16 place-items-center rounded-2xl btn-primary"><Users size={32} /></div>
                <h2 className="font-display text-2xl font-bold">الدخول كزائر</h2>
                <p className="text-sm text-muted">
                  يمكنك تجربة المنصة كزائر بحساب تلقائي. لديك <b>اختباران</b> فقط حسب المسابقة المتاحة.
                </p>
                <div className="rounded-xl bg-[color-mix(in_srgb,var(--c-primary)_10%,transparent)] p-3 text-sm">
                  <p>الإيميل: <b dir="ltr">guest@elda3iaelmfkr.com</b></p>
                  <p>الرقم السري: <b>123</b></p>
                </div>
                <button onClick={handleGuest} className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3 font-bold">
                  <Users size={20} /> دخول كزائر
                </button>
              </motion.div>
            )}

            {/* ===== FORGOT ===== */}
            {mode === 'forgot' && (
              <motion.div key="forgot" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h2 className="font-display text-2xl font-bold">استعادة الرقم السري</h2>
                <p className="text-sm text-muted">أدخل بريدك وسنرسل لك رابطاً لإعادة تعيين الرقم السري.</p>
                <Field icon={<Mail size={18} />}>
                  <input value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full bg-transparent outline-none" />
                </Field>
                <button onClick={handleForgot} className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3 font-bold">
                  <KeyRound size={20} /> إرسال رابط الاستعادة
                </button>
                <button onClick={() => { setMode('login'); setMsg(null); }} className="w-full text-sm text-muted hover:text-primary">العودة لتسجيل الدخول</button>
              </motion.div>
            )}

            {/* ===== REGISTER ===== */}
            {mode === 'register' && (
              <motion.div key="register" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
                <h2 className="font-display text-2xl font-bold">إنشاء حساب جديد</h2>

                <Field icon={<User size={18} />}>
                  <input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="الاسم رباعي (إجباري)" className="w-full bg-transparent outline-none" />
                </Field>
                <Field icon={<Mail size={18} />}>
                  <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="البريد الإلكتروني" className="w-full bg-transparent outline-none" />
                </Field>
                <Field icon={<Phone size={18} />}>
                  <input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="رقم الواتساب" inputMode="numeric" className="w-full bg-transparent outline-none" />
                </Field>
                <Field icon={<Lock size={18} />}>
                  <input type={showPw ? 'text' : 'password'} value={code} onChange={(e) => setCode(e.target.value)} placeholder="الرقم السري" className="w-full bg-transparent outline-none" />
                  <button onClick={() => setShowPw((s) => !s)} className="text-muted">{showPw ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </Field>

                {/* Gender icons */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-muted">النوع</p>
                  <div className="grid grid-cols-2 gap-3">
                    <GenderBtn active={gender === 'ذكر'} onClick={() => setGender('ذكر')} icon={<Mars size={26} />} label="ذكر" />
                    <GenderBtn active={gender === 'أنثى'} onClick={() => setGender('أنثى')} icon={<Venus size={26} />} label="أنثى" />
                  </div>
                </div>

                {/* Photo */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-muted">الصورة الشخصية (اختياري)</p>
                  <label className="flex cursor-pointer items-center gap-3 rounded-xl border border-dashed border-line p-3 text-sm text-muted hover:text-primary">
                    {photo ? <img src={photo} className="h-10 w-10 rounded-full object-cover" alt="" /> : <ImageIcon size={20} />}
                    <span>{photo ? 'تم اختيار الصورة — اضغط للتغيير' : 'رفع صورة (تُحفظ على درايف)'}</span>
                    <input type="file" accept="image/*" onChange={onPhoto} className="hidden" />
                  </label>
                </div>

                {/* Competitions multi-select */}
                <div>
                  <p className="mb-2 text-sm font-semibold text-muted">المسابقات (يمكن اختيار أكثر من واحدة)</p>
                  <div className="space-y-2">
                    {activeComps.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => toggleComp(c.name)}
                        className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition ${
                          selectedComps.includes(c.name)
                            ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary font-semibold'
                            : 'border-line text-muted'
                        }`}
                      >
                        {c.name}
                        {selectedComps.includes(c.name) && <Check size={18} />}
                      </button>
                    ))}
                  </div>
                </div>

                <button onClick={handleRegister} className="flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-3 font-bold">
                  <UserPlus size={20} /> إنشاء الحساب
                </button>

                <div className="flex items-center gap-3">
                  <span className="h-px flex-1 bg-line" /> <span className="text-xs text-muted">أو</span> <span className="h-px flex-1 bg-line" />
                </div>
                <button onClick={handleGoogle} className="flex w-full items-center justify-center gap-2 rounded-xl border border-line py-3 font-semibold hover:border-primary">
                  <GoogleG /> التسجيل بحساب جوجل
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </Layout>
  );
}

function Field({ icon, children }: { icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-line px-4 py-3">
      <span className="text-muted">{icon}</span>
      {children}
    </div>
  );
}

function GenderBtn({ active, onClick, icon, label }: { active: boolean; onClick: () => void; icon: React.ReactNode; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-1 rounded-2xl border-2 py-4 transition ${
        active ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_14%,transparent)] text-primary' : 'border-line text-muted'
      }`}
    >
      {icon}
      <span className="text-sm font-semibold">{label}</span>
    </button>
  );
}

function GoogleG() {
  return (
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#FFC107" d="M43.6 20.5h-1.9V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.5 29.4 4.5 24 4.5 13.2 4.5 4.5 13.2 4.5 24S13.2 43.5 24 43.5 43.5 34.8 43.5 24c0-1.2-.1-2.3-.4-3.5z" />
      <path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.7 16 19 13 24 13c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.3 6.5 29.4 4.5 24 4.5 16.3 4.5 9.7 8.9 6.3 14.7z" />
      <path fill="#4CAF50" d="M24 43.5c5.3 0 10.1-2 13.7-5.3l-6.3-5.3c-2 1.5-4.6 2.4-7.4 2.4-5.2 0-9.6-3.3-11.3-7.9l-6.5 5C9.6 39 16.2 43.5 24 43.5z" />
      <path fill="#1976D2" d="M43.6 20.5H24v8h11.3c-.8 2.2-2.2 4.1-4 5.4l6.3 5.3c-.4.4 6.9-5 6.9-15.2 0-1.2-.1-2.3-.4-3.5z" />
    </svg>
  );
}
