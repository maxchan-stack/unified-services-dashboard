import { store } from '../store.js';
import { eventBus } from '../utils/helpers.js';

const RADIO_STREAMS = [
  // 🎷 Smooth Jazz 順暢爵士區
  { id: 'smoothjazz-global', name: '🎷 SmoothJazz.com Global Radio', url: 'https://smoothjazz.cdnstream1.com/2585_128.mp3', category: 'jazz', tag: 'Smooth Jazz', desc: '全球第一 Smooth Jazz 24 小時廣播電台' },
  { id: 'smoothjazz-klassik', name: '🎷 Klassik Smooth Jazz (德系爵士)', url: 'https://stream.klassikradio.de/smooth/mp3-192', category: 'jazz', tag: 'Smooth Jazz', desc: '高品質 192kbps 柔順爵士廣播頻道' },
  { id: 'smoothjazz-florida', name: '🎷 Smooth Jazz Florida (佛羅里達)', url: 'https://smoothjazz.cdnstream1.com/2586_128.mp3', category: 'jazz', tag: 'Smooth Jazz', desc: '美式陽光悠閒爵士樂頻道' },
  
  // 🎹 Classical & Solo Piano 古典鋼琴區
  { id: 'piano-klassik', name: '🎹 Klassik Radio Piano (古典鋼琴)', url: 'https://stream.klassikradio.de/piano/mp3-192', category: 'piano', tag: '古典鋼琴', desc: '192kbps 高音質鋼琴獨奏與大師作品' },
  { id: 'lounge-piano', name: '🎹 FFH Piano & Lounge (鋼琴沙發樂)', url: 'https://mp3.ffh.de/ffhchannels/hqlounge.mp3', category: 'piano', tag: '古典鋼琴', desc: '柔和獨奏鋼琴與放鬆純樂器演奏' },
  
  // 🍃 Light Music & Mellow 輕音樂專注區
  { id: 'mellow-rp', name: '🍃 Radio Paradise Mellow (專注純音樂)', url: 'https://stream.radioparadise.com/mellow-128', category: 'mellow', tag: '專注輕音樂', desc: '無廣告、工作專注與吉他純樂器輕音樂' },
  
  // 🍸 Lounge & Bossa Nova 舒壓沙發樂區
  { id: 'lounge-klassik', name: '🍸 Klassik Radio Lounge (高級沙發樂)', url: 'https://stream.klassikradio.de/lounge/mp3-192', category: 'lounge', tag: '舒壓沙發樂', desc: '192kbps Lounge & Chillout 舒壓電台' },
  { id: 'bossa-rp', name: '🍸 Radio Paradise Global (Bossa Nova)', url: 'https://stream.radioparadise.com/eclectic-128', category: 'lounge', tag: 'Bossa Nova', desc: '融合 Bossa Nova 與異國風情輕快爵士' }
];

export function initSmoothJazz() {
  const player = document.getElementById('sticky-radio-player');
  const audio = document.getElementById('radio-audio-element');
  if (!player || !audio) return;

  const playBtn = document.getElementById('sticky-play-btn');
  const playIcon = document.getElementById('sticky-play-icon');
  const equalizer = document.getElementById('sticky-equalizer');
  const titleEl = document.getElementById('sticky-station-title');
  const statusEl = document.getElementById('sticky-status-text');
  const selectEl = document.getElementById('sticky-station-select');
  const volumeSlider = document.getElementById('sticky-volume-slider');

  let isPlaying = false;

  // Render Select Options
  if (selectEl) {
    selectEl.innerHTML = RADIO_STREAMS.map(s => `
      <option value="${s.url}">${s.name}</option>
    `).join('');

    const savedUrl = store.get('radioStreamUrl') || RADIO_STREAMS[0].url;
    selectEl.value = savedUrl;
    
    const currentStream = RADIO_STREAMS.find(s => s.url === savedUrl) || RADIO_STREAMS[0];
    titleEl.textContent = currentStream.name;
    audio.src = savedUrl;
  }

  function playStream(url, name) {
    store.set('radioStreamUrl', url);
    audio.src = url;
    if (selectEl) selectEl.value = url;
    if (titleEl) titleEl.textContent = name;

    statusEl.textContent = '⏳ 正在連線廣播...';
    audio.play().then(() => {
      isPlaying = true;
      playIcon.className = 'ri-pause-fill';
      statusEl.textContent = '▶️ 正在直播收聽中';
      equalizer?.classList.add('playing');
    }).catch(err => {
      statusEl.textContent = `⚠️ 連線失敗: ${err.message}`;
      isPlaying = false;
      playIcon.className = 'ri-play-fill';
      equalizer?.classList.remove('playing');
    });
  }

  function togglePlay() {
    if (isPlaying) {
      audio.pause();
      isPlaying = false;
      playIcon.className = 'ri-play-fill';
      statusEl.textContent = '已暫停播放';
      equalizer?.classList.remove('playing');
    } else {
      const selectedUrl = selectEl?.value || RADIO_STREAMS[0].url;
      const currentStream = RADIO_STREAMS.find(s => s.url === selectedUrl) || RADIO_STREAMS[0];
      playStream(selectedUrl, currentStream.name);
    }
  }

  playBtn?.addEventListener('click', togglePlay);

  selectEl?.addEventListener('change', (e) => {
    const selectedUrl = e.target.value;
    const currentStream = RADIO_STREAMS.find(s => s.url === selectedUrl) || RADIO_STREAMS[0];
    playStream(selectedUrl, currentStream.name);
  });

  volumeSlider?.addEventListener('input', (e) => {
    audio.volume = parseFloat(e.target.value);
  });

  // 番茄鐘開啟專注時：自動連結隨機電台並播放
  eventBus.on('play-random-radio', () => {
    const randomIndex = Math.floor(Math.random() * RADIO_STREAMS.length);
    const randomStation = RADIO_STREAMS[randomIndex];
    console.log('[Radio] 番茄鐘連線隨機電台:', randomStation.name);
    playStream(randomStation.url, randomStation.name);
  });

  audio.addEventListener('error', () => {
    statusEl.textContent = '⚠️ 串流連線異常，請切換頻道。';
    isPlaying = false;
    playIcon.className = 'ri-play-fill';
    equalizer?.classList.remove('playing');
  });
}
