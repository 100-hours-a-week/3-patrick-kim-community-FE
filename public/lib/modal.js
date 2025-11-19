// Modal 유틸리티

/**
 * 확인 모달 표시
 * @param {string} title - 모달 제목
 * @param {string} message - 모달 메시지
 * @param {Object} options - 옵션 {confirmText, cancelText, isDanger}
 * @returns {Promise<boolean>} - 확인 시 true, 취소 시 false
 */
export function showConfirmModal(title, message, options = {}) {
  return new Promise((resolve) => {
    const {
      confirmText = '확인',
      cancelText = '취소',
      isDanger = false
    } = options;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    const titleEl = document.createElement('h3');
    titleEl.className = 'modal-title';
    titleEl.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => {
      closeModal();
      resolve(false);
    };
    
    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    const messageEl = document.createElement('p');
    messageEl.textContent = message;
    body.appendChild(messageEl);
    
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn modal-btn-cancel';
    cancelBtn.textContent = cancelText;
    cancelBtn.onclick = () => {
      closeModal();
      resolve(false);
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = `modal-btn ${isDanger ? 'modal-btn-danger' : 'modal-btn-confirm'}`;
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
      closeModal();
      resolve(true);
    };
    
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    
    document.body.appendChild(overlay);
    
    // ESC 키로 닫기
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        resolve(false);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // 오버레이 클릭 시 닫기
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
        resolve(false);
      }
    });
    
    function closeModal() {
      document.removeEventListener('keydown', handleEscape);
      overlay.remove();
    }
  });
}

/**
 * 입력 모달 표시 (댓글 수정용)
 * @param {string} title - 모달 제목
 * @param {string} defaultValue - 기본 입력값
 * @param {Object} options - 옵션 {placeholder, confirmText, cancelText}
 * @returns {Promise<string|null>} - 입력값 또는 null (취소 시)
 */
export function showInputModal(title, defaultValue = '', options = {}) {
  return new Promise((resolve) => {
    const {
      placeholder = '내용을 입력하세요',
      confirmText = '확인',
      cancelText = '취소'
    } = options;

    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const header = document.createElement('div');
    header.className = 'modal-header';
    
    const titleEl = document.createElement('h3');
    titleEl.className = 'modal-title';
    titleEl.textContent = title;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '×';
    closeBtn.onclick = () => {
      closeModal();
      resolve(null);
    };
    
    header.appendChild(titleEl);
    header.appendChild(closeBtn);
    
    const body = document.createElement('div');
    body.className = 'modal-body';
    
    const textarea = document.createElement('textarea');
    textarea.placeholder = placeholder;
    textarea.value = defaultValue;
    body.appendChild(textarea);
    
    const footer = document.createElement('div');
    footer.className = 'modal-footer';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'modal-btn modal-btn-cancel';
    cancelBtn.textContent = cancelText;
    cancelBtn.onclick = () => {
      closeModal();
      resolve(null);
    };
    
    const confirmBtn = document.createElement('button');
    confirmBtn.className = 'modal-btn modal-btn-confirm';
    confirmBtn.textContent = confirmText;
    confirmBtn.onclick = () => {
      const value = textarea.value.trim();
      closeModal();
      resolve(value || null);
    };
    
    footer.appendChild(cancelBtn);
    footer.appendChild(confirmBtn);
    
    modal.appendChild(header);
    modal.appendChild(body);
    modal.appendChild(footer);
    overlay.appendChild(modal);
    
    document.body.appendChild(overlay);
    
    // textarea 포커스
    setTimeout(() => textarea.focus(), 100);
    
    // ESC 키로 닫기
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        closeModal();
        resolve(null);
      }
    };
    document.addEventListener('keydown', handleEscape);
    
    // 오버레이 클릭 시 닫기
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        closeModal();
        resolve(null);
      }
    });
    
    function closeModal() {
      document.removeEventListener('keydown', handleEscape);
      overlay.remove();
    }
  });
}
