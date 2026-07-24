import { store } from '../store.js';

const VALID_TABS = ['bulletin', 'gemini', 'google', 'island'];

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

  // Handle PWA Install Prompt
  let deferredPrompt;
  const pwaContainer = document.getElementById('pwa-install-container');
  const pwaBtn = document.getElementById('pwa-install-btn');

  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    if (pwaContainer) pwaContainer.style.display = 'block';
  });

  pwaBtn?.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log('User response to PWA prompt:', outcome);
    deferredPrompt = null;
    if (pwaContainer) pwaContainer.style.display = 'none';
  });
}
