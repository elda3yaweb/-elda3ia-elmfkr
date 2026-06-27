// ===== Core Types for منصة الداعية المفكر =====

export type Lang = 'ar';

export interface SocialIcon {
  id: string;
  name: string;
  url: string;
  icon: string; // lucide icon name
  primary: boolean; // shown by default (first 2)
}

export interface PlatformSettings {
  // Identity
  platformName: string;
  subSlogan: string;
  logoUrl: string;
  copyright: string;

  // Watermark
  watermarkEnabled: boolean;
  watermarkType: 'text' | 'image';
  watermarkText: string;
  watermarkImage: string;
  watermarkOpacity: number;

  // Welcome screen
  welcomeTitle: string;
  welcomeDescription: string;
  welcomeVideoUrl: string;
  welcomeButtonText: string;

  // Announcement bar (شريط الإعلان)
  announcementEnabled: boolean;
  announcementText: string;
  announcementColor: string;
  announcementBg: string;
  announcementSpeed: number; // seconds per loop
  announcementDirection: 'rtl' | 'ltr';
  announcementFontSize: number;
  announcementVertical: boolean;

  // Social
  social: SocialIcon[];

  // Theme colors - LIGHT
  lightPrimary: string;
  lightSecondary: string;
  lightAccent: string;
  lightBg: string;
  lightSurface: string;
  lightText: string;
  lightMuted: string;

  // Theme colors - DARK
  darkPrimary: string;
  darkSecondary: string;
  darkAccent: string;
  darkBg: string;
  darkSurface: string;
  darkText: string;
  darkMuted: string;

  // Quiz instructions (shown ONLY when starting a quiz)
  quizInstructionsEnabled: boolean;
  quizInstructionsTitle: string;
  quizInstructions: string[];
  quizReadinessQuestion: string;
  quizStartYesLabel: string;
  quizStartCancelLabel: string;

  // Comments
  commentsEnabled: boolean;
  commentsTitle: string;

  // Display / layout (admin controlled)
  cardColumns: number;
  optionsLayout: 'grid' | 'list';
  homeHeroText: string;
  showStats: boolean;
  showLeaderboard: boolean;
  defaultTheme: 'light' | 'dark';

  // External registered sheets
  sheetSources: SheetSource[];

  // AI assistant
  assistantEnabled: boolean;
  assistantName: string;
  assistantWelcome: string;

  // Subscription (controlled from admin)
  subscriptionTitle: string;
  subscriptionPrice: string;
  subscriptionFeatures: string[];
  subscriptionPaymentInfo: string;
  subscriptionWhatsapp: string;

  // SEO / Meta
  seoTitle: string;
  seoDescription: string;
  seoKeywords: string;
  seoImage: string;
  seoAuthor: string;

  // Google integration (controlled from admin)
  googleClientId: string;       // real Google Sign-In client id
  questionsSheetUrl: string;    // read questions on open
  contestantsSheetUrl: string;  // read contestants on open
  autoSyncOnOpen: boolean;
}

export type Gender = 'ذكر' | 'أنثى';
export type AccountStatus = 'نشط' | 'محظور' | 'موقوف';
export type SubscriptionType = 'مجاني' | 'مشترك';

export interface Contestant {
  id: string;            // M-2026-0001
  fullName: string;      // رباعي
  email: string;
  phone: string;         // واتساب
  gender: Gender;
  secretCode: string;
  allowedAttempts: number;
  status: AccountStatus;
  competitions: string[]; // اسم المسابقة (multiple)
  sendStatus: 'نعم' | 'لا' | '';
  subscription: SubscriptionType;
  deviceFingerprint: string;
  photoUrl: string;
  note: string;
  registeredAt: string;
  role: 'مسؤل' | 'متسابق' | 'زائر';
}

export interface Competition {
  id: string;
  name: string;
  description: string;
  image: string;
  active: boolean;
}

