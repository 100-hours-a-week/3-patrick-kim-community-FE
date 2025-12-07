// 게시글 목록 페이지 로직 (더보기 버튼 방식)
import { getPosts } from '/js-api/posts.js';
import { formatDateTime } from '/lib/datetime.js';
import { requireAuth } from '/lib/auth.js';
import { loadHeader, loadFooter } from '/component/layout.js';
import { showError } from '/lib/toast.js';

requireAuth();
await loadHeader(true, '/pages/home.html'); // 뒤로가기 버튼으로 홈으로 이동
await loadFooter();

// 상태 관리 (새로고침 시 초기화)
let cursorId = null;
let hasNext = true;
let isLoading = false;
const limit = 10;
let totalPostsLoaded = 0;

function createPostItem(post) {
  const el = document.createElement('article');
  el.className = 'post';
  const when = formatDateTime(post.createdAt);
  el.innerHTML = `
    <h3>${post.title ?? '제목 없는 페이지'}</h3>
    <p class="meta">${post.member?.nickname ?? '익명의 기록자'} | 댓글 ${post.comments ?? 0} | 조회수 ${post.views ?? 0} | ${when}</p>
    <div class="preview">${post.content?.slice?.(0, 120) ?? ''}</div>
  `;
  el.addEventListener('click', () => {
    if (post.postId) {
      window.location.href = `/pages/post-detail.html?postId=${post.postId}`;
    }
  });
  return el;
}

async function loadMore() {
  const container = document.querySelector('.post-list');
  const loadMoreBtn = document.getElementById('load-more-btn');
  const spinner = document.getElementById('load-more-spinner');
  const emptyState = document.getElementById('empty-state');

  if (!container || isLoading || !hasNext) return;

  isLoading = true;
  if (loadMoreBtn) loadMoreBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';

  try {
    const res = await getPosts(cursorId, limit);
    if (!res?.isSuccess) throw new Error(res?.message || '목록 조회 실패');

    const { posts = [], nextCursorId, hasNext: next } = res.data || {};
    posts.forEach(p => container.appendChild(createPostItem(p)));

    totalPostsLoaded += posts.length;
    cursorId = nextCursorId ?? null;
    hasNext = next ?? false;

    // Empty State 표시/숨김
    if (emptyState) {
      if (totalPostsLoaded === 0) {
        emptyState.style.display = 'block';
        container.style.display = 'none';
      } else {
        emptyState.style.display = 'none';
        container.style.display = 'block';
      }
    }

    // 더보기 버튼 표시/숨김 처리
    if (loadMoreBtn) {
      if (hasNext) {
        loadMoreBtn.style.display = 'inline-block'; // 다음 페이지 있으면 보이기
      } else {
        loadMoreBtn.style.display = 'none'; // 없으면 숨김
      }
    }
  } catch (e) {
    console.error('이야기 목록 조회 실패:', e);
    showError(`이야기를 불러올 수 없습니다: ${e.message || e}`);
  } finally {
    isLoading = false;
    if (loadMoreBtn) loadMoreBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
  }
}

// 초기 로드
(async () => {
  await loadMore(); // 첫 10개

  const writeBtn = document.querySelector('.write-btn');
  writeBtn?.addEventListener('click', () => {
    window.location.href = '/pages/post-new.html';
  });

  // 더보기 버튼 핸들러
  const loadMoreBtn = document.getElementById('load-more-btn');
  loadMoreBtn?.addEventListener('click', () => loadMore());
})();
