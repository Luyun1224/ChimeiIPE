# 導入新院區（以耕莘為例）

每個院區**各自一份試算表、各自一個 GAS、各自一個網址**，資料完全分開，互不影響。
程式碼完全相同，只差設定。

## 需要改的地方只有兩個

| 檔案 | 要改什麼 |
| --- | --- |
| `config.js` | `hospital`（例：`"耕莘醫院"`）、`dept`、`gasUrl`（耕莘自己的 GAS 網址） |
| `gas/Code.gs`（貼到耕莘的 Apps Script 時） | `SPREADSHEET_ID` 改成 `''`，或填耕莘試算表的 ID |

其他檔案都不用動。

---

## 步驟

### 1. 複製一份 repo

建議為耕莘開一個獨立的 repo（例如 `CTH-IPE`），網址與資料都和奇美分開：

1. 在 GitHub 新建一個 repo（Public 才能免費用 GitHub Pages）
2. 把這個 repo 的所有檔案上傳過去（`index.html`、`dashboard.html`、`config.js`、`gas/`、`docs/`、`README.md`）
   - 或在本 repo 的 Settings 勾選 **Template repository**，之後按 **Use this template** 一鍵複製

### 2. 建耕莘的試算表與 GAS

照 [DEPLOY.md](DEPLOY.md) 的「一、第一次部署」第 1–3 步做：

- 用**耕莘的帳號**建立新試算表
- 貼上 `gas/Code.gs`，**把 `SPREADSHEET_ID` 改成 `''`**（不要沿用奇美的 ID，否則資料會寫進奇美的試算表！）
- 執行 `setup()` → 部署成網頁應用程式 → 複製 `/exec` 網址

### 3. 改 `config.js`

```js
window.IPE_CONFIG = {
  hospital: "耕莘醫院",
  dept: "教學部",
  gasUrl: "https://script.google.com/macros/s/（耕莘的部署ID）/exec"
};
```

### 4. 開啟 GitHub Pages 並驗收

照 [DEPLOY.md](DEPLOY.md) 第 5–6 步。

---

## 導入檢查清單

- [ ] 耕莘的試算表是用耕莘的帳號（最好是公用帳號）建立
- [ ] `gas/Code.gs` 的 `SPREADSHEET_ID` **不是**奇美的 ID（`1jJMCmXj…`）
- [ ] GAS 部署：執行身分「我」、存取權「所有人」
- [ ] `config.js` 的 `gasUrl` 是耕莘的網址、`hospital` 是「耕莘醫院」
- [ ] 問卷頁最下方顯示「耕莘醫院 教學部」
- [ ] 測試填一筆前測＋後測，耕莘試算表有資料、**奇美試算表沒有**
- [ ] 儀表板看得到測試資料，且配對成功
- [ ] 刪除測試資料，製作問卷 QR code

## 如果耕莘要改題目或選項

例如職類、職級選項不同，或六題 IPE 題目要調整，請看 [DATA.md](DATA.md) 的「修改題目時要同步改的地方」。
建議在耕莘的 repo 改，避免影響奇美。

## 之後奇美版有更新，耕莘要不要跟？

兩個 repo 是獨立的，奇美更新不會自動同步到耕莘。要跟進時：

1. 把奇美 repo 更新過的檔案複製到耕莘 repo，**但保留耕莘自己的 `config.js`**
2. 若 `gas/Code.gs` 有改，照 [DEPLOY.md](DEPLOY.md)「改了 gas/Code.gs」更新耕莘的 GAS（保留耕莘的 `SPREADSHEET_ID`）
