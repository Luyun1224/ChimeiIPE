# 院級跨領域 IPE 問卷系統（前測／後測＋成效儀表板）

跨領域教育（IPE）課程用的線上問卷與成效分析工具：

- **問卷**（`index.html`）：學員課前填「前測」、課後填「後測＋活動回饋與滿意度」
- **儀表板**（`dashboard.html`）：自動配對前後測，呈現六大面向的進步幅度、配對 t 檢定、各職類分析、滿意度與回饋意見，可下載 CSV
- **後端**（`gas/Code.gs`）：Google Apps Script，把回應寫進 Google 試算表，並提供儀表板讀取（不回傳姓名、人事號）

不需要伺服器或資料庫，只要一個 GitHub repo（放網頁）＋一份 Google 試算表（存資料）。

## 檔案結構

```
├── index.html        問卷頁（給學員填）
├── dashboard.html    成效儀表板（給承辦人／主管看）
├── config.js         ★ 各院設定：院名、GAS 網址 —— 換院區時前端只改這個
├── gas/
│   └── Code.gs       Google Apps Script 後端（貼到試算表的 Apps Script 裡）
└── docs/
    ├── DEPLOY.md     第一次部署與日後更新的步驟
    ├── NEW_SITE.md   導入新院區（例如耕莘）的檢查清單
    └── DATA.md       問卷題目、試算表欄位、前後測配對規則、修改題目時要動哪裡
```

## 系統怎麼運作

```
學員手機 ──填答──▶ index.html ──POST──▶ GAS（Code.gs）──寫入──▶ Google 試算表
                                         │
承辦人 ◀──圖表── dashboard.html ◀──GET───┘（只回傳去識別化資料＋配對代碼）
```

- 網頁放在 GitHub Pages（Settings → Pages → Branch: `main`、資料夾 `/ (root)`），網址為
  `https://<GitHub帳號>.github.io/<repo名稱>/`（問卷）與 `.../dashboard.html`（儀表板）
- `index.html`、`dashboard.html`、`config.js` 必須放在同一層（目前是 repo 根目錄），
  不要搬進子資料夾，否則已印出去的 QR code 網址會失效

## 常見工作要看哪份文件

| 我想要… | 看這裡 |
| --- | --- |
| 第一次架設、或修改 GAS 後重新部署 | [docs/DEPLOY.md](docs/DEPLOY.md) |
| 在耕莘（或其他院區）也架一套 | [docs/NEW_SITE.md](docs/NEW_SITE.md) |
| 改題目、加欄位、了解前後測怎麼配對 | [docs/DATA.md](docs/DATA.md) |
| 換院名或 GAS 網址 | 直接改 [`config.js`](config.js) |
