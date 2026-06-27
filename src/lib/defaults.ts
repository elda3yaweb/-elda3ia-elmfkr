import type {
  PlatformSettings, Contestant, Competition, QuizConfig, Question,
  QuizResult, CommentItem, NoteItem, VideoItem,
} from './types';

export const SETTINGS_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1lOIPFJkJ-xIXLqHJJ2CGzuLV0vYG5V3fdVFZyaauBXY';
export const COMPETITIONS_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/18IGOfEIsg2pdPnHpTcd15ozh4mmTAkCK53P9ISifWCM';
export const DRIVE_FOLDER_URL =
  'https://drive.google.com/drive/folders/13MaSIzN677luY7Pz4EzkYyeZhn0TkqW6';

export const GUEST_EMAIL = 'guest@elda3iaelmfkr.com';
export const GUEST_CODE = '123';

export const defaultSettings: PlatformSettings = {
  platformName: 'الداعية المفكر',
  subSlogan: 'elda3ia elmfkr — محاكاة مسابقات الجهاز المركزى للتنظيم والإدارة',
  logoUrl: '/logo.png',
  copyright: '© 2026 منصة الداعية المفكر — جميع الحقوق محفوظة',

  watermarkEnabled: true,
  watermarkType: 'text',
  watermarkText: 'الداعية المفكر',
  watermarkImage: '',
  watermarkOpacity: 0.05,

  welcomeTitle: 'أهلاً بك في منصة الداعية المفكر',
  welcomeDescription:
    'منصة متكاملة للمسابقات الدعوية والمعرفية — اختبر معلوماتك، نافس، واحصل على شهادتك. رحلة من العلم والمتعة في انتظارك.',
  welcomeVideoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  welcomeButtonText: 'ابدأ الرحلة',

  announcementEnabled: true,
  announcementText:
    '🎉 أهلاً بكم في منصة الداعية المفكر — المسابقة الكبرى مفتوحة الآن — سارعوا بالتسجيل وكونوا من الفائزين 🏆',
  announcementColor: '#ffffff',
  announcementBg: '#0f766e',
  announcementSpeed: 22,
  announcementDirection: 'rtl',
  announcementFontSize: 16,
  announcementVertical: false,

  social: [
    { id: 's1', name: 'فيسبوك', url: 'https://facebook.com', icon: 'Facebook', primary: true },
    { id: 's2', name: 'واتساب', url: 'https://wa.me/201000000000', icon: 'MessageCircle', primary: true },
    { id: 's3', name: 'يوتيوب', url: 'https://youtube.com', icon: 'Youtube', primary: false },
    { id: 's4', name: 'تليجرام', url: 'https://telegram.org', icon: 'Send', primary: false },
    { id: 's5', name: 'انستجرام', url: 'https://instagram.com', icon: 'Instagram', primary: false },
    { id: 's6', name: 'تويتر', url: 'https://x.com', icon: 'Twitter', primary: false },
  ],

  lightPrimary: '#0f766e',
  lightSecondary: '#b45309',
  lightAccent: '#0891b2',
  lightBg: '#f4f1ea',
  lightSurface: '#ffffff',
  lightText: '#1c1917',
  lightMuted: '#78716c',

  darkPrimary: '#2dd4bf',
  darkSecondary: '#fbbf24',
  darkAccent: '#22d3ee',
  darkBg: '#0a0f0d',
  darkSurface: '#141b18',
  darkText: '#f5f5f4',
  darkMuted: '#a8a29e',

  quizInstructionsEnabled: true,
  quizInstructionsTitle: 'تعليمات الاختبار',
  quizInstructions: [
    'يرجى التأكد من استقرار اتصال الإنترنت.',
    'بمجرد بدء الاختبار، سيبدأ الوقت في التناقص.',
    'اقرأ كل سؤال بعناية قبل اختيار الإجابة.',
    'اضغط التالي للانتقال إلى السؤال التالي.',
    'لا يمكن العودة للأسئلة السابقة بعد التأكيد.',
    'ستظهر النتيجة تلقائياً فور انتهاء الوقت.',
    'لا تتوقف عند سؤال صعب؛ انتقل للتالي.',
    'النظام مراقب لضمان النزاهة.',
  ],
  quizReadinessQuestion: 'هل أنت مستعد لبدء اختبار مراجعة يومية مع الداعية؟',
  quizStartYesLabel: 'نعم، ابدأ الآن',
  quizStartCancelLabel: 'إلغاء',

  commentsEnabled: true,
  commentsTitle: 'التعليقات',

  cardColumns: 4,
  optionsLayout: 'grid',
  homeHeroText: 'اختبر معلوماتك، نافس، واحصل على شهادتك',
  showStats: true,
  showLeaderboard: true,
  defaultTheme: 'light',

  sheetSources: [
    { id: 'src-settings', label: 'شيت الإعدادات', url: SETTINGS_SHEET_URL, type: 'settings' },
    { id: 'src-comps', label: 'شيت المسابقات', url: COMPETITIONS_SHEET_URL, type: 'competitions' },
  ],

  assistantEnabled: true,
  assistantName: 'مساعد الداعية المفكر',
  assistantWelcome: 'أهلاً بك! أنا مساعدك الذكي في منصة الداعية المفكر. اسألني عن أي شيء يخص المنصة أو المسابقات أو الاختبارات.',

  subscriptionTitle: 'اشترك واحصل على كل المميزات',
  subscriptionPrice: '٥٠ جنيهاً / شهرياً',
  subscriptionFeatures: [
    'دخول غير محدود لكل الاختبارات بما فيها اختبارات المشتركين',
    'محاولات غير محدودة في جميع الاختبارات',
    'أولوية في الدعم والمتابعة من إدارة المنصة',
    'الوصول الكامل للمذكرات والفيديوهات الحصرية',
    'شهادات معتمدة لكل اختبار تجتازه',
  ],
  subscriptionPaymentInfo:
    'طرق الدفع المتاحة:\n• فودافون كاش / محفظة: 01000000000\n• إنستا باي: elda3ia@instapay\n\nبعد الدفع، أرسل صورة الإيصال على الواتساب لتفعيل اشتراكك خلال دقائق.',
  subscriptionWhatsapp: '201000000000',

  seoTitle: 'الداعية المفكر elda3ia elmfkr — منصة محاكاة لمسابقات الجهاز المركزى للتنظيم والإدارة',
  seoDescription:
    'منصة الداعية المفكر: هي منصة تعليمية وقناة رقمية مصرية رائدة متخصصة في تأهيل المتقدمين لاجتياز مسابقات التوظيف الحكومية في مصر، لا سيما اختبارات الجهاز المركزي للتنظيم والإدارة ومسابقات الأزهر الشريف ووزارة الأوقاف و وزارة التربية والتعليم والتعليم الفني.',
  seoKeywords: 'مسابقات الأزهر الشريف,وزارة الأوقاف,التربية والتعليم,معلم حصة,خطباء,الجهاز المركزى للتنظيم والإدارة,الداعية المفكر,elda3ia elmfkr',
  seoImage: '/logo.png',
  seoAuthor: 'الداعية المفكر elda3ia elmfkr',

  googleClientId: '',
  questionsSheetUrl: '',
  contestantsSheetUrl: '',
  autoSyncOnOpen: false,
};

