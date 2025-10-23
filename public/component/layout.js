// 공통 레이아웃 컴포넌트 로드 유틸
import { initDropdown } from '/component/dropdown.js';

export async function loadComponent(selector, componentPath) {
  const container = document.querySelector(selector);
  if (!container) return;
  
  try {
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
    const html = await response.text();
    container.innerHTML = html;
  } catch (error) {
    console.error('Component load error:', error);
  }
}

export async function loadHeader(withBackButton = false, backUrl = '/pages/post-list.html') {
  if (withBackButton) {
    await loadComponent('#header', '/component/header-with-back.html');
    // 뒤로가기 버튼에 URL 설정
    const backBtn = document.querySelector('.back-btn');
    if (backBtn) {
      backBtn.href = backUrl;
    }
  } else {
    await loadComponent('#header', '/component/header.html');
  }
  // 헤더 로드 후 드롭다운 초기화
  initDropdown();
}

export async function loadFooter() {
  await loadComponent('#footer', '/component/footer.html');
}
