import { store } from '../store.js';
import { debounce, eventBus } from './helpers.js';

/**
 * 100% 零帳號登入、零 Google 權限阻擋之「公用匿名雲端自動同步」模組
 */
const CLOUD_STORE_URL = 'https://api.jsonbin.io/v3/b/6695a74ee41b4d34e4125b20';
const ACCESS_KEY = '$2a$10$X8t3oW/nJ5tYfO8gU9zNye2C9hL7V8k.2b5.Kz1Q6V0Y8X9Z.a5uO'; // 公用匿名讀寫 API Key

export class CloudSyncService {
  constructor() {
    this.isSyncing = false;
    this.statusElement = null;
  }

  init() {
    this.statusElement = document.getElementById('cloud-sync-status');
    this.updateStatus('☁️ 雲端自動同步已就緒', 'ready');

    // 頁面載入時：自動嘗試從雲端下載最新資料
    this.downloadCloudData();

    // 監聽 Store 變化，停止輸入 1.2 秒後自動靜默上傳
    const debouncedSave = debounce(() => this.uploadCloudData(), 1200);

    store.subscribe((key) => {
      if (key === 'scratchpadContent' || key === 'radioStreamUrl') {
        this.updateStatus('⏳ 正在備份至雲端...', 'syncing');
        debouncedSave();
      }
    });
  }

  updateStatus(msg, type = 'ready') {
    if (this.statusElement) {
      this.statusElement.textContent = msg;
      this.statusElement.className = `cloud-sync-status ${type}`;
    }
    eventBus.emit('cloud-status-change', { msg, type });
  }

  // 1. 自動從雲端拉取最新資料
  async downloadCloudData() {
    try {
      this.updateStatus('⏳ 正在比對雲端資料...', 'syncing');

      const res = await fetch(CLOUD_STORE_URL, {
        method: 'GET',
        headers: {
          'X-Master-Key': ACCESS_KEY
        }
      });

      if (res.ok) {
        const result = await res.json();
        const cloudData = result.record;

        if (cloudData && typeof cloudData === 'object') {
          // 若雲端有較新的筆記或設定，自動還原
          if (cloudData.scratchpadContent !== undefined) {
            store.set('scratchpadContent', cloudData.scratchpadContent);
            const textarea = document.getElementById('scratchpad-textarea');
            if (textarea) textarea.value = cloudData.scratchpadContent;
          }

          console.log('[CloudSync] 雲端資料已自動完成即時同步。');
          this.updateStatus('☁️ 雲端資料已自動同步', 'ready');
        }
      } else {
        this.updateStatus('☁️ 雲端自動同步已就緒', 'ready');
      }
    } catch (err) {
      console.warn('[CloudSync] 離線狀態，使用本機儲存資料:', err.message);
      this.updateStatus('🏠 使用本機儲存 (離線)', 'ready');
    }
  }

  // 2. 自動在背景將最新內容上傳雲端
  async uploadCloudData() {
    if (this.isSyncing) return;
    this.isSyncing = true;

    const payload = {
      updatedAt: new Date().toISOString(),
      scratchpadContent: store.get('scratchpadContent') || '',
      radioStreamUrl: store.get('radioStreamUrl') || ''
    };

    try {
      const res = await fetch(CLOUD_STORE_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Master-Key': ACCESS_KEY
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        this.updateStatus('☁️ 已自動備份至雲端', 'ready');
        console.log('[CloudSync] 內容已於背景自動備份至雲端。');
      } else {
        this.updateStatus('⚠️ 備份延遲，仍存於本機', 'ready');
      }
    } catch (err) {
      console.warn('[CloudSync] 上傳失敗:', err.message);
      this.updateStatus('🏠 存於本機 LocalStorage', 'ready');
    } finally {
      this.isSyncing = false;
    }
  }
}

export const cloudSync = new CloudSyncService();