export const defaultChatSessions = [] as import('./types').ChatSession[];

export const defaultCompetitions: Competition[] = [
  { id: 'c1', name: 'مسابقة السيرة النبوية', description: 'في سيرة خير البرية ﷺ', image: '', active: true },
  { id: 'c2', name: 'مسابقة علوم القرآن', description: 'في علوم وأحكام القرآن الكريم', image: '', active: true },
  { id: 'c3', name: 'مسابقة الثقافة الإسلامية', description: 'ثقافة إسلامية عامة', image: '', active: true },
];

export const defaultQuizConfigs: QuizConfig[] = [
  {
    id: 'q1', name: 'بنك السيرة النبوية', image: '', questionCount: 10, duration: 15,
    status: 'متاح', competitions: ['مسابقة السيرة النبوية'], subscribersOnly: false,
    passPercent: 60, defaultLink: '',
  },
  {
    id: 'q2', name: 'بنك علوم القرآن', image: '', questionCount: 12, duration: 20,
    status: 'متاح', competitions: ['مسابقة علوم القرآن'], subscribersOnly: false,
    passPercent: 70, defaultLink: '',
  },
  {
    id: 'q3', name: 'بنك الثقافة الإسلامية', image: '', questionCount: 8, duration: 12,
    status: 'متاح', competitions: ['مسابقة الثقافة الإسلامية'], subscribersOnly: false,
    passPercent: 50, defaultLink: '',
  },
  {
    id: 'q4', name: 'بنك المشتركين المتقدم', image: '', questionCount: 15, duration: 25,
    status: 'متاح', competitions: ['مسابقة علوم القرآن', 'مسابقة السيرة النبوية'], subscribersOnly: true,
    passPercent: 80, defaultLink: '',
  },
];

