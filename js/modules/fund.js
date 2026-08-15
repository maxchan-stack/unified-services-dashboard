import { store } from '../store.js';

const FUND_PORTALS = {
  parent: 'https://maxchan-stack.github.io/class-fund-ledger/?view=parent&api=AKfycbwBoo653bMsvkZceaXks8x2Ul2GuFJWI5ctXQMkh3vq_YLolAerNJWIv9gRyEnOmvN_Bw',
  teacher: 'https://maxchan-stack.github.io/class-fund-ledger/?api=AKfycbwBoo653bMsvkZceaXks8x2Ul2GuFJWI5ctXQMkh3vq_YLolAerNJWIv9gRyEnOmvN_Bw'
};

export function initFund() {
  const container = document.getElementById('fund-container');
  if (!container) return;

  const currentTab = store.get('fundPortal') || 'parent';
  const currentUrl = FUND_PORTALS[currentTab] || FUND_PORTALS.parent;

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
    const targetUrl = FUND_PORTALS[portalKey] || FUND_PORTALS.parent;
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
