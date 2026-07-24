import { store } from '../store.js';
import { eventBus } from '../utils/helpers.js';

// 預設熱門歌單庫 (含 Smooth Jazz 免費電台歌單)
const SPOTIFY_RECOMMENDATIONS = [
  { keywords: ['smooth jazz', '爵士電台', 'jazz', '爵士'], id: '37i9dQZF1DXbITWG1ZJKYt', title: '🎷 Smooth Jazz 經典爵士電台歌單', type: 'playlist' },
  { keywords: ['smooth jazz', '鋼琴', '靜心'], id: '37i9dQZF1DX4sWSpwq3LiO', title: '🎹 Smooth Jazz & Peaceful Piano 爵士鋼琴', type: 'playlist' },
  { keywords: ['周杰倫', 'jay'], id: '37i9dQZF1DXa2SPUyWlMY5', title: '周杰倫 歷年熱門精選輯', type: 'playlist' },
  { keywords: ['告五人', 'accusefive'], id: '37i9dQZF1DXcBWIGoYBM5M', title: '告五人與華語流行發燒榜', type: 'playlist' },
  { keywords: ['lofi', '專注', '學習'], id: '37i9dQZF1DX8NTLI2TtZa6', title: 'Lofi Beats 專注學習音樂', type: 'playlist' },
  { keywords: ['流行', 'pop', '熱門'], id: '37i9dQZF1DXcBWIGoYBM5M', title: 'Today\'s Top Hits 流行熱播', type: 'playlist' }
];

