/**
 * Event Bus & Helper Utilities
 */
class EventBus {
  constructor() {
    this.events = {};
  }

  on(event, callback) {
    if (!this.events[event]) this.events[event] = [];
    this.events[event].push(callback);
  }

  emit(event, data) {
    if (this.events[event]) {
      this.events[event].forEach(cb => cb(data));
    }
  }
}

export const eventBus = new EventBus();

// Format Seconds to MM:SS
export function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

// HTML Entity Escape（防止 XSS 注入）
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

// Simple Markdown Formatter
export function parseMarkdown(text) {
  if (!text) return '';
  let escaped = escapeHtml(text);
  return escaped
    .replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

// Debounce Function
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// ─────────────────────────────────────────────────────
// Toast 通知系統（非阻塞，取代 alert）
// 用法：showToast('訊息', 'success' | 'warning' | 'error' | 'info', 持續毫秒)
// ─────────────────────────────────────────────────────

let _toastContainer = null;

function getToastContainer() {
  if (!_toastContainer) {
    _toastContainer = document.getElementById('toast-container');
    if (!_toastContainer) {
      _toastContainer = document.createElement('div');
      _toastContainer.id = 'toast-container';
      document.body.appendChild(_toastContainer);
    }
  }
  return _toastContainer;
}

export function showToast(message, type = 'info', duration = 3500) {
  const container = getToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const iconMap = { success: '✓', warning: '⚠', error: '✕', info: 'ℹ' };
  toast.textContent = `${iconMap[type] || ''} ${message}`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.add('toast-out');
    toast.addEventListener('animationend', () => toast.remove(), { once: true });
  }, duration);
}

// ─────────────────────────────────────────────────────
// ConfirmModal（非阻塞，取代 confirm）
// 用法：const confirmed = await showConfirm('確定要執行嗎？');
// ─────────────────────────────────────────────────────

export function showConfirm(message, confirmText = '確定', cancelText = '取消') {
  return new Promise((resolve) => {
    const backdrop = document.createElement('div');
    backdrop.className = 'confirm-modal-backdrop';

    backdrop.innerHTML = `
      <div class="confirm-modal-box">
        <p class="confirm-modal-message">${message}</p>
        <div class="confirm-modal-actions">
          <button class="btn btn-ghost btn-sm" id="_confirm-cancel">${cancelText}</button>
          <button class="btn btn-primary btn-sm" id="_confirm-ok">${confirmText}</button>
        </div>
      </div>
    `;

    document.body.appendChild(backdrop);

    backdrop.querySelector('#_confirm-ok').addEventListener('click', () => {
      backdrop.remove();
      resolve(true);
    });
    backdrop.querySelector('#_confirm-cancel').addEventListener('click', () => {
      backdrop.remove();
      resolve(false);
    });
  });
}
