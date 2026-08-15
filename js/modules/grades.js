const GRADES_URL = 'https://script.google.com/a/macros/webmail.ccsh.tp.edu.tw/s/AKfycbwtmiwyFUYcw2_sXZHcjKF8c8AgVHVhb8EnEyN2VyrybyW5PLYMPo577tOSvv8-kPS7NQ/exec';

export function initGrades() {
  const container = document.getElementById('grades-container');
  if (!container) return;

  container.innerHTML = `
    <div class="grades-wrapper">
      <!-- 內嵌工具列 -->
      <div class="grades-nav-bar">
        <button class="grades-tab-btn active" id="grades-home-btn">
          <i class="ri-graduation-cap-line"></i> 學生成績查詢
        </button>
        <button id="grades-reload-btn" class="btn btn-secondary btn-sm" title="重新載入">
          <i class="ri-refresh-line"></i> 重新載入
        </button>
        <a href="${GRADES_URL}" target="_blank" rel="noopener noreferrer" class="btn btn-ghost btn-sm" style="text-decoration: none; display: flex; align-items: center; gap: 4px;" title="在新分頁開啟">
          <i class="ri-external-link-line"></i> 另開視窗
        </a>
      </div>

      <!-- 成績系統無縫內嵌主視窗 -->
      <div class="grades-embed-container">
        <div class="skeleton-loader" id="grades-skeleton">
          <div class="skeleton-bar h-lg"></div>
          <div class="skeleton-bar h-md"></div>
          <div class="skeleton-bar h-sm"></div>
          <div class="skeleton-bar h-card"></div>
          <div class="skeleton-bar h-md"></div>
          <div class="skeleton-bar h-sm"></div>
        </div>
        <iframe id="grades-iframe"
                class="grades-iframe"
                src="${GRADES_URL}"
                loading="lazy"
                allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  const iframe = document.getElementById('grades-iframe');
  const skeleton = document.getElementById('grades-skeleton');
  const reloadBtn = document.getElementById('grades-reload-btn');
  const homeBtn = document.getElementById('grades-home-btn');

  iframe?.addEventListener('load', () => {
    skeleton?.classList.add('hidden');
  });

  reloadBtn?.addEventListener('click', () => {
    const currentSrc = iframe.src;
    skeleton?.classList.remove('hidden');
    iframe.src = '';
    setTimeout(() => { iframe.src = currentSrc; }, 200);
  });

  homeBtn?.addEventListener('click', () => {
    skeleton?.classList.remove('hidden');
    iframe.src = GRADES_URL;
  });
}
