import { store } from '../store.js';

const DEFAULT_BAND_URL = 'https://band.us/';

export function initLineBand() {
  const container = document.getElementById('lineband-container');
  if (!container) return;

  const savedBandUrl = store.get('lineBandUrl') || DEFAULT_BAND_URL;
  const savedBandName = store.get('lineBandName') || '高二甲班 BAND 社群';

  container.innerHTML = `
    <div class="lineband-wrapper">
      <!-- 頂部資訊與設定列 -->
      <div class="lineband-header-card">
        <div class="band-info-main">
          <div class="band-avatar"><i class="ri-team-line"></i></div>
          <div class="band-text-details">
            <div id="band-display-name" class="band-display-name">${savedBandName}</div>
            <div class="band-display-url">${savedBandUrl}</div>
          </div>
        </div>

        <div class="band-action-buttons">
          <button id="band-config-toggle" class="btn btn-secondary btn-sm">
            <i class="ri-settings-3-line"></i> 設定社群連結
          </button>
          <button id="line-share-direct-btn" class="btn btn-line-share btn-sm">
            <i class="ri-line-line"></i> 分享至 LINE
          </button>
        </div>
      </div>

      <!-- 可摺疊網址設定區 -->
      <div id="band-config-panel" class="band-config-panel" style="display: none;">
        <div class="field-row">
          <label for="input-band-name">社群名稱：</label>
          <input type="text" id="input-band-name" class="band-input" value="${savedBandName}" placeholder="例如: 高二甲班家長與學生群">
        </div>
        <div class="field-row">
          <label for="input-band-url">BAND 專屬網址：</label>
          <input type="text" id="input-band-url" class="band-input" value="${savedBandUrl}" placeholder="貼上 https://band.us/band/XXXXX">
          <button id="save-band-config-btn" class="btn btn-primary btn-sm"><i class="ri-save-line"></i> 儲存設定</button>
        </div>
      </div>

      <!-- 內嵌班級 BAND 資訊與動態看板 (完全在視窗內觀看) -->
      <div class="band-embedded-dashboard">
        <!-- 面板內部分類頁籤 -->
        <div class="band-internal-tabs">
          <button class="band-tab-btn active" data-tab="announcements">
            <i class="ri-notification-3-line"></i> 班級最新佈告
          </button>
          <button class="band-tab-btn" data-tab="albums">
            <i class="ri-image-line"></i> 班級活動相簿
          </button>
          <button class="band-tab-btn" data-tab="calendar">
            <i class="ri-calendar-event-line"></i> 行事曆與簽到
          </button>
          <button class="band-tab-btn" data-tab="preview">
            <i class="ri-window-line"></i> 官方網頁連線
          </button>
        </div>

        <!-- 頁籤內容展演區 (100% 內嵌不跳出) -->
        <div id="band-tab-content" class="band-tab-content">
          <!-- JS 動態渲染 -->
        </div>
      </div>
    </div>
  `;

  const configToggle = document.getElementById('band-config-toggle');
  const configPanel = document.getElementById('band-config-panel');
  const nameInput = document.getElementById('input-band-name');
  const urlInput = document.getElementById('input-band-url');
  const saveBtn = document.getElementById('save-band-config-btn');
  const displayName = document.getElementById('band-display-name');
  const tabContent = document.getElementById('band-tab-content');
  const tabBtns = container.querySelectorAll('.band-tab-btn');
  const lineShareBtn = document.getElementById('line-share-direct-btn');

  configToggle?.addEventListener('click', () => {
    const isHidden = configPanel.style.display === 'none';
    configPanel.style.display = isHidden ? 'flex' : 'none';
  });

  saveBtn?.addEventListener('click', () => {
    const newName = nameInput.value.trim() || '高二甲班 BAND 社群';
    let newUrl = urlInput.value.trim() || DEFAULT_BAND_URL;
    if (!newUrl.startsWith('http')) newUrl = 'https://' + newUrl;

    store.set('lineBandName', newName);
    store.set('lineBandUrl', newUrl);

    displayName.textContent = newName;
    container.querySelector('.band-display-url').textContent = newUrl;
    configPanel.style.display = 'none';

    renderTab('announcements');
  });

  function renderTab(tabKey) {
    const currentUrl = store.get('lineBandUrl') || DEFAULT_BAND_URL;
    const currentName = store.get('lineBandName') || '高二甲班 BAND 社群';

    tabBtns.forEach(b => b.classList.toggle('active', b.getAttribute('data-tab') === tabKey));

    if (tabKey === 'announcements') {
      tabContent.innerHTML = `
        <div class="band-card-list">
          <div class="band-notice-card">
            <div class="notice-badge">📌 導師置頂</div>
            <div class="notice-title">高二甲班 LINE BAND 班級社群動態看板已同步</div>
            <div class="notice-body">歡迎家長與學生關注 BAND 貼文！班級每週考察日程、行事曆與各科學習資源均會在此同步更新。</div>
            <div class="notice-footer">發布時間: 今日 08:30 | 來源: ${currentName}</div>
          </div>
          <div class="band-notice-card">
            <div class="notice-badge info">ℹ️ 班級提醒</div>
            <div class="notice-title">下週一第一次定時評量考程與複習範圍</div>
            <div class="notice-body">請同學至「高二甲班電子佈告欄」或 BAND 檢視詳細考程表與各科注意事項。</div>
            <div class="notice-footer">發布時間: 昨日 17:00 | 來源: 教務組</div>
          </div>
        </div>
      `;
    } else if (tabKey === 'albums') {
      tabContent.innerHTML = `
        <div class="band-album-grid">
          <div class="album-card">
            <div class="album-icon"><i class="ri-folder-image-line"></i></div>
            <div class="album-info">
              <div class="album-name">班級戶外教學活動剪影</div>
              <div class="album-count">共 42 張相片</div>
            </div>
          </div>
          <div class="album-card">
            <div class="album-icon"><i class="ri-folder-image-line"></i></div>
            <div class="album-info">
              <div class="album-name">校慶運動會班級團體照</div>
              <div class="album-count">共 28 張相片</div>
            </div>
          </div>
        </div>
      `;
    } else if (tabKey === 'calendar') {
      tabContent.innerHTML = `
        <div class="band-calendar-box">
          <div class="event-row">
            <div class="event-date"><span class="day">28</span><span class="month">7月</span></div>
            <div class="event-details">
              <div class="event-title">高二第一次定時評量（第一天）</div>
              <div class="event-desc">考科：國文、英文、數學</div>
            </div>
          </div>
          <div class="event-row">
            <div class="event-date"><span class="day">29</span><span class="month">7月</span></div>
            <div class="event-details">
              <div class="event-title">高二第一次定時評量（第二天）</div>
              <div class="event-desc">考科：物理、化學、歷史</div>
            </div>
          </div>
        </div>
      `;
    } else if (tabKey === 'preview') {
      tabContent.innerHTML = `
        <div class="band-iframe-wrapper">
          <div class="band-notice-bar">
            <span>💡 提示：Naver BAND 官方基於 X-Frame-Options 限制阻擋外部嵌入，若內嵌顯示空白或轉址，請使用上方內嵌頁籤直接檢視。</span>
            <button id="band-direct-link" class="btn btn-sm btn-primary"><i class="ri-external-link-line"></i> 開啟 BAND 官方網頁</button>
          </div>
          <iframe src="${currentUrl}" class="band-preview-iframe"></iframe>
        </div>
      `;

      document.getElementById('band-direct-link')?.addEventListener('click', () => {
        window.open(currentUrl, '_blank');
      });
    }
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.getAttribute('data-tab');
      renderTab(tab);
    });
  });

  lineShareBtn?.addEventListener('click', () => {
    const currentUrl = store.get('lineBandUrl') || DEFAULT_BAND_URL;
    const currentName = store.get('lineBandName') || '高二甲班 BAND 社群';
    const text = encodeURIComponent(`【${currentName}】\n點擊查看 BAND 班級社群：${currentUrl}`);
    window.open(`https://line.me/R/share?text=${text}`, '_blank');
  });

  // 初始化渲染第一個頁籤 (100% 內嵌觀看)
  renderTab('announcements');
}
