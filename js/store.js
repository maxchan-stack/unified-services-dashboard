/**
 * State & LocalStorage Store Manager
 */
const STORAGE_KEY = 'omnihub_config_v1';
const VALID_TABS = ['bulletin', 'gemini', 'google', 'island'];

const defaultState = {
  theme: 'theme-dark',
  layoutMode: 'tab',
  activeTab: 'bulletin',
  apiKeys: {
    gemini: ''
  },
  scratchpadContent: '',
  googleMapQuery: 'Taipei 101'
};

class Store {
  constructor() {
    this.state = this.loadState();
    this.listeners = [];
  }

  loadState() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        const activeTab = VALID_TABS.includes(parsed.activeTab) ? parsed.activeTab : 'bulletin';
        return { ...defaultState, ...parsed, activeTab };
      }
      return { ...defaultState };
    } catch (e) {
      console.warn('Failed to load state from LocalStorage:', e);
      return { ...defaultState };
    }
  }

  saveState() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.state));
    } catch (e) {
      console.error('Failed to save state to LocalStorage:', e);
    }
  }

  get(key) {
    return this.state[key];
  }

  set(key, value) {
    this.state[key] = value;
    this.saveState();
    this.notify(key, value);
  }

  updateApiKeys(keys) {
    this.state.apiKeys = { ...this.state.apiKeys, ...keys };
    this.saveState();
    this.notify('apiKeys', this.state.apiKeys);
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  notify(key, value) {
    this.listeners.forEach(fn => fn(key, value, this.state));
  }

  exportConfig() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(this.state, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `omnihub-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }

  importConfig(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      this.state = { ...defaultState, ...parsed };
      this.saveState();
      window.location.reload();
      return true;
    } catch (e) {
      alert('無效的 JSON 設定檔格式！');
      return false;
    }
  }

  resetAll() {
    if (confirm('確定要重置所有本機設定與紀錄嗎？')) {
      localStorage.removeItem(STORAGE_KEY);
      window.location.reload();
    }
  }
}

export const store = new Store();
