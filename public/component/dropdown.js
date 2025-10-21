// 드롭다운 메뉴 토글 기능
document.addEventListener('DOMContentLoaded', function() {
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
      if (confirm('로그아웃 하시겠습니까?')) {
        try {
          await logout();
          alert('로그아웃 되었습니다.');
          window.location.href = '/pages/index.html';
        } catch (error) {
        console.log('로그아웃 실패:', error);
          alert('로그아웃에 실패했습니다. 다시 시도해주세요.');
        }
      }
    });
  });
});
