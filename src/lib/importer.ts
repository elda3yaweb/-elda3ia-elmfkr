import type { Question, Contestant } from './types';

// ===== CSV parsing (handles quotes, commas, tabs) =====
function detectDelimiter(text: string): string {
  const firstLine = text.split(/\r?\n/)[0] || '';
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return tabs > commas ? '\t' : ',';
}

export function parseCSV(text: string): string[][] {
  const delim = detectDelimiter(text);
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  // strip BOM
  text = text.replace(/^\ufeff/, '');
  for (let i = 0; i < text.length; i++) {
    const ch = text[i];
    if (inQuotes) {
      if (ch === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else inQuotes = false;
      } else field += ch;
    } else {
      if (ch === '"') inQuotes = true;
      else if (ch === delim) { row.push(field); field = ''; }
      else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = ''; }
      else if (ch === '\r') { /* skip */ }
      else field += ch;
    }
  }
  if (field.length > 0 || row.length > 0) { row.push(field); rows.push(row); }
  return rows.filter((r) => r.some((c) => c.trim() !== ''));
}

// ===== Questions importer =====
// Expected unified columns:
// السؤال | رابط صورة السؤال | الاختيار 1..8 | الإجابة الصحيحة | الشرح
export function parseQuestionsCSV(text: string): Omit<Question, 'id' | 'bank'>[] {
  const rows = parseCSV(text);
  if (rows.length === 0) throw new Error('الملف فارغ');

  // detect header
  const header = rows[0].map((h) => h.trim());
  const looksLikeHeader = header.some((h) => /السؤال|question|الاختيار|option|الإجابة|answer/i.test(h));
  const dataRows = looksLikeHeader ? rows.slice(1) : rows;

  const out: Omit<Question, 'id' | 'bank'>[] = [];
  for (const r of dataRows) {
    const cells = r.map((c) => c.trim());
    const textCol = cells[0] || '';
    if (!textCol) continue;
    const image = cells[1] || '';
    // options = columns 2..9 (up to 8), answer is the column right after options block
    // We treat columns 2..9 as options; the answer column is the one labeled الإجابة الصحيحة
    let options = cells.slice(2, 10).map((c) => c).filter((c) => c !== '');
    // answer column: try index 10, else last non-empty before explanation
    let answer = cells[10] || '';
    let explanation = cells[11] || '';
    // fallback: if fewer columns, answer may be the last filled cell
    if (!answer) {
      // assume last option-area cell is the answer when format is compact
      const tail = cells.slice(2).filter((c) => c !== '');
      if (tail.length >= 3) {
        answer = tail[tail.length - 1];
        options = tail.slice(0, tail.length - 1);
      }
    }
    if (options.length < 2) continue;

    let correctIndex = options.findIndex((o) => o.trim() === answer.trim());
    if (correctIndex < 0) {
      // try numeric answer (1-based)
      const n = parseInt(answer, 10);
      if (!isNaN(n) && n >= 1 && n <= options.length) correctIndex = n - 1;
      else correctIndex = 0;
    }
    out.push({ text: textCol, image, options, correctIndex, explanation });
  }
  if (out.length === 0) throw new Error('لم يتم العثور على أسئلة صالحة. تأكد من التنسيق.');
  return out;
}

// ===== Contestants importer =====
// columns: الاسم | البريد | الموبايل | النوع | الكود | الاشتراك | المسابقات (مفصولة بـ ؛)
export function parseContestantsCSV(text: string): Partial<Contestant>[] {
  const rows = parseCSV(text);
  if (rows.length === 0) throw new Error('الملف فارغ');
  const header = rows[0].map((h) => h.trim());
  const looksLikeHeader = header.some((h) => /الاسم|name|البريد|email/i.test(h));
  const dataRows = looksLikeHeader ? rows.slice(1) : rows;
  const out: Partial<Contestant>[] = [];
  for (const r of dataRows) {
    const c = r.map((x) => x.trim());
    if (!c[0] || !c[1]) continue;
    out.push({
      fullName: c[0],
      email: c[1],
      phone: c[2] || '',
      gender: (c[3] === 'أنثى' ? 'أنثى' : 'ذكر') as Contestant['gender'],
      secretCode: c[4] || '123',
      subscription: (c[5] === 'مشترك' ? 'مشترك' : 'مجاني') as Contestant['subscription'],
      competitions: (c[6] || '').split(/[؛;,]/).map((x) => x.trim()).filter(Boolean),
    });
  }
  if (out.length === 0) throw new Error('لم يتم العثور على أسماء صالحة.');
  return out;
}

// ===== Google Sheet → CSV =====
export function sheetToCsvUrl(url: string): string {
  // Extract spreadsheet id and gid, build export csv link
  const idMatch = url.match(/\/spreadsheets\/d\/([a-zA-Z0-9-_]+)/);
  if (!idMatch) {
    // maybe already a published csv / gviz link
    return url;
  }
  const id = idMatch[1];
  const gidMatch = url.match(/[#&?]gid=([0-9]+)/);
  const gid = gidMatch ? gidMatch[1] : '0';
  return `https://docs.google.com/spreadsheets/d/${id}/gviz/tq?tqx=out:csv&gid=${gid}`;
}

export async function fetchGoogleSheetCSV(url: string): Promise<string> {
  const csvUrl = sheetToCsvUrl(url);
  const res = await fetch(csvUrl);
  if (!res.ok) throw new Error('تعذّر الوصول للرابط. تأكد أن الشيت متاح للقراءة العامة.');
  const text = await res.text();
  if (text.trim().startsWith('<')) throw new Error('الشيت غير متاح للعموم. شاركه "أي شخص لديه الرابط" أو انشره على الويب.');
  return text;
}
