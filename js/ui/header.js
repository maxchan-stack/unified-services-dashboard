import { store } from '../store.js';

export function initHeader() {
  const pageTitle = document.getElementById('view-title');
  const sheetsSelect = document.getElementById('sheets-shortcut-select');

  store.subscribe((key, val, state) => {
    if (key === 'activeTab') {
      const titleMap = {
        bulletin: '214 班電子佈告欄',
        fund: '214 班教材費專戶',
        grades: '214 班學生成績查詢',
        island: '島民行政中心',
        cleaning: '214 班打掃排班與值日生系統'
      };
      if (pageTitle) pageTitle.textContent = titleMap[state.activeTab] || '行動整合頁面';
    }
  });

  sheetsSelect?.addEventListener('change', (e) => {
    const url = e.target.value;
    if (url) {
      window.open(url, '_blank');
      sheetsSelect.selectedIndex = 0; // 重置選單為預設提示
    }
  });
}
