import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type {
  PlatformSettings, Contestant, Competition, QuizConfig, Question,
  QuizResult, CommentItem, NoteItem, VideoItem, ChatSession, ChatMessage, AssistantKnowledge,
  ArticleFolder, Article, LibraryFolder, LibraryItem,
} from './types';
import {
  defaultSettings, defaultContestants, defaultCompetitions, defaultQuizConfigs,
  defaultQuestions, defaultResults, defaultComments, defaultNotes, defaultVideos,
  defaultChatSessions, defaultArticleFolders, defaultArticles,
  defaultLibraryFolders, defaultLibraryItems, GUEST_EMAIL, GUEST_CODE,
} from './defaults';
import { descendantFolderIds } from './library';
import { fetchGoogleSheetCSV, parseQuestionsCSV, parseContestantsCSV } from './importer';
import { api, isLiveMode, uploadPhoto, sendEmail } from './api';

// ---- best-effort live sync helpers (no-op in offline mode) ----
function syncContestant(c: Contestant, isNew: boolean) {
  if (!isLiveMode()) return;
  const row = [
    c.id, c.fullName, c.email, c.phone, c.gender, c.secretCode, c.allowedAttempts,
    c.status, c.competitions.join('، '), c.sendStatus, c.subscription,
    c.deviceFingerprint, c.photoUrl, c.note, c.registeredAt, c.role,
  ];
  api(isNew ? 'addContestant' : 'updateContestant', { id: c.id, row });
}
function syncResult(r: QuizResult) {
  if (!isLiveMode()) return;
  api('saveResult', { row: [r.contestantId, r.contestantName, r.quizName, r.competition, r.score, r.total, r.percent, r.passed ? 'ناجح' : 'راسب', r.date] });
}
export { uploadPhoto, sendEmail };

// Generate a stable device fingerprint
export function getDeviceFingerprint(): string {
  const nav = navigator;
  const parts = [
    nav.userAgent, nav.language, screen.width, screen.height,
    screen.colorDepth, new Date().getTimezoneOffset(),
    nav.hardwareConcurrency || 0,
  ].join('|');
  let hash = 0;
  for (let i = 0; i < parts.length; i++) {
    hash = (hash << 5) - hash + parts.charCodeAt(i);
    hash |= 0;
  }
  return 'FP-' + Math.abs(hash).toString(16).toUpperCase();
}

function nextSerial(contestants: Contestant[]): string {
  const year = new Date().getFullYear();
  const prefix = `M-${year}-`;
  const nums = contestants
    .map((c) => c.id)
    .filter((id) => id.startsWith(prefix))
    .map((id) => parseInt(id.split('-')[2], 10))
    .filter((n) => !isNaN(n));
  const max = nums.length ? Math.max(...nums) : 0;
  return prefix + String(max + 1).padStart(4, '0');
}

// Find a sheet by fuzzy Arabic name match
function pickSheet(sheets: Record<string, any[][]>, ...names: string[]): any[][] | null {
  const keys = Object.keys(sheets);
  for (const n of names) {
    const k = keys.find((key) => key.includes(n));
    if (k) return sheets[k];
  }
  return null;
}

const cell = (row: any[], i: number) => (row && row[i] != null ? String(row[i]).trim() : '');

