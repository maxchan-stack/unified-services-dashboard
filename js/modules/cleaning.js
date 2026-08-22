export function initCleaning() {
  const container = document.getElementById('cleaning-container');
  if (!container) return;

  container.innerHTML = `
    <div class="island-wrapper" style="display: flex; flex-direction: column; height: 100%; width: 100%; gap: 0.5rem;">
      <div class="island-toolbar" style="display: flex; justify-content: space-between; align-items: center; padding: 0.5rem 0.85rem; background: var(--bg-card); border-radius: var(--radius-md); border: 1px solid var(--border-color); flex-wrap: wrap; gap: 0.5rem;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <i class="ri-brush-3-line" style="color: var(--primary); font-size: 1.1rem;"></i>
          <span style="font-weight: 700; font-size: 0.9rem; color: var(--text-primary);">214 班打掃排班與值日生管理系統</span>
          <span class="badge" style="font-size: 0.72rem; padding: 0.15rem 0.45rem; background: rgba(59, 130, 246, 0.1); color: var(--primary); border: 1px solid rgba(59, 130, 246, 0.2); border-radius: 999px;">Cloudflare Pages 即時連線</span>
        </div>
        <div style="display: flex; gap: 0.5rem; align-items: center;">
          <button id="cleaning-reload-btn" class="btn btn-secondary btn-sm" title="重新載入排班系統" style="display: flex; align-items: center; gap: 0.3rem;">
            <i class="ri-refresh-line"></i> 重新整理
          </button>
          <button id="cleaning-web-btn" class="btn btn-primary btn-sm" title="在獨立分頁開啟全螢幕排班系統" style="display: flex; align-items: center; gap: 0.3rem;">
            <i class="ri-external-link-line"></i> 開啟獨立新分頁
          </button>
        </div>
      </div>

      <div class="island-embed-container" style="flex: 1; height: calc(100vh - 170px); width: 100%; border-radius: var(--radius-md); overflow: hidden; border: 1px solid var(--border-color); background: white;">
        <iframe id="cleaning-iframe"
                class="island-iframe"
                src="https://class-clean-schedule.pages.dev"
                style="width: 100%; height: 100%; border: none;"
                loading="lazy"
                allow="clipboard-read; clipboard-write; fullscreen"
                allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  const iframe = document.getElementById('cleaning-iframe');
  const reloadBtn = document.getElementById('cleaning-reload-btn');
  const webBtn = document.getElementById('cleaning-web-btn');

  reloadBtn?.addEventListener('click', () => {
    const currentSrc = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = currentSrc; }, 200);
  });

  webBtn?.addEventListener('click', () => {
    window.open('https://class-clean-schedule.pages.dev', '_blank');
  });
}
