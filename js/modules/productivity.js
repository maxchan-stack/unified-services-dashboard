import { store } from '../store.js';
import { eventBus, formatTime, showToast, showConfirm } from '../utils/helpers.js';

export function initProductivity() {
  // Scratchpad Drawer
  const scratchpadDrawer = document.getElementById('scratchpad-drawer');
  const openScratchpadBtn = document.getElementById('btn-open-scratchpad');
  const closeScratchpadBtn = document.getElementById('close-scratchpad-btn');
  const scratchpadTextarea = document.getElementById('scratchpad-textarea');
  const clearScratchpadBtn = document.getElementById('clear-scratchpad-btn');
  const copyScratchpadBtn = document.getElementById('copy-scratchpad-btn');
  const overlay = document.getElementById('modal-overlay');

  if (scratchpadTextarea) {
    scratchpadTextarea.value = store.get('scratchpadContent') || '';

    scratchpadTextarea.addEventListener('input', (e) => {
      store.set('scratchpadContent', e.target.value);
    });
  }

  openScratchpadBtn?.addEventListener('click', () => {
    scratchpadDrawer.classList.add('active');
    overlay.classList.add('active');
  });

  closeScratchpadBtn?.addEventListener('click', () => {
    scratchpadDrawer.classList.remove('active');
    overlay.classList.remove('active');
  });

  clearScratchpadBtn?.addEventListener('click', async () => {
    if (!scratchpadTextarea) return;
    const confirmed = await showConfirm('確定要清空所有筆記嗎？此動作無法復原。', '確定清空', '取消');
    if (confirmed) {
      scratchpadTextarea.value = '';
      store.set('scratchpadContent', '');
      showToast('筆記已清空', 'info');
    }
  });

  copyScratchpadBtn?.addEventListener('click', async () => {
    if (!scratchpadTextarea) return;
    try {
      await navigator.clipboard.writeText(scratchpadTextarea.value);
      showToast('筆記內容已複製至剪貼簿', 'success');
    } catch {
      showToast('複製失敗，請手動選取文字複製', 'error');
    }
  });

  // Pomodoro Timer
  const pomodoroModal = document.getElementById('pomodoro-modal');
  const pomodoroCapsule = document.getElementById('pomodoro-capsule');
  const openPomoBtn = document.getElementById('btn-open-pomodoro');
  const closePomoBtn = document.getElementById('close-pomodoro-modal');
  
  const headerDisplay = document.getElementById('header-timer-display');
  const headerToggle = document.getElementById('header-timer-toggle');
  const modalDisplay = document.getElementById('modal-timer-display');
  const modalPhase = document.getElementById('modal-timer-phase');
  const ringProgress = document.getElementById('timer-ring-progress');

  const pomoStartBtn = document.getElementById('pomo-start-btn');
  const pomoPauseBtn = document.getElementById('pomo-pause-btn');
  const pomoResetBtn = document.getElementById('pomo-reset-btn');

  let timerInterval = null;
  let remainingSeconds = 25 * 60; // 25 minutes
  let isRunning = false;
  let isWorkPhase = true;

  const circumference = 2 * Math.PI * 88; // 553

  function updateTimerDisplays() {
    const formatted = formatTime(remainingSeconds);
    if (headerDisplay) headerDisplay.textContent = formatted;
    if (modalDisplay) modalDisplay.textContent = formatted;

    if (pomodoroCapsule) {
      pomodoroCapsule.classList.toggle('phase-break', !isWorkPhase);
    }

    // Update Progress Ring
    if (ringProgress) {
      const progress = remainingSeconds / (isWorkPhase ? 25 * 60 : 5 * 60);
      const offset = circumference - (progress * circumference);
      ringProgress.style.strokeDashoffset = offset;
    }
  }

  const ringContainer = document.querySelector('.timer-ring-container');

  function startTimer() {
    if (isRunning) return;
    isRunning = true;

    // 啟動膠囊並自動隱藏全屏 Modal 回到主視圖
    if (pomodoroCapsule) pomodoroCapsule.style.display = 'flex';
    pomodoroModal?.classList.remove('active');
    overlay?.classList.remove('active');

    ringContainer?.classList.add('is-running');
    pomoStartBtn.style.display = 'none';
    pomoPauseBtn.style.display = 'inline-flex';

    // 專注階段自動連線隨機電台並播放
    if (isWorkPhase) {
      eventBus.emit('play-random-radio');
    }

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplays();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        ringContainer?.classList.remove('is-running');
        
        if (isWorkPhase) {
          showToast('專注時間結束！休息 5 分鐘', 'success', 5000);
          isWorkPhase = false;
          remainingSeconds = 5 * 60;
          if (modalPhase) modalPhase.textContent = '休息時間';
        } else {
          showToast('休息結束！開始新一輪專注', 'info', 5000);
          isWorkPhase = true;
          remainingSeconds = 25 * 60;
          if (modalPhase) modalPhase.textContent = '工作時間';
        }

        pomoStartBtn.style.display = 'inline-flex';
        pomoPauseBtn.style.display = 'none';
        updateTimerDisplays();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    ringContainer?.classList.remove('is-running');
    pomoStartBtn.style.display = 'inline-flex';
    pomoPauseBtn.style.display = 'none';
  }

  function resetTimer() {
    pauseTimer();
    isWorkPhase = true;
    remainingSeconds = 25 * 60;
    if (pomodoroCapsule) pomodoroCapsule.style.display = 'none';
    if (modalPhase) modalPhase.textContent = '工作時間';
    updateTimerDisplays();
  }

  openPomoBtn?.addEventListener('click', () => {
    pomodoroModal.classList.add('active');
    overlay.classList.add('active');
  });

  closePomoBtn?.addEventListener('click', () => {
    pomodoroModal.classList.remove('active');
    overlay.classList.remove('active');
  });

  // 點擊膠囊展開完整番茄鐘彈窗
  headerToggle?.addEventListener('click', (e) => {
    e.stopPropagation();
    pomodoroModal.classList.add('active');
    overlay.classList.add('active');
  });

  pomodoroCapsule?.addEventListener('click', () => {
    pomodoroModal.classList.add('active');
    overlay.classList.add('active');
  });

  pomoStartBtn?.addEventListener('click', startTimer);
  pomoPauseBtn?.addEventListener('click', pauseTimer);
  pomoResetBtn?.addEventListener('click', resetTimer);

  // Overlay click closes active drawer/modal
  overlay?.addEventListener('click', () => {
    scratchpadDrawer.classList.remove('active');
    pomodoroModal.classList.remove('active');
    document.getElementById('settings-drawer')?.classList.remove('active');
    document.getElementById('sidebar')?.classList.remove('mobile-open');
    overlay.classList.remove('active');
  });

  updateTimerDisplays();
}
