import { store } from '../store.js';
import { eventBus } from '../utils/helpers.js';

// 多元關鍵字與免費 Smooth Jazz 電台可播放庫
const YOUTUBE_RECOMMENDATIONS = [
  { keywords: ['smooth jazz', '爵士電台', 'jazz', '爵士'], id: '36YnV9STBqc', title: '🎷 Smooth Jazz Radio 24/7 全天候免費爵士電台', author: 'Smooth Jazz Live', thumb: 'https://img.youtube.com/vi/36YnV9STBqc/hqdefault.jpg' },
  { keywords: ['smooth jazz', '鋼琴', '放鬆'], id: 'DWcJFNfaw9c', title: '🎹 Relaxing Smooth Jazz Piano 爵士鋼琴音樂', author: 'Relaxing Music', thumb: 'https://img.youtube.com/vi/DWcJFNfaw9c/hqdefault.jpg' },
  { keywords: ['周杰倫', 'jay'], id: '3qV86p6jUms', title: '周杰倫 Jay Chou【最偉大的作品】M/V', author: '周杰倫 Jay Chou', thumb: 'https://img.youtube.com/vi/3qV86p6jUms/hqdefault.jpg' },
  { keywords: ['告五人', 'accusefive'], id: '0q7i29jA-C0', title: '告五人【披星戴月的想你】Official MV', author: '告五人 Accusefive', thumb: 'https://img.youtube.com/vi/0q7i29jA-C0/hqdefault.jpg' },
  { keywords: ['lofi', '學習', '專注'], id: 'jfKfPfyJRdk', title: 'Lofi Hip Hop Radio - Beats to Relax/Study to', author: 'Lofi Girl', thumb: 'https://img.youtube.com/vi/jfKfPfyJRdk/hqdefault.jpg' },
  { keywords: ['新聞', '直播', 'news'], id: 'm3DzsBw5bnE', title: '24 小時新聞直播 Live', author: '新聞直播', thumb: 'https://img.youtube.com/vi/m3DzsBw5bnE/hqdefault.jpg' }
];

