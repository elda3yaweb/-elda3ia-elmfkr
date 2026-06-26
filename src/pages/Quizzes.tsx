import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ClipboardList, Clock, HelpCircle, Crown, Lock, Play, Target } from 'lucide-react';
import Layout from '../components/Layout';
import SubscribeModal from '../components/SubscribeModal';
import BackButton from '../components/BackButton';

export default function Quizzes() {
  const { currentUser, activeCompetition, quizConfigs } = useStore();
  const navigate = useNavigate();
  const [showSub, setShowSub] = useState(false);
  if (!currentUser) { navigate('/auth'); return null; }

  const isSub = currentUser.subscription === 'مشترك' || currentUser.role === 'مسؤل';
  const noAttempts = !isSub && currentUser.allowedAttempts <= 0;

  // show ALL quizzes for the active competition (including subscribers-only).
  // free users see subscriber quizzes locked.
  const available = quizConfigs.filter(
    (q) => q.status === 'متاح' && q.competitions.includes(activeCompetition || '')
  );

  return (
    <Layout>
      <div className="mx-auto max-w-6xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><ClipboardList size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">الاختبارات</h1>
            <p className="text-muted">مسابقة: <span className="font-bold text-primary">{activeCompetition}</span></p>
          </div>
        </div>

        {noAttempts && (
          <div className="mb-6 flex flex-col items-center justify-between gap-3 rounded-2xl bg-amber-500/15 p-4 text-center font-semibold text-amber-600 sm:flex-row sm:text-right">
            <span>لقد استنفدت جميع محاولاتك. اشترك للحصول على محاولات غير محدودة.</span>
            <button onClick={() => setShowSub(true)} className="rounded-xl btn-primary px-5 py-2 text-sm font-bold text-white">عرض الاشتراك</button>
          </div>
        )}

        {available.length === 0 ? (
          <div className="rounded-2xl surface-card p-12 text-center text-muted">
            <HelpCircle className="mx-auto mb-3 text-primary" size={48} />
            لا توجد اختبارات متاحة لهذه المسابقة حالياً.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {available.map((q, i) => {
              const locked = q.subscribersOnly && !isSub; // free user → locked
              return (
                <motion.div
                  key={q.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.06 }}
                  className="overflow-hidden rounded-2xl surface-card"
                >
                  <div className="relative h-36 overflow-hidden bg-[color-mix(in_srgb,var(--c-primary)_18%,transparent)]">
                    {q.image ? (
                      <img src={q.image} className={`h-full w-full object-cover ${locked ? 'opacity-50 grayscale' : ''}`} alt="" />
                    ) : (
                      <div className="grid h-full place-items-center"><ClipboardList size={48} className="text-primary opacity-50" /></div>
                    )}
                    {q.subscribersOnly && (
                      <span className="absolute right-3 top-3 inline-flex items-center gap-1 rounded-full bg-amber-500 px-3 py-1 text-xs font-bold text-white">
                        <Crown size={12} /> للمشتركين
                      </span>
                    )}
                    {locked && (
                      <div className="absolute inset-0 grid place-items-center bg-black/30 backdrop-blur-[2px]">
                        <Lock size={40} className="text-white drop-shadow" />
                      </div>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold">{q.name}</h3>
                    <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs text-muted">
                      <Stat icon={<HelpCircle size={16} />} val={`${q.questionCount}`} label="سؤال" />
                      <Stat icon={<Clock size={16} />} val={`${q.duration}`} label="دقيقة" />
                      <Stat icon={<Target size={16} />} val={`${q.passPercent}%`} label="النجاح" />
                    </div>

                    {locked ? (
                      <button
                        onClick={() => setShowSub(true)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl py-2.5 font-bold text-white"
                        style={{ background: 'var(--c-secondary)' }}
                      >
                        <Crown size={18} /> اشترك لفتح الاختبار
                      </button>
                    ) : (
                      <button
                        disabled={noAttempts}
                        onClick={() => navigate(`/quiz/${q.id}`)}
                        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl btn-primary py-2.5 font-bold disabled:opacity-40"
                      >
                        {noAttempts ? <Lock size={18} /> : <Play size={18} />}
                        {noAttempts ? 'لا توجد محاولات' : 'ابدأ الاختبار'}
                      </button>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {showSub && <SubscribeModal onClose={() => setShowSub(false)} />}
    </Layout>
  );
}

function Stat({ icon, val, label }: { icon: React.ReactNode; val: string; label: string }) {
  return (
    <div className="rounded-xl bg-[color-mix(in_srgb,var(--c-text)_5%,transparent)] py-2">
      <div className="flex justify-center text-primary">{icon}</div>
      <div className="mt-1 font-bold text-base-c">{val}</div>
      <div>{label}</div>
    </div>
  );
}
