import { store } from './store.js';
import { initSidebar } from './ui/sidebar.js';
import { initHeader } from './ui/header.js';
import { initWorkspace } from './ui/workspace.js';
import { initRouter } from './router.js';
import { initGemini } from './modules/gemini.js';
import { initSmoothJazz } from './modules/smoothjazz.js';
import { initGoogle } from './modules/google.js';
import { initBulletin } from './modules/bulletin.js';
import { initIsland } from './modules/island.js';
import { initCrossIntegration } from './modules/cross-integration.js';
import { initProductivity } from './modules/productivity.js';
import { initSettings } from './utils/settings.js';
import { cloudSync } from './utils/cloudSync.js';

document.addEventListener('DOMContentLoaded', () => {
  console.log('[MobileHub] Initializing Cloud-Synced Focus-First 行動整合頁面 (v41)...');

  // 1. Apply Initial Theme
  const theme = store.get('theme') || 'theme-dark';
  document.body.className = theme;

  // 2. Initialize Core UI & Layout System
  initSidebar();
  initHeader();
  initWorkspace();
  initRouter();

  // 3. Initialize Service Modules
  initGemini();
  initSmoothJazz();
  initGoogle();
  initBulletin();
  initIsland();

  // 4. Initialize Enhancement Modules & Cloud Sync
  initCrossIntegration();
  initProductivity();
  initSettings();

  // 5. Initialize 100% Anonymous Zero-Login Cloud Auto-Sync
  cloudSync.init();

  // 6. Register PWA Service Worker (with auto-update & cache purge)
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js?v=41')
        .then(reg => {
          console.log('[MobileHub] ServiceWorker registered with scope:', reg.scope);
          reg.update(); // Force check for newer Service Worker immediately
        })
        .catch(err => console.warn('[MobileHub] ServiceWorker registration failed:', err));
    });
  }

  console.log('[MobileHub] Application ready.');
});
