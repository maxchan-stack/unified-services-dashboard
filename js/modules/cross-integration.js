import { store } from '../store.js';
import { eventBus } from '../utils/helpers.js';

export function initCrossIntegration() {
  // Global Event Listener Router
  eventBus.on('play-spotify-recommendation', (playlistId) => {
    // If in tab mode, switch tab to spotify
    if (store.get('layoutMode') === 'tab') {
      store.set('activeTab', 'spotify');
    }
  });

  eventBus.on('play-youtube-recommendation', (videoId) => {
    if (store.get('layoutMode') === 'tab') {
      store.set('activeTab', 'youtube');
    }
  });

  eventBus.on('update-google-map', (query) => {
    if (store.get('layoutMode') === 'tab') {
      store.set('activeTab', 'google');
    }
  });
}