// Map raw Google Sheets data (from Apps Script getAll) into store state.
function mapSheetsToState(
  sheets: Record<string, any[][]>,
  current: { competitions: Competition[]; quizConfigs: QuizConfig[] }
): Partial<{ contestants: Contestant[]; competitions: Competition[]; quizConfigs: QuizConfig[]; questions: Question[] }> | null {
  const patch: any = {};

  // ----- المتسابقين -----
  const cRows = pickSheet(sheets, 'بيانات المتسابقين', 'المتسابقين', 'المتسابقون');
  if (cRows && cRows.length > 1) {
    const contestants: Contestant[] = [];
    for (let i = 1; i < cRows.length; i++) {
      const r = cRows[i];
      if (!cell(r, 1) && !cell(r, 2)) continue;
      contestants.push({
        id: cell(r, 0) || `M-${new Date().getFullYear()}-${String(i).padStart(4, '0')}`,
        fullName: cell(r, 1),
        email: cell(r, 2),
        phone: cell(r, 3),
        gender: (cell(r, 4) === 'أنثى' ? 'أنثى' : 'ذكر'),
        secretCode: cell(r, 5) || '123',
        allowedAttempts: Number(cell(r, 6)) || 10,
        status: (['نشط', 'محظور', 'موقوف'].includes(cell(r, 7)) ? cell(r, 7) : 'نشط') as Contestant['status'],
        competitions: cell(r, 8).split(/[،;؛,]/).map((x) => x.trim()).filter(Boolean),
        sendStatus: (cell(r, 9) as Contestant['sendStatus']) || '',
        subscription: (cell(r, 10) === 'مشترك' ? 'مشترك' : 'مجاني'),
        deviceFingerprint: cell(r, 11),
        photoUrl: cell(r, 12),
        note: cell(r, 13),
        registeredAt: cell(r, 14) || new Date().toLocaleString('ar-EG'),
        role: (cell(r, 15) === 'مسؤل' ? 'مسؤل' : cell(r, 15) === 'زائر' ? 'زائر' : 'متسابق'),
      });
    }
    if (contestants.length) patch.contestants = contestants;
  }

  // ----- المسابقات -----
  const compRows = pickSheet(sheets, 'المسابقات');
  if (compRows && compRows.length > 1) {
    const competitions: Competition[] = [];
    for (let i = 1; i < compRows.length; i++) {
      const r = compRows[i];
      const name = cell(r, 0) || cell(r, 1);
      if (!name) continue;
      competitions.push({
        id: 'c-live-' + i,
        name,
        description: cell(r, 1) !== name ? cell(r, 1) : cell(r, 2),
        image: cell(r, 3),
        active: cell(r, 2) !== 'معطلة' && cell(r, 4) !== 'لا',
      });
    }
    if (competitions.length) patch.competitions = competitions;
  }

  // ----- إعدادات الاختبارات -----
  const qcRows = pickSheet(sheets, 'إعدادات الاختبارات', 'اعدادات الاختبارات', 'الاختبارات');
  if (qcRows && qcRows.length > 1) {
    const quizConfigs: QuizConfig[] = [];
    for (let i = 1; i < qcRows.length; i++) {
      const r = qcRows[i];
      const name = cell(r, 0);
      if (!name) continue;
      quizConfigs.push({
        id: 'q-live-' + i,
        name,
        image: cell(r, 1),
        questionCount: Number(cell(r, 2)) || 10,
        duration: Number(cell(r, 3)) || 15,
        status: (cell(r, 4) === 'غير متاح' ? 'غير متاح' : 'متاح'),
        competitions: cell(r, 5).split(/[،;؛,]/).map((x) => x.trim()).filter(Boolean),
        subscribersOnly: cell(r, 6) === 'مشترك' || cell(r, 6) === 'نعم',
        passPercent: Number(cell(r, 7)) || 60,
        defaultLink: cell(r, 8),
      });
    }
    if (quizConfigs.length) patch.quizConfigs = quizConfigs;
  }

  // ----- بنوك الأسئلة -----
  // Structure: each quiz/bank lives in its OWN tab, named exactly like the bank
  // (matching اسم الاختبار in tab "إعدادات الاختبارات").
  // Each bank tab columns: السؤال | رابط صورة | اختيار1..8 | الإجابة الصحيحة | الشرح
  // (a legacy single unified "بنك الأسئلة" tab with a trailing "البنك" column is still supported.)
  const bankNames = (patch.quizConfigs || current.quizConfigs).map((q: QuizConfig) => q.name);
  const questions: Question[] = [];

  const parseBankRows = (rows: any[][], bankName: string, tag: string) => {
    for (let i = 1; i < rows.length; i++) {
      const r = rows[i];
      const text = cell(r, 0);
      if (!text) continue;
      const image = cell(r, 1);
      const opts = [2, 3, 4, 5, 6, 7, 8, 9].map((c) => cell(r, c)).filter((x) => x !== '');
      const answer = cell(r, 10);
      const explanation = cell(r, 11);
      const bankCol = cell(r, 12); // optional override (legacy unified tab)
      if (opts.length < 2) continue;
      let correctIndex = opts.findIndex((o) => o === answer);
      if (correctIndex < 0) {
        const n = parseInt(answer, 10);
        correctIndex = !isNaN(n) && n >= 1 && n <= opts.length ? n - 1 : 0;
      }
      questions.push({
        id: `live-q-${tag}-${i}`,
        bank: bankCol || bankName,
        text, image, options: opts, correctIndex, explanation,
      });
    }
  };

  // 1) one tab per bank (the structure you described)
  bankNames.forEach((bn: string, idx: number) => {
    const rows = pickSheet(sheets, bn);
    if (rows && rows.length > 1) parseBankRows(rows, bn, 'b' + idx);
  });

  // 2) legacy single unified tab (fallback / extra questions)
  const unified = pickSheet(sheets, 'بنك الأسئلة', 'بنك الاسئلة', 'الأسئلة', 'الاسئلة');
  if (unified && unified.length > 1) parseBankRows(unified, bankNames[0] || 'بنك مستورد', 'u');

  if (questions.length) patch.questions = questions;

  return Object.keys(patch).length ? patch : null;
}

export type Theme = 'light' | 'dark';

