import { store } from '../store.js';
import { eventBus } from '../utils/helpers.js';

const RADIO_STREAMS = [
  // 🎷 順暢爵士與沙發樂 (Smooth Jazz & Lounge)
  { id: 'smoothjazz-global', name: '🎷 SmoothJazz.com Global Radio', url: 'https://smoothjazz.cdnstream1.com/2585_128.mp3', group: '🎷 順暢爵士與沙發樂', desc: '全球第一 Smooth Jazz 24 小時廣播電台' },
  { id: 'smoothjazz-klassik', name: '🎷 Klassik Smooth Jazz (德系高音質)', url: 'https://stream.klassikradio.de/smooth/mp3-192', group: '🎷 順暢爵士與沙發樂', desc: '高品質 192kbps 柔順爵士廣播頻道' },
  { id: 'smoothjazz-florida', name: '🎷 Smooth Jazz Florida (美式爵士)', url: 'https://smoothjazz.cdnstream1.com/2586_128.mp3', group: '🎷 順暢爵士與沙發樂', desc: '美式陽光悠閒爵士樂頻道' },
  { id: 'lounge-klassik', name: '🍸 Klassik Radio Lounge (高級沙發樂)', url: 'https://stream.klassikradio.de/lounge/mp3-192', group: '🎷 順暢爵士與沙發樂', desc: '192kbps Lounge & Chillout 舒壓電台' },

  // 🎧 Lofi & Chill 放鬆專注 (Lofi Beats)
  { id: 'lofi-girl-relay', name: '🎧 Lofi Girl Chill Beats (放鬆學習)', url: 'https://stream.zeno.fm/f3wvbbqmdg8uv', group: '🎧 Lofi & Chill 放鬆專注', desc: '工作、閱讀與編程專用 24h Lofi 音樂' },
  { id: 'chillhop-radio', name: '☕ Chillhop Radio (專注節奏樂)', url: 'https://stream.zeno.fm/0r0xa792kwzuv', group: '🎧 Lofi & Chill 放鬆專注', desc: '極簡輕快 Hip-Hop 節奏音樂' },

  // 📻 SomaFM 全球免登入電台 (SomaFM Stations)
  { id: 'somafm-groovesalad', name: '🥗 SomaFM Groove Salad (輕柔電子)', url: 'https://ice1.somafm.com/groovesalad-128-mp3', group: '📻 SomaFM 免登入電台', desc: '全球知名無廣告 Ambient & Chill 串流' },
  { id: 'somafm-secretagent', name: '🕵️ SomaFM Secret Agent (爵士電影)', url: 'https://ice1.somafm.com/secretagent-128-mp3', group: '📻 SomaFM 免登入電台', desc: '間諜電影原聲與復古爵士風格樂' },
  { id: 'somafm-chill', name: '❄️ SomaFM Chillout (舒壓氛圍)', url: 'https://ice1.somafm.com/chill-128-mp3', group: '📻 SomaFM 免登入電台', desc: '放鬆心靈與沉浸式純音樂' },
  { id: 'somafm-lush', name: '🌸 SomaFM Lush (美聲感官輕音樂)', url: 'https://ice1.somafm.com/lush-128-mp3', group: '📻 SomaFM 免登入電台', desc: '溫柔舒適的純人聲與輕音樂' },

  // 🎹 古典鋼琴與獨奏 (Piano & Classical)
  { id: 'piano-klassik', name: '🎹 Klassik Radio Piano (古典鋼琴)', url: 'https://stream.klassikradio.de/piano/mp3-192', group: '🎹 古典鋼琴與獨奏', desc: '192kbps 高音質鋼琴獨奏與大師作品' },
  { id: 'lounge-piano', name: '🎹 FFH Piano & Lounge (鋼琴沙發樂)', url: 'https://mp3.ffh.de/ffhchannels/hqlounge.mp3', group: '🎹 古典鋼琴與獨奏', desc: '柔和獨奏鋼琴與放鬆純樂器演奏' },

  // 🍃 專注純音樂與搖滾 (Radio Paradise)
  { id: 'mellow-rp', name: '🍃 Radio Paradise Mellow (專注純樂器)', url: 'https://stream.radioparadise.com/mellow-128', group: '🍃 專注純音樂與搖滾', desc: '無廣告、工作專注與吉他純樂器輕音樂' },
  { id: 'main-rp', name: '🎸 Radio Paradise Main Mix (多元混合)', url: 'https://stream.radioparadise.com/mp3-128', group: '🍃 專注純音樂與搖滾', desc: '高音質多元音樂調和廣播串流' },
  { id: 'rock-rp', name: '🎸 Radio Paradise Rock (搖滾音樂頻譜)', url: 'https://stream.radioparadise.com/rock-128', group: '🍃 專注純音樂與搖滾', desc: '搖滾與動感原聲頻譜' }
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

  // Render Select Options with Grouping
  if (selectEl) {
    const groups = [...new Set(RADIO_STREAMS.map(s => s.group))];
    selectEl.innerHTML = groups.map(groupName => {
      const items = RADIO_STREAMS.filter(s => s.group === groupName);
      return `<optgroup label="${groupName}">
        ${items.map(s => `<option value="${s.url}">${s.name}</option>`).join('')}
      </optgroup>`;
    }).join('');

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
