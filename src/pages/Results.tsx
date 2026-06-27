import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Award, Download, Calendar, CheckCircle2, XCircle, Printer } from 'lucide-react';
import Layout from '../components/Layout';
import BackButton from '../components/BackButton';
import SearchBar from '../components/SearchBar';
import { CertificateWatermark } from '../components/Watermark';

export default function Results() {
  const { currentUser, results, settings } = useStore();
  const navigate = useNavigate();
  const certRef = useRef<HTMLDivElement>(null);
  const [selected, setSelected] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  if (!currentUser) { navigate('/auth'); return null; }

  const allMine = results.filter((r) => r.contestantId === currentUser.id).sort((a, b) => b.date.localeCompare(a.date));
  const sq = search.trim().toLowerCase();
  const mine = sq ? allMine.filter((r) => r.quizName.toLowerCase().includes(sq)) : allMine;
  const passed = allMine.filter((r) => r.passed);
  const cert = passed.find((r) => r.id === selected) || passed[0];

  const printCert = () => window.print();

  return (
    <Layout>
      <div className="mx-auto max-w-5xl px-4 py-10">
        <BackButton to="/home" />
        <div className="mb-8 flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary"><Award size={26} /></div>
          <div>
            <h1 className="font-display text-3xl font-extrabold">النتائج والشهادة</h1>
            <p className="text-muted">سجل نتائج اختباراتك وشهاداتك</p>
          </div>
        </div>

        {allMine.length > 0 && <SearchBar value={search} onChange={setSearch} placeholder="ابحث في النتائج..." />}

        {allMine.length === 0 ? (
          <div className="rounded-2xl surface-card p-12 text-center text-muted">
            لم تخض أي اختبار بعد. ابدأ أول اختبار الآن!
            <div><button onClick={() => navigate('/quizzes')} className="mt-4 rounded-xl btn-primary px-6 py-2.5 font-bold">الذهاب للاختبارات</button></div>
          </div>
        ) : (
          <>
            {/* results table */}
            <div className="mb-10 overflow-hidden rounded-2xl surface-card">
              <table className="w-full text-right text-sm">
                <thead className="bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] text-primary">
                  <tr>
                    <th className="p-4 font-bold">الاختبار</th>
                    <th className="p-4 font-bold">الدرجة</th>
                    <th className="p-4 font-bold">النسبة</th>
                    <th className="p-4 font-bold">الحالة</th>
                    <th className="p-4 font-bold">التاريخ</th>
                    <th className="p-4 font-bold">شهادة</th>
                  </tr>
                </thead>
                <tbody>
                  {mine.map((r) => (
                    <tr key={r.id} className="border-t border-line">
                      <td className="p-4 font-semibold">{r.quizName}</td>
                      <td className="p-4">{r.score}/{r.total}</td>
                      <td className="p-4 font-bold text-primary">{r.percent}%</td>
                      <td className="p-4">
                        {r.passed ? (
                          <span className="inline-flex items-center gap-1 text-green-500"><CheckCircle2 size={16} /> ناجح</span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500"><XCircle size={16} /> راسب</span>
                        )}
                      </td>
                      <td className="p-4 text-muted"><Calendar size={14} className="ml-1 inline" />{r.date}</td>
                      <td className="p-4">
                        {r.passed ? (
                          <button onClick={() => setSelected(r.id)} className="rounded-lg btn-primary px-3 py-1.5 text-xs font-bold">عرض</button>
                        ) : <span className="text-muted">—</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* certificate */}
            {cert && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <div className="mb-4 flex items-center justify-between">
                  <h2 className="font-display text-2xl font-bold">شهادتك</h2>
                  <div className="flex gap-2">
                    <button onClick={printCert} className="flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-bold">
                      <Printer size={16} /> طباعة
                    </button>
                    <button onClick={printCert} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold hover:border-primary">
                      <Download size={16} /> حفظ PDF
                    </button>
                  </div>
                </div>

                <div ref={certRef} id="certificate" className="relative overflow-hidden rounded-3xl bg-white p-8 text-center text-stone-900 shadow-2xl sm:p-12" style={{ direction: 'rtl' }}>
                  {/* watermark over certificate (prints too) */}
                  <CertificateWatermark />
                  {/* ornate border */}
                  <div className="pointer-events-none absolute inset-3 rounded-2xl border-4 border-double" style={{ borderColor: settings.lightPrimary }} />
                  <div className="pointer-events-none absolute inset-5 rounded-xl border" style={{ borderColor: settings.lightSecondary }} />

                  <div className="relative z-10">
                    <p className="font-display text-lg font-bold" style={{ color: settings.lightSecondary }}>بسم الله الرحمن الرحيم</p>
                    <h3 className="mt-4 font-display text-4xl font-extrabold" style={{ color: settings.lightPrimary }}>شهادة تقدير</h3>
                    <p className="mt-6 text-lg text-stone-600">تشهد منصة <b>{settings.platformName}</b> بأن المتسابق/ة</p>
                    <p className="my-4 font-display text-3xl font-extrabold text-stone-900">{cert.contestantName}</p>
                    <p className="text-lg text-stone-600">قد اجتاز/ت بنجاح اختبار</p>
                    <p className="mt-2 font-display text-2xl font-bold" style={{ color: settings.lightAccent }}>{cert.quizName}</p>
                    <p className="mt-1 text-stone-600">ضمن <b>{cert.competition}</b></p>

                    <div className="mt-6 inline-flex items-center gap-2 rounded-full px-6 py-2 text-xl font-extrabold text-white" style={{ background: settings.lightPrimary }}>
                      <Award size={24} /> بنسبة {cert.percent}%
                    </div>

                    <div className="mt-8 flex items-center justify-between text-sm text-stone-500">
                      <div>
                        <p className="font-bold text-stone-700">التاريخ</p>
                        <p>{cert.date}</p>
                      </div>
                      <div className="grid h-16 w-16 place-items-center rounded-full" style={{ background: settings.lightSecondary }}>
                        <Award size={32} className="text-white" />
                      </div>
                      <div>
                        <p className="font-bold text-stone-700">رقم المتسابق</p>
                        <p dir="ltr">{cert.contestantId}</p>
                      </div>
                    </div>
                    <p className="mt-6 text-xs text-stone-400">{settings.copyright}</p>
                  </div>
                </div>
              </motion.div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}