// ===== Question banks (samples — each bank can hold 1000+) =====
type SeedQ = { text: string; options: string[]; correctIndex: number; image?: string; explanation?: string };
const seerahQ: SeedQ[] = [
  { text: 'في أي عام وُلد النبي محمد ﷺ؟', options: ['عام الفيل', 'عام الحزن', 'عام الوفود', 'عام الفتح'], correctIndex: 0, explanation: 'وُلد ﷺ عام الفيل الذي حاول فيه أبرهة هدم الكعبة.' },
  { text: 'ما اسم أم النبي ﷺ؟', options: ['خديجة', 'آمنة بنت وهب', 'حليمة', 'فاطمة'], correctIndex: 1 },
  { text: 'كم كان عمر النبي ﷺ عند البعثة؟', options: ['30', '35', '40', '45'], correctIndex: 2 },
  { text: 'ما اسم الغار الذي تعبّد فيه النبي ﷺ؟', options: ['غار ثور', 'غار حراء', 'غار الكهف', 'غار النور'], correctIndex: 1 },
  { text: 'من أول من آمن من الرجال؟', options: ['أبو بكر الصديق', 'عمر بن الخطاب', 'علي بن أبي طالب', 'عثمان'], correctIndex: 0 },
  { text: 'في أي مدينة هاجر النبي ﷺ؟', options: ['مكة', 'الطائف', 'المدينة', 'خيبر'], correctIndex: 2 },
  { text: 'كم عدد غزوات النبي ﷺ التي شارك فيها؟', options: ['19', '25', '27', '30'], correctIndex: 2 },
  { text: 'ما أول غزوة كبرى في الإسلام؟', options: ['أحد', 'بدر', 'الخندق', 'حنين'], correctIndex: 1 },
  { text: 'من هو أمين الأمة؟', options: ['أبو عبيدة بن الجراح', 'خالد بن الوليد', 'سعد بن أبي وقاص', 'الزبير'], correctIndex: 0 },
  { text: 'كم سنة عاش النبي ﷺ؟', options: ['60', '63', '65', '70'], correctIndex: 1 },
  { text: 'ما اسم ناقة النبي ﷺ؟', options: ['القصواء', 'العضباء', 'الجدعاء', 'كل ما سبق'], correctIndex: 3 },
  { text: 'في أي شهر فُرض الصيام؟', options: ['شعبان', 'رمضان', 'رجب', 'محرم'], correctIndex: 1 },
];

const quranQ: SeedQ[] = [
  { text: 'كم عدد سور القرآن الكريم؟', options: ['110', '114', '120', '116'], correctIndex: 1 },
  { text: 'ما أطول سورة في القرآن؟', options: ['آل عمران', 'النساء', 'البقرة', 'المائدة'], correctIndex: 2 },
  { text: 'ما أقصر سورة في القرآن؟', options: ['الكوثر', 'الإخلاص', 'العصر', 'الناس'], correctIndex: 0 },
  { text: 'كم عدد أجزاء القرآن؟', options: ['28', '30', '32', '29'], correctIndex: 1 },
  { text: 'ما السورة التي لا تبدأ بالبسملة؟', options: ['الفاتحة', 'التوبة', 'الناس', 'الفلق'], correctIndex: 1 },
  { text: 'ما السورة التي تُسمى قلب القرآن؟', options: ['يس', 'الرحمن', 'الواقعة', 'الملك'], correctIndex: 0 },
  { text: 'في أي سورة آية الكرسي؟', options: ['آل عمران', 'البقرة', 'النساء', 'الأنعام'], correctIndex: 1 },
  { text: 'كم عدد السور المكية تقريباً؟', options: ['86', '90', '70', '100'], correctIndex: 0 },
  { text: 'ما السورة التي تعدل ثلث القرآن؟', options: ['الفاتحة', 'الإخلاص', 'الكافرون', 'النصر'], correctIndex: 1 },
  { text: 'ما أول ما نزل من القرآن؟', options: ['سورة الفاتحة', 'صدر سورة العلق', 'سورة المدثر', 'سورة الناس'], correctIndex: 1 },
];

