import type { PlatformSettings, Question } from './types';
import type { Theme } from './store';

// Apply theme CSS variables to :root
export function applyTheme(settings: PlatformSettings, theme: Theme) {
  const root = document.documentElement;
  const map = theme === 'dark'
    ? {
        '--c-primary': settings.darkPrimary,
        '--c-secondary': settings.darkSecondary,
        '--c-accent': settings.darkAccent,
        '--c-bg': settings.darkBg,
        '--c-surface': settings.darkSurface,
        '--c-text': settings.darkText,
        '--c-muted': settings.darkMuted,
      }
    : {
        '--c-primary': settings.lightPrimary,
        '--c-secondary': settings.lightSecondary,
        '--c-accent': settings.lightAccent,
        '--c-bg': settings.lightBg,
        '--c-surface': settings.lightSurface,
        '--c-text': settings.lightText,
        '--c-muted': settings.lightMuted,
      };
  Object.entries(map).forEach(([k, v]) => root.style.setProperty(k, v));
  root.setAttribute('data-theme', theme);
}

// Fisher-Yates shuffle
export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Pick N random questions from a bank, with shuffled options
export interface PreparedQuestion {
  id: string;
  text: string;
  image: string;
  explanation: string;
  options: string[];
  correctIndex: number;
}

export function prepareQuiz(bank: Question[], count: number): PreparedQuestion[] {
  const picked = shuffle(bank).slice(0, Math.min(count, bank.length));
  return picked.map((q) => {
    const correctValue = q.options[q.correctIndex];
    const shuffledOptions = shuffle(q.options);
    return {
      id: q.id,
      text: q.text,
      image: q.image || '',
      explanation: q.explanation || '',
      options: shuffledOptions,
      correctIndex: shuffledOptions.indexOf(correctValue),
    };
  });
}

// Simple Arabic → Latin transliteration for default link slugs
const translitMap: Record<string, string> = {
  'ا': 'a', 'أ': 'a', 'إ': 'i', 'آ': 'a', 'ب': 'b', 'ت': 't', 'ث': 'th',
  'ج': 'j', 'ح': 'h', 'خ': 'kh', 'د': 'd', 'ذ': 'dh', 'ر': 'r', 'ز': 'z',
  'س': 's', 'ش': 'sh', 'ص': 's', 'ض': 'd', 'ط': 't', 'ظ': 'z', 'ع': 'a',
  'غ': 'gh', 'ف': 'f', 'ق': 'q', 'ك': 'k', 'ل': 'l', 'م': 'm', 'ن': 'n',
  'ه': 'h', 'و': 'w', 'ي': 'y', 'ى': 'a', 'ة': 'a', 'ء': '', 'ئ': 'y', 'ؤ': 'w',
};

export function transliterate(text: string): string {
  return text
    .split('')
    .map((ch) => (translitMap[ch] !== undefined ? translitMap[ch] : /[a-zA-Z0-9]/.test(ch) ? ch : ' '))
    .join('')
    .trim()
    .replace(/\s+/g, '-')
    .toLowerCase();
}

export function buildDefaultLink(base: string, quizName: string): string {
  return `${base}/quiz/${transliterate(quizName)}`;
}

export function waLink(phone: string): string {
  const clean = phone.replace(/[^\d]/g, '');
  return `https://wa.me/${clean}`;
}

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Convert ANY YouTube/Vimeo/Drive link into a proper embeddable URL
export function toEmbedUrl(raw: string): string {
  if (!raw) return '';
  const url = raw.trim();

  // already an embed link
  if (/youtube\.com\/embed\//.test(url) || /player\.vimeo\.com/.test(url)) return url;

  // youtu.be/VIDEOID
  let m = url.match(/youtu\.be\/([a-zA-Z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // youtube.com/watch?v=VIDEOID
  m = url.match(/[?&]v=([a-zA-Z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // youtube.com/shorts/VIDEOID
  m = url.match(/youtube\.com\/shorts\/([a-zA-Z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // youtube.com/live/VIDEOID
  m = url.match(/youtube\.com\/live\/([a-zA-Z0-9_-]{6,})/);
  if (m) return `https://www.youtube.com/embed/${m[1]}`;

  // vimeo.com/VIDEOID
  m = url.match(/vimeo\.com\/(\d+)/);
  if (m) return `https://player.vimeo.com/video/${m[1]}`;

  // Google Drive file → preview
  m = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
  if (m) return `https://drive.google.com/file/d/${m[1]}/preview`;

  // fallback: return as-is
  return url;
}

export function isDirectVideoFile(url: string): boolean {
  return /\.(mp4|webm|ogg|mov)(\?.*)?$/i.test(url.trim());
}
