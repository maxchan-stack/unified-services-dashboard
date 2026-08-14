import { store } from '../store.js';

const VALID_TABS = ['bulletin', 'fund', 'island'];

export function initWorkspace() {
  const workspace = document.getElementById('workspace');

  function applyActiveTab(tabName) {
    if (!workspace) return;
    workspace.className = 'workspace layout-tab';

    const safeTab = VALID_TABS.includes(tabName) ? tabName : 'bulletin';
    const panels = workspace.querySelectorAll('.module-panel');
    
    panels.forEach(p => {
      const mod = p.getAttribute('data-module');
      if (mod === safeTab) {
        p.classList.add('active-tab');
        p.style.display = 'flex';
      } else {
        p.classList.remove('active-tab');
        p.style.display = 'none';
      }
    });

    console.log('[Workspace] Active Tab set to:', safeTab);
  }

  // Initial apply
  applyActiveTab(store.get('activeTab'));

  store.subscribe((key, val, state) => {
    if (key === 'activeTab' || key === 'layoutMode') {
      applyActiveTab(state?.activeTab || val);
    }
  });
}
