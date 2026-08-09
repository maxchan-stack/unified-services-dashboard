import { store } from '../store.js';

export function initSettings() {
  const drawer = document.getElementById('settings-drawer');
  const overlay = document.getElementById('modal-overlay');
  const openBtn = document.getElementById('btn-open-settings');
  const headerOpenBtn = document.getElementById('header-settings-btn');
  const closeBtn = document.getElementById('close-settings-btn');

  const geminiInput = document.getElementById('input-gemini-key');
  const themeSelect = document.getElementById('select-theme');
  const exportBtn = document.getElementById('btn-export-config');
  const importInput = document.getElementById('input-import-config');
  const resetBtn = document.getElementById('btn-reset-all');

  // Load current values
  const keys = store.get('apiKeys');
  if (keys && geminiInput) {
    geminiInput.value = keys.gemini || '';
  }
  if (themeSelect) {
    themeSelect.value = store.get('theme') || 'theme-dark';
  }

  // Toggle Drawer
  function openSettings() {
    drawer?.classList.add('active');
    overlay?.classList.add('active');
  }

  function closeSettings() {
    drawer?.classList.remove('active');
    overlay?.classList.remove('active');
  }

  openBtn?.addEventListener('click', openSettings);
  headerOpenBtn?.addEventListener('click', openSettings);
  closeBtn?.addEventListener('click', closeSettings);

  // Auto Save Gemini API Key on Input and Change
  geminiInput?.addEventListener('input', (e) => {
    store.updateApiKeys({ gemini: e.target.value.trim() });
  });
  geminiInput?.addEventListener('change', (e) => {
    store.updateApiKeys({ gemini: e.target.value.trim() });
  });

  // Theme Change
  themeSelect?.addEventListener('change', (e) => {
    const newTheme = e.target.value;
    document.body.className = newTheme;
    store.set('theme', newTheme);
  });

  // Verify Gemini API Key
  const verifyGeminiBtn = document.getElementById('btn-verify-gemini');
  const geminiStatusText = document.getElementById('gemini-key-status');

  verifyGeminiBtn?.addEventListener('click', async () => {
    const key = geminiInput.value.trim();
    if (!key) {
      geminiStatusText.className = 'key-status-text error';
      geminiStatusText.textContent = '請先輸入 Gemini API Key！';
      return;
    }

    geminiStatusText.className = 'key-status-text';
    geminiStatusText.textContent = '正在連線驗證中...';

    try {
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: 'Ping test' }] }] })
      });

      const data = await res.json();
      if (res.ok && data.candidates) {
        geminiStatusText.className = 'key-status-text success';
        geminiStatusText.textContent = '驗證成功！API Key 有效且可用。';
        store.updateApiKeys({ gemini: key });
      } else {
        geminiStatusText.className = 'key-status-text error';
        geminiStatusText.textContent = `驗證失敗：${data.error?.message || 'Key 無效'}`;
      }
    } catch (e) {
      geminiStatusText.className = 'key-status-text error';
      geminiStatusText.textContent = `連線失敗：${e.message}`;
    }
  });

  // Export / Import
  exportBtn?.addEventListener('click', () => store.exportConfig());

  importInput?.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => store.importConfig(event.target.result);
      reader.readAsText(file);
    }
  });

  resetBtn?.addEventListener('click', () => store.resetAll());
}