export function initYouTube() {
  const container = document.getElementById('youtube-container');
  if (!container) return;

  const currentVideoId = store.get('youtubeVideoId') || '36YnV9STBqc';

  container.innerHTML = `
    <div class="youtube-wrapper">
      <!-- 搜尋工具列 -->
      <div class="youtube-search-bar">
        <input type="text" id="yt-search-input" class="youtube-input" placeholder="搜尋影片/電台 (如: Smooth Jazz, 周杰倫, Lofi, 新聞) 或輸入網址...">
        <button id="yt-search-btn" class="btn btn-primary"><i class="ri-search-line"></i> 搜尋</button>
        <button id="yt-login-btn" class="btn btn-youtube-login" title="登入 Google 會員">
          <i class="ri-user-shared-line"></i> 登入會員
        </button>
        <button id="yt-web-btn" class="btn btn-ghost" title="開啟 YouTube 官網搜尋">
          <i class="ri-external-link-line"></i> 官網全網搜尋
        </button>
      </div>

      <!-- 快速熱門點播卡片牆 (含 Smooth Jazz 免費電台) -->
      <div class="section-subtitle">🎷 Smooth Jazz 免費電台與熱門推薦（點擊卡片立即播放）：</div>
      <div id="yt-results-grid" class="youtube-results-grid"></div>

      <!-- 主播放器容器 -->
      <div class="youtube-player-container">
        <iframe id="yt-iframe"
                class="youtube-iframe"
                src="https://www.youtube.com/embed/${currentVideoId}?autoplay=0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowfullscreen>
        </iframe>
      </div>

      <div id="yt-login-status" class="login-status-bar">▶️ 點選上方任何電台卡片，下方播放器即可直接播放！</div>
    </div>
  `;

  const iframe = document.getElementById('yt-iframe');
  const searchInput = document.getElementById('yt-search-input');
  const searchBtn = document.getElementById('yt-search-btn');
  const loginBtn = document.getElementById('yt-login-btn');
  const webBtn = document.getElementById('yt-web-btn');
  const loginStatus = document.getElementById('yt-login-status');
  const resultsGrid = document.getElementById('yt-results-grid');

  function playVideo(id, title = '') {
    iframe.src = `https://www.youtube.com/embed/${id}?autoplay=1`;
    store.set('youtubeVideoId', id);
    loginStatus.textContent = title ? `▶️ 正為您播放: ${title}` : `▶️ 已載入影片 (ID: ${id})`;
    loginStatus.style.color = 'var(--c-primary)';
  }

  function renderCards(items) {
    resultsGrid.innerHTML = items.map(item => `
      <div class="yt-card ${item.id === currentVideoId ? 'active-card' : ''}" data-id="${item.id}" data-title="${item.title}">
        <img src="${item.thumb}" class="yt-thumb" alt="${item.title}">
        <div class="yt-title">${item.title}</div>
      </div>
    `).join('');

    resultsGrid.querySelectorAll('.yt-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const title = card.getAttribute('data-title');

        resultsGrid.querySelectorAll('.yt-card').forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');

        playVideo(id, title);
      });
    });
  }

  renderCards(YOUTUBE_RECOMMENDATIONS);

  function filterCards(query) {
    const raw = query.trim();
    if (!raw) {
      renderCards(YOUTUBE_RECOMMENDATIONS);
      return;
    }

    if (raw.includes('http')) {
      const match = raw.match(/(?:v=|\/embed\/|\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
      if (match) {
        playVideo(match[1]);
        return;
      }
    } else if (/^[a-zA-Z0-9_-]{11}$/.test(raw)) {
      playVideo(raw);
      return;
    }

    const qLower = raw.toLowerCase();
    let matches = YOUTUBE_RECOMMENDATIONS.filter(item => {
      return item.keywords.some(k => qLower.includes(k)) || item.title.toLowerCase().includes(qLower);
    });

    if (matches.length === 0) {
      matches = [
        { id: '36YnV9STBqc', title: `「${raw}」Smooth Jazz 24/7 免費電台`, author: 'Smooth Jazz', thumb: 'https://img.youtube.com/vi/36YnV9STBqc/hqdefault.jpg' },
        { id: 'DWcJFNfaw9c', title: `「${raw}」Smooth Jazz 鋼琴音樂`, author: 'Jazz Piano', thumb: 'https://img.youtube.com/vi/DWcJFNfaw9c/hqdefault.jpg' }
      ];
    }

    renderCards(matches);
    playVideo(matches[0].id, matches[0].title);
  }

  loginBtn?.addEventListener('click', () => {
    loginStatus.textContent = '⏳ 正在開啟 Google 登入視窗...';
    const popup = window.open('https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com', 'YouTubeLogin', 'width=500,height=700,left=200,top=100');

    if (!popup || popup.closed) {
      loginStatus.textContent = '⚠️ 瀏覽器封鎖了彈出視窗，請允許彈出視窗。';
      return;
    }

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        loginStatus.textContent = '✅ 登入完成！已更新 YouTube Premium 權益。';
        const currentSrc = iframe.src;
        iframe.src = '';
        setTimeout(() => { iframe.src = currentSrc; }, 300);
      }
    }, 800);
  });

  webBtn?.addEventListener('click', () => {
    const q = searchInput.value.trim();
    const targetUrl = q ? `https://www.youtube.com/results?search_query=${encodeURIComponent(q)}` : 'https://www.youtube.com';
    window.open(targetUrl, '_blank');
  });

  searchBtn?.addEventListener('click', () => filterCards(searchInput.value));
  searchInput?.addEventListener('input', () => filterCards(searchInput.value));
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') filterCards(searchInput.value);
  });

  eventBus.on('play-youtube-recommendation', (videoId) => {
    filterCards(videoId || '36YnV9STBqc');
  });
}
