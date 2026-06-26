// Real Google Sign-In via Google Identity Services (GIS)
// Requires a real OAuth Client ID set in admin settings (googleClientId).

let gisLoaded = false;

function loadGis(): Promise<void> {
  if (gisLoaded && (window as any).google?.accounts?.id) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const existing = document.getElementById('gis-script');
    if (existing) { existing.addEventListener('load', () => { gisLoaded = true; resolve(); }); return; }
    const sc = document.createElement('script');
    sc.id = 'gis-script';
    sc.src = 'https://accounts.google.com/gsi/client';
    sc.async = true;
    sc.defer = true;
    sc.onload = () => { gisLoaded = true; resolve(); };
    sc.onerror = () => reject(new Error('تعذّر تحميل خدمة تسجيل جوجل'));
    document.head.appendChild(sc);
  });
}

export interface GoogleProfile {
  name: string;
  email: string;
  picture: string;
}

function decodeJwt(token: string): any {
  const payload = token.split('.')[1];
  const json = decodeURIComponent(
    atob(payload.replace(/-/g, '+').replace(/_/g, '/'))
      .split('')
      .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
      .join('')
  );
  return JSON.parse(json);
}

// Triggers the Google One Tap / popup and resolves with the profile.
export async function googleSignIn(clientId: string): Promise<GoogleProfile> {
  if (!clientId) throw new Error('لم يتم ضبط معرّف عميل جوجل (Client ID) في إعدادات المنصة.');
  await loadGis();
  const google = (window as any).google;

  return new Promise<GoogleProfile>((resolve, reject) => {
    try {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: (resp: any) => {
          try {
            const p = decodeJwt(resp.credential);
            resolve({ name: p.name || '', email: p.email || '', picture: p.picture || '' });
          } catch {
            reject(new Error('تعذّر قراءة بيانات حساب جوجل'));
          }
        },
      });
      // prompt One Tap; fallback to popup if dismissed
      google.accounts.id.prompt((notification: any) => {
        if (notification.isNotDisplayed?.() || notification.isSkippedMoment?.()) {
          // render a temporary button click via OAuth popup style is complex;
          // inform caller to use rendered button fallback
          reject(new Error('لم يظهر تسجيل جوجل. تأكد من إعداد Client ID والنطاق المصرّح.'));
        }
      });
    } catch (e) {
      reject(e instanceof Error ? e : new Error('فشل تسجيل جوجل'));
    }
  });
}
