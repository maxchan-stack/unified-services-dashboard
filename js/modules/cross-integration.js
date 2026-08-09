import { store } from '../store.js';
import { eventBus } from '../utils/helpers.js';

export function initCrossIntegration() {
  // 跨模組事件路由：當其他模組觸發地圖搜尋時，自動切換至 Google Maps Tab
  eventBus.on('update-google-map', (query) => {
    if (store.get('layoutMode') === 'tab') {
      store.set('activeTab', 'google');
    }
  });
}
