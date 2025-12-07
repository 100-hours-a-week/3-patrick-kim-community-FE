// 드롭다운 메뉴 토글 기능 (ESM)
import { logout } from '/js-api/auth.js';
import { showConfirmModal } from '/lib/modal.js';
import { showToast } from '/lib/toast.js';

export function initDropdown() {
  const dropdowns = document.querySelectorAll('.dropdown');
  
  dropdowns.forEach(dropdown => {
    const icon = dropdown.querySelector('.profile-icon, .icon-btn');
    const menu = dropdown.querySelector('.menu');
    
    if (icon && menu) {
      // 아이콘 클릭 시 드롭다운 토글
      icon.addEventListener('click', function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        // 다른 드롭다운 닫기
        dropdowns.forEach(d => {
          if (d !== dropdown) {
            d.classList.remove('active');
          }
        });
        
        // 현재 드롭다운 토글
        dropdown.classList.toggle('active');
      });
    }
  });
  
  // 문서의 다른 곳 클릭 시 드롭다운 닫기
  document.addEventListener('click', function(e) {
    if (!e.target.closest('.dropdown')) {
      dropdowns.forEach(dropdown => {
        dropdown.classList.remove('active');
      });
    }
  });
  
  // 로그아웃 버튼 처리
  const logoutBtns = document.querySelectorAll('#logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async function(e) {
      e.preventDefault();

      const confirmed = await showConfirmModal(
        '잠시 책을 덮으시겠습니까?',
        '언제든 마음이 일렁일 때 다시 찾아와주세요',
        {
          confirmText: '책 덮기',
          cancelText: '머물기'
        }
      );

      if (confirmed) {
        try {
          await logout();
          showToast('조용히 책을 덮었습니다');
          setTimeout(() => {
            window.location.href = '/pages/index.html';
          }, 800);
        } catch (error) {
          console.log('로그아웃 실패:', error);
          showToast('책을 덮는 데 실패했습니다. 다시 시도해주세요', 'error');
        }
      }
    });
  });
}

// 자동 실행 (기존 페이지 호환성)
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initDropdown);
} else {
  initDropdown();
}