const cultureQ: SeedQ[] = [
  { text: 'كم عدد أركان الإسلام؟', options: ['4', '5', '6', '7'], correctIndex: 1 },
  { text: 'كم عدد أركان الإيمان؟', options: ['5', '6', '7', '8'], correctIndex: 1 },
  { text: 'ما أول بيت وُضع للناس؟', options: ['المسجد الأقصى', 'الكعبة المشرفة', 'المسجد النبوي', 'مسجد قباء'], correctIndex: 1 },
  { text: 'في أي يوم تُقام صلاة الجمعة؟', options: ['الخميس', 'الجمعة', 'السبت', 'الأحد'], correctIndex: 1 },
  { text: 'كم عدد الصلوات المفروضة يومياً؟', options: ['3', '4', '5', '6'], correctIndex: 2 },
  { text: 'ما اسم الشهر الذي يُفرض فيه الحج؟', options: ['رمضان', 'ذو الحجة', 'محرم', 'شوال'], correctIndex: 1 },
  { text: 'ما الكتاب الذي أُنزل على موسى عليه السلام؟', options: ['الإنجيل', 'الزبور', 'التوراة', 'الصحف'], correctIndex: 2 },
  { text: 'كم عدد أبواب الجنة؟', options: ['7', '8', '6', '5'], correctIndex: 1 },
  { text: 'ما اسم الملك الموكل بالوحي؟', options: ['ميكائيل', 'جبريل', 'إسرافيل', 'عزرائيل'], correctIndex: 1 },
  { text: 'كم مرة ذُكر اسم محمد ﷺ في القرآن؟', options: ['4', '5', '3', '6'], correctIndex: 0 },
];

const advancedQ: SeedQ[] = [
  { text: 'ما عدد آيات سورة البقرة؟', options: ['286', '200', '255', '300'], correctIndex: 0 },
  { text: 'ما السورة التي تُسمى عروس القرآن؟', options: ['الرحمن', 'يس', 'الواقعة', 'الملك'], correctIndex: 0 },
  { text: 'من جمع القرآن في مصحف واحد أولاً؟', options: ['عمر', 'أبو بكر', 'عثمان', 'علي'], correctIndex: 1 },
  { text: 'كم عدد سجدات التلاوة في القرآن؟', options: ['14', '15', '10', '12'], correctIndex: 1 },
  { text: 'ما أول سورة نزلت كاملة؟', options: ['الفاتحة', 'المدثر', 'العلق', 'المزمل'], correctIndex: 0 },
  { text: 'ما السورة التي بها سجدتان؟', options: ['الحج', 'النمل', 'فصلت', 'الانشقاق'], correctIndex: 0 },
  { text: 'من الصحابي الملقب بترجمان القرآن؟', options: ['ابن مسعود', 'ابن عباس', 'أبي بن كعب', 'زيد بن ثابت'], correctIndex: 1 },
  { text: 'كم سنة استغرق نزول القرآن؟', options: ['20', '23', '25', '13'], correctIndex: 1 },
];

function buildBank(bank: string, arr: Array<{ text: string; options: string[]; correctIndex: number; image?: string; explanation?: string }>): Question[] {
  return arr.map((q, i) => ({
    id: `${bank}-${i}`,
    bank,
    text: q.text,
    image: q.image || '',
    options: q.options,
    correctIndex: q.correctIndex,
    explanation: q.explanation || '',
  }));
}

export const defaultQuestions: Question[] = [
  ...buildBank('بنك السيرة النبوية', seerahQ),
  ...buildBank('بنك علوم القرآن', quranQ),
  ...buildBank('بنك الثقافة الإسلامية', cultureQ),
  ...buildBank('بنك المشتركين المتقدم', advancedQ),
];

export const defaultContestants: Contestant[] = [
  {
    id: 'M-2026-0001', fullName: 'مسؤل المنصة العام', email: 'admin@elda3iaelmfkr.com',
    phone: '201000000000', gender: 'ذكر', secretCode: 'admin', allowedAttempts: 9999,
    status: 'نشط', competitions: ['مسابقة السيرة النبوية'], sendStatus: 'نعم',
    subscription: 'مشترك', deviceFingerprint: '', photoUrl: '', note: '',
    registeredAt: new Date().toLocaleString('ar-EG'), role: 'مسؤل',
  },
  {
    id: 'M-2026-0002', fullName: 'أحمد محمد علي حسن', email: 'ahmed@example.com',
    phone: '201111111111', gender: 'ذكر', secretCode: '1234', allowedAttempts: 8,
    status: 'نشط', competitions: ['مسابقة السيرة النبوية', 'مسابقة علوم القرآن'],
    sendStatus: 'نعم', subscription: 'مشترك', deviceFingerprint: '', photoUrl: '',
    note: '', registeredAt: new Date().toLocaleString('ar-EG'), role: 'متسابق',
  },
  {
    id: 'M-2026-0003', fullName: 'فاطمة سعيد إبراهيم محمود', email: 'fatma@example.com',
    phone: '201222222222', gender: 'أنثى', secretCode: '5678', allowedAttempts: 10,
    status: 'نشط', competitions: ['مسابقة الثقافة الإسلامية'], sendStatus: 'لا',
    subscription: 'مجاني', deviceFingerprint: '', photoUrl: '',
    note: '', registeredAt: new Date().toLocaleString('ar-EG'), role: 'متسابق',
  },
];