// Rule-based assistant (no external API needed) — answers about the platform
function normalizeAr(t: string): string {
  return t
    .replace(/[\u064B-\u065F\u0670]/g, '') // tashkeel
    .replace(/[إأآا]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه').replace(/ؤ/g, 'و').replace(/ئ/g, 'ي')
    .replace(/[^\u0600-\u06FF a-zA-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ').trim().toLowerCase();
}

function assistantReply(
  qRaw: string,
  state: { settings: PlatformSettings; competitions: Competition[]; quizConfigs: QuizConfig[]; questions: Question[]; currentUser: Contestant | null; assistantKnowledge: AssistantKnowledge[] }
): string {
  const norm = normalizeAr(qRaw);
  const s = state.settings;
  const has = (...kw: string[]) => kw.some((k) => norm.includes(normalizeAr(k)));

  // 1) ADMIN CUSTOM KNOWLEDGE — highest priority (the admin "teaches" the assistant)
  let bestK: AssistantKnowledge | null = null;
  let bestScore = 0;
  for (const k of state.assistantKnowledge) {
    const kws = k.keywords.split(/[,،\n]/).map((x) => normalizeAr(x)).filter(Boolean);
    let score = 0;
    for (const kw of kws) if (kw && norm.includes(kw)) score += kw.length;
    // also score whole-question similarity
    if (normalizeAr(k.keywords) && norm.includes(normalizeAr(k.keywords).slice(0, 20))) score += 5;
    if (score > bestScore) { bestScore = score; bestK = k; }
  }
  if (bestK && bestScore >= 3) return bestK.answer;

  // 2) DECLINE answering quiz/bank questions politely
  const looksLikeQuiz =
    /؟|\?/.test(qRaw) &&
    (has('ما هو', 'ما هي', 'من هو', 'من هي', 'كم عدد', 'في اي عام', 'متى', 'اين', 'عرف', 'اذكر', 'احسب', 'الاجابه الصحيحه', 'حل السؤال', 'جاوب', 'الحل'));
  // match against actual bank question text
  const matchesBank = state.questions.some((qq) => {
    const nq = normalizeAr(qq.text);
    return nq.length > 8 && (norm.includes(nq.slice(0, 12)) || nq.includes(norm.slice(0, 12)));
  });
  if (looksLikeQuiz || matchesBank) {
    return 'أعتذر منك بكل احترام 🌿 — لا يمكنني الإجابة على أسئلة الاختبارات أو بنك الأسئلة حفاظاً على نزاهة المسابقة وعدالتها بين المتسابقين. لكنني سعيد بمساعدتك في أي شيء آخر يخص المنصة: التسجيل، المحاولات، الشهادات، الاشتراك، أو كيفية المذاكرة من قسم المذكرات والفيديوهات. بالتوفيق! 💪';
  }

  // 3) general platform help
  if (has('سلام', 'اهلا', 'مرحبا', 'هاي', 'hello', 'hi', 'ازيك', 'صباح', 'مساء')) {
    return `وعليكم السلام ورحمة الله 🌿 أنا ${s.assistantName}، مساعدك في منصة ${s.platformName}. اسألني عن المسابقات، الاختبارات، التسجيل، الشهادات، الاشتراك، أو أي شيء يخص المنصة.`;
  }
  if (has('مسابقه', 'مسابقات', 'المسابقه')) {
    const names = state.competitions.filter((c) => c.active).map((c) => '• ' + c.name).join('\n');
    return `المسابقات المتاحة حالياً:\n${names || '— لا توجد مسابقات مفعّلة حالياً —'}\n\nيمكنك التسجيل في أكثر من مسابقة من صفحة إنشاء الحساب أو من ملفك الشخصي.`;
  }
  if (has('كيف ابدا', 'ابدا الاختبار', 'ابدا الامتحان', 'ازاي احل', 'ازاي ابدا', 'طريقه الاختبار', 'شرح الاختبار')) {
    return 'لبدء اختبار: سجّل الدخول → اضغط "الاختبارات" → اختر الاختبار → "ابدأ الاختبار". ستظهر أسئلة عشوائية مختلفة كل مرة، مع عداد زمني. اختر إجابتك ثم "التالي"، أو "تخطّي" (يُحتسب خطأ ويظهر في النهاية). في الختام تحصل على شاشة تحليل بنتيجتك.';
  }
  if (has('اختبار', 'امتحان', 'اسئله', 'الاسئله')) {
    return 'الاختبارات تُسحب أسئلتها عشوائياً من بنك الأسئلة، وكل محاولة تختلف عن السابقة، والاختيارات تُرتّب عشوائياً. لكل اختبار وقت محدد ونسبة نجاح. ابدأ من قسم "الاختبارات".';
  }
  if (has('محاوله', 'محاولات', 'كام مره', 'عدد المرات')) {
    const u = state.currentUser;
    const left = u ? (u.subscription === 'مشترك' || u.role === 'مسؤل' ? 'غير محدودة (مشترك)' : String(u.allowedAttempts)) : 'سجّل الدخول لمعرفتها';
    return `المحاولات الافتراضية 10 لكل حساب جديد، وتُخصم محاولة بعد كل اختبار. محاولاتك المتبقية: ${left}. المشتركون لديهم محاولات غير محدودة.`;
  }
  if (has('شهاده', 'سيرتفيكيت', 'certificate')) {
    return 'بمجرد اجتيازك للاختبار بنسبة النجاح المطلوبة، تظهر شهادتك باسمك في قسم "النتائج والشهادة"، ويمكنك طباعتها أو حفظها PDF.';
  }
  if (has('حظر', 'موقوف', 'مغلق', 'متوقف', 'مش بيفتح', 'محظور')) {
    return 'إذا كان حسابك محظوراً أو موقوفاً، تواصل مع إدارة المنصة عبر زر الواتساب وسيُراجَع حسابك في أقرب وقت.';
  }
  if (has('جهاز', 'بصمه', 'device', 'جهاز تاني', 'جهاز اخر')) {
    return 'يُسمح بالدخول من جهاز واحد فقط لكل حساب لحماية المسابقة. لتغيير الجهاز، تواصل مع الإدارة لمسح بصمة الجهاز القديم.';
  }
  if (has('باسورد', 'الرقم السري', 'نسيت', 'كلمه المرور', 'باسوورد', 'استعاده')) {
    return 'لو نسيت الرقم السري: من صفحة الدخول اضغط "نسيت الرقم السري؟" وأدخل بريدك لاستعادته. ويمكنك أيضاً تغييره لاحقاً من ملفك الشخصي.';
  }
  if (has('مشترك', 'اشتراك', 'ادفع', 'الدفع', 'فلوس', 'سعر', 'مميزات')) {
    return `${s.subscriptionTitle} — ${s.subscriptionPrice}.\nمن مميزات الاشتراك:\n${(s.subscriptionFeatures || []).map((f) => '• ' + f).join('\n')}\n\nللاشتراك تواصل مع الإدارة عبر الواتساب من نافذة الاشتراك.`;
  }
  if (has('تسجيل', 'حساب جديد', 'انشاء حساب', 'اعمل حساب')) {
    return 'لإنشاء حساب: اضغط "حساب جديد" في صفحة الدخول، أدخل اسمك رباعياً، بريدك، رقم الواتساب، رقم سري، اختر النوع والمسابقة/المسابقات. ويمكنك التسجيل بحساب جوجل أو الدخول كزائر بسرعة.';
  }
  if (has('زائر', 'ضيف', 'guest')) {
    return 'الدخول كزائر يتيح لك تجربة المنصة باختبارين فقط بعد اختيار المسابقة. لكل المميزات (محاولات أكثر وشهادات) أنشئ حساباً كاملاً.';
  }
  if (has('مذكره', 'مذكرات', 'فيديو', 'فيديوهات', 'ماده', 'مقالات', 'مقاله', 'اذاكر', 'مراجعه')) {
    return 'تجد في المنصة قسم "المذكرات" و"الفيديوهات" و"المقالات" لمساعدتك على المراجعة والاستعداد للاختبارات. راجعها جيداً قبل خوض الاختبار.';
  }
  if (has('شكرا', 'تمام', 'thanks', 'جزاك', 'تسلم')) {
    return 'العفو 🌟 سعدت بمساعدتك، وبالتوفيق في مسابقاتك بإذن الله!';
  }
  if (has('مسؤل', 'ادمن', 'لوحه التحكم', 'admin')) {
    return 'لوحة التحكم مخصصة لمسؤل المنصة فقط، وتظهر بجانب الاسم بعد تسجيل دخول المسؤول. منها يُدار كل شيء: الإعدادات، الألوان، الاختبارات، الأسئلة، المتسابقين، والاشتراك.';
  }

  return `سؤال جميل! 🌿 أنا هنا لمساعدتك في كل ما يخص منصة ${s.platformName}: المسابقات، الاختبارات، التسجيل، المحاولات، الشهادات، الاشتراك، والمذاكرة. وضّح لي أكثر وسأساعدك فوراً، أو تواصل مع الإدارة عبر الواتساب لأي أمر خاص.`;
}

interface AppState {
  // ----- data (the "sheets") -----
  settings: PlatformSettings;
  contestants: Contestant[];
  competitions: Competition[];
  quizConfigs: QuizConfig[];
  questions: Question[];
  results: QuizResult[];
  comments: CommentItem[];
  notes: NoteItem[];
  videos: VideoItem[];
  articleFolders: ArticleFolder[];
  articles: Article[];
  libraryFolders: LibraryFolder[];
  libraryItems: LibraryItem[];
  chatSessions: ChatSession[];
  assistantKnowledge: AssistantKnowledge[];

  // ----- session -----
  theme: Theme;
  currentUser: Contestant | null;
  hasEnteredJourney: boolean;
  activeCompetition: string | null;

  // ----- actions -----
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  enterJourney: () => void;
  exitJourney: () => void;
  setActiveCompetition: (c: string) => void;

  login: (identifier: string, code: string) => { ok: boolean; msg: string };
  loginGuest: () => { ok: boolean; msg: string };
  register: (data: Partial<Contestant> & { fullName: string; email: string; phone: string; secretCode: string; gender: Contestant['gender']; competitions: string[] }) => { ok: boolean; msg: string; id?: string };
  registerGoogle: (name: string, email: string, photo: string, phone: string, gender: Contestant['gender'], competitions: string[], secretCode?: string) => { ok: boolean; msg: string; needsCompletion?: boolean };
  googleProfileExists: (email: string) => boolean;
  logout: () => void;
  updateProfile: (data: Partial<Contestant>) => void;
  resetPassword: (email: string) => { ok: boolean; msg: string };

  saveResult: (r: Omit<QuizResult, 'id' | 'date'>) => void;
  addComment: (name: string, text: string) => void;

  // admin
  updateSettings: (s: Partial<PlatformSettings>) => void;
  upsertContestant: (c: Contestant) => void;
  deleteContestant: (id: string) => void;
  upsertCompetition: (c: Competition) => void;
  deleteCompetition: (id: string) => void;
  upsertQuiz: (q: QuizConfig) => void;
  deleteQuiz: (id: string) => void;
  upsertQuestion: (q: Question) => void;
  deleteQuestion: (id: string) => void;
  approveComment: (id: string, approved: boolean) => void;
  toggleCommentVip: (id: string, vip: boolean) => void;
  deleteComment: (id: string) => void;
  upsertNote: (n: NoteItem) => void;
  deleteNote: (id: string) => void;
  upsertVideo: (v: VideoItem) => void;
  deleteVideo: (id: string) => void;
  upsertArticleFolder: (f: ArticleFolder) => void;
  deleteArticleFolder: (id: string) => void;
  upsertArticle: (a: Article) => void;
  deleteArticle: (id: string) => void;
  upsertLibraryFolder: (f: LibraryFolder) => void;
  deleteLibraryFolder: (id: string) => void;
  upsertLibraryItem: (i: LibraryItem) => void;
  deleteLibraryItem: (id: string) => void;
  // bulk import
  importQuestions: (bank: string, qs: Omit<Question, 'id' | 'bank'>[], mode: 'replace' | 'append') => void;
  clearBank: (bank: string) => void;
  importContestants: (rows: Partial<Contestant>[]) => number;
  // chat
  sendChat: (text: string) => void;
  adminEditAssistantReply: (sessionId: string, messageId: string, newText: string) => void;
  clearChat: () => void;
  addKnowledge: (keywords: string, answer: string) => void;
  updateKnowledge: (id: string, keywords: string, answer: string) => void;
  deleteKnowledge: (id: string) => void;
  teachFromMessage: (sessionId: string, messageId: string, answer: string) => void;
  // sheets sync
  syncFromSheets: () => Promise<{ ok: boolean; msg: string }>;
  syncAllFromLive: () => Promise<{ ok: boolean; msg: string }>;
  resetAll: () => void;
}

export const useStore = create<AppState>()(
  persist(
    (set, get) => ({
      settings: defaultSettings,
      contestants: defaultContestants,
      competitions: defaultCompetitions,
      quizConfigs: defaultQuizConfigs,
      questions: defaultQuestions,
      results: defaultResults,
      comments: defaultComments,
      notes: defaultNotes,
      videos: defaultVideos,
      articleFolders: defaultArticleFolders,
      articles: defaultArticles,
      libraryFolders: defaultLibraryFolders,
      libraryItems: defaultLibraryItems,
      chatSessions: defaultChatSessions,
      assistantKnowledge: [],

      theme: 'light',
      currentUser: null,
      hasEnteredJourney: false,
      activeCompetition: null,

      setTheme: (t) => set({ theme: t }),
      toggleTheme: () => set({ theme: get().theme === 'light' ? 'dark' : 'light' }),
      enterJourney: () => set({ hasEnteredJourney: true }),
      exitJourney: () => set({ hasEnteredJourney: false }),
      setActiveCompetition: (c) => set({ activeCompetition: c }),

      login: (identifier, code) => {
        const id = identifier.trim().toLowerCase();
        const c = get().contestants.find(
          (x) =>
            x.email.toLowerCase() === id ||
            x.phone === identifier.trim() ||
            x.fullName.toLowerCase() === id
        );
        if (!c) return { ok: false, msg: 'لم يتم العثور على حساب بهذه البيانات' };
        if (c.secretCode !== code) return { ok: false, msg: 'الرقم السري غير صحيح' };
        if (c.status === 'محظور') return { ok: false, msg: 'تم حظر حسابك. برجاء التواصل مع الإدارة.' };
        if (c.status === 'موقوف') return { ok: false, msg: 'تم إيقاف حسابك مؤقتاً. برجاء التواصل مع الإدارة.' };

        // device fingerprint check (skip admin)
        const fp = getDeviceFingerprint();
        if (c.role !== 'مسؤل') {
          if (!c.deviceFingerprint) {
            // first login → register device
            const updated = { ...c, deviceFingerprint: fp };
            set({
              contestants: get().contestants.map((x) => (x.id === c.id ? updated : x)),
              currentUser: updated,
              activeCompetition: updated.competitions[0] || null,
            });
            return { ok: true, msg: 'تم تسجيل الدخول' };
          }
          if (c.deviceFingerprint !== fp) {
            return { ok: false, msg: 'هذا الحساب مفعّل على جهاز آخر. برجاء التواصل مع الإدارة.' };
          }
        }
        set({ currentUser: c, activeCompetition: c.competitions[0] || get().competitions[0]?.name || null });
        return { ok: true, msg: 'تم تسجيل الدخول' };
      },

      loginGuest: () => {
        // fresh guest each time; competitions empty → must choose after entering
        const guest: Contestant = {
          id: 'GUEST', fullName: 'زائر المنصة', email: GUEST_EMAIL, phone: '',
          gender: 'ذكر', secretCode: GUEST_CODE, allowedAttempts: 2, status: 'نشط',
          competitions: [], sendStatus: '',
          subscription: 'مجاني', deviceFingerprint: '', photoUrl: '', note: 'زائر',
          registeredAt: new Date().toLocaleString('ar-EG'), role: 'زائر',
        };
        const others = get().contestants.filter((c) => c.email !== GUEST_EMAIL);
        set({ contestants: [...others, guest], currentUser: guest, activeCompetition: null });
        return { ok: true, msg: 'تم الدخول كزائر' };
      },

      register: (data) => {
        const exists = get().contestants.find(
          (c) => c.email.toLowerCase() === data.email.toLowerCase()
        );
        if (exists) return { ok: false, msg: 'هذا البريد الإلكتروني مسجّل بالفعل' };
        const words = data.fullName.trim().split(/\s+/);
        if (words.length < 3) return { ok: false, msg: 'الاسم يجب أن يكون ثلاثياً على الأقل' };
        const id = nextSerial(get().contestants);
        const newC: Contestant = {
          id,
          fullName: data.fullName.trim(),
          email: data.email.trim(),
          phone: data.phone.trim(),
          gender: data.gender,
          secretCode: data.secretCode,
          allowedAttempts: 10,
          status: 'نشط',
          competitions: data.competitions,
          sendStatus: 'نعم', // simulate email sent
          subscription: 'مجاني',
          deviceFingerprint: getDeviceFingerprint(),
          photoUrl: data.photoUrl || '',
          note: '',
          registeredAt: new Date().toLocaleString('ar-EG'),
          role: 'متسابق',
        };
        set({
          contestants: [...get().contestants, newC],
          currentUser: newC,
          activeCompetition: newC.competitions[0] || null,
        });
        syncContestant(newC, true);
        if (isLiveMode()) {
          sendEmail(newC.email, 'تم تسجيلك في منصة الداعية المفكر',
            `<div dir="rtl">أهلاً ${newC.fullName}،<br/>تم إنشاء حسابك بنجاح. رقمك التسلسلي: <b>${id}</b>.<br/>بالتوفيق في المسابقات!</div>`);
        }
        return { ok: true, msg: 'تم إنشاء الحساب بنجاح', id };
      },

      googleProfileExists: (email) => !!get().contestants.find((c) => c.email.toLowerCase() === email.trim().toLowerCase()),

      registerGoogle: (name, email, photo, phone, gender, competitions, secretCode) => {
        let user = get().contestants.find((c) => c.email.toLowerCase() === email.toLowerCase());
        if (user) {
          // returning Google user → just log in (respect ban/suspend)
          if (user.status === 'محظور') return { ok: false, msg: 'تم حظر حسابك. برجاء التواصل مع الإدارة.' };
          if (user.status === 'موقوف') return { ok: false, msg: 'تم إيقاف حسابك مؤقتاً. برجاء التواصل مع الإدارة.' };
          set({ currentUser: user, activeCompetition: user.competitions[0] || null });
          return { ok: true, msg: 'مرحباً بعودتك' };
        }
        const id = nextSerial(get().contestants);
        user = {
          id, fullName: name, email, phone, gender,
          secretCode: secretCode || Math.random().toString(36).slice(2, 8),
          allowedAttempts: 10, status: 'نشط', competitions,
          sendStatus: 'نعم', subscription: 'مجاني',
          deviceFingerprint: getDeviceFingerprint(), photoUrl: photo, note: 'Google',
          registeredAt: new Date().toLocaleString('ar-EG'), role: 'متسابق',
        };
        set({
          contestants: [...get().contestants, user],
          currentUser: user, activeCompetition: competitions[0] || null,
        });
        return { ok: true, msg: 'تم التسجيل بحساب جوجل' };
      },

      logout: () => set({ currentUser: null, activeCompetition: null, hasEnteredJourney: false }),

      updateProfile: (data) => {
        const u = get().currentUser;
        if (!u) return;
        const updated = { ...u, ...data };
        set({
          currentUser: updated,
          contestants: get().contestants.map((c) => (c.id === u.id ? updated : c)),
        });
        if (updated.role !== 'زائر') syncContestant(updated, false);
      },

      resetPassword: (email) => {
        const c = get().contestants.find((x) => x.email.toLowerCase() === email.trim().toLowerCase());
        if (!c) return { ok: false, msg: 'لا يوجد حساب بهذا البريد' };
        if (isLiveMode()) {
          sendEmail(c.email, 'استعادة الرقم السري — الداعية المفكر',
            `<div dir="rtl">رقمك السري الحالي: <b>${c.secretCode}</b><br/>يمكنك تغييره من صفحة الملف الشخصي بعد الدخول.</div>`);
        }
        return { ok: true, msg: `تم إرسال رابط إعادة تعيين الرقم السري إلى ${email}` };
      },

      saveResult: (r) => {
        const result: QuizResult = {
          ...r,
          id: 'r' + Date.now(),
          date: new Date().toLocaleString('ar-EG'),
        };
        // decrement attempts (not for subscribers)
        const u = get().currentUser;
        let contestants = get().contestants;
        let currentUser = u;
        if (u && u.subscription !== 'مشترك' && u.role !== 'مسؤل') {
          const newAttempts = Math.max(0, u.allowedAttempts - 1);
          currentUser = { ...u, allowedAttempts: newAttempts };
          contestants = contestants.map((c) => (c.id === u.id ? currentUser! : c));
        }
        set({ results: [...get().results, result], contestants, currentUser });
        syncResult(result);
        if (currentUser && currentUser.role !== 'زائر') syncContestant(currentUser, false);
      },

      addComment: (name, text) => {
        const u = get().currentUser;
        const vip = !!u && (u.subscription === 'مشترك');
        const c: CommentItem = {
          id: 'cm' + Date.now(), name, text,
          date: new Date().toLocaleString('ar-EG'), approved: false, vip,
        };
        set({ comments: [...get().comments, c] });
      },

      // ===== admin =====
      updateSettings: (s) => { set({ settings: { ...get().settings, ...s } }); if (isLiveMode()) api('updateSettings', { settings: s }); },
      upsertContestant: (c) => {
        const exists = get().contestants.find((x) => x.id === c.id);
        set({
          contestants: exists
            ? get().contestants.map((x) => (x.id === c.id ? c : x))
            : [...get().contestants, c],
          currentUser: get().currentUser?.id === c.id ? c : get().currentUser,
        });
        syncContestant(c, !exists);
      },
      deleteContestant: (id) => set({ contestants: get().contestants.filter((c) => c.id !== id) }),
      upsertCompetition: (c) => {
        const exists = get().competitions.find((x) => x.id === c.id);
        set({ competitions: exists ? get().competitions.map((x) => (x.id === c.id ? c : x)) : [...get().competitions, c] });
      },
      deleteCompetition: (id) => set({ competitions: get().competitions.filter((c) => c.id !== id) }),
      upsertQuiz: (q) => {
        const exists = get().quizConfigs.find((x) => x.id === q.id);
        set({ quizConfigs: exists ? get().quizConfigs.map((x) => (x.id === q.id ? q : x)) : [...get().quizConfigs, q] });
      },
      deleteQuiz: (id) => set({ quizConfigs: get().quizConfigs.filter((q) => q.id !== id) }),
      upsertQuestion: (q) => {
        const exists = get().questions.find((x) => x.id === q.id);
        set({ questions: exists ? get().questions.map((x) => (x.id === q.id ? q : x)) : [...get().questions, q] });
      },
      deleteQuestion: (id) => set({ questions: get().questions.filter((q) => q.id !== id) }),
      approveComment: (id, approved) =>
        set({ comments: get().comments.map((c) => (c.id === id ? { ...c, approved } : c)) }),
      toggleCommentVip: (id, vip) =>
        set({ comments: get().comments.map((c) => (c.id === id ? { ...c, vip } : c)) }),
      deleteComment: (id) => set({ comments: get().comments.filter((c) => c.id !== id) }),
      upsertNote: (n) => {
        const exists = get().notes.find((x) => x.id === n.id);
        set({ notes: exists ? get().notes.map((x) => (x.id === n.id ? n : x)) : [...get().notes, n] });
      },
      deleteNote: (id) => set({ notes: get().notes.filter((n) => n.id !== id) }),
      upsertVideo: (v) => {
        const exists = get().videos.find((x) => x.id === v.id);
        set({ videos: exists ? get().videos.map((x) => (x.id === v.id ? v : x)) : [...get().videos, v] });
      },
      deleteVideo: (id) => set({ videos: get().videos.filter((v) => v.id !== id) }),
      upsertArticleFolder: (f) => {
        const exists = get().articleFolders.find((x) => x.id === f.id);
        set({ articleFolders: exists ? get().articleFolders.map((x) => (x.id === f.id ? f : x)) : [...get().articleFolders, f] });
      },
      deleteArticleFolder: (id) => set({
        articleFolders: get().articleFolders.filter((f) => f.id !== id),
        articles: get().articles.filter((a) => a.folderId !== id),
      }),
      upsertArticle: (a) => {
        const exists = get().articles.find((x) => x.id === a.id);
        set({ articles: exists ? get().articles.map((x) => (x.id === a.id ? a : x)) : [...get().articles, a] });
      },
      deleteArticle: (id) => set({ articles: get().articles.filter((a) => a.id !== id) }),

      upsertLibraryFolder: (f: LibraryFolder) => {
        const exists = get().libraryFolders.find((x) => x.id === f.id);
        set({ libraryFolders: exists ? get().libraryFolders.map((x) => (x.id === f.id ? f : x)) : [...get().libraryFolders, f] });
      },
      deleteLibraryFolder: (id: string) => {
        const ids = descendantFolderIds(get().libraryFolders, id);
        set({
          libraryFolders: get().libraryFolders.filter((f) => !ids.includes(f.id)),
          libraryItems: get().libraryItems.filter((i) => !i.folderId || !ids.includes(i.folderId)),
        });
      },
      upsertLibraryItem: (i: LibraryItem) => {
        const exists = get().libraryItems.find((x) => x.id === i.id);
        set({ libraryItems: exists ? get().libraryItems.map((x) => (x.id === i.id ? i : x)) : [...get().libraryItems, i] });
      },
      deleteLibraryItem: (id: string) => set({ libraryItems: get().libraryItems.filter((i) => i.id !== id) }),

      importQuestions: (bank, qs, mode) => {
        const others = mode === 'replace'
          ? get().questions.filter((q) => q.bank !== bank)
          : get().questions;
        const startIdx = get().questions.filter((q) => q.bank === bank).length;
        const built: Question[] = qs.map((q, i) => ({
          id: `${bank}-imp-${Date.now()}-${startIdx + i}`,
          bank,
          text: q.text,
          image: q.image || '',
          options: q.options,
          correctIndex: q.correctIndex,
          explanation: q.explanation || '',
        }));
        set({ questions: [...others, ...built] });
        // live: write to the bank's own tab (creates it if missing)
        if (isLiveMode()) {
          const rows = qs.map((q) => {
            const opts = [...q.options];
            while (opts.length < 8) opts.push('');
            return [q.text, q.image || '', ...opts.slice(0, 8), q.options[q.correctIndex] || '', q.explanation || ''];
          });
          api('importQuestions', { bank, rows, replace: mode === 'replace' });
        }
      },
      clearBank: (bank) => set({ questions: get().questions.filter((q) => q.bank !== bank) }),
      importContestants: (rows) => {
        let added = 0;
        let list = [...get().contestants];
        const year = new Date().getFullYear();
        for (const r of rows) {
          if (!r.fullName || !r.email) continue;
          if (list.find((c) => c.email.toLowerCase() === r.email!.toLowerCase())) continue;
          const prefix = `M-${year}-`;
          const nums = list.map((c) => c.id).filter((id) => id.startsWith(prefix)).map((id) => parseInt(id.split('-')[2], 10)).filter((n) => !isNaN(n));
          const id = prefix + String((nums.length ? Math.max(...nums) : 0) + 1).padStart(4, '0');
          list.push({
            id, fullName: r.fullName, email: r.email, phone: r.phone || '',
            gender: (r.gender as any) || 'ذكر', secretCode: r.secretCode || '123',
            allowedAttempts: r.allowedAttempts ?? 10, status: 'نشط',
            competitions: r.competitions || [], sendStatus: 'لا',
            subscription: (r.subscription as any) || 'مجاني', deviceFingerprint: '',
            photoUrl: r.photoUrl || '', note: r.note || 'مستورد',
            registeredAt: new Date().toLocaleString('ar-EG'), role: 'متسابق',
          });
          added++;
        }
        set({ contestants: list });
        return added;
      },

      sendChat: (text) => {
        const u = get().currentUser;
        const userId = u?.id || 'anon';
        const userName = u?.fullName || 'زائر';
        const now = new Date().toLocaleString('ar-EG');
        const userMsg: ChatMessage = { id: 'm' + Date.now(), role: 'user', text, time: now };
        const reply: ChatMessage = { id: 'm' + (Date.now() + 1), role: 'assistant', text: assistantReply(text, get()), time: now };
        const sessions = [...get().chatSessions];
        let session = sessions.find((s) => s.userId === userId);
        if (!session) {
          session = { id: 'sess' + Date.now(), userId, userName, messages: [], updatedAt: now };
          sessions.push(session);
        }
        session.messages = [...session.messages, userMsg, reply];
        session.updatedAt = now;
        set({ chatSessions: sessions.map((s) => (s.userId === userId ? { ...session! } : s)) });
      },
      adminEditAssistantReply: (sessionId, messageId, newText) => set({
        chatSessions: get().chatSessions.map((s) =>
          s.id === sessionId
            ? { ...s, messages: s.messages.map((m) => (m.id === messageId ? { ...m, text: newText } : m)) }
            : s
        ),
      }),
      clearChat: () => {
        const u = get().currentUser;
        set({ chatSessions: get().chatSessions.filter((s) => s.userId !== (u?.id || 'anon')) });
      },
      addKnowledge: (keywords, answer) => set({
        assistantKnowledge: [...get().assistantKnowledge, { id: 'k' + Date.now(), keywords, answer, createdAt: new Date().toLocaleString('ar-EG') }],
      }),
      updateKnowledge: (id, keywords, answer) => set({
        assistantKnowledge: get().assistantKnowledge.map((k) => (k.id === id ? { ...k, keywords, answer } : k)),
      }),
      deleteKnowledge: (id) => set({ assistantKnowledge: get().assistantKnowledge.filter((k) => k.id !== id) }),
      teachFromMessage: (sessionId, messageId, answer) => {
        // find the user question that preceded this assistant message, store as knowledge
        const sess = get().chatSessions.find((s) => s.id === sessionId);
        if (!sess) return;
        const idx = sess.messages.findIndex((m) => m.id === messageId);
        const userQ = idx > 0 ? sess.messages[idx - 1] : null;
        const keywords = userQ ? userQ.text : '';
        get().addKnowledge(keywords, answer);
        // also fix the displayed reply
        get().adminEditAssistantReply(sessionId, messageId, answer);
      },

      syncFromSheets: async () => {
        const s = get().settings;
        let qCount = 0, cCount = 0;
        try {
          if (s.questionsSheetUrl) {
            const csv = await fetchGoogleSheetCSV(s.questionsSheetUrl);
            const parsed = parseQuestionsCSV(csv);
            // import into a bank named after the first quiz, or "بنك مستورد"
            const bank = get().quizConfigs[0]?.name || 'بنك مستورد';
            const others = get().questions.filter((x) => x.bank !== bank);
            const built: Question[] = parsed.map((q, i) => ({
              id: `${bank}-sync-${i}`, bank, text: q.text, image: q.image || '',
              options: q.options, correctIndex: q.correctIndex, explanation: q.explanation || '',
            }));
            set({ questions: [...others, ...built] });
            qCount = built.length;
          }
          if (s.contestantsSheetUrl) {
            const csv = await fetchGoogleSheetCSV(s.contestantsSheetUrl);
            const rows = parseContestantsCSV(csv);
            cCount = get().importContestants(rows);
          }
          if (!s.questionsSheetUrl && !s.contestantsSheetUrl) {
            return { ok: false, msg: 'لم يتم تحديد روابط الشيتات في إعدادات الربط.' };
          }
          return { ok: true, msg: `تمت المزامنة: ${qCount} سؤال و${cCount} متسابق جديد من Google Sheets.` };
        } catch (e: any) {
          return { ok: false, msg: e?.message || 'تعذّرت المزامنة. تأكد أن الشيتات متاحة للقراءة العامة.' };
        }
      },

      // Pull EVERYTHING from the live Apps Script (getAll) so all data is centralized.
      // This is what makes "upload once → works for everyone" possible.
      syncAllFromLive: async () => {
        if (!isLiveMode()) return { ok: false, msg: 'الوضع الحي غير مفعّل.' };
        try {
          const r = await api<Record<string, any[][]>>('getAll');
          if (!r.ok || !r.data) return { ok: false, msg: 'تعذّر جلب البيانات من الشيت.' };
          const sheets = r.data;
          const patch = mapSheetsToState(sheets, get());
          if (patch) set(patch);
          return { ok: true, msg: 'تمت مزامنة كل البيانات من Google Sheets ✅' };
        } catch (e: any) {
          return { ok: false, msg: e?.message || 'تعذّرت المزامنة الكاملة.' };
        }
      },

      resetAll: () => set({
        settings: defaultSettings, contestants: defaultContestants,
        competitions: defaultCompetitions, quizConfigs: defaultQuizConfigs,
        questions: defaultQuestions, results: defaultResults, comments: defaultComments,
        notes: defaultNotes, videos: defaultVideos,
        articleFolders: defaultArticleFolders, articles: defaultArticles,
        libraryFolders: defaultLibraryFolders, libraryItems: defaultLibraryItems,
        chatSessions: [], assistantKnowledge: [], currentUser: null,
        activeCompetition: null, hasEnteredJourney: false,
      }),
    }),
    {
      name: 'elda3ia-platform-v5',
      version: 9,
      // do NOT persist session-only flags so the welcome screen shows on every fresh open
      partialize: (state) => {
        const { hasEnteredJourney, ...rest } = state as any;
        void hasEnteredJourney;
        return rest;
      },
      // ALWAYS deep-merge defaults so any newly-added field/array can never be undefined → no crashes
      merge: (persisted: unknown, current: AppState): AppState => {
        const p = (persisted || {}) as Partial<AppState> & Record<string, any>;
        const safeSettings = { ...defaultSettings, ...(p.settings || {}) };
        // ensure array fields are always arrays
        if (!Array.isArray(safeSettings.subscriptionFeatures)) safeSettings.subscriptionFeatures = defaultSettings.subscriptionFeatures;
        if (!Array.isArray(safeSettings.quizInstructions)) safeSettings.quizInstructions = defaultSettings.quizInstructions;
        if (!Array.isArray(safeSettings.social)) safeSettings.social = defaultSettings.social;
        if (!Array.isArray(safeSettings.sheetSources)) safeSettings.sheetSources = defaultSettings.sheetSources;

        const quizConfigs = Array.isArray(p.quizConfigs)
          ? p.quizConfigs.map((q: any) => ({
              ...q,
              competitions: Array.isArray(q.competitions) ? q.competitions : q.competition ? [q.competition] : [],
            }))
          : current.quizConfigs;
        const questions = Array.isArray(p.questions)
          ? p.questions.map((q: any) => ({ ...q, image: q.image || '', explanation: q.explanation || '' }))
          : current.questions;
        const notes = Array.isArray(p.notes)
          ? p.notes.map((n: any) => ({
              ...n, thumbnail: n.thumbnail || '', subscribersOnly: !!n.subscribersOnly,
              competitions: Array.isArray(n.competitions) ? n.competitions : n.competition ? [n.competition] : [],
            }))
          : current.notes;
        const videos = Array.isArray(p.videos)
          ? p.videos.map((v: any) => ({
              ...v, thumbnail: v.thumbnail || '', subscribersOnly: !!v.subscribersOnly,
              competitions: Array.isArray(v.competitions) ? v.competitions : v.competition ? [v.competition] : [],
            }))
          : current.videos;

        return {
          ...current,
          ...p,
          settings: safeSettings,
          quizConfigs,
          questions,
          notes,
          videos,
          comments: Array.isArray(p.comments)
            ? p.comments.map((c: any) => ({ ...c, vip: !!c.vip }))
            : current.comments,
          chatSessions: Array.isArray(p.chatSessions) ? p.chatSessions : [],
          assistantKnowledge: Array.isArray((p as any).assistantKnowledge) ? (p as any).assistantKnowledge : [],
          articleFolders: Array.isArray(p.articleFolders) ? p.articleFolders : current.articleFolders,
          articles: Array.isArray(p.articles)
            ? p.articles.map((a: any) => ({
                ...a, subscribersOnly: !!a.subscribersOnly,
                competitions: Array.isArray(a.competitions) ? a.competitions : a.competition ? [a.competition] : [],
              }))
            : current.articles,
          libraryFolders: Array.isArray((p as any).libraryFolders) ? (p as any).libraryFolders : current.libraryFolders,
          libraryItems: Array.isArray((p as any).libraryItems) ? (p as any).libraryItems : current.libraryItems,
        };
      },
    }
  )
);
