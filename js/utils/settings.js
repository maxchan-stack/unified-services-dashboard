import { store } from '../store.js';
import { showToast } from './helpers.js';

const BULLETIN_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbyQr4WjfdF_sNs7z1VyngP0rPxYJJEpGsp1i7dO_MHR5w5egCvJIjVMFavea_CnHHgPeA/exec';

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

  const showChangeSecretBtn = document.getElementById('btn-show-change-secret');
  const changeSecretPanel = document.getElementById('change-secret-panel');
  const newSecretInput = document.getElementById('input-new-bulletin-secret');
  const newSecretToggleBtn = document.getElementById('btn-toggle-new-secret');
  const syncCloudSecretBtn = document.getElementById('btn-sync-cloud-secret');
  const syncSecretStatus = document.getElementById('sync-secret-status');

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
    document.getElementById('sidebar')?.classList.remove('mobile-open');
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
  setupTogglePassword(newSecretInput, newSecretToggleBtn);
  setupTogglePassword(fundApiKeyInput, fundApiKeyToggleBtn);

  // ── 佈告欄 Admin Secret 本機儲存 ──
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
      bulletinSecretStatus.textContent = '授權碼已儲存至本機，教師/管理員功能已啟用。';
    }
    showToast('佈告欄管理員授權碼已儲存', 'success');
  });

  // ── 展開/收合雲端密鑰修改面板 ──
  showChangeSecretBtn?.addEventListener('click', () => {
    if (!changeSecretPanel) return;
    const isHidden = changeSecretPanel.style.display === 'none';
    changeSecretPanel.style.display = isHidden ? 'block' : 'none';
    showChangeSecretBtn.innerHTML = isHidden
      ? '<i class="ri-arrow-up-s-line"></i> 收合變更面板'
      : '<i class="ri-lock-password-line"></i> 變更雲端密鑰...';
  });

  // ── 一鍵同步驗證舊密碼並更新至雲端 ──
  syncCloudSecretBtn?.addEventListener('click', async () => {
    const oldSecret = bulletinSecretInput?.value?.trim() || '';
    const newSecret = newSecretInput?.value?.trim() || '';

    if (!oldSecret) {
      if (syncSecretStatus) {
        syncSecretStatus.className = 'key-status-text error';
        syncSecretStatus.textContent = '請先在上方填入「目前管理員密鑰」以進行身分驗證。';
      }
      return;
    }

    if (!newSecret || newSecret.length < 6) {
      if (syncSecretStatus) {
        syncSecretStatus.className = 'key-status-text error';
        syncSecretStatus.textContent = '新密鑰長度至少需 6 個字元。';
      }
      return;
    }

    syncCloudSecretBtn.disabled = true;
    syncCloudSecretBtn.innerHTML = '<i class="ri-loader-4-line ri-spin"></i> 正在連線更新雲端…';
    if (syncSecretStatus) {
      syncSecretStatus.className = 'key-status-text';
      syncSecretStatus.textContent = '正在連線 Google Apps Script 雲端伺服器驗證…';
    }

    try {
      const res = await fetch(BULLETIN_WEB_APP_URL, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'text/plain;charset=utf-8' },
        body: JSON.stringify({
          action: 'updateAdminSecret',
          oldSecret: oldSecret,
          adminSecret: oldSecret,
          newSecret: newSecret
        })
      });

      const result = await res.json();
      if (result.success) {
        // 成功：更新本機 localStorage 與上方輸入框
        localStorage.setItem('bulletin_admin_secret', newSecret);
        if (bulletinSecretInput) bulletinSecretInput.value = newSecret;
        if (newSecretInput) newSecretInput.value = '';
        if (changeSecretPanel) changeSecretPanel.style.display = 'none';

        if (bulletinSecretStatus) {
          bulletinSecretStatus.className = 'key-status-text success';
          bulletinSecretStatus.textContent = '密鑰已成功更新至雲端並同步至本機！';
        }
        if (showChangeSecretBtn) {
          showChangeSecretBtn.innerHTML = '<i class="ri-lock-password-line"></i> 變更雲端密鑰...';
        }
        showToast('管理員密鑰已成功更新至雲端試算表！', 'success', 5000);
      } else {
        const errMsg = result.error || '舊密碼驗證失敗，雲端拒絕更新';
        if (syncSecretStatus) {
          syncSecretStatus.className = 'key-status-text error';
          syncSecretStatus.textContent = `更新失敗：${errMsg}`;
        }
        showToast(`更新失敗：${errMsg}`, 'error', 5000);
      }
    } catch (err) {
      if (syncSecretStatus) {
        syncSecretStatus.className = 'key-status-text error';
        syncSecretStatus.textContent = `連線失敗：${err.message}。若 Google 後端尚未佈署此動作，請先更新 Google Apps Script。`;
      }
      showToast('連線失敗，請檢查網路狀態', 'error', 5000);
    } finally {
      syncCloudSecretBtn.disabled = false;
      syncCloudSecretBtn.innerHTML = '<i class="ri-cloud-line"></i> 驗證舊密碼並同步更新至雲端';
    }
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
