import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FileText, Download, Globe, Lock, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import SubscribeModal from '../components/SubscribeModal';

export default function Notes() {
  const { currentUser, notes, activeCompetition } = useStore();
  const navigate = useNavigate();
  const [showSub, setShowSub] = useState(false);
  if (!currentUser) { navigate('/auth'); return null; }

  const isSub = currentUser.subscription === 'مشترك' || currentUser.role === 'مسؤل';

  // [] competitions = متاح لكل المسابقات
  const list = notes.filter(
    (n) => n.competitions.length === 0 || !activeCompetition || n.competitions.includes(activeCompetition)
  );

  return (
    <Layout>
      <div className="mx-auto max-w-4xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><FileText size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">المذكرات</h1>
            <p className="text-muted">مراجع ومذكرات المسابقة</p>
          </div>
        </div>
        {list.length === 0 ? (
          <div className="rounded-2xl surface-card p-12 text-center text-muted">لا توجد مذكرات متاحة حالياً.</div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {list.map((n, i) => {
              const locked = n.subscribersOnly && !isSub;
              const Card = (
                <motion.div
                  key={n.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  onClick={() => { if (locked) setShowSub(true); else window.open(n.fileUrl, '_blank'); }}
                  className="group relative flex cursor-pointer items-center gap-4 rounded-2xl surface-card p-5 transition hover:-translate-y-1"
                >
                  {n.thumbnail ? (
                    <img src={n.thumbnail} className={`h-16 w-16 shrink-0 rounded-xl object-cover ${locked ? 'opacity-50 grayscale' : ''}`} alt="" />
                  ) : (
                    <div className="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-[color-mix(in_srgb,var(--c-secondary)_15%,transparent)] text-secondary"><FileText size={26} /></div>
                  )}
                  <div className="flex-1">
                    <h3 className="font-display text-lg font-bold">{n.title}</h3>
                    <p className="text-sm text-muted">{n.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-primary">
                        {n.competitions.length === 0 ? (<><Globe size={12} /> كل المسابقات</>) : n.competitions.join(' · ')}
                      </span>
                      {n.subscribersOnly && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-bold text-amber-600"><Crown size={11} /> للمشتركين</span>}
                    </div>
                  </div>
                  {locked ? <Lock className="text-amber-500" size={22} /> : <Download className="text-primary opacity-0 transition group-hover:opacity-100" size={22} />}
                </motion.div>
              );
              return Card;
            })}
          </div>
        )}
      </div>
      {showSub && <SubscribeModal onClose={() => setShowSub(false)} />}
    </Layout>
  );
}
