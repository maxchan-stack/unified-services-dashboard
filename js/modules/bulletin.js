import { store } from '../store.js';

const DEFAULT_ADMIN_SECRET = 'a8b414c024b8';

const BULLETIN_PORTALS = {
  bulletin: 'https://maxchan-stack.github.io/bulletin-board-web/bulletin.html',
  student:  'https://maxchan-stack.github.io/bulletin-board-web/index.html',
  parent:   'https://maxchan-stack.github.io/bulletin-board-web/parent.html',
  teacher:  'https://maxchan-stack.github.io/bulletin-board-web/bulletin.html',
  admin:    'https://maxchan-stack.github.io/bulletin-board-web/admin.html'
};

function getPortalUrl(portalKey) {
  let url = BULLETIN_PORTALS[portalKey] || BULLETIN_PORTALS.bulletin;
  const secret = localStorage.getItem('bulletin_admin_secret') || DEFAULT_ADMIN_SECRET;

  if (portalKey === 'teacher' || portalKey === 'admin') {
    url += `?admin=${encodeURIComponent(secret)}`;
  }
  return url;
}

export function initBulletin() {
  const container = document.getElementById('bulletin-container');
  if (!container) return;

  const currentTab = store.get('bulletinPortal') || 'bulletin';
  const currentUrl = getPortalUrl(currentTab);

  container.innerHTML = `
    <div class="bulletin-wrapper">
      <!-- 內嵌身分切換工具列 -->
      <div class="bulletin-nav-bar">
        <button class="bulletin-tab-btn ${currentTab === 'bulletin' ? 'active' : ''}" data-portal="bulletin">
          <i class="ri-newspaper-line"></i> 總覽佈告欄
        </button>
        <button class="bulletin-tab-btn ${currentTab === 'student' ? 'active' : ''}" data-portal="student">
          <i class="ri-user-smile-line"></i> 學生版
        </button>
        <button class="bulletin-tab-btn ${currentTab === 'parent' ? 'active' : ''}" data-portal="parent">
          <i class="ri-parent-line"></i> 家長版
        </button>
        <button class="bulletin-tab-btn ${currentTab === 'teacher' ? 'active' : ''}" data-portal="teacher">
          <i class="ri-edit-box-line"></i> 導師發布台
        </button>
        <button class="bulletin-tab-btn ${currentTab === 'admin' ? 'active' : ''}" data-portal="admin">
          <i class="ri-key-2-line"></i> 授權碼管理
        </button>
        <button id="bulletin-reload-btn" class="btn btn-secondary btn-sm" title="重新載入">
          <i class="ri-refresh-line"></i> 重新載入
        </button>
      </div>

      <!-- 214 班電子佈告欄無縫內嵌主視窗 -->
      <div class="bulletin-embed-container">
        <div class="skeleton-loader" id="bulletin-skeleton">
          <div class="skeleton-bar h-lg"></div>
          <div class="skeleton-bar h-md"></div>
          <div class="skeleton-bar h-sm"></div>
          <div class="skeleton-bar h-card"></div>
          <div class="skeleton-bar h-md"></div>
          <div class="skeleton-bar h-sm"></div>
        </div>
        <iframe id="bulletin-iframe"
                class="bulletin-iframe"
                src="${currentUrl}"
                loading="lazy"
                allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  const iframe = document.getElementById('bulletin-iframe');
  const skeleton = document.getElementById('bulletin-skeleton');
  const tabBtns = container.querySelectorAll('.bulletin-tab-btn');
  const reloadBtn = document.getElementById('bulletin-reload-btn');

  iframe?.addEventListener('load', () => {
    skeleton?.classList.add('hidden');
  });

  function switchPortal(portalKey) {
    const targetUrl = getPortalUrl(portalKey);

    skeleton?.classList.remove('hidden');
    iframe.src = targetUrl;
    store.set('bulletinPortal', portalKey);

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

