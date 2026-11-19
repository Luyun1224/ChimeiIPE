/**
 * 院級跨領域 IPE 問卷（前測／後測）— Google Apps Script 後端
 * 試算表：https://docs.google.com/spreadsheets/d/1jJMCmXjXwnwffrT8DmeV0TIXkOi6tljnDdvcQup60IU/edit
 *
 * 部署步驟：
 * 1. 開啟上面的試算表 → 擴充功能 → Apps Script，把本檔內容貼上並儲存
 * 2. 先手動執行一次 setup()，授權後會建立「IPE問卷回應」工作表與標題列
 *    （舊版工作表若還沒有「職級」欄，setup() 會自動在「職類」右側插入）
 * 3. 部署 → 新增部署作業 → 類型選「網頁應用程式」
 *    執行身分：我；存取權：所有人 → 部署
 * 4. 把產生的 /exec 網址貼到 index.html 的 GAS_URL
 * ※ 之後若修改程式碼，要用「管理部署作業 → 編輯 → 新版本」更新，網址才會不變
 */

const SPREADSHEET_ID = '1jJMCmXjXwnwffrT8DmeV0TIXkOi6tljnDdvcQup60IU';
const SHEET_NAME = 'IPE問卷回應';

// [欄位 key, 標題]；前測與後測的 IPE 六題寫在同一組欄位，方便前後測比較
const COLUMNS = [
  ['timestamp',  '填答時間'],
  ['courseDate', '課程日期'],
  ['phase',      '測驗階段'],
  ['name',       '姓名'],
  ['empId',      '人事號'],
  ['unit',       '單位科別'],
  ['job',        '職類'],
  ['rank',       '職級'],
  ['ipe1', 'IPE1 專業認同'],
  ['ipe2', 'IPE2 協作行為'],
  ['ipe3', 'IPE3 心理安全'],
  ['ipe4', 'IPE4 全人整合'],
  ['ipe5', 'IPE5 團隊整合'],
  ['ipe6', 'IPE6 能力轉移'],
  ['ipeAvg', 'IPE 平均'],
  ['gain',     '最具收穫的環節（複選）'],
  ['teamBest', '團隊表現最出色的面向'],
  ['overall', 'IPE 活動整體滿意度'],
  ['comment', '可加強或改進的面向']
];

const RANKS = ['臨床教師', '住院醫師', 'PGY2醫師', 'PGY1醫師', '實習醫學生(UGY)', '醫事實習生'];

function getSheet_() {
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(COLUMNS.map(c => c[1]));
    sh.getRange(1, 1, 1, COLUMNS.length)
      .setFontWeight('bold').setBackground('#DD5426').setFontColor('#ffffff').setWrap(true);
    sh.setFrozenRows(1);
    sh.setFrozenColumns(4);
    sh.getRange('B:B').setNumberFormat('yyyy-mm-dd');
    sh.getRange('E:E').setNumberFormat('@'); // 人事號保留開頭 0
  } else {
    migrateRank_(sh);
  }
  return sh;
}

// 舊版工作表沒有「職級」欄：在「職類」右側插入一欄，舊資料的職級留白
function migrateRank_(sh) {
  const col = COLUMNS.findIndex(c => c[0] === 'rank') + 1;   // 8 (H)
  const header = sh.getRange(1, 1, 1, Math.max(sh.getLastColumn(), col)).getValues()[0];
  if (header[col - 1] === '職級') return;
  if (header[col - 2] !== '職類') throw new Error('工作表欄位與程式不符，請檢查標題列');
  sh.insertColumnAfter(col - 1);
  sh.getRange(1, col).setValue('職級')
    .setFontWeight('bold').setBackground('#DD5426').setFontColor('#ffffff').setWrap(true);
}

function setup() {
  getSheet_();
}

function avg_(data, keys) {
  const v = keys.map(k => Number(data[k])).filter(n => n >= 1 && n <= 5);
  return v.length === keys.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length * 100) / 100 : '';
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(20000);
    const data = JSON.parse(e.postData.contents);

    // 基本檢核（人事號非必填：醫事實習生通常沒有人事號）
    ['name', 'phase', 'rank'].forEach(k => {
      if (!data[k]) throw new Error('缺少欄位：' + k);
    });
    if (['前測', '後測'].indexOf(data.phase) < 0) throw new Error('測驗階段錯誤');
    if (RANKS.indexOf(data.rank) < 0) throw new Error('職級錯誤');

    data.timestamp = new Date();
    data.empId = String(data.empId || '').trim();
    data.ipeAvg = avg_(data, ['ipe1', 'ipe2', 'ipe3', 'ipe4', 'ipe5', 'ipe6']);

    const row = COLUMNS.map(c => (data[c[0]] === undefined || data[c[0]] === null) ? '' : data[c[0]]);
    getSheet_().appendRow(row);

    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err.message || err) });
  } finally {
    try { lock.releaseLock(); } catch (_) {}
  }
}

// GET /exec                → 健康檢查
// GET /exec?action=data    → 儀表板資料（不回傳姓名、人事號，只給雜湊後的配對代碼）
function doGet(e) {
  const action = e && e.parameter && e.parameter.action;
  if (action !== 'data') return json_({ ok: true, msg: 'IPE 問卷 API 運作中' });

  const sh = getSheet_();
  const last = sh.getLastRow();
  if (last < 2) return json_({ ok: true, rows: [] });
  const values = sh.getRange(2, 1, last - 1, COLUMNS.length).getValues();
  const tz = 'Asia/Taipei';
  const fmt = (v, f) => v instanceof Date ? Utilities.formatDate(v, tz, f) : String(v || '');
  const HIDE = { name: 1, empId: 1 };

  const rows = values.map(r => {
    const o = {};
    COLUMNS.forEach((c, i) => { if (!HIDE[c[0]]) o[c[0]] = r[i]; });
    o.timestamp = fmt(r[0], 'yyyy-MM-dd HH:mm:ss');
    o.courseDate = fmt(r[1], 'yyyy-MM-dd');
    o.pid = pid_(r[4], r[3], r[5]); // 有人事號用人事號；沒有則用姓名＋單位科別
    return o;
  });
  return json_({ ok: true, rows: rows, updated: fmt(new Date(), 'yyyy-MM-dd HH:mm') });
}

// 配對代碼：有人事號 → 只用人事號；沒有人事號 → 姓名＋單位科別（忽略空白、英文大小寫）
function pid_(empId, name, unit) {
  const norm = v => String(v || '').replace(/\s/g, '').toUpperCase();
  const id = norm(empId);
  const raw = id ? 'ID|' + id : 'NU|' + norm(name) + '|' + norm(unit);
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, raw, Utilities.Charset.UTF_8);
  return bytes.slice(0, 8).map(b => ('0' + (b & 255).toString(16)).slice(-2)).join('');
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
