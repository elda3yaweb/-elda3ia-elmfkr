import { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../lib/store';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Clock, ChevronLeft, CheckCircle2, XCircle, Award, RotateCcw, Home,
  SkipForward, Share2, ListChecks, Mail,
} from 'lucide-react';
import Layout from '../components/Layout';
import { prepareQuiz, type PreparedQuestion } from '../lib/utils';

function gradeText(p: number) {
  if (p >= 90) return { label: 'ممتاز', color: '#16a34a' };
  if (p >= 80) return { label: 'جيد جداً', color: '#0891b2' };
  if (p >= 70) return { label: 'جيد', color: '#0f766e' };
  if (p >= 60) return { label: 'مقبول', color: '#b45309' };
  return { label: 'ضعيف', color: '#dc2626' };
}

export default function Quiz() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser, quizConfigs, questions, saveResult, settings } = useStore();

  const config = quizConfigs.find((q) => q.id === id);
  if (!currentUser || !config) { navigate('/quizzes'); return null; }

  // block direct access to subscriber-only quizzes for free users
  const isSubscriber = currentUser.subscription === 'مشترك' || currentUser.role === 'مسؤل';
  if (config.subscribersOnly && !isSubscriber) { navigate('/quizzes'); return null; }

  const bank = useMemo(() => questions.filter((q) => q.bank === config.name), [questions, config.name]);
  const [prepared, setPrepared] = useState<PreparedQuestion[]>(() => prepareQuiz(bank, config.questionCount));
  const [order, setOrder] = useState<number[]>(() => prepared.map((_, i) => i)); // navigation order (skipped go to end)
  const [pos, setPos] = useState(0); // index in `order`
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [skipped, setSkipped] = useState<Set<number>>(new Set());
  const [finished, setFinished] = useState(false);
  const [timeLeft, setTimeLeft] = useState(config.duration * 60);
  const [started, setStarted] = useState(false);
  const [result, setResult] = useState<{ score: number; percent: number; passed: boolean } | null>(null);

  const compName = config.competitions[0] || '';

  // phase: 'instructions' (if enabled) → 'countdown' → quiz
  const [phase, setPhase] = useState<'instructions' | 'countdown'>(
    settings.quizInstructionsEnabled ? 'instructions' : 'countdown'
  );

  // brief countdown intro then start (only during countdown phase)
  const [intro, setIntro] = useState(3);
  useEffect(() => {
    if (started || phase !== 'countdown') return;
    if (intro <= 0) { setStarted(true); return; }
    const t = setTimeout(() => setIntro((n) => n - 1), 700);
    return () => clearTimeout(t);
  }, [intro, started, phase]);

  const finish = useCallback(() => {
    if (finished) return;
    let score = 0;
    prepared.forEach((q, i) => { if (answers[i] === q.correctIndex) score++; });
    const total = prepared.length;
    const percent = total ? Math.round((score / total) * 100) : 0;
    const passed = percent >= config.passPercent;
    const durationUsed = Math.ceil((config.duration * 60 - timeLeft) / 60);
    setResult({ score, percent, passed });
    setFinished(true);
    saveResult({
      contestantId: currentUser.id, contestantName: currentUser.fullName,
      quizName: config.name, competition: compName,
      score, total, percent, passed, durationUsed,
    });
  }, [finished, prepared, answers, config, timeLeft, currentUser, saveResult, compName]);

  useEffect(() => {
    if (!started || finished) return;
    if (timeLeft <= 0) { finish(); return; }
    const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [timeLeft, finished, finish, started]);

  const restart = () => {
    const np = prepareQuiz(bank, config.questionCount);
    setPrepared(np); setOrder(np.map((_, i) => i)); setPos(0);
    setAnswers({}); setSkipped(new Set()); setFinished(false);
    setTimeLeft(config.duration * 60); setResult(null); setIntro(3); setStarted(false);
    setPhase(settings.quizInstructionsEnabled ? 'instructions' : 'countdown');
  };

  const share = async () => {
    const url = `${window.location.origin}/quiz/${config.id}`;
    const text = `جرّب اختبار "${config.name}" في منصة ${settings.platformName}`;
    if (navigator.share) {
      try { await navigator.share({ title: config.name, text, url }); return; } catch { /* */ }
    }
    await navigator.clipboard.writeText(`${text}\n${url}`);
    alert('تم نسخ رابط الاختبار للمشاركة');
  };

  if (bank.length === 0) {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-20 text-center">
          <p className="text-xl text-muted">لا توجد أسئلة في بنك هذا الاختبار بعد.</p>
        </div>
      </Layout>
    );
  }

  // ===== QUIZ INSTRUCTIONS SCREEN (shown only when starting a quiz) =====
  if (!started && phase === 'instructions') {
    return (
      <Layout>
        <div className="mx-auto max-w-2xl px-4 py-10">
          <motion.div
            initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
            className="overflow-hidden rounded-3xl surface-card shadow-2xl"
          >
            <div className="gradient-hero p-7 text-center">
              <div className="mx-auto mb-3 grid h-16 w-16 place-items-center rounded-2xl btn-primary"><ListChecks size={32} /></div>
              <h2 className="font-display text-2xl font-extrabold">{settings.quizInstructionsTitle}</h2>
              <p className="mt-1 text-sm font-bold text-primary">{config.name}</p>
            </div>

            <div className="p-6 sm:p-8">
              <ol className="space-y-3">
                {settings.quizInstructions.map((ins, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-start gap-3 rounded-2xl bg-[color-mix(in_srgb,var(--c-text)_4%,transparent)] p-3.5"
                  >
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full btn-primary text-sm font-bold">{i + 1}</span>
                    <span className="flex-1 leading-relaxed">{ins}</span>
                  </motion.li>
                ))}
              </ol>

              {/* readiness question box */}
              <div className="mt-7 rounded-2xl border-2 border-primary bg-[color-mix(in_srgb,var(--c-primary)_8%,transparent)] p-5 text-center">
                <p className="font-display text-lg font-bold">{settings.quizReadinessQuestion}</p>
                <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <button
                    onClick={() => setPhase('countdown')}
                    className="flex items-center justify-center gap-2 rounded-2xl btn-primary py-3.5 text-lg font-bold glow"
                  >
                    <CheckCircle2 size={22} /> {settings.quizStartYesLabel}
                  </button>
                  <button
                    onClick={() => navigate('/quizzes')}
                    className="flex items-center justify-center gap-2 rounded-2xl border-2 border-line py-3.5 text-lg font-bold text-muted hover:border-red-400 hover:text-red-500"
                  >
                    <XCircle size={22} /> {settings.quizStartCancelLabel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // ===== INTRO COUNTDOWN =====
  if (!started) {
    return (
      <Layout>
        <div className="grid min-h-[70vh] place-items-center px-4">
          <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center">
            <p className="mb-6 font-display text-2xl font-bold text-muted">استعد لاختبار</p>
            <h2 className="mb-10 font-display text-3xl font-extrabold text-primary">{config.name}</h2>
            <motion.div
              key={intro}
              initial={{ scale: 0.3, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="mx-auto grid h-40 w-40 place-items-center rounded-full btn-primary glow"
            >
              <span className="font-display text-7xl font-extrabold text-white">{intro > 0 ? intro : 'ابدأ'}</span>
            </motion.div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // ===== RESULT / ANALYSIS SCREEN =====
  if (finished && result) {
    const wrong = prepared.filter((q, i) => answers[i] !== q.correctIndex);
    const g = gradeText(result.percent);
    const correctCount = result.score;
    const wrongCount = prepared.length - result.score;

    return (
      <Layout>
        <div className="mx-auto max-w-3xl px-4 py-10">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="overflow-hidden rounded-3xl surface-card shadow-2xl">
            {/* header */}
            <div className="gradient-hero p-8 text-center">
              <ListChecks className="mx-auto mb-3 text-primary" size={40} />
              <h2 className="font-display text-3xl font-extrabold">تحليل نتيجة الاختبار</h2>
              <p className="mt-1 text-lg font-bold text-primary">{config.name}</p>
            </div>

            <div className="p-6 sm:p-8">
              {/* stats grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                <Cell val={`${prepared.length}`} label="عدد الأسئلة" />
                <Cell val={`${correctCount}`} label="الصحيحة" color="#16a34a" />
                <Cell val={`${wrongCount}`} label="الخاطئة" color="#dc2626" />
                <Cell val={`${result.percent}%`} label="النسبة" />
                <Cell val={g.label} label="التقدير" color={g.color} />
              </div>

              {/* encouragement / motivation */}
              <div className={`mt-6 rounded-2xl p-5 text-center text-lg font-semibold ${result.passed ? 'bg-green-500/12 text-green-700' : 'bg-amber-500/12 text-amber-700'}`}>
                {result.passed ? (
                  <>🎉 أحسنت! لقد اجتزت الاختبار بنجاح وأنت مؤهل للمنافسة في المسابقة. واصل تألقك وثابر على التميز!</>
                ) : (
                  <>💪 لا تيأس! النجاح يحتاج مراجعة وتركيز. راجع الأسئلة التي أخطأت فيها بالأسفل، ثم أعد المحاولة وستتحسن نتيجتك بإذن الله.</>
                )}
              </div>

              {/* wrong questions */}
              {wrong.length > 0 && (
                <div className="mt-7">
                  <div className="mb-3 flex items-center justify-between">
                    <h3 className="font-display text-lg font-bold">الأسئلة التي أخطأت فيها ({wrong.length})</h3>
                    <span className="inline-flex items-center gap-1.5 rounded-full bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] px-3 py-1 text-xs font-semibold text-primary">
                      <Mail size={14} /> أُرسلت لبريدك للمراجعة
                    </span>
                  </div>
                  <div className="space-y-3">
                    {prepared.map((q, i) => {
                      if (answers[i] === q.correctIndex) return null;
                      return (
                        <div key={q.id} className="rounded-2xl bg-[color-mix(in_srgb,var(--c-text)_4%,transparent)] p-4">
                          <p className="flex items-start gap-2 font-semibold">
                            <XCircle size={20} className="mt-0.5 shrink-0 text-red-500" /> {q.text}
                          </p>
                          {q.image && <img src={q.image} className="mt-2 max-h-40 rounded-xl object-contain" alt="" />}
                          <p className="mt-2 pr-7 text-sm font-semibold text-green-600">✓ الصحيحة: {q.options[q.correctIndex]}</p>
                          {answers[i] !== undefined ? (
                            <p className="pr-7 text-sm text-red-500">✗ إجابتك: {q.options[answers[i]]}</p>
                          ) : (
                            <p className="pr-7 text-sm text-amber-600">⊘ تخطّيت السؤال (يُحتسب خطأ)</p>
                          )}
                          {q.explanation && <p className="mt-1 pr-7 text-sm text-muted">📝 {q.explanation}</p>}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* actions */}
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                {result.passed && (
                  <button onClick={() => navigate('/results')} className="flex flex-1 items-center justify-center gap-2 rounded-xl btn-primary py-3 font-bold">
                    <Award size={20} /> الشهادة
                  </button>
                )}
                <button onClick={restart} className="flex flex-1 items-center justify-center gap-2 rounded-xl btn-primary py-3 font-bold">
                  <RotateCcw size={20} /> إعادة الاختبار
                </button>
                <button onClick={share} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-3 font-bold hover:border-primary">
                  <Share2 size={20} /> مشاركة
                </button>
                <button onClick={() => navigate('/quizzes')} className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-line py-3 font-bold hover:border-primary">
                  <Home size={20} /> الاختبارات
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </Layout>
    );
  }

  // ===== QUIZ SCREEN =====
  const curIndex = order[pos];
  const q = prepared[curIndex];
  const answered = Object.keys(answers).length;
  const mm = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const ss = String(timeLeft % 60).padStart(2, '0');
  const totalTime = config.duration * 60;
  const timePct = (timeLeft / totalTime) * 100;
  const hasAnswer = answers[curIndex] !== undefined;
  const optCount = q.options.length;
  const isOdd = optCount % 2 === 1;

  const goNext = () => {
    if (pos < order.length - 1) setPos((p) => p + 1);
    else finish();
  };
  const doSkip = () => {
    setSkipped((s) => new Set(s).add(curIndex));
    // move this question to the end of order if not already last
    setOrder((ord) => {
      const without = ord.filter((x) => x !== curIndex);
      return [...without, curIndex];
    });
    // stay at same pos (which now shows next question), unless it was last
    if (pos >= order.length - 1) {
      // it was last; everything answered or skipped → finish
      finish();
    }
  };

  return (
    <Layout>
      <div className="mx-auto max-w-3xl px-4 py-6">
        {/* SLICK TIMER on top */}
        <div className="mb-5 overflow-hidden rounded-2xl surface-card">
          <div className="flex items-center justify-between px-5 py-3">
            <div>
              <h2 className="font-display text-base font-bold sm:text-lg">{config.name}</h2>
              <p className="text-xs text-muted">سؤال {pos + 1} من {order.length} · أُجيب {answered}</p>
            </div>
            <div className={`flex items-center gap-2 rounded-xl px-4 py-2 font-display text-xl font-extrabold tabular-nums ${timeLeft < 30 ? 'animate-pulse bg-red-500/15 text-red-500' : 'text-primary'}`}>
              <Clock size={20} /> {mm}:{ss}
            </div>
          </div>
          {/* animated time bar */}
          <div className="h-1.5 w-full bg-[color-mix(in_srgb,var(--c-text)_10%,transparent)]">
            <div
              className="h-full transition-all duration-1000 ease-linear"
              style={{ width: `${timePct}%`, background: timeLeft < 30 ? '#dc2626' : 'var(--c-primary)' }}
            />
          </div>
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={curIndex}
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.18 }}
            className="rounded-3xl surface-card p-6 shadow-xl sm:p-7"
          >
            {/* QUESTION */}
            <p className="font-display text-xl font-bold leading-relaxed sm:text-2xl">{q.text}</p>

            {/* IMAGE under question — eager + decoded fast so user doesn't feel delay */}
            {q.image && (
              <div className="mt-4 overflow-hidden rounded-2xl border border-line">
                <img
                  src={q.image}
                  alt="صورة السؤال"
                  loading="eager"
                  decoding="async"
                  fetchPriority="high"
                  className="max-h-72 w-full object-contain"
                />
              </div>
            )}

            {/* OPTIONS: desktop 2×2 (odd centered last), mobile stacked */}
            <div className={`mt-6 grid gap-3 ${settings.optionsLayout === 'list' ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2'}`}>
              {q.options.map((opt, oi) => {
                const isLastOdd = isOdd && oi === optCount - 1 && settings.optionsLayout !== 'list';
                return (
                  <button
                    key={oi}
                    onClick={() => setAnswers((a) => ({ ...a, [curIndex]: oi }))}
                    className={`flex items-center gap-3 rounded-2xl border-2 px-5 py-4 text-right transition ${
                      answers[curIndex] === oi
                        ? 'border-primary bg-[color-mix(in_srgb,var(--c-primary)_12%,transparent)] font-bold text-primary'
                        : 'border-line hover:border-primary'
                    } ${isLastOdd ? 'sm:col-span-2 sm:mx-auto sm:w-1/2' : ''}`}
                  >
                    <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full border-2 text-sm font-bold ${answers[curIndex] === oi ? 'border-primary text-primary' : 'border-line text-muted'}`}>
                      {['أ', 'ب', 'ج', 'د', 'هـ', 'و', 'ز', 'ح'][oi]}
                    </span>
                    {opt}
                  </button>
                );
              })}
            </div>

            {/* CONTROLS: next (only after choose) + skip */}
            <div className="mt-7 flex items-center gap-3">
              <button
                onClick={goNext}
                disabled={!hasAnswer}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl btn-primary py-3.5 text-lg font-bold disabled:cursor-not-allowed disabled:opacity-40"
              >
                {pos === order.length - 1 ? <><CheckCircle2 size={20} /> إنهاء</> : <>التالي <ChevronLeft size={20} /></>}
              </button>
              <button
                onClick={doSkip}
                className="flex items-center justify-center gap-2 rounded-xl border-2 border-line px-6 py-3.5 font-bold text-muted hover:border-amber-500 hover:text-amber-600"
              >
                <SkipForward size={18} /> تخطّي
              </button>
            </div>
            {!hasAnswer && <p className="mt-2 text-center text-xs text-muted">اختر إجابة لتفعيل زر "التالي" — يمكنك تغيير اختيارك قبل المتابعة</p>}
          </motion.div>
        </AnimatePresence>

        {/* progress dots */}
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {order.map((qi, i) => (
            <span
              key={qi}
              className={`grid h-8 w-8 place-items-center rounded-lg text-xs font-bold ${
                i === pos ? 'btn-primary' : skipped.has(qi) ? 'bg-amber-500/25 text-amber-600' : answers[qi] !== undefined ? 'bg-[color-mix(in_srgb,var(--c-primary)_22%,transparent)] text-primary' : 'surface-card text-muted'
              }`}
            >
              {i + 1}
            </span>
          ))}
        </div>
      </div>
    </Layout>
  );
}

function Cell({ val, label, color }: { val: string; label: string; color?: string }) {
  return (
    <div className="rounded-2xl bg-[color-mix(in_srgb,var(--c-text)_5%,transparent)] py-4 text-center">
      <div className="font-display text-2xl font-extrabold" style={{ color: color || 'var(--c-primary)' }}>{val}</div>
      <div className="mt-0.5 text-xs text-muted">{label}</div>
    </div>
  );
}
