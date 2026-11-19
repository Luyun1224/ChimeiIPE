/**
 * ★ 各院設定檔 ★
 * 換院區（例如耕莘）時，前端「只需要改這個檔案」，index.html 與 dashboard.html 都會讀這裡。
 */
window.IPE_CONFIG = {
  // 院名與單位：顯示在問卷與儀表板最下方
  hospital: "奇美醫院",
  dept: "教學部",

  // GAS 網頁應用程式網址（部署 → 網頁應用程式 → 結尾是 /exec 的那一串）
  // 問卷與儀表板共用同一個網址；用「管理部署作業 → 編輯 → 新版本」更新時網址不會變
  gasUrl: "https://script.google.com/macros/s/AKfycby7zSy8dfboib32GUJ8ZIDxNhAHMcpqMsG8i3ErORlaJl7D4ByPw3ImrjHY1auN2_aD/exec"
};
