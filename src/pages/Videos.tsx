import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Video, Globe, Lock, Crown } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import SubscribeModal from '../components/SubscribeModal';
import { toEmbedUrl } from '../lib/utils';

export default function Videos() {
  const { currentUser, videos, activeCompetition } = useStore();
  const navigate = useNavigate();
  const [showSub, setShowSub] = useState(false);
  if (!currentUser) { navigate('/auth'); return null; }

  const isSub = currentUser.subscription === 'مشترك' || currentUser.role === 'مسؤل';

  const list = videos.filter(
    (v) => v.competitions.length === 0 || !activeCompetition || v.competitions.includes(activeCompetition)
  );

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><Video size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">الفيديوهات</h1>
            <p className="text-muted">محتوى تعليمي مرئي</p>
          </div>
        </div>
        {list.length === 0 ? (
          <div className="rounded-2xl surface-card p-12 text-center text-muted">لا توجد فيديوهات متاحة حالياً.</div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2">
            {list.map((v, i) => {
              const locked = v.subscribersOnly && !isSub;
              return (
                <motion.div
                  key={v.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                  className="overflow-hidden rounded-2xl surface-card"
                >
                  {locked ? (
                    <button onClick={() => setShowSub(true)} className="relative grid aspect-video w-full place-items-center bg-[color-mix(in_srgb,var(--c-primary)_14%,transparent)]">
                      <div className="text-center">
                        <Lock size={40} className="mx-auto text-primary" />
                        <p className="mt-2 font-bold text-primary">فيديو للمشتركين — اضغط للاشتراك</p>
                      </div>
                    </button>
                  ) : (
                    <iframe src={toEmbedUrl(v.url)} className="aspect-video w-full" allowFullScreen title={v.title} />
                  )}
                  <div className="p-5">
                    <h3 className="font-display text-lg font-bold">{v.title}</h3>
                    <p className="text-sm text-muted">{v.description}</p>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                      <span className="flex items-center gap-1 text-primary">
                        {v.competitions.length === 0 ? (<><Globe size={12} /> كل المسابقات</>) : v.competitions.join(' · ')}
                      </span>
                      {v.subscribersOnly && <span className="inline-flex items-center gap-1 rounded-full bg-amber-500/15 px-2 py-0.5 font-bold text-amber-600"><Crown size={11} /> للمشتركين</span>}
                    </div>
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