export const defaultResults: QuizResult[] = [
  {
    id: 'r1', contestantId: 'M-2026-0002', contestantName: 'أحمد محمد علي حسن',
    quizName: 'بنك السيرة النبوية', competition: 'مسابقة السيرة النبوية',
    score: 9, total: 10, percent: 90, passed: true,
    date: new Date(Date.now() - 86400000).toLocaleString('ar-EG'), durationUsed: 7,
  },
  {
    id: 'r2', contestantId: 'M-2026-0003', contestantName: 'فاطمة سعيد إبراهيم محمود',
    quizName: 'بنك الثقافة الإسلامية', competition: 'مسابقة الثقافة الإسلامية',
    score: 7, total: 8, percent: 88, passed: true,
    date: new Date(Date.now() - 172800000).toLocaleString('ar-EG'), durationUsed: 5,
  },
  {
    id: 'r3', contestantId: 'M-2026-0002', contestantName: 'أحمد محمد علي حسن',
    quizName: 'بنك علوم القرآن', competition: 'مسابقة علوم القرآن',
    score: 11, total: 12, percent: 92, passed: true,
    date: new Date(Date.now() - 43200000).toLocaleString('ar-EG'), durationUsed: 14,
  },
];

export const defaultComments: CommentItem[] = [
  { id: 'cm1', name: 'أحمد محمد', text: 'منصة رائعة جزاكم الله خيراً، استفدت كثيراً!', date: new Date().toLocaleString('ar-EG'), approved: true, vip: true },
  { id: 'cm2', name: 'فاطمة سعيد', text: 'الأسئلة مميزة والتصميم جميل جداً ما شاء الله.', date: new Date().toLocaleString('ar-EG'), approved: true, vip: false },
];

export const defaultNotes: NoteItem[] = [
  { id: 'n1', title: 'مذكرة السيرة النبوية', description: 'ملخص شامل لأهم أحداث السيرة', fileUrl: '#', thumbnail: '', competitions: ['مسابقة السيرة النبوية'], subscribersOnly: false },
  { id: 'n2', title: 'مذكرة علوم القرآن', description: 'أساسيات علوم القرآن الكريم', fileUrl: '#', thumbnail: '', competitions: ['مسابقة علوم القرآن'], subscribersOnly: true },
  { id: 'n3', title: 'دليل المنصة العام', description: 'مرجع متاح لكل المسابقات', fileUrl: '#', thumbnail: '', competitions: [], subscribersOnly: false },
];

export const defaultVideos: VideoItem[] = [
  { id: 'v1', title: 'مقدمة في السيرة النبوية', description: 'فيديو تعريفي', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: '', competitions: ['مسابقة السيرة النبوية'], subscribersOnly: false },
  { id: 'v2', title: 'دروس في علوم القرآن', description: 'سلسلة تعليمية', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnail: '', competitions: ['مسابقة علوم القرآن'], subscribersOnly: true },
];

export const defaultArticleFolders: import('./types').ArticleFolder[] = [
  { id: 'f1', name: 'شروحات السيرة النبوية', description: 'مقالات وشروحات في السيرة', competition: 'مسابقة السيرة النبوية' },
  { id: 'f2', name: 'شروحات علوم القرآن', description: 'مقالات في علوم القرآن', competition: 'مسابقة علوم القرآن' },
];

