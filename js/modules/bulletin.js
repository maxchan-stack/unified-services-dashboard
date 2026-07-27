import { store } from '../store.js';

// ADMIN_SECRET 為 'a8b414c024b8'，帶入 URL 參數 ?admin=a8b414c024b8 即可自動完成管理員密鑰填入與驗證
const BULLETIN_PORTALS = {
  bulletin: 'https://maxchan-stack.github.io/bulletin-board-web/bulletin.html',
  student: 'https://maxchan-stack.github.io/bulletin-board-web/index.html',
  parent: 'https://maxchan-stack.github.io/bulletin-board-web/parent.html',
  admin: 'https://maxchan-stack.github.io/bulletin-board-web/admin.html?admin=a8b414c024b8'
};

export function initBulletin() {
  const container = document.getElementById('bulletin-container');
  if (!container) return;

  const currentTab = store.get('bulletinPortal') || 'bulletin';
  const currentUrl = BULLETIN_PORTALS[currentTab] || BULLETIN_PORTALS.bulletin;

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
        <button class="bulletin-tab-btn ${currentTab === 'admin' ? 'active' : ''}" data-portal="admin">
          <i class="ri-edit-box-line"></i> 導師發布台
        </button>
        <button id="bulletin-reload-btn" class="btn btn-secondary btn-sm" title="重新載入">
          <i class="ri-refresh-line"></i> 重新載入
        </button>
      </div>

      <!-- 214 班電子佈告欄無縫內嵌主視窗 -->
      <div class="bulletin-embed-container">
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
  const tabBtns = container.querySelectorAll('.bulletin-tab-btn');
  const reloadBtn = document.getElementById('bulletin-reload-btn');

  function switchPortal(portalKey) {
    const targetUrl = BULLETIN_PORTALS[portalKey] || BULLETIN_PORTALS.bulletin;
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
    iframe.src = '';
    setTimeout(() => { iframe.src = currentSrc; }, 200);
  });
}
