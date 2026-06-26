import { useState } from 'react';
import { useStore } from '../lib/store';
import { useNavigate } from 'react-router-dom';
import {
  Crown, Settings, Users, Trophy, ClipboardList, FileQuestion, MessageSquare,
  FileText, Video, Palette, ShieldAlert, RotateCcw, Database,
} from 'lucide-react';
import Layout from '../components/Layout';
import AdminSettings from '../components/admin/AdminSettings';
import AdminColors from '../components/admin/AdminColors';
import AdminContestants from '../components/admin/AdminContestants';
import AdminCompetitions from '../components/admin/AdminCompetitions';
import AdminQuizzes from '../components/admin/AdminQuizzes';
import AdminQuestions from '../components/admin/AdminQuestions';
import AdminComments from '../components/admin/AdminComments';
import AdminLibrary from '../components/admin/AdminLibrary';
import AdminDisplay from '../components/admin/AdminDisplay';
import AdminSheets from '../components/admin/AdminSheets';
import AdminAssistant from '../components/admin/AdminAssistant';
import AdminSubscription from '../components/admin/AdminSubscription';
import AdminSEO from '../components/admin/AdminSEO';
import AdminBackend from '../components/admin/AdminBackend';
import AdminQuizInstructions from '../components/admin/AdminQuizInstructions';
import { SETTINGS_SHEET_URL, COMPETITIONS_SHEET_URL, DRIVE_FOLDER_URL } from '../lib/defaults';
import { LayoutGrid, Database as DbIcon, Bot, BadgeDollarSign, Search, Cloud, FolderTree, ListChecks } from 'lucide-react';

const tabs = [
  { id: 'settings', label: 'الإعدادات العامة', icon: Settings },
  { id: 'colors', label: 'ألوان المنصة', icon: Palette },
  { id: 'display', label: 'شكل العرض والأوضاع', icon: LayoutGrid },
  { id: 'seo', label: 'إعدادات SEO', icon: Search },
  { id: 'contestants', label: 'المتسابقين', icon: Users },
  { id: 'competitions', label: 'المسابقات', icon: Trophy },
  { id: 'quizzes', label: 'إعدادات الاختبارات', icon: ClipboardList },
  { id: 'quizInstructions', label: 'تعليمات الاختبار', icon: ListChecks },
  { id: 'subscription', label: 'بيانات الاشتراك', icon: BadgeDollarSign },
  { id: 'questions', label: 'بنوك الأسئلة', icon: FileQuestion },
  { id: 'comments', label: 'التعليقات', icon: MessageSquare },
  { id: 'library', label: 'المكتبة (مجلدات)', icon: FolderTree },
  { id: 'assistant', label: 'المساعد الذكي', icon: Bot },
  { id: 'sheets', label: 'روابط الشيتات', icon: DbIcon },
  { id: 'backend', label: 'الربط الحي (Google Sheets)', icon: Cloud },
];

export default function Admin() {
  const { currentUser, resetAll } = useStore();
  const navigate = useNavigate();
  const [tab, setTab] = useState('settings');

  if (!currentUser || currentUser.role !== 'مسؤل') {
    return (
      <Layout>
        <div className="mx-auto max-w-md px-4 py-20 text-center">
          <ShieldAlert className="mx-auto mb-4 text-red-500" size={56} />
          <h1 className="font-display text-2xl font-bold">غير مصرح</h1>
          <p className="mt-2 text-muted">هذه الصفحة مخصصة لمسؤل المنصة فقط.</p>
          <button onClick={() => navigate('/home')} className="mt-6 rounded-xl btn-primary px-6 py-2.5 font-bold">العودة للرئيسية</button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl btn-primary glow"><Crown size={26} /></div>
            <div>
              <h1 className="font-display text-3xl font-extrabold">لوحة تحكم المسؤول</h1>
              <p className="text-muted">إدارة كاملة للمنصة وكل البيانات</p>
            </div>
          </div>
          <button
            onClick={() => { if (confirm('سيتم إعادة كل البيانات للوضع الافتراضي. متابعة؟')) resetAll(); }}
            className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-red-500 hover:border-red-500"
          >
            <RotateCcw size={16} /> إعادة ضبط البيانات
          </button>
        </div>

        {/* sheet links */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <SheetLink href={SETTINGS_SHEET_URL} label="شيت الإعدادات" />
          <SheetLink href={COMPETITIONS_SHEET_URL} label="شيت المسابقات" />
          <SheetLink href={DRIVE_FOLDER_URL} label="مجلد الصور (درايف)" />
        </div>

        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* sidebar tabs */}
          <div className="flex gap-2 overflow-x-auto rounded-2xl surface-card p-2 lg:flex-col lg:overflow-visible">
            {tabs.map((t) => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex shrink-0 items-center gap-3 rounded-xl px-4 py-3 text-right text-sm font-semibold transition lg:w-full ${tab === t.id ? 'btn-primary' : 'text-muted hover:text-primary'}`}
              >
                <t.icon size={18} /> {t.label}
              </button>
            ))}
          </div>

          {/* content */}
          <div className="min-w-0 rounded-2xl surface-card p-6">
            {tab === 'settings' && <AdminSettings />}
            {tab === 'colors' && <AdminColors />}
            {tab === 'contestants' && <AdminContestants />}
            {tab === 'competitions' && <AdminCompetitions />}
            {tab === 'quizzes' && <AdminQuizzes />}
            {tab === 'quizInstructions' && <AdminQuizInstructions />}
            {tab === 'questions' && <AdminQuestions />}
            {tab === 'comments' && <AdminComments />}
            {tab === 'library' && <AdminLibrary />}
            {tab === 'display' && <AdminDisplay />}
            {tab === 'assistant' && <AdminAssistant />}
            {tab === 'subscription' && <AdminSubscription />}
            {tab === 'seo' && <AdminSEO />}
            {tab === 'sheets' && <AdminSheets />}
            {tab === 'backend' && <AdminBackend />}
          </div>
        </div>
      </div>
    </Layout>
  );
}

function SheetLink({ href, label }: { href: string; label: string }) {
  return (
    <a href={href} target="_blank" rel="noreferrer" className="flex items-center gap-3 rounded-xl surface-card px-4 py-3 text-sm font-semibold hover:border-primary">
      <Database size={18} className="text-primary" /> {label}
    </a>
  );
}
