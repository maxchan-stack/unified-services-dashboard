import { store } from '../store.js';
import { showToast } from '../utils/helpers.js';

// GAS API Key 不再硬編碼。
// 使用者須在「偏好設定」中設定「教材費 GAS API Key」後方可使用此功能。
const FUND_BASE_URL = 'https://maxchan-stack.github.io/class-fund-ledger/';

function getFundApiKey() {
  return localStorage.getItem('fund_gas_api_key') || '';
}

function getFundPortalUrl(view) {
  const apiKey = getFundApiKey();
  if (!apiKey) return null;
  const base = `${FUND_BASE_URL}?api=${encodeURIComponent(apiKey)}`;
  return view === 'parent' ? base + '&view=parent' : base;
}

export function initFund() {
  const container = document.getElementById('fund-container');
  if (!container) return;

  const currentTab = store.get('fundPortal') || 'parent';
  const currentUrl = getFundPortalUrl(currentTab) || '';

  container.innerHTML = `
    <div class="fund-wrapper">
      <!-- 內嵌身分切換工具列 -->
      <div class="fund-nav-bar">
        <button class="fund-tab-btn ${currentTab === 'parent' ? 'active' : ''}" data-portal="parent">
          <i class="ri-book-read-line"></i> 學生/家長存摺查詢
        </button>
        <button class="fund-tab-btn ${currentTab === 'teacher' ? 'active' : ''}" data-portal="teacher">
          <i class="ri-wallet-3-line"></i> 教師專戶管理
        </button>
        <button id="fund-reload-btn" class="btn btn-secondary btn-sm" title="重新載入">
          <i class="ri-refresh-line"></i> 重新載入
        </button>
      </div>

      <!-- 教材費無縫內嵌主視窗 -->
      <div class="fund-embed-container">
        <div class="skeleton-loader" id="fund-skeleton">
          <div class="skeleton-bar h-lg"></div>
          <div class="skeleton-bar h-md"></div>
          <div class="skeleton-bar h-sm"></div>
          <div class="skeleton-bar h-card"></div>
          <div class="skeleton-bar h-md"></div>
          <div class="skeleton-bar h-sm"></div>
        </div>
        <iframe id="fund-iframe"
                class="fund-iframe"
                src="${currentUrl}"
                loading="lazy"
                allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  const iframe = document.getElementById('fund-iframe');
  const skeleton = document.getElementById('fund-skeleton');
  const tabBtns = container.querySelectorAll('.fund-tab-btn');
  const reloadBtn = document.getElementById('fund-reload-btn');

  iframe?.addEventListener('load', () => {
    skeleton?.classList.add('hidden');
  });

  function switchPortal(portalKey) {
    const targetUrl = getFundPortalUrl(portalKey);
    if (!targetUrl) {
      showToast('請先在「偏好設定」中設定「教材費 GAS API Key」，才能使用此功能。', 'warning');
      return;
    }
    skeleton?.classList.remove('hidden');
    iframe.src = targetUrl;
    store.set('fundPortal', portalKey);

    tabBtns.forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-portal') === portalKey);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-portal');
      switchPortal(key);
    });
  });

  reloadBtn?.addEventListener('click', () => {
    const currentSrc = iframe.src;
    skeleton?.classList.remove('hidden');
    iframe.src = '';
    setTimeout(() => { iframe.src = currentSrc; }, 200);
  });
}
