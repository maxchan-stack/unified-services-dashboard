import { store } from '../store.js';
import { debounce, eventBus } from './helpers.js';

/**
 * CloudSyncService v2
 *
 * 改善重點：
 * 1. 版本號比對：避免舊版本覆蓋新版本
 * 2. 衝突偵測：下載時發現衝突，追加合併而非覆蓋
 * 3. 上傳前預檢：先 GET 比對版本，落後時先合併再讓使用者確認
 * 4. 向下相容：可讀取舊格式（無 _v 欄位）的雲端資料
 *
 * 架構性限制：
 * 此服務使用免費 JSON Bin，不支援原子性條件式更新。
 * 因此無法 100% 消除兩裝置毫秒級同時寫入的 Race Condition。
 * 本服務的目標是「降低機率 + 衝突時保留雙端資料」。
 */
export class CloudSyncService {
  constructor() {
    this.isSyncing = false;
    this.statusElement = null;
    this.cloudStoreUrl = '';
    this.accessKey = '';
  }

  // ─────────────────────────────────────────
  // 公開：初始化
  // ─────────────────────────────────────────

  init() {
    this.statusElement = document.getElementById('cloud-sync-status');

    // 在 init() 內讀取，確保 store 已完整初始化（支援新舊 key 相容）
    this.cloudStoreUrl = store.get('_cloudStoreUrl') || store.get('cloudStoreUrl') || '';
    this.accessKey = store.get('_cloudAccessKey') || store.get('cloudAccessKey') || '';

    this._initDeviceId();

    if (!this.cloudStoreUrl) {
      this.updateStatus('🏠 本機儲存', 'ready');
      return;
    }

    this.updateStatus('☁️ 正在連線雲端...', 'syncing');
    this.downloadCloudData();

    // 延長至 2500ms：改善後每次上傳需 GET + PUT 兩個請求，
    // 避免頻繁觸發超過 JSON Bin 免費方案的 Rate Limit。
    const debouncedUpload = debounce(() => this.uploadCloudData(), 2500);

    store.subscribe((key) => {
      if (key === 'scratchpadContent' || key === 'radioStreamUrl') {
        this.updateStatus('⏳ 等待同步...', 'syncing');
        debouncedUpload();
      }
    });
  }

  // ─────────────────────────────────────────
  // 公開：更新 UI 狀態
  // ─────────────────────────────────────────

  updateStatus(msg, type = 'ready') {
    if (this.statusElement) {
      this.statusElement.textContent = msg;
      this.statusElement.className = `cloud-sync-status ${type}`;
    }
    eventBus.emit('cloud-status-change', { msg, type });
  }

  // ─────────────────────────────────────────
  // 私有：初始化裝置識別碼
  // ─────────────────────────────────────────

  _initDeviceId() {
    let deviceId = store.get('_deviceId');
    if (!deviceId) {
      deviceId = 'dev_' + Math.random().toString(36).slice(2, 10);
      store.set('_deviceId', deviceId);
    }
    return deviceId;
  }

  // ─────────────────────────────────────────
  // 私有：向下相容解析雲端資料
  // 支援舊格式（無 _v）與新格式（有 _v）
  // ─────────────────────────────────────────

  _parseCloudRecord(record) {
    if (!record || typeof record !== 'object') return null;

    // 新格式：有 _v 欄位
    if (typeof record._v === 'number') {
      return {
        version: record._v,
        scratchpadContent: record.scratchpadContent ?? '',
        radioStreamUrl: record.radioStreamUrl ?? '',
        isNewFormat: true
      };
    }

    // 舊格式：無 _v 欄位（向下相容）
    // 視為 version 0，確保第一次寫入時會推進版本號
    if (record.scratchpadContent !== undefined || record.updatedAt !== undefined) {
      return {
        version: 0,
        scratchpadContent: record.scratchpadContent ?? '',
        radioStreamUrl: record.radioStreamUrl ?? '',
        isNewFormat: false
      };
    }

    return null;
  }

