import { useState, useEffect } from 'react';
import { getWebAppUrl, setWebAppUrl, testConnection, isLiveMode, api } from '../../lib/api';
import { APPS_SCRIPT_CODE } from '../../lib/appsScript';
import { useStore } from '../../lib/store';
import { Cloud, CloudOff, Copy, Check, Download, Wifi, FileCode, RefreshCw, AlertTriangle, Chrome } from 'lucide-react';

export default function AdminBackend() {
  const { settings, updateSettings, syncFromSheets } = useStore();
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<{ ok: boolean; msg: string } | null>(null);
  const [testing, setTesting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [live, setLive] = useState(false);

  // Google Sign-In + CSV sheet read (lightweight alternative to Apps Script)
  const [clientId, setClientId] = useState(settings.googleClientId);
  const [qSheet, setQSheet] = useState(settings.questionsSheetUrl);
  const [cSheet, setCSheet] = useState(settings.contestantsSheetUrl);
  const [autoSync, setAutoSync] = useState(settings.autoSyncOnOpen);
  const [gSaved, setGSaved] = useState(false);
  const [csvMsg, setCsvMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [csvBusy, setCsvBusy] = useState(false);

  const saveGoogle = () => {
    updateSettings({ googleClientId: clientId, questionsSheetUrl: qSheet, contestantsSheetUrl: cSheet, autoSyncOnOpen: autoSync });
    setGSaved(true); setTimeout(() => setGSaved(false), 3000);
  };
  const csvSyncNow = async () => {
    updateSettings({ questionsSheetUrl: qSheet, contestantsSheetUrl: cSheet });
    setCsvBusy(true); setCsvMsg(null);
    const r = await syncFromSheets();
    setCsvMsg({ ok: r.ok, text: r.msg });
    setCsvBusy(false);
  };

  useEffect(() => { setUrl(getWebAppUrl()); setLive(isLiveMode()); }, []);

  const connect = async () => {
    if (!url.trim()) return;
    setTesting(true); setStatus(null);
    const r = await testConnection(url.trim());
    setStatus({ ok: r.ok, msg: r.message });
    setLive(isLiveMode());
    setTesting(false);
  };

  const disconnect = () => {
    setWebAppUrl('');
    setUrl('');
    setLive(false);
    setStatus({ ok: true, msg: 'تم قطع الاتصال — المنصة الآن في الوضع المحلي (Offline).' });
  };

  const copyCode = () => {
    navigator.clipboard.writeText(APPS_SCRIPT_CODE);
    setCopied(true); setTimeout(() => setCopied(false), 2500);
  };

  const downloadCode = () => {
    const blob = new Blob([APPS_SCRIPT_CODE], { type: 'text/javascript;charset=utf-8' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = 'elda3ia-apps-script.gs'; a.click();
  };

  const syncNow = async () => {
    setTesting(true);
    const r = await api('getAll');
    setStatus({ ok: r.ok, msg: r.ok ? 'تمت مزامنة البيانات من الشيت بنجاح ✅' : 'تعذّرت المزامنة. تأكد من الاتصال.' });
    setTesting(false);
  };

  return (
    <div>
      {/* status banner */}
      <div className={`mb-6 flex items-center gap-3 rounded-2xl p-5 ${live ? 'bg-green-500/12' : 'bg-amber-500/12'}`}>
        {live ? <Cloud className="text-green-600" size={32} /> : <CloudOff className="text-amber-600" size={32} />}
        <div>
          <p className={`font-display text-lg font-bold ${live ? 'text-green-600' : 'text-amber-600'}`}>
            {live ? 'الوضع الحي مُفعّل (متصل بـ Google Sheets)' : 'الوضع المحلي (Offline)'}
          </p>
          <p className="text-sm text-muted">
            {live
              ? 'كل التعديلات تُحفظ في الشيت والدرايف فعلياً، والإيميلات تُرسل من Gmail.'
              : 'البيانات محفوظة في هذا المتصفح فقط. فعّل الوضع الحي للربط الفعلي بالشيت.'}
          </p>
        </div>
      </div>

      {/* connection */}
      <div className="mb-6 rounded-2xl border border-line p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Wifi size={20} className="text-primary" /> رابط الربط الحي (Web App URL)</h3>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://script.google.com/macros/s/..../exec" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
          <button onClick={connect} disabled={testing} className="shrink-0 rounded-xl btn-primary px-6 py-2.5 font-bold disabled:opacity-50">
            {testing ? 'جارٍ...' : 'اتصال'}
          </button>
        </div>
        {status && <div className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold ${status.ok ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>{status.msg}</div>}
        {live && (
          <div className="mt-3 flex gap-2">
            <button onClick={syncNow} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-primary"><RefreshCw size={16} /> مزامنة الآن</button>
            <button onClick={disconnect} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold text-red-500"><CloudOff size={16} /> قطع الاتصال</button>
          </div>
        )}
      </div>

      {/* steps */}
      <div className="mb-6 rounded-2xl border border-line p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><FileCode size={20} className="text-primary" /> خطوات التفعيل (مرة واحدة)</h3>
        <ol className="space-y-2.5 text-sm">
          {[
            'انسخ كود Apps Script بالأسفل (زر "نسخ الكود").',
            'افتح شيت المسابقات → Extensions → Apps Script.',
            'الصق الكود كاملاً، واحفظ، وعدّل أرقام الشيتات والدرايف بالأعلى إن لزم.',
            'اضغط Deploy → New deployment → اختر النوع Web app.',
            'في "Execute as" اختر Me، وفي "Who has access" اختر Anyone.',
            'انسخ رابط Web App والصقه بالأعلى ثم اضغط "اتصال".',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full btn-primary text-xs font-bold">{i + 1}</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="mt-3 flex items-start gap-2 rounded-xl bg-amber-500/10 p-3 text-xs text-amber-700">
          <AlertTriangle size={16} className="mt-0.5 shrink-0" />
          عند أول نشر سيطلب جوجل تفويض الصلاحيات (Authorize) — اقبلها، فهي صلاحياتك أنت على شيتك ودرايفك.
        </div>
      </div>

      {/* code */}
      <div className="rounded-2xl border border-line p-5">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-display text-lg font-bold"><FileCode size={20} className="text-primary" /> كود Google Apps Script</h3>
          <div className="flex gap-2">
            <button onClick={copyCode} className="flex items-center gap-2 rounded-xl btn-primary px-4 py-2 text-sm font-bold">{copied ? <><Check size={16} /> تم النسخ</> : <><Copy size={16} /> نسخ الكود</>}</button>
            <button onClick={downloadCode} className="flex items-center gap-2 rounded-xl border border-line px-4 py-2 text-sm font-bold"><Download size={16} /> تحميل</button>
          </div>
        </div>
        <pre className="max-h-80 overflow-auto rounded-xl bg-[#0d1117] p-4 text-xs leading-relaxed text-[#c9d1d9]" dir="ltr"><code>{APPS_SCRIPT_CODE}</code></pre>
      </div>

      {/* Google Sign-In + lightweight CSV read */}
      <div className="mt-6 rounded-2xl border border-line p-5">
        <h3 className="mb-3 flex items-center gap-2 font-display text-lg font-bold"><Chrome size={20} className="text-primary" /> تسجيل جوجل الحقيقي + قراءة الشيت (CSV)</h3>
        <p className="mb-3 text-sm text-muted">
          بديل خفيف للقراءة بدون Apps Script: يكفي أن يكون الشيت منشوراً/عاماً للقراءة. ولتفعيل زر "التسجيل بحساب جوجل"، أضف Client ID.
        </p>
        {/* How to get the Client ID */}
        <details className="mb-4 rounded-xl bg-[color-mix(in_srgb,var(--c-primary)_7%,transparent)] p-4 text-sm">
          <summary className="cursor-pointer font-bold text-primary">كيف أحصل على Google OAuth Client ID؟ (اضغط للشرح)</summary>
          <ol className="mt-3 space-y-2">
            {[
              'افتح console.cloud.google.com وسجّل دخول بحساب جوجل.',
              'من الأعلى أنشئ مشروعاً جديداً (New Project) وسمّه مثلاً "الداعية المفكر".',
              'من القائمة الجانبية: APIs & Services → OAuth consent screen، اختر External ثم املأ اسم التطبيق وبريدك واحفظ.',
              'ثم: APIs & Services → Credentials → Create Credentials → OAuth client ID.',
              'اختر نوع التطبيق: Web application.',
              'في "Authorized JavaScript origins" أضف رابط منصتك (مثل https://اسم-منصتك.vercel.app) وأيضاً http://localhost:5173 للتجربة.',
              'اضغط Create — سيظهر لك Client ID بالشكل xxxx.apps.googleusercontent.com، انسخه والصقه بالأسفل.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full btn-primary text-[10px] font-bold">{i + 1}</span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noreferrer" className="mt-3 inline-block font-bold text-primary underline">فتح صفحة Credentials مباشرة ↗</a>
        </details>

        <div className="space-y-3">
          <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">Google OAuth Client ID</span>
            <input value={clientId} onChange={(e) => setClientId(e.target.value)} placeholder="xxxx.apps.googleusercontent.com" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
          </label>
          <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">رابط شيت بنك الأسئلة</span>
            <input value={qSheet} onChange={(e) => setQSheet(e.target.value)} placeholder="رابط Google Sheet للأسئلة" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
          </label>
          <label className="block"><span className="mb-1 block text-sm font-semibold text-muted">رابط شيت المتسابقين</span>
            <input value={cSheet} onChange={(e) => setCSheet(e.target.value)} placeholder="رابط Google Sheet للمتسابقين" className="w-full rounded-xl px-4 py-2.5 text-sm outline-none" dir="ltr" />
          </label>
          <label className="flex cursor-pointer items-center justify-between rounded-xl border border-line px-4 py-3 text-sm font-semibold">
            مزامنة تلقائية عند فتح المنصة
            <input type="checkbox" checked={autoSync} onChange={(e) => setAutoSync(e.target.checked)} className="h-5 w-5" />
          </label>
        </div>
        <div className="mt-4 flex flex-wrap items-center gap-3">
          <button onClick={saveGoogle} className="rounded-xl btn-primary px-6 py-2.5 font-bold">حفظ إعدادات جوجل</button>
          {gSaved && <span className="text-sm font-semibold text-green-600">✓ تم الحفظ</span>}
          <button onClick={csvSyncNow} disabled={csvBusy} className="flex items-center gap-2 rounded-xl border border-line px-6 py-2.5 font-bold text-primary disabled:opacity-50">
            <RefreshCw size={16} className={csvBusy ? 'animate-spin' : ''} /> {csvBusy ? 'جاري القراءة...' : 'قراءة الشيت الآن'}
          </button>
        </div>
        {csvMsg && <div className={`mt-3 rounded-xl px-4 py-2.5 text-sm font-semibold ${csvMsg.ok ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-500'}`}>{csvMsg.text}</div>}
      </div>
    </div>
  );
}
