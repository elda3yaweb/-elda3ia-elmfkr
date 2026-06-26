// The complete Google Apps Script the admin copies into their Sheet's
// Extensions → Apps Script, then deploys as a Web App.
export const APPS_SCRIPT_CODE = `/**
 * منصة الداعية المفكر — Google Apps Script Backend
 * ربط حي بين المنصة و Google Sheets + Drive + Gmail
 *
 * خطوات النشر:
 * 1) افتح شيت المسابقات → Extensions → Apps Script
 * 2) الصق هذا الكود كاملاً واحفظ
 * 3) عدّل SETTINGS_SHEET_ID و DRIVE_FOLDER_ID بالأسفل
 * 4) Deploy → New deployment → type: Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 5) انسخ رابط Web App والصقه في لوحة التحكم → "الربط الحي"
 */

// ====== عدّل هذه القيم ======
var COMPETITIONS_SHEET_ID = '18IGOfEIsg2pdPnHpTcd15ozh4mmTAkCK53P9ISifWCM';
var SETTINGS_SHEET_ID     = '1lOIPFJkJ-xIXLqHJJ2CGzuLV0vYG5V3fdVFZyaauBXY';
var DRIVE_FOLDER_ID       = '13MaSIzN677luY7Pz4EzkYyeZhn0TkqW6';
// ===========================

function doPost(e) {
  try {
    var req = JSON.parse(e.postData.contents);
    var action = req.action;
    var out;
    switch (action) {
      case 'ping':            out = { ok: true, data: 'pong' }; break;
      case 'getAll':          out = { ok: true, data: getAll() }; break;
      case 'addContestant':   out = { ok: true, data: addContestant(req.row) }; break;
      case 'updateContestant':out = { ok: true, data: updateContestant(req.id, req.row) }; break;
      case 'saveResult':      out = { ok: true, data: appendRow('النتائج', req.row) }; break;
      case 'uploadPhoto':     out = { ok: true, data: { url: uploadPhoto(req.name, req.base64) } }; break;
      case 'sendEmail':       out = { ok: true, data: sendEmail(req.to, req.subject, req.body) }; break;
      case 'importQuestions': out = { ok: true, data: importRows('بنك الأسئلة', req.rows) }; break;
      case 'updateSettings':  out = { ok: true, data: updateSettings(req.settings) }; break;
      default:                out = { ok: false, error: 'unknown action: ' + action };
    }
    return json(out);
  } catch (err) {
    return json({ ok: false, error: String(err) });
  }
}

function doGet() { return json({ ok: true, data: 'الداعية المفكر API يعمل' }); }

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function sheet(name) {
  return SpreadsheetApp.openById(COMPETITIONS_SHEET_ID).getSheetByName(name);
}

function getAll() {
  var ss = SpreadsheetApp.openById(COMPETITIONS_SHEET_ID);
  var result = {};
  ss.getSheets().forEach(function (sh) {
    result[sh.getName()] = sh.getDataRange().getValues();
  });
  return result;
}

function appendRow(sheetName, row) {
  var sh = sheet(sheetName);
  if (!sh) return false;
  sh.appendRow(row);
  return true;
}

function importRows(sheetName, rows) {
  var sh = sheet(sheetName);
  if (!sh) return false;
  rows.forEach(function (r) { sh.appendRow(r); });
  return rows.length;
}

function addContestant(row) {
  var sh = sheet('بيانات المتسابقين');
  sh.appendRow(row);
  return true;
}

function updateContestant(id, row) {
  var sh = sheet('بيانات المتسابقين');
  var data = sh.getDataRange().getValues();
  for (var i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sh.getRange(i + 1, 1, 1, row.length).setValues([row]);
      return true;
    }
  }
  sh.appendRow(row);
  return true;
}

function uploadPhoto(name, base64) {
  var folder = DriveApp.getFolderById(DRIVE_FOLDER_ID);
  // remove old file with same name
  var existing = folder.getFilesByName(name);
  while (existing.hasNext()) existing.next().setTrashed(true);
  var data = base64.indexOf(',') > -1 ? base64.split(',')[1] : base64;
  var blob = Utilities.newBlob(Utilities.base64Decode(data), 'image/png', name);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return 'https://drive.google.com/uc?export=view&id=' + file.getId();
}

function sendEmail(to, subject, body) {
  MailApp.sendEmail({ to: to, subject: subject, htmlBody: body });
  return true;
}

function updateSettings(obj) {
  var sh = SpreadsheetApp.openById(SETTINGS_SHEET_ID).getSheets()[0];
  var keys = Object.keys(obj);
  keys.forEach(function (k) {
    sh.appendRow([k, obj[k]]);
  });
  return true;
}
`;
