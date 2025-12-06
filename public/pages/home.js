// ===========================
// 홈 페이지 (메인 허브)
// ===========================

import { loadHeader, loadFooter } from '/component/layout.js';
import { requireAuth } from '/lib/auth.js';

requireAuth(); // 인증 체크

// 날짜 포맷팅
function formatCurrentDate() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth() + 1;
  const day = now.getDate();
  const weekdays = ['일요일', '월요일', '화요일', '수요일', '목요일', '금요일', '토요일'];
  const weekday = weekdays[now.getDay()];

  return `${year}년 ${month}월 ${day}일 ${weekday}`;
}

// 통계 로드
async function loadStats() {
  try {
    // TODO: 실제 API 호출
    // const memoirResponse = await fetch('/api/memoirs/my/count', {
    //   method: 'GET',
    //   credentials: 'include'
    // });
    // const sharedResponse = await fetch('/api/posts/count', {
    //   method: 'GET',
    //   credentials: 'include'
    // });
    //
    // const memoirData = await memoirResponse.json();
    // const sharedData = await sharedResponse.json();
    //
    // const memoirCount = memoirData.count || 0;
    // const sharedCount = sharedData.count || 0;

    // 임시 더미 데이터
    const memoirCount = 5;
    const sharedCount = 12;

    // 통계 업데이트
    const memoirCountEl = document.getElementById('memoir-count');
    const sharedCountEl = document.getElementById('shared-count');

    if (memoirCountEl) {
      memoirCountEl.textContent = `${memoirCount}개의 추억`;
    }

    if (sharedCountEl) {
      sharedCountEl.textContent = `${sharedCount}개의 이야기`;
    }
  } catch (error) {
    console.error('통계 로드 실패:', error);
    // 에러 시에도 기본값 유지
  }
}

// 환영 날짜 설정
function setWelcomeDate() {
  const dateEl = document.getElementById('welcome-date');
  if (dateEl) {
    dateEl.textContent = formatCurrentDate();
  }
}

// 초기화
document.addEventListener('DOMContentLoaded', async () => {
  await loadHeader(false); // 메인 헤더 (뒤로가기 없음)
  await loadFooter();
  setWelcomeDate();
  await loadStats();
});
