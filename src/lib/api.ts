// ===== Live backend integration layer (Google Apps Script Web App) =====
// When the admin pastes their Apps Script Web App URL into settings,
// the platform reads & writes ALL data to the real Google Sheets + Drive,
// and can send real emails. Until then, everything works locally (offline mode).

let WEB_APP_URL = '';

export function setWebAppUrl(url: string) {
  WEB_APP_URL = url.trim();
  try { localStorage.setItem('elda3ia-webapp-url', WEB_APP_URL); } catch { /* */ }
}

export function getWebAppUrl(): string {
  if (WEB_APP_URL) return WEB_APP_URL;
  try { WEB_APP_URL = localStorage.getItem('elda3ia-webapp-url') || ''; } catch { /* */ }
  return WEB_APP_URL;
}

export function isLiveMode(): boolean {
  return !!getWebAppUrl();
}

interface ApiResult<T = any> {
  ok: boolean;
  data?: T;
  error?: string;
}

// Generic call to the Apps Script Web App.
// action examples: 'getAll', 'addContestant', 'updateContestant', 'saveResult',
//                  'uploadPhoto', 'sendEmail', 'importQuestions', 'updateSettings'
export async function api<T = any>(action: string, payload: Record<string, any> = {}): Promise<ApiResult<T>> {
  const url = getWebAppUrl();
  if (!url) return { ok: false, error: 'offline' };
  try {
    const res = await fetch(url, {
      method: 'POST',
      // text/plain avoids CORS preflight with Apps Script
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action, ...payload }),
    });
    const json = await res.json();
    if (json && json.ok === false) return { ok: false, error: json.error || 'server-error' };
    return { ok: true, data: (json && json.data !== undefined ? json.data : json) as T };
  } catch (e: any) {
    return { ok: false, error: e?.message || 'network-error' };
  }
}

// Test the connection
export async function testConnection(url: string): Promise<{ ok: boolean; message: string }> {
  const prev = getWebAppUrl();
  setWebAppUrl(url);
  const r = await api('ping');
  if (!r.ok) {
    setWebAppUrl(prev);
    return { ok: false, message: 'فشل الاتصال. تأكد من نشر السكريبت بصلاحية "أي شخص" ومن صحة الرابط.' };
  }
  return { ok: true, message: 'تم الاتصال بنجاح بالشيت الحي ✅' };
}

// Upload a photo (base64) to Drive via Apps Script; returns the Drive URL
export async function uploadPhoto(name: string, base64: string): Promise<string | null> {
  const r = await api<{ url: string }>('uploadPhoto', { name, base64 });
  return r.ok && r.data ? r.data.url : null;
}

// Send an email via Apps Script (Gmail)
export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  const r = await api('sendEmail', { to, subject, body });
  return r.ok;
}
