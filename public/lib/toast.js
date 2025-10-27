// Toast 알림 유틸리티
let toastContainer = null;

function getToastContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

function getIcon(type) {
  const icons = {
    success: '✓',
    error: '✕',
    warning: '⚠',
    info: 'ℹ'
  };
  return icons[type] || icons.info;
}

/**
 * Toast 알림 표시
 * @param {string} message - 표시할 메시지
 * @param {string} type - 'success', 'error', 'warning', 'info' (기본값: 'info')
 * @param {number} duration - 표시 시간(ms), 0이면 자동으로 닫히지 않음 (기본값: 3000)
 */
export function showToast(message, type = 'info', duration = 3000) {
  const container = getToastContainer();
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  const icon = document.createElement('span');
  icon.className = 'toast-icon';
  icon.textContent = getIcon(type);
  
  const messageEl = document.createElement('span');
  messageEl.className = 'toast-message';
  messageEl.textContent = message;
  
  const closeBtn = document.createElement('button');
  closeBtn.className = 'toast-close';
  closeBtn.innerHTML = '×';
  closeBtn.onclick = () => removeToast(toast);
  
  toast.appendChild(icon);
  toast.appendChild(messageEl);
  toast.appendChild(closeBtn);
  
  container.appendChild(toast);
  
  if (duration > 0) {
    setTimeout(() => removeToast(toast), duration);
  }
  
  return toast;
}

function removeToast(toast) {
  toast.classList.add('removing');
  setTimeout(() => {
    if (toast.parentElement) {
      toast.parentElement.removeChild(toast);
    }
  }, 300);
}

// 편의 함수들
export function showSuccess(message, duration = 3000) {
  return showToast(message, 'success', duration);
}

export function showError(message, duration = 4000) {
  return showToast(message, 'error', duration);
}

export function showWarning(message, duration = 3000) {
  return showToast(message, 'warning', duration);
}

export function showInfo(message, duration = 3000) {
  return showToast(message, 'info', duration);
}

// alert 대체 함수 (기존 코드 호환성)
export function toast(message, type = 'info') {
  return showToast(message, type);
}
