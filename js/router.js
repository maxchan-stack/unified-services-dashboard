import { store } from './store.js';

const VALID_TABS = ['bulletin', 'fund', 'grades', 'island'];

export function initRouter() {
  // Sync Sidebar Active Item with State
  store.subscribe((key, val, state) => {
    if (key === 'activeTab') {
      const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');
      navItems.forEach(item => item.classList.remove('active'));

      const safeTab = VALID_TABS.includes(state.activeTab) ? state.activeTab : 'bulletin';
      const activeNav = document.querySelector(`.sidebar-nav .nav-item[data-view="${safeTab}"]`);
      activeNav?.classList.add('active');
    }
  });
}