  // ─────────────────────────────────────────
  // 私有：產生合併備份區塊文字
  // ─────────────────────────────────────────

  _buildMergedContent(localContent, remoteContent) {
    const timestamp = new Date().toLocaleTimeString('zh-TW', { hour12: false });
    return (
      `${localContent}\n\n` +
      `╔══════════════════════════════════════╗\n` +
      `║  雲端衝突備份 (${timestamp} 自動合併)  ║\n` +
      `╚══════════════════════════════════════╝\n` +
      `${remoteContent}`
    );
  }

  // ─────────────────────────────────────────
  // 1. 下載：從雲端拉取最新資料
  // ─────────────────────────────────────────

  async downloadCloudData() {
    if (!this.cloudStoreUrl) return;

    try {
      const headers = {};
      if (this.accessKey) headers['X-Master-Key'] = this.accessKey;

      const res = await fetch(this.cloudStoreUrl, { method: 'GET', headers });

      if (!res.ok) {
        this.updateStatus('⚠️ 雲端服務異常，使用本機資料', 'ready');
        return;
      }

      const result = await res.json();
      // JSONBin.io 回傳格式為 { record: {...} }，其他服務可能直接回傳物件
      const raw = result.record ?? result;
      const cloudData = this._parseCloudRecord(raw);

      if (!cloudData) {
        // 雲端是空的（第一次使用）
        this.updateStatus('☁️ 雲端尚無資料，使用本機', 'ready');
        return;
      }

      const localVersion = store.get('_cloudVersion') || 0;
      const localContent = store.get('scratchpadContent') || '';

      // 情況 A：雲端版本 <= 本地已知版本，不覆蓋本地
      if (cloudData.version <= localVersion) {
        console.log('[CloudSync] 本地資料已是最新，略過下載。');
        this.updateStatus('☁️ 雲端同步已就緒', 'ready');
        return;
      }

      // 情況 B：雲端較新，且本地有未同步的修改（衝突）
      // localVersion === 0 視為全新裝置，直接接受雲端，不視為衝突
      const hasLocalUnsyncedChanges =
        localVersion > 0 &&
        localContent.trim() !== '' &&
        localContent !== cloudData.scratchpadContent;

      if (hasLocalUnsyncedChanges) {
        const mergedContent = this._buildMergedContent(localContent, cloudData.scratchpadContent);
        store.set('scratchpadContent', mergedContent);
        store.set('_cloudVersion', cloudData.version);

        const textarea = document.getElementById('scratchpad-textarea');
        if (textarea) textarea.value = mergedContent;

        this.updateStatus('⚠️ 偵測到衝突，已自動合併保留雙端內容', 'warning');
        console.warn('[CloudSync] 衝突：已追加合併雲端備份至筆記尾端。');
        return;
      }

      // 情況 C：雲端較新，本地無衝突，直接更新本地
      store.set('scratchpadContent', cloudData.scratchpadContent);
      store.set('_cloudVersion', cloudData.version);

      if (cloudData.radioStreamUrl) {
        store.set('radioStreamUrl', cloudData.radioStreamUrl);
      }

      const textarea = document.getElementById('scratchpad-textarea');
      if (textarea) textarea.value = cloudData.scratchpadContent;

      console.log(`[CloudSync] 下載完成，雲端版本 v${cloudData.version}。`);
      this.updateStatus('☁️ 雲端資料已同步', 'ready');

    } catch (err) {
      console.warn('[CloudSync] 無法連線雲端，使用本機資料:', err.message);
      this.updateStatus('🏠 離線，使用本機儲存', 'ready');
    }
  }

