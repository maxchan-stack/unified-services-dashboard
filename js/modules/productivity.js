import { store } from '../store.js';
import { eventBus, formatTime } from '../utils/helpers.js';

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

  clearScratchpadBtn?.addEventListener('click', () => {
    if (scratchpadTextarea && confirm('確定要清空所有筆記嗎？')) {
      scratchpadTextarea.value = '';
      store.set('scratchpadContent', '');
    }
  });

  copyScratchpadBtn?.addEventListener('click', () => {
    if (scratchpadTextarea) {
      navigator.clipboard.writeText(scratchpadTextarea.value);
      alert('筆記內容已成功複製至剪貼簿！');
    }
  });

  // Pomodoro Timer
  const pomodoroModal = document.getElementById('pomodoro-modal');
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

    // Update Progress Ring
    if (ringProgress) {
      const progress = remainingSeconds / (isWorkPhase ? 25 * 60 : 5 * 60);
      const offset = circumference - (progress * circumference);
      ringProgress.style.strokeDashoffset = offset;
    }
  }

  function startTimer() {
    if (isRunning) return;
    isRunning = true;

    pomoStartBtn.style.display = 'none';
    pomoPauseBtn.style.display = 'inline-flex';
    if (headerToggle) headerToggle.innerHTML = '<i class="ri-pause-fill"></i>';

    timerInterval = setInterval(() => {
      remainingSeconds--;
      updateTimerDisplays();

      if (remainingSeconds <= 0) {
        clearInterval(timerInterval);
        isRunning = false;
        
        if (isWorkPhase) {
          alert('專注時間結束！休息 5 分鐘。');
          isWorkPhase = false;
          remainingSeconds = 5 * 60;
          if (modalPhase) modalPhase.textContent = '休息時間';
        } else {
          alert('休息結束！重新開始專注。');
          isWorkPhase = true;
          remainingSeconds = 25 * 60;
          if (modalPhase) modalPhase.textContent = '工作時間';
        }

        pomoStartBtn.style.display = 'inline-flex';
        pomoPauseBtn.style.display = 'none';
        if (headerToggle) headerToggle.innerHTML = '<i class="ri-play-fill"></i>';
        updateTimerDisplays();
      }
    }, 1000);
  }

  function pauseTimer() {
    if (!isRunning) return;
    clearInterval(timerInterval);
    isRunning = false;
    pomoStartBtn.style.display = 'inline-flex';
    pomoPauseBtn.style.display = 'none';
    if (headerToggle) headerToggle.innerHTML = '<i class="ri-play-fill"></i>';
  }

  function resetTimer() {
    pauseTimer();
    isWorkPhase = true;
    remainingSeconds = 25 * 60;
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

  headerToggle?.addEventListener('click', () => {
    if (isRunning) pauseTimer();
    else startTimer();
  });

  pomoStartBtn?.addEventListener('click', startTimer);
  pomoPauseBtn?.addEventListener('click', pauseTimer);
  pomoResetBtn?.addEventListener('click', resetTimer);

  // Overlay click closes active drawer/modal
  overlay?.addEventListener('click', () => {
    scratchpadDrawer.classList.remove('active');
    pomodoroModal.classList.remove('active');
    document.getElementById('settings-drawer')?.classList.remove('active');
    overlay.classList.remove('active');
  });

  updateTimerDisplays();
}
