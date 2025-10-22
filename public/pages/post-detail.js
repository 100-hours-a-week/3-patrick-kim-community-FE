// 게시글 상세 페이지 로직
import { getPostDetail, addLike, removeLike, deletePost } from '/api/posts.js';
import { getComments, createComment, updateComment, deleteComment } from '/api/comments.js';
import { formatDateTime } from '/lib/datetime.js';

let currentPostId = null;
let isLiked = false;
let likeCount = 0;

// 댓글 페이지네이션 상태
let commentCursorId = null;
let hasNextComments = true;
let isLoadingComments = false;
const commentLimit = 10;

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
      likePill.innerHTML = `<span class="like-icon">❤️</span><strong>${likeCount}</strong><span>좋아요수</span>`;
      likePill.style.cursor = 'pointer';
      likePill.style.backgroundColor = isLiked ? '#FEE500' : '#f8f8f8';
      
      // 애니메이션 클래스 추가 후 제거
      likePill.classList.remove('liked');
      void likePill.offsetWidth; // 리플로우 강제 (애니메이션 재시작)
      if (isLiked) {
        likePill.classList.add('liked');
      }
    }
  }
}

async function handleDelete() {
  if (!currentPostId) return;
  
  const confirmed = confirm('정말 삭제하시겠습니까?');
  if (!confirmed) return;
  
  try {
    const result = await deletePost(currentPostId);
    if (result?.isSuccess) {
      alert('게시글이 삭제되었습니다.');
      window.location.href = '/pages/post-list.html';
    } else {
      throw new Error(result?.message || '게시글 삭제 실패');
    }
  } catch (e) {
    console.error('게시글 삭제 실패:', e);
    alert(`게시글 삭제 실패: ${e.message || e}`);
  }
}

// 댓글 아이템 생성
function createCommentItem(comment) {
  const el = document.createElement('div');
  el.className = 'comment';
  el.dataset.commentId = comment.commentId;
  
  const user = comment.user || {};
  const avatarStyle = user.profileImageUrl 
    ? `background-image:url('${user.profileImageUrl}'); background-size:cover; background-position:center; display:inline-block;` 
    : '';
  const when = formatDateTime(comment.createdAt);
  
  el.innerHTML = `
    <div class="comment-head">
      <div class="comment-meta">
        <span class="avatar" style="width:22px; height:22px; ${avatarStyle}"></span> 
        ${user.nickname || '익명'} · ${when}
      </div>
      <div class="inline-actions">
        <button class="btn outline edit-comment-btn" style="width:auto">수정</button>
        <button class="btn outline danger delete-comment-btn" style="width:auto">삭제</button>
      </div>
    </div>
    <div class="comment-content">${comment.content ?? ''}</div>
  `;
  
  // 수정 버튼 이벤트
  const editBtn = el.querySelector('.edit-comment-btn');
  editBtn?.addEventListener('click', () => handleEditComment(comment.commentId, el));
  
  // 삭제 버튼 이벤트
  const deleteBtn = el.querySelector('.delete-comment-btn');
  deleteBtn?.addEventListener('click', () => handleDeleteComment(comment.commentId, el));
  
  return el;
}

// 댓글 작성
async function handleCreateComment() {
  const textarea = qs('.comment-editor textarea');
  const content = textarea?.value?.trim();
  
  if (!content) {
    alert('댓글 내용을 입력해주세요.');
    textarea?.focus();
    return;
  }
  
  if (!currentPostId) {
    alert('게시글 ID가 없습니다.');
    return;
  }
  
  try {
    const result = await createComment(currentPostId, content);
    if (result?.isSuccess) {
      alert('댓글이 작성되었습니다.');
      // 댓글 목록 새로고침
      commentCursorId = null;
      hasNextComments = true;
      const container = qs('.comment-list');
      if (container) container.innerHTML = '';
      await loadMoreComments();
      // 입력창 초기화
      if (textarea) textarea.value = '';
    } else {
      throw new Error(result?.message || '댓글 작성 실패');
    }
  } catch (e) {
    console.error('댓글 작성 실패:', e);
    alert(`댓글 작성 실패: ${e.message || e}`);
  }
}

