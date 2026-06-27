import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BarChart3, Users, ClipboardList, CheckCircle2, TrendingUp } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';

export default function Stats() {
  const { currentUser, contestants, results, quizConfigs, competitions } = useStore();
  const navigate = useNavigate();
  if (!currentUser) { navigate('/auth'); return null; }

  const totalContestants = contestants.filter((c) => c.role === 'متسابق').length;
  const totalExams = results.length;
  const passed = results.filter((r) => r.passed).length;
  const passRate = totalExams ? Math.round((passed / totalExams) * 100) : 0;
  const avgScore = totalExams ? Math.round(results.reduce((s, r) => s + r.percent, 0) / totalExams) : 0;

  const perComp = competitions.map((c) => ({
    name: c.name,
    contestants: contestants.filter((x) => x.competitions.includes(c.name)).length,
    exams: results.filter((r) => r.competition === c.name).length,
  }));
  const maxExams = Math.max(1, ...perComp.map((p) => p.exams));

  const stats = [
    { icon: Users, label: 'إجمالي المتسابقين', val: totalContestants, color: 'var(--c-primary)' },
    { icon: ClipboardList, label: 'الاختبارات المنفذة', val: totalExams, color: 'var(--c-secondary)' },
    { icon: CheckCircle2, label: 'نسبة النجاح', val: `${passRate}%`, color: 'var(--c-accent)' },
    { icon: TrendingUp, label: 'متوسط الدرجات', val: `${avgScore}%`, color: 'var(--c-primary)' },
  ];

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><BarChart3 size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">الإحصائيات</h1>
            <p className="text-muted">نظرة عامة على أداء المنصة</p>
          </div>
        </div>

        <div className="mb-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
              className="rounded-2xl surface-card p-6"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl text-white" style={{ background: s.color }}>
                <s.icon size={24} />
              </div>
              <div className="mt-4 font-display text-3xl font-extrabold">{s.val}</div>
              <div className="text-sm text-muted">{s.label}</div>
            </motion.div>
          ))}
        </div>

        <div className="rounded-2xl surface-card p-6">
          <h2 className="mb-6 font-display text-xl font-bold">الاختبارات حسب المسابقة</h2>
          <div className="space-y-5">
            {perComp.map((p) => (
              <div key={p.name}>
                <div className="mb-1.5 flex items-center justify-between text-sm">
                  <span className="font-semibold">{p.name}</span>
                  <span className="text-muted">{p.exams} اختبار · {p.contestants} متسابق</span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-[color-mix(in_srgb,var(--c-text)_8%,transparent)]">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${(p.exams / maxExams) * 100}%` }} transition={{ duration: 0.8 }}
                    className="h-full btn-primary"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 rounded-2xl surface-card p-6">
          <h2 className="mb-4 font-display text-xl font-bold">الاختبارات المتاحة</h2>
          <div className="flex flex-wrap gap-3">
            {quizConfigs.map((q) => (
              <span key={q.id} className={`rounded-full px-4 py-2 text-sm font-semibold ${q.status === 'متاح' ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>
                {q.name} · {q.status}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Layout>
  );
}
