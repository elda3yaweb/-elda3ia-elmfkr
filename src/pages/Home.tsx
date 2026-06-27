import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ClipboardList, BarChart3, Award, Trophy, FileText, Video, BookText,
  BookOpen, AlertCircle, Crown, Sparkles, Lock,
} from 'lucide-react';
import Layout from '../components/Layout';
import { waLink } from '../lib/utils';

const allCards = [
  { to: '/quizzes', icon: ClipboardList, title: 'الاختبارات', desc: 'ابدأ اختبارات المسابقة', color: 'var(--c-primary)', key: 'quizzes' },
  { to: '/results', icon: Award, title: 'النتائج والشهادة', desc: 'نتائجك واحصل على شهادتك', color: 'var(--c-secondary)', key: 'results' },
  { to: '/leaderboard', icon: Trophy, title: 'لوحة الشرف', desc: 'أفضل المتسابقين', color: 'var(--c-accent)', key: 'leaderboard' },
  { to: '/stats', icon: BarChart3, title: 'الإحصائيات', desc: 'إحصائيات المنصة والأداء', color: 'var(--c-primary)', key: 'stats' },
  { to: '/notes', icon: FileText, title: 'المذكرات', desc: 'مذكرات ومراجع المسابقة', color: 'var(--c-secondary)', key: 'notes' },
  { to: '/videos', icon: Video, title: 'الفيديوهات', desc: 'فيديوهات تعليمية', color: 'var(--c-accent)', key: 'videos' },
  { to: '/articles', icon: BookText, title: 'الشروحات والمقالات', desc: 'مقالات وشروحات منظّمة', color: 'var(--c-secondary)', key: 'articles' },
  { to: '/comments', icon: AlertCircle, title: 'التعليقات', desc: 'شاركنا رأيك', color: 'var(--c-secondary)', key: 'comments' },
];

export default function Home() {
  const { currentUser, activeCompetition, settings } = useStore();
  const navigate = useNavigate();

  const cards = allCards.filter((c) => {
    if (c.key === 'stats' && !settings.showStats) return false;
    if (c.key === 'leaderboard' && !settings.showLeaderboard) return false;
    if (c.key === 'comments' && !settings.commentsEnabled) return false;
    return true;
  }).map((c) => {
    if (c.key === 'comments') return { ...c, title: settings.commentsTitle };
    return c;
  });
  const colClass = settings.cardColumns >= 4 ? 'lg:grid-cols-4' : settings.cardColumns === 3 ? 'lg:grid-cols-3' : settings.cardColumns === 2 ? 'lg:grid-cols-2' : 'lg:grid-cols-1';

  if (!currentUser) {
    navigate('/auth');
    return null;
  }
  // guest must pick a competition first
  if (currentUser.role === 'زائر' && currentUser.competitions.length === 0) {
    navigate('/guest-setup');
    return null;
  }

  const banned = currentUser.status !== 'نشط';

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-10">
        {/* Status banner */}
        {banned && (
          <div className="mb-6 flex flex-col items-center gap-3 rounded-2xl bg-red-500/15 p-5 text-center sm:flex-row sm:text-right">
            <AlertCircle className="text-red-500" size={28} />
            <div className="flex-1">
              <p className="font-bold text-red-500">
                {currentUser.status === 'محظور' ? 'تم حظر حسابك' : 'تم إيقاف حسابك مؤقتاً'}
              </p>
              <p className="text-sm text-muted">برجاء التواصل مع الإدارة لحل المشكلة.</p>
            </div>
            <a href={waLink('201000000000')} target="_blank" rel="noreferrer" className="rounded-xl btn-primary px-5 py-2 text-sm font-bold">
              تواصل مع الإدارة
            </a>
          </div>
        )}

        {/* Hero */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="relative mb-10 overflow-hidden rounded-3xl gradient-hero p-8 sm:p-10"
        >
          <div className="arabesque pointer-events-none absolute inset-0 opacity-40" />
          <div className="relative z-10">
            <div className="mb-3 inline-flex items-center gap-2 rounded-full surface-card px-4 py-1.5 text-sm font-semibold text-primary">
              <Sparkles size={16} /> مرحباً بك مجدداً
            </div>
            <h1 className="font-display text-3xl font-extrabold sm:text-4xl">
              أهلاً، {currentUser.fullName.split(' ').slice(0, 2).join(' ')}
            </h1>
            <p className="mt-1 text-base text-muted">{settings.homeHeroText}</p>
            <p className="mt-2 text-lg text-muted">
              أنت مسجّل في: <span className="font-bold text-primary">{activeCompetition}</span>
            </p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <Badge icon={<Lock size={14} />} text={`محاولات متبقية: ${currentUser.subscription === 'مشترك' || currentUser.role === 'مسؤل' ? '∞' : currentUser.allowedAttempts}`} />
              <Badge icon={currentUser.subscription === 'مشترك' ? <Crown size={14} /> : <BookOpen size={14} />} text={currentUser.subscription} />
              <Badge icon={<Award size={14} />} text={`رقمك: ${currentUser.id}`} />
            </div>
          </div>
        </motion.div>

        {/* Cards grid */}
        <div className={`grid gap-5 sm:grid-cols-2 ${colClass}`}>
          {cards.map((c, i) => (
            <motion.button
              key={c.to}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              whileHover={{ y: -6 }}
              onClick={() => navigate(c.to)}
              className="group flex flex-col items-start gap-4 rounded-2xl surface-card p-6 text-right transition"
            >
              <div
                className="grid h-14 w-14 place-items-center rounded-2xl text-white transition group-hover:scale-110"
                style={{ background: c.color }}
              >
                <c.icon size={28} />
              </div>
              <div>
                <h3 className="font-display text-lg font-bold">{c.title}</h3>
                <p className="text-sm text-muted">{c.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>

        {currentUser.role === 'مسؤل' && (
          <motion.button
            initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            onClick={() => navigate('/admin')}
            className="mt-8 flex w-full items-center justify-center gap-3 rounded-2xl btn-primary py-4 text-lg font-bold glow"
          >
            <Crown size={24} /> لوحة تحكم المسؤول
          </motion.button>
        )}
      </div>
    </Layout>
  );
}

function Badge({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full surface-card px-3 py-1.5 font-semibold">
      <span className="text-primary">{icon}</span> {text}
    </span>
  );
}