export const defaultArticles: import('./types').Article[] = [
  {
    id: 'a1', folderId: 'f1', title: 'نشأة النبي محمد ﷺ', cover: '', mode: 'rich',
    html: '<h2>نشأة النبي ﷺ</h2><p>وُلد النبي محمد ﷺ في <strong>عام الفيل</strong> بمكة المكرمة، ونشأ يتيماً في كنف جده عبد المطلب ثم عمه أبي طالب.</p><ul><li>كفلته حليمة السعدية في البادية.</li><li>عُرف بالصادق الأمين قبل البعثة.</li></ul><blockquote>وإنك لعلى خلق عظيم</blockquote>',
    externalUrl: '', competitions: ['مسابقة السيرة النبوية'], subscribersOnly: false, createdAt: new Date().toLocaleString('ar-EG'),
  },
  {
    id: 'a2', folderId: 'f2', title: 'مقال خارجي: مدخل لعلوم القرآن', cover: '', mode: 'link',
    html: '', externalUrl: 'https://ar.wikipedia.org/wiki/علوم_القرآن',
    competitions: ['مسابقة علوم القرآن'], subscribersOnly: true, createdAt: new Date().toLocaleString('ar-EG'),
  },
];

// ===== Unified nested library (folders within folders) =====
const now = () => new Date().toLocaleString('ar-EG');
export const defaultLibraryFolders: import('./types').LibraryFolder[] = [
  // notes section
  { id: 'lf-n1', section: 'notes', name: 'مذكرات السيرة النبوية', description: 'كل ما يخص السيرة', parentId: null, competitions: ['مسابقة السيرة النبوية'], subscribersOnly: false },
  { id: 'lf-n1-1', section: 'notes', name: 'المرحلة المكية', description: 'مذكرات الفترة المكية', parentId: 'lf-n1', competitions: [], subscribersOnly: false },
  { id: 'lf-n1-1-1', section: 'notes', name: 'بداية الوحي', description: '', parentId: 'lf-n1-1', competitions: [], subscribersOnly: false },
  { id: 'lf-n2', section: 'notes', name: 'مذكرات علوم القرآن', description: '', parentId: null, competitions: ['مسابقة علوم القرآن'], subscribersOnly: false },
  // videos section
  { id: 'lf-v1', section: 'videos', name: 'فيديوهات السيرة النبوية', description: '', parentId: null, competitions: ['مسابقة السيرة النبوية'], subscribersOnly: false },
  { id: 'lf-v1-1', section: 'videos', name: 'الغزوات', description: 'سلسلة الغزوات', parentId: 'lf-v1', competitions: [], subscribersOnly: false },
  // articles (شرح) section
  { id: 'lf-a1', section: 'articles', name: 'شروحات عامة', description: 'مقالات وشروحات', parentId: null, competitions: [], subscribersOnly: false },
  { id: 'lf-a1-1', section: 'articles', name: 'مفاهيم أساسية', description: '', parentId: 'lf-a1', competitions: [], subscribersOnly: false },
];

export const defaultLibraryItems: import('./types').LibraryItem[] = [
  { id: 'li-n1', section: 'notes', folderId: 'lf-n1-1-1', title: 'مذكرة بداية الوحي', description: 'ملخص نزول الوحي في غار حراء', kind: 'file', url: '#', html: '', cover: '', competitions: [], subscribersOnly: false, createdAt: now() },
  { id: 'li-n2', section: 'notes', folderId: 'lf-n2', title: 'مذكرة المكي والمدني', description: 'الفرق بين المكي والمدني', kind: 'file', url: '#', html: '', cover: '', competitions: [], subscribersOnly: false, createdAt: now() },
  { id: 'li-v1', section: 'videos', folderId: 'lf-v1-1', title: 'غزوة بدر الكبرى', description: 'فيديو تعليمي', kind: 'video', url: 'https://www.youtube.com/embed/dQw4w9WgXcQ', html: '', cover: '', competitions: [], subscribersOnly: false, createdAt: now() },
  { id: 'li-a1', section: 'articles', folderId: 'lf-a1-1', title: 'شرح: معنى التوحيد', description: 'مقال مكتوب', kind: 'rich', url: '', html: '<h2>معنى التوحيد</h2><p>التوحيد هو إفراد الله تعالى بالعبادة، وهو أصل الدين ولبّ الرسالة.</p><ul><li>توحيد الربوبية</li><li>توحيد الألوهية</li><li>توحيد الأسماء والصفات</li></ul>', cover: '', competitions: [], subscribersOnly: false, createdAt: now() },
  { id: 'li-a2', section: 'articles', folderId: null, title: 'مقال خارجي: أركان الإسلام', description: 'رابط مرجعي', kind: 'link', url: 'https://ar.wikipedia.org/wiki/أركان_الإسلام', html: '', cover: '', competitions: [], subscribersOnly: false, createdAt: now() },
];