export interface QuizConfig {
  id: string;
  name: string;          // اسم الاختبار / بنك الأسئلة
  image: string;
  questionCount: number; // عدد الأسئلة المسحوبة
  duration: number;      // وقت الاختبار بالدقائق
  status: 'متاح' | 'غير متاح';
  competitions: string[]; // اسم المسابقة (يمكن أكثر من مسابقة)
  subscribersOnly: boolean;
  passPercent: number;
  defaultLink: string;
}

export interface Question {
  id: string;
  bank: string;          // اسم البنك = اسم الاختبار
  text: string;
  image: string;         // رابط صورة السؤال (اختياري)
  options: string[];     // حتى 8 اختيارات
  correctIndex: number;
  explanation: string;   // شرح الإجابة
}

export interface QuizResult {
  id: string;
  contestantId: string;
  contestantName: string;
  quizName: string;
  competition: string;
  score: number;
  total: number;
  percent: number;
  passed: boolean;
  date: string;
  durationUsed: number;
}

export interface CommentItem {
  id: string;
  name: string;
  text: string;
  date: string;
  approved: boolean;
  vip: boolean;        // true if author is a subscriber (مشترك)
}

export interface NoteItem {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  thumbnail: string;        // optional preview image
  competitions: string[];   // [] = كل المسابقات، أو واحدة/أكثر محددة
  subscribersOnly: boolean; // للمشتركين فقط
}

export interface VideoItem {
  id: string;
  title: string;
  description: string;
  url: string;              // embeddable url
  thumbnail: string;        // optional preview image
  competitions: string[];   // [] = كل المسابقات، أو واحدة/أكثر محددة
  subscribersOnly: boolean; // للمشتركين فقط
}

// ===== Articles / explanations section =====
export interface ArticleFolder {
  id: string;
  name: string;
  description: string;
  competition: string; // optional association
}

export interface Article {
  id: string;
  folderId: string;
  title: string;
  cover: string;          // optional cover image url
  mode: 'rich' | 'link'; // written/pasted content OR external link
  html: string;           // rich HTML content
  externalUrl: string;    // article link
  competitions: string[]; // [] = كل المسابقات، أو واحدة/أكثر محددة
  subscribersOnly: boolean; // للمشتركين فقط
  createdAt: string;
}

// ===== Unified nested library (folders within folders, infinite depth) =====
// Used by 3 sections: notes (مذكرات), videos (فيديوهات), articles (شرح)
export type LibrarySection = 'notes' | 'videos' | 'articles';

export interface LibraryFolder {
  id: string;
  section: LibrarySection;
  name: string;
  description: string;
  parentId: string | null;   // null = root of its section
  competitions: string[];    // [] = all
  subscribersOnly: boolean;
}

export interface LibraryItem {
  id: string;
  section: LibrarySection;
  folderId: string | null;   // null = root level of section
  title: string;
  description: string;
  // content varies by section/type
  kind: 'file' | 'video' | 'rich' | 'link';
  url: string;               // file url / video embed / external link
  html: string;              // rich text (for شرح)
  cover: string;             // optional cover/thumbnail
  competitions: string[];    // [] = all
  subscribersOnly: boolean;
  createdAt: string;
}

// ===== AI Assistant chat =====
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  time: string;
}

export interface ChatSession {
  id: string;
  userId: string;
  userName: string;
  messages: ChatMessage[];
  updatedAt: string;
}

// ===== custom knowledge the admin teaches the assistant =====
export interface AssistantKnowledge {
  id: string;
  keywords: string;   // كلمات مفتاحية مفصولة بفواصل
  answer: string;
  createdAt: string;
}

// ===== external sheet sources registered by admin =====
export interface SheetSource {
  id: string;
  label: string;
  url: string;
  type: 'names' | 'questions' | 'settings' | 'competitions' | 'other';
}

// ===== display / layout settings controlled by admin =====
export interface DisplaySettings {
  cardColumns: number;      // عدد الكروت بالصف
  optionsLayout: 'grid' | 'list'; // شكل عرض الاختيارات على الديسктоп
  homeHeroText: string;     // نص يظهر في الرئيسية
  showStats: boolean;
  showLeaderboard: boolean;
  defaultTheme: 'light' | 'dark';
}
