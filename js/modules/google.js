import { store } from '../store.js';
import { eventBus } from '../utils/helpers.js';

export function initGoogle() {
  const container = document.getElementById('google-container');
  if (!container) return;

  const currentQuery = store.get('googleMapQuery') || 'Taipei 101';

  container.innerHTML = `
    <div class="google-wrapper">
      <div class="google-search-bar">
        <input type="text" id="gmaps-search-input" class="google-input" placeholder="搜尋地點 (如: 台北 101, 京都清水寺)..." value="${currentQuery}">
        <button id="gmaps-search-btn" class="btn btn-primary btn-sm"><i class="ri-map-pin-line"></i> 搜尋地圖</button>
        <button id="gsearch-btn" class="btn btn-secondary btn-sm" title="開啟 Google 網頁搜尋"><i class="ri-google-fill"></i> 網頁搜尋</button>
      </div>

      <div class="google-maps-container">
        <iframe id="gmaps-iframe"
                class="gmaps-iframe"
                src="https://www.google.com/maps?q=${encodeURIComponent(currentQuery)}&output=embed"
                loading="lazy"
                allowfullscreen>
        </iframe>
      </div>
    </div>
  `;

  const iframe = document.getElementById('gmaps-iframe');
  const searchInput = document.getElementById('gmaps-search-input');
  const mapsBtn = document.getElementById('gmaps-search-btn');
  const searchBtn = document.getElementById('gsearch-btn');

  function updateMapQuery(query) {
    const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;
    iframe.src = mapUrl;
    store.set('googleMapQuery', query);
  }

  mapsBtn?.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q) updateMapQuery(q);
  });

  searchBtn?.addEventListener('click', () => {
    const q = searchInput.value.trim();
    if (q) window.open(`https://www.google.com/search?q=${encodeURIComponent(q)}`, '_blank');
  });

  searchInput?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const q = searchInput.value.trim();
      if (q) updateMapQuery(q);
    }
  });

  eventBus.on('update-google-map', (query) => {
    updateMapQuery(query || 'Taipei 101');
  });
}
