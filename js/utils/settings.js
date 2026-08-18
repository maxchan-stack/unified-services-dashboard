import { store } from '../store.js';
import { showToast } from './helpers.js';

export function initSettings() {
  const drawer = document.getElementById('settings-drawer');
  const overlay = document.getElementById('modal-overlay');
  const openBtn = document.getElementById('btn-open-settings');
  const headerOpenBtn = document.getElementById('header-settings-btn');
  const closeBtn = document.getElementById('close-settings-btn');

  // ── 主題 ──
  const themeSelect = document.getElementById('select-theme');

  // ── 佈告欄 Admin Secret ──
  const bulletinSecretInput = document.getElementById('input-bulletin-secret');
  const bulletinSecretToggleBtn = document.getElementById('btn-toggle-bulletin-secret');
  const bulletinSecretSaveBtn = document.getElementById('btn-save-bulletin-secret');
  const bulletinSecretStatus = document.getElementById('bulletin-secret-status');

  // ── 教材費 GAS API Key ──
  const fundApiKeyInput = document.getElementById('input-fund-api-key');
  const fundApiKeyToggleBtn = document.getElementById('btn-toggle-fund-key');
  const fundApiKeySaveBtn = document.getElementById('btn-save-fund-api-key');
  const fundApiKeyStatus = document.getElementById('fund-api-key-status');

  // ── 備份匯入匯出 ──
  const exportBtn = document.getElementById('btn-export-config');
  const importInput = document.getElementById('input-import-config');
  const resetBtn = document.getElementById('btn-reset-all');

  // ── 載入既有值 ──
  if (themeSelect) themeSelect.value = store.get('theme') || 'theme-dark';

  // 佈告欄 secret（從 localStorage 直接讀，不存入 store）
  if (bulletinSecretInput) {
    bulletinSecretInput.value = localStorage.getItem('bulletin_admin_secret') || '';
  }
  // 教材費 API Key
  if (fundApiKeyInput) {
    fundApiKeyInput.value = localStorage.getItem('fund_gas_api_key') || '';
  }

  // ── 開關抽屜 ──
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

  // ── 主題切換 ──
  themeSelect?.addEventListener('change', (e) => {
    const newTheme = e.target.value;
    document.body.className = newTheme;
    store.set('theme', newTheme);
  });

  // ── 密碼顯示/隱藏切換（通用 helper） ──
  function setupTogglePassword(inputEl, toggleBtn) {
    toggleBtn?.addEventListener('click', () => {
      const isPassword = inputEl.type === 'password';
      inputEl.type = isPassword ? 'text' : 'password';
      const icon = toggleBtn.querySelector('i');
      if (icon) {
        icon.className = isPassword ? 'ri-eye-off-line' : 'ri-eye-line';
      }
    });
  }
  setupTogglePassword(bulletinSecretInput, bulletinSecretToggleBtn);
  setupTogglePassword(fundApiKeyInput, fundApiKeyToggleBtn);

  // ── 佈告欄 Admin Secret 儲存 ──
  bulletinSecretSaveBtn?.addEventListener('click', () => {
    const val = bulletinSecretInput?.value?.trim() || '';
    if (!val) {
      if (bulletinSecretStatus) {
        bulletinSecretStatus.className = 'key-status-text error';
        bulletinSecretStatus.textContent = '授權碼不可為空，請輸入後再儲存。';
      }
      return;
    }
    localStorage.setItem('bulletin_admin_secret', val);
    if (bulletinSecretStatus) {
      bulletinSecretStatus.className = 'key-status-text success';
      bulletinSecretStatus.textContent = '授權碼已儲存，教師/管理員功能已啟用。';
    }
    showToast('佈告欄管理員授權碼已儲存', 'success');
  });

  // ── 教材費 GAS API Key 儲存 ──
  fundApiKeySaveBtn?.addEventListener('click', () => {
    const val = fundApiKeyInput?.value?.trim() || '';
    if (!val) {
      if (fundApiKeyStatus) {
        fundApiKeyStatus.className = 'key-status-text error';
        fundApiKeyStatus.textContent = 'API Key 不可為空，請輸入後再儲存。';
      }
      return;
    }
    localStorage.setItem('fund_gas_api_key', val);
    if (fundApiKeyStatus) {
      fundApiKeyStatus.className = 'key-status-text success';
      fundApiKeyStatus.textContent = 'API Key 已儲存，教材費專戶功能已啟用。';
    }
    showToast('教材費 GAS API Key 已儲存', 'success');
  });

  // ── 匯出/匯入/重置 ──
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
