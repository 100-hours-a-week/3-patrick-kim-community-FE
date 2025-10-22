// 게시글 목록 페이지 로직
import { getPosts } from '/api/posts.js';
import { formatDateTime } from '/lib/datetime.js';

function createPostItem(post) {
  const el = document.createElement('article');
  el.className = 'post';
  const when = formatDateTime(post.createdAt);
  el.innerHTML = `
    <h3>${post.title ?? '제목 없음'}</h3>
    <p class="meta">${post.user?.nickname ?? '알 수 없음'} | 댓글 ${post.comments ?? 0} | 조회수 ${post.views ?? 0} | ${when}</p>
    <div class="preview">${post.content?.slice?.(0, 120) ?? ''}</div>
  `;
  // 상세페이지 이동은 추후 postId 기반으로 연결
  el.addEventListener('click', () => {
    if (post.postId) {
      window.location.href = `/pages/post-detail.html?postId=${post.postId}`;
    }
  });
  return el;
}

async function loadPosts({ cursorId, limit = 10 } = {}) {
  const container = document.querySelector('.post-list');
  if (!container) return;

  try {
    const res = await getPosts(cursorId, limit);
    if (!res?.isSuccess) throw new Error(res?.message || '목록 조회 실패');
    const { posts = [] } = res.data || {};
    posts.forEach(p => container.appendChild(createPostItem(p)));
    return res.data; // nextCursorId, hasNext
  } catch (e) {
    console.error('게시글 목록 조회 실패:', e);
    alert(`게시글 목록 조회 실패: ${e.message || e}`);
  }
}

// 초기 로드 +  TODO : (선택) 더보기 버튼 / 무한 스크롤은 추후 개선
(async () => {
  await loadPosts();

  const writeBtn = document.querySelector('.write-btn');
  writeBtn?.addEventListener('click', () => {
    window.location.href = '/pages/post-new.html';
  });
})();
