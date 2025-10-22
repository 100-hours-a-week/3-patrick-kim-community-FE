// 게시글 상세 페이지 로직
import { getPostDetail } from '/api/posts.js';
import { formatDateTime } from '/lib/datetime.js';

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function setText(el, text) {
  if (el) el.textContent = text ?? '';
}

(async function main() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('postId');
  if (!postId) {
    alert('잘못된 접근입니다. 게시글 ID가 없습니다.');
    window.location.href = '/pages/post-list.html';
    return;
  }

  try {
    const res = await getPostDetail(postId);
    if (!res?.isSuccess) throw new Error(res?.message || '상세 조회 실패');

    const data = res.data || {};
  const { title, user = {}, createdAt, postImageUrl, likes = 0, comments = 0, views = 0, content } = data;
  const when = formatDateTime(createdAt);

    // 제목
    setText(qs('.post-title'), title || '제목 없음');

    // 메타 영역 (작성자, 날짜)
    const metaEl = qs('article .meta');
    if (metaEl) {
      const avatarStyle = user.profileImageUrl ? ` style="background-image:url('${user.profileImageUrl}'); background-size:cover; background-position:center;"` : '';
      metaEl.innerHTML = `
        <span class="author"><span class="avatar"${avatarStyle}></span> ${user.nickname ?? '익명'}</span>
        <span>${when}</span>
      `;
    }

    // 이미지
    const imageBox = qs('.image-box');
    if (imageBox) {
      if (postImageUrl) {
        imageBox.innerHTML = `<img src="${postImageUrl}" alt="post image" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
      } else {
        imageBox.textContent = '이미지가 없습니다';
      }
    }

    // 본문 (있을 때만 갱신)
    if (content) {
      setText(qs('.post-body'), content);
    }

    // 통계
    const statsEl = qs('.stats');
    if (statsEl) {
      statsEl.innerHTML = `
        <div class="stat-pill"><strong>${likes}</strong><span>좋아요수</span></div>
        <div class="stat-pill"><strong>${views}</strong><span>조회수</span></div>
        <div class="stat-pill"><strong>${comments}</strong><span>댓글</span></div>
      `;
    }

    // 수정 버튼에 postId 전달
    const editLink = qs('.inline-actions a.btn.outline');
    if (editLink) {
      const url = new URL(editLink.getAttribute('href'), window.location.origin);
      url.searchParams.set('postId', postId);
      editLink.setAttribute('href', `${url.pathname}${url.search}`);
    }
  } catch (e) {
    console.error('게시글 상세 조회 실패:', e);
    alert(`게시글 상세 조회 실패: ${e.message || e}`);
    window.location.href = '/pages/post-list.html';
  }
})();
