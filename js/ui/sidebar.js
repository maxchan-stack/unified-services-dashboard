import { store } from '../store.js';

const VALID_TABS = ['bulletin', 'fund', 'grades', 'island'];

export function initSidebar() {
  const sidebar = document.getElementById('sidebar');
  const toggleBtn = document.getElementById('sidebar-toggle-btn');
  const mobileToggleBtn = document.getElementById('mobile-menu-toggle');
  const overlay = document.getElementById('modal-overlay');
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item[data-view]');

  // Toggle Collapse (Desktop)
  toggleBtn?.addEventListener('click', () => {
    sidebar?.classList.toggle('collapsed');
  });

  // Mobile Menu Toggle (Mobile RWD)
  mobileToggleBtn?.addEventListener('click', () => {
    sidebar?.classList.add('mobile-open');
    overlay?.classList.add('active');
  });

  // Nav Item Clicks
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const view = item.getAttribute('data-view');
      if (!view) return;

      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      store.set('layoutMode', 'tab');
      store.set('activeTab', view);

      // On Mobile: Close sidebar after selection
      if (window.innerWidth <= 768) {
        sidebar?.classList.remove('mobile-open');
        overlay?.classList.remove('active');
      }
    });
  });

  // Sync initial active nav item
  function syncActiveNav(currentTab) {
    const safeTab = VALID_TABS.includes(currentTab) ? currentTab : 'bulletin';
    navItems.forEach(i => {
      i.classList.toggle('active', i.getAttribute('data-view') === safeTab);
    });
  }

  syncActiveNav(store.get('activeTab'));

  store.subscribe((key, val, state) => {
    if (key === 'activeTab') {
      syncActiveNav(state?.activeTab || val);
    }
  });

  // ── 手機底部導航列互動邏輯 ──
  const bottomNavItems = document.querySelectorAll('.bottom-nav-item[data-view]');
  const moreBtn = document.getElementById('bn-more');

  bottomNavItems.forEach(item => {
    item.addEventListener('click', () => {
      const view = item.getAttribute('data-view');
      if (!view) return;

      // 同步頂部 Sidebar active 狀態
      navItems.forEach(i => i.classList.remove('active'));
      document.querySelector(`.sidebar-nav .nav-item[data-view="${view}"]`)?.classList.add('active');

      // 更新底部導航 active 狀態
      bottomNavItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');

      store.set('layoutMode', 'tab');
      store.set('activeTab', view);
    });
  });

  // 「更多」按鈕：展開 Sidebar Drawer
  moreBtn?.addEventListener('click', () => {
    sidebar?.classList.add('mobile-open');
    overlay?.classList.add('active');
  });

  // 從 store 同步更新底部導航 active 狀態
  store.subscribe((key, val, state) => {
    if (key === 'activeTab') {
      bottomNavItems.forEach(i => {
        i.classList.toggle('active', i.getAttribute('data-view') === state.activeTab);
      });
    }
  });

  // ── PWA 安裝提示邏輯（包含頂部橫幅） ──
  let deferredPrompt;
  const pwaContainer = document.getElementById('pwa-install-container');
  const pwaBtn = document.getElementById('pwa-install-btn');
  const pwaBanner = document.getElementById('pwa-install-banner');
  const pwaBannerInstallBtn = document.getElementById('pwa-banner-install-btn');
  const pwaBannerDismissBtn = document.getElementById('pwa-banner-dismiss-btn');
  const pwaAlreadyDismissed = localStorage.getItem('pwa_banner_dismissed');

  function showBanner() {
    if (pwaBanner && !pwaAlreadyDismissed) {
      pwaBanner.style.display = 'flex';
      document.body.classList.add('pwa-banner-visible');
    }
  }

  function hideBanner() {
    if (pwaBanner) pwaBanner.style.display = 'none';
    document.body.classList.remove('pwa-banner-visible');
  }

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaContainer) pwaContainer.style.display = 'block';
    showBanner();
  });

  pwaBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    if (pwaContainer) pwaContainer.style.display = 'none';
    hideBanner();
  });

  pwaBannerInstallBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    deferredPrompt = null;
    hideBanner();
    if (pwaContainer) pwaContainer.style.display = 'none';
  });

  pwaBannerDismissBtn?.addEventListener('click', () => {
    hideBanner();
    localStorage.setItem('pwa_banner_dismissed', '1');
  });
}
