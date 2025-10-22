// 게시글 상세 페이지 로직
import { getPostDetail, addLike, removeLike } from '/api/posts.js';
import { formatDateTime } from '/lib/datetime.js';

let currentPostId = null;
let isLiked = false;
let likeCount = 0;

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function setText(el, text) {
  if (el) el.textContent = text ?? '';
}

async function toggleLike() {
  if (!currentPostId) return;
  
  try {
    let result;
    if (isLiked) {
      result = await removeLike(currentPostId);
    } else {
      result = await addLike(currentPostId);
    }
    
    if (result?.isSuccess) {
      // 상태 토글
      isLiked = !isLiked;
      likeCount += isLiked ? 1 : -1;
      updateLikeUI();
    }
  } catch (e) {
    console.error('좋아요 토글 실패:', e);
    alert(`좋아요 처리 실패: ${e.message || e}`);
  }
}

function updateLikeUI() {
  const statsEl = qs('.stats');
  if (statsEl) {
    const likePill = statsEl.querySelector('.stat-pill.like-pill');
    if (likePill) {
      likePill.innerHTML = `<strong>${likeCount}</strong><span>좋아요수</span>`;
      likePill.style.cursor = 'pointer';
      likePill.style.backgroundColor = isLiked ? '#FEE500' : '#f8f8f8';
    }
  }
}

(async function main() {
  const params = new URLSearchParams(window.location.search);
  const postId = params.get('postId');
  currentPostId = postId;
  
  if (!postId) {
    alert('잘못된 접근입니다. 게시글 ID가 없습니다.');
    window.location.href = '/pages/post-list.html';
    return;
  }

  try {
    const res = await getPostDetail(postId);
    if (!res?.isSuccess) throw new Error(res?.message || '상세 조회 실패');

    const data = res.data || {};
    const { title, user = {}, createdAt, postImageUrl, likes = 0, comments = 0, views = 0, content, liked = false } = data;
    const when = formatDateTime(createdAt);
    
    // 좋아요 상태 저장
    isLiked = liked;
    likeCount = likes;

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
        <div class="stat-pill like-pill" style="cursor:pointer; background-color:${isLiked ? '#FEE500' : '#f8f8f8'};">
          <strong>${likeCount}</strong><span>좋아요수</span>
        </div>
        <div class="stat-pill"><strong>${views}</strong><span>조회수</span></div>
        <div class="stat-pill"><strong>${comments}</strong><span>댓글</span></div>
      `;
      
      // 좋아요 클릭 이벤트
      const likePill = statsEl.querySelector('.like-pill');
      likePill?.addEventListener('click', () => toggleLike());
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
