import { store } from '../store.js';

export function initIsland() {
  const container = document.getElementById('island-container');
  if (!container) return;

  container.innerHTML = `
    <div class="island-wrapper">
      <div class="island-toolbar">
        <button id="island-reload-btn" class="btn btn-secondary btn-sm" title="重新載入島民行政中心">
          <i class="ri-refresh-line"></i> 重新載入
        </button>
        <button id="island-web-btn" class="btn btn-primary btn-sm" title="在獨立分頁開啟全螢幕島民行政中心">
          <i class="ri-external-link-line"></i> 開啟完整全螢幕
        </button>
      </div>

      <div class="island-embed-container">
        <iframe id="island-iframe"
                class="island-iframe"
                src="./island.html"
                loading="lazy"
                allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  const iframe = document.getElementById('island-iframe');
  const reloadBtn = document.getElementById('island-reload-btn');
  const webBtn = document.getElementById('island-web-btn');

  reloadBtn?.addEventListener('click', () => {
    const currentSrc = iframe.src;
    iframe.src = '';
    setTimeout(() => { iframe.src = currentSrc; }, 200);
  });

  webBtn?.addEventListener('click', () => {
    window.open('./island.html', '_blank');
  });
}
