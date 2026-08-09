import { store } from '../store.js';
import { debounce, eventBus } from './helpers.js';

/**
 * 本機高效率儲存與自訂雲端自動同步模組
 */
const CLOUD_STORE_URL = store.get('cloudStoreUrl') || '';
const ACCESS_KEY = store.get('cloudAccessKey') || '';

export class CloudSyncService {
  constructor() {
    this.isSyncing = false;
    this.statusElement = null;
  }

  init() {
    this.statusElement = document.getElementById('cloud-sync-status');
    
    if (!CLOUD_STORE_URL) {
      this.updateStatus('🏠 使用本機儲存 (LocalStorage)', 'ready');
      return;
    }

    this.updateStatus('☁️ 雲端自動同步已就緒', 'ready');
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
    if (!CLOUD_STORE_URL) return;

    try {
      this.updateStatus('⏳ 正在比對雲端資料...', 'syncing');

      const headers = {};
      if (ACCESS_KEY) headers['X-Master-Key'] = ACCESS_KEY;

      const res = await fetch(CLOUD_STORE_URL, { method: 'GET', headers });

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
    if (!CLOUD_STORE_URL || this.isSyncing) return;
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