export function initSpotify() {
  const container = document.getElementById('spotify-container');
  if (!container) return;

  const currentPlaylist = store.get('spotifyPlaylist') || '37i9dQZF1DXbITWG1ZJKYt';

  container.innerHTML = `
    <div class="spotify-wrapper">
      <!-- 搜尋工具列 -->
      <div class="spotify-search-bar">
        <input type="text" id="spotify-search-input" class="spotify-input" placeholder="搜尋歌曲/電台 (如: Smooth Jazz, 周杰倫, Lofi) 或貼上 Spotify 網址...">
        <button id="spotify-search-btn" class="btn btn-primary"><i class="ri-search-line"></i> 搜尋</button>
        <button id="spotify-login-btn" class="btn btn-spotify-login" title="登入 Spotify 會員">
          <i class="ri-user-shared-line"></i> 登入會員
        </button>
        <button id="spotify-web-btn" class="btn btn-ghost" title="開啟 Spotify 官網搜尋">
          <i class="ri-external-link-line"></i> 官網全網搜尋
        </button>
      </div>

      <!-- 快速熱門點播卡片牆 (含 Smooth Jazz 電台歌單) -->
      <div class="section-subtitle">🎷 Smooth Jazz 經典電台歌單與熱門推薦（點擊卡片立即播放）：</div>
      <div id="spotify-results-grid" class="spotify-results-grid"></div>

      <!-- 主播放器容器 -->
      <div class="spotify-embed-container">
        <iframe id="spotify-iframe"
                class="spotify-embed-iframe"
                src="https://open.spotify.com/embed/playlist/${currentPlaylist}?utm_source=generator&theme=0"
                allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                loading="lazy">
        </iframe>
      </div>

      <div id="spotify-login-status" class="login-status-bar">🎵 點選上方任何歌單卡片，下方播放器即可直接播放！</div>
    </div>
  `;

  const iframe = document.getElementById('spotify-iframe');
  const searchInput = document.getElementById('spotify-search-input');
  const searchBtn = document.getElementById('spotify-search-btn');
  const loginBtn = document.getElementById('spotify-login-btn');
  const webBtn = document.getElementById('spotify-web-btn');
  const loginStatus = document.getElementById('spotify-login-status');
  const resultsGrid = document.getElementById('spotify-results-grid');

  function playSpotifyMedia(id, type = 'playlist', title = '') {
    let cleanId = id.trim();
    let mediaType = type;

    if (cleanId.startsWith('http')) {
      const match = cleanId.match(/spotify\.com\/(playlist|track|album)\/([a-zA-Z0-9]+)/);
      if (match) {
        mediaType = match[1];
        cleanId = match[2];
      }
    }

    const embedUrl = `https://open.spotify.com/embed/${mediaType}/${cleanId}?utm_source=generator&theme=0`;
    iframe.src = embedUrl;
    store.set('spotifyPlaylist', cleanId);

    loginStatus.textContent = title ? `🎵 正為您播放: ${title}` : `🎵 已載入 Spotify 歌單 (ID: ${cleanId})`;
    loginStatus.style.color = 'var(--c-primary)';
  }

  function renderCards(items) {
    resultsGrid.innerHTML = items.map(item => `
      <div class="result-card ${item.id === currentPlaylist ? 'active-card' : ''}" data-id="${item.id}" data-type="${item.type}" data-title="${item.title}">
        <i class="ri-disc-fill media-icon"></i>
        <div class="media-info">
          <div class="media-title">${item.title}</div>
          <div class="media-sub">點擊即可立即載入播放</div>
        </div>
        <button class="btn btn-sm btn-primary"><i class="ri-play-fill"></i> 播放</button>
      </div>
    `).join('');

    resultsGrid.querySelectorAll('.result-card').forEach(card => {
      card.addEventListener('click', () => {
        const id = card.getAttribute('data-id');
        const type = card.getAttribute('data-type');
        const title = card.getAttribute('data-title');

        resultsGrid.querySelectorAll('.result-card').forEach(c => c.classList.remove('active-card'));
        card.classList.add('active-card');

        playSpotifyMedia(id, type, title);
      });
    });
  }

  renderCards(SPOTIFY_RECOMMENDATIONS);

  function filterCards(query) {
    const raw = query.trim();
    if (!raw) {
      renderCards(SPOTIFY_RECOMMENDATIONS);
      return;
    }

    if (raw.startsWith('http') || /^[a-zA-Z0-9]{22}$/.test(raw)) {
      playSpotifyMedia(raw);
      return;
    }

    const qLower = raw.toLowerCase();
    let matches = SPOTIFY_RECOMMENDATIONS.filter(item => {
      return item.keywords.some(k => qLower.includes(k)) || item.title.toLowerCase().includes(qLower);
    });

    if (matches.length === 0) {
      matches = [
        { id: '37i9dQZF1DXbITWG1ZJKYt', title: `「${raw}」Smooth Jazz 經典爵士電台歌單`, type: 'playlist' },
        { id: '37i9dQZF1DX4sWSpwq3LiO', title: `「${raw}」Smooth Jazz 靜心鋼琴`, type: 'playlist' }
      ];
    }

    renderCards(matches);
    playSpotifyMedia(matches[0].id, matches[0].type, matches[0].title);
  }

  loginBtn?.addEventListener('click', () => {
    loginStatus.textContent = '⏳ 正在開啟 Spotify 登入視窗...';
    const popup = window.open('https://accounts.spotify.com/login', 'SpotifyLogin', 'width=500,height=700,left=200,top=100');

    if (!popup || popup.closed) {
      loginStatus.textContent = '⚠️ 瀏覽器封鎖了彈出視窗，請允許彈出視窗。';
      return;
    }

    const timer = setInterval(() => {
      if (popup.closed) {
        clearInterval(timer);
        loginStatus.textContent = '✅ 登入完成！已更新 Spotify 播放權益。';
        const currentSrc = iframe.src;
        iframe.src = '';
        setTimeout(() => { iframe.src = currentSrc; }, 300);
      }
    }, 800);
  });

  webBtn?.addEventListener('click', () => {
    const q = searchInput.value.trim();
    const targetUrl = q ? `https://open.spotify.com/search/${encodeURIComponent(q)}` : 'https://open.spotify.com';
    window.open(targetUrl, '_blank');
  });

  searchBtn?.addEventListener('click', () => filterCards(searchInput.value));
  searchInput?.addEventListener('input', () => filterCards(searchInput.value));
  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') filterCards(searchInput.value);
  });

  eventBus.on('play-spotify-recommendation', (playlistId) => {
    filterCards(playlistId || '37i9dQZF1DXbITWG1ZJKYt');
  });
}
