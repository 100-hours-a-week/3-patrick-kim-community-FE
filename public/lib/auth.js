// 인증 상태 체크 및 리다이렉트 유틸
export function isLoggedIn() {
  return !!localStorage.getItem('accessToken'); // 토큰 등 인증정보 체크
}

export function requireAuth() {
  if (!isLoggedIn()) {
    window.location.href = '/pages/index.html';
  }
}

export function redirectIfLoggedIn() {
  if (isLoggedIn()) {
    window.location.href = '/pages/post-list.html';
  }
}