// 댓글 수정
async function handleEditComment(commentId, commentEl) {
  const contentEl = commentEl.querySelector('.comment-content');
  const currentContent = contentEl?.textContent || '';
  
  const newContent = prompt('댓글을 수정하세요:', currentContent);
  if (newContent === null) return; // 취소
  if (!newContent.trim()) {
    alert('댓글 내용을 입력해주세요.');
    return;
  }
  
  try {
    const result = await updateComment(commentId, newContent.trim());
    if (result?.isSuccess) {
      alert('댓글이 수정되었습니다.');
      // 댓글 내용만 업데이트
      if (contentEl) contentEl.textContent = newContent.trim();
    } else {
      throw new Error(result?.message || '댓글 수정 실패');
    }
  } catch (e) {
    console.error('댓글 수정 실패:', e);
    alert(`댓글 수정 실패: ${e.message || e}`);
  }
}

// 댓글 삭제
async function handleDeleteComment(commentId, commentEl) {
  const confirmed = confirm('정말 삭제하시겠습니까?');
  if (!confirmed) return;
  
  try {
    const result = await deleteComment(commentId);
    if (result?.isSuccess) {
      alert('댓글이 삭제되었습니다.');
      // DOM에서 제거
      commentEl?.remove();
    } else {
      throw new Error(result?.message || '댓글 삭제 실패');
    }
  } catch (e) {
    console.error('댓글 삭제 실패:', e);
    alert(`댓글 삭제 실패: ${e.message || e}`);
  }
}


// 댓글 목록 로드
async function loadMoreComments() {
  const container = qs('.comment-list');
  const loadMoreBtn = document.getElementById('load-more-comments-btn');
  const spinner = document.getElementById('load-more-comments-spinner');
  
  if (!container || !currentPostId || isLoadingComments || !hasNextComments) return;

  isLoadingComments = true;
  if (loadMoreBtn) loadMoreBtn.disabled = true;
  if (spinner) spinner.style.display = 'inline-block';

  try {
    const res = await getComments(currentPostId, commentCursorId, commentLimit);
    if (!res?.isSuccess) throw new Error(res?.message || '댓글 목록 조회 실패');
    
    const { comments = [], nextCursorId, hasNext } = res.data || {};
    comments.forEach(c => container.appendChild(createCommentItem(c)));
    
    commentCursorId = nextCursorId ?? null;
    hasNextComments = hasNext ?? false;
    
    // 더보기 버튼 표시/숨김 처리
    if (loadMoreBtn) {
      if (hasNextComments) {
        loadMoreBtn.style.display = 'inline-block';
      } else {
        loadMoreBtn.style.display = 'none';
      }
    }
  } catch (e) {
    console.error('댓글 목록 조회 실패:', e);
    alert(`댓글 목록 조회 실패: ${e.message || e}`);
  } finally {
    isLoadingComments = false;
    if (loadMoreBtn) loadMoreBtn.disabled = false;
    if (spinner) spinner.style.display = 'none';
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
        <div class="stat-pill like-pill${isLiked ? ' liked' : ''}" style="cursor:pointer; background-color:${isLiked ? '#FEE500' : '#f8f8f8'};">
          <span class="like-icon">❤️</span><strong>${likeCount}</strong><span>좋아요수</span>
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
    
    // 삭제 버튼 이벤트
    const deleteBtn = qs('.inline-actions button.btn.outline.danger');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', handleDelete);
    }
    
    // 댓글 목록 로드
    await loadMoreComments();
    
    // 댓글 더보기 버튼 이벤트
    const loadMoreCommentsBtn = document.getElementById('load-more-comments-btn');
    loadMoreCommentsBtn?.addEventListener('click', () => loadMoreComments());
    
    // 댓글 등록 버튼 이벤트
    const createCommentBtn = qs('.comment-editor .btn');
    createCommentBtn?.addEventListener('click', handleCreateComment);
  } catch (e) {
    console.error('게시글 상세 조회 실패:', e);
    alert(`게시글 상세 조회 실패: ${e.message || e}`);
    window.location.href = '/pages/post-list.html';
  }
})();
