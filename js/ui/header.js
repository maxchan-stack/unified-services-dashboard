import { store } from '../store.js';

export function initHeader() {
  const pageTitle = document.getElementById('view-title');

  store.subscribe((key, val, state) => {
    if (key === 'activeTab') {
      const titleMap = {
        bulletin: '214 班電子佈告欄',
        gemini: 'Gemini AI 助手',
        google: 'Google 地圖與搜尋',
        island: '島民行政中心'
      };
      if (pageTitle) pageTitle.textContent = titleMap[state.activeTab] || '行動整合頁面';
    }
  });
}