  // ─────────────────────────────────────────
  // 2. 上傳：將本地資料推送至雲端
  //
  // 流程：先 GET 比對版本 → 確認不落後 → PUT 新版本
  //
  // 已知限制：GET 與 PUT 之間存在時間窗口（非原子操作），
  // 在極端的毫秒級同時寫入情境下仍可能發生覆蓋。
  // 這是使用免費 JSON Bin 的架構性限制，無法在純前端消除。
  // ─────────────────────────────────────────

  async uploadCloudData() {
    if (!this.cloudStoreUrl || this.isSyncing) return;
    this.isSyncing = true;
    this.updateStatus('⏳ 正在同步至雲端...', 'syncing');

    try {
      const headers = {};
      if (this.accessKey) headers['X-Master-Key'] = this.accessKey;

      // 步驟 1：GET 預檢，取得雲端目前版本號
      let remoteVersion = 0;
      let remoteContent = '';

      try {
        const checkRes = await fetch(this.cloudStoreUrl, { method: 'GET', headers });
        if (checkRes.ok) {
          const result = await checkRes.json();
          const raw = result.record ?? result;
          const cloudData = this._parseCloudRecord(raw);
          if (cloudData) {
            remoteVersion = cloudData.version;
            remoteContent = cloudData.scratchpadContent;
          }
        }
      } catch (getErr) {
        // GET 失敗（例如離線），無法比對版本，中止上傳
        console.warn('[CloudSync] GET 預檢失敗，中止本次上傳:', getErr.message);
        this.updateStatus('🏠 無法連線，資料暫存於本機', 'ready');
        return;
      }

      const localVersion = store.get('_cloudVersion') || 0;
      const localContent = store.get('scratchpadContent') || '';

      // 步驟 2：版本落後檢查
      if (remoteVersion > localVersion) {
        const hasConflict =
          remoteContent.trim() !== '' &&
          remoteContent !== localContent;

        if (hasConflict) {
          // 衝突：追加合併，不直接推送，讓使用者看到合併結果後再觸發下一次上傳
          console.warn('[CloudSync] 上傳前發現版本落後且內容衝突，執行合併後暫停。');
          const mergedContent = this._buildMergedContent(localContent, remoteContent);
          store.set('scratchpadContent', mergedContent);
          store.set('_cloudVersion', remoteVersion);

          const textarea = document.getElementById('scratchpad-textarea');
          if (textarea) textarea.value = mergedContent;

          this.updateStatus('⚠️ 偵測到衝突，已自動合併，請確認後再同步', 'warning');
          return;
        } else {
          // 雲端較新但內容相同，更新本地版本號即可
          store.set('_cloudVersion', remoteVersion);
        }
      }

      // 步驟 3：組裝新版本 Payload 並 PUT
      const nextVersion = Math.max(remoteVersion, localVersion) + 1;
      const payload = {
        _v: nextVersion,
        _updatedAt: new Date().toISOString(),
        _deviceId: store.get('_deviceId') || 'unknown',
        scratchpadContent: localContent,
        radioStreamUrl: store.get('radioStreamUrl') || ''
      };

      const putRes = await fetch(this.cloudStoreUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', ...headers },
        body: JSON.stringify(payload)
      });

      if (putRes.ok) {
        // 步驟 4：僅在收到 200 OK 後才更新本地版本號
        store.set('_cloudVersion', nextVersion);
        console.log(`[CloudSync] 上傳成功，版本推進至 v${nextVersion}。`);
        this.updateStatus('☁️ 已同步至雲端', 'ready');
      } else {
        console.warn('[CloudSync] PUT 回應非 2xx:', putRes.status);
        this.updateStatus('⚠️ 同步失敗，資料暫存於本機', 'ready');
      }

    } catch (err) {
      console.warn('[CloudSync] 上傳時發生網路錯誤:', err.message);
      this.updateStatus('🏠 同步失敗，資料暫存於本機', 'ready');
    } finally {
      this.isSyncing = false;
    }
  }
}

export const cloudSync = new CloudSyncService();
