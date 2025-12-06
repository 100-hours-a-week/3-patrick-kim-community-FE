// 게시글 상세 페이지 로직
import { getPostDetail, addLike, removeLike, deletePost } from '/js-api/posts.js';
import { getComments, createComment, updateComment, deleteComment } from '/js-api/comments.js';
import { formatDateTime } from '/lib/datetime.js';
import { loadHeader, loadFooter } from '/component/layout.js';
import { showSuccess, showError, showWarning } from '/lib/toast.js';
import { showConfirmModal, showInputModal } from '/lib/modal.js';

await loadHeader(true, '/pages/post-list.html'); // 뒤로가기 버튼 있는 헤더
await loadFooter();

let currentPostId = null;
let isLiked = false;
let likeCount = 0;
let commentCount = 0; // 댓글 수 추적

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
    showError(`좋아요 처리 실패: ${e.message || e}`);
  }
}

function updateLikeUI() {
  const statsEl = qs('.stats');
  if (!statsEl) return;

  const likePill = statsEl.querySelector('.stat-pill.like-pill');
  if (!likePill) return;

  likePill.className = 'stat-pill like-pill';
  likePill.style.opacity = isLiked ? '1' : '0.6';
  likePill.innerHTML = `<strong>${likeCount}</strong><span>공감</span>`;
}

// 댓글 수 업데이트 UI
function updateCommentCountUI() {
  const statsEl = qs('.stats');
  if (!statsEl) return;
  
  const commentPills = statsEl.querySelectorAll('.stat-pill');
  const commentPill = commentPills[2]; // 세 번째 stat-pill이 댓글
  if (commentPill) {
    const strong = commentPill.querySelector('strong');
    if (strong) {
      strong.textContent = commentCount;
    }
  }
}

async function handleDelete() {
  if (!currentPostId) return;

  const confirmed = await showConfirmModal(
    '이 페이지를 찢어내시겠습니까?',
    '한 번 사라진 기억은 다시 되돌릴 수 없습니다',
    {
      isDanger: true,
      confirmText: '찢어내기',
      cancelText: '보관하기'
    }
  );

  if (!confirmed) return;

  try {
    const result = await deletePost(currentPostId);
    if (result?.isSuccess) {
      showSuccess('페이지가 조용히 사라졌습니다');
      setTimeout(() => {
        window.location.href = '/pages/post-list.html';
      }, 800);
    } else {
      throw new Error(result?.message || '페이지를 지우지 못했습니다');
    }
  } catch (e) {
    console.error('페이지 삭제 실패:', e);
    showError(`삭제에 실패했습니다: ${e.message || e}`);
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
        <span style="margin: 0 8px;">${user.nickname || '익명'}</span>
        <span style="color: #B8B8B8;">${when}</span>
      </div>
      <div class="inline-actions">
        <button class="btn outline edit-comment-btn" style="width:auto; padding: 8px 16px; font-size: 0.85rem;">수정</button>
        <button class="btn outline danger delete-comment-btn" style="width:auto; padding: 8px 16px; font-size: 0.85rem;">삭제</button>
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
    showWarning('이야기 내용을 입력해주세요');
    textarea?.focus();
    return;
  }

  // 댓글 길이 검증 (최대 255자)
  if (content.length > 255) {
    showWarning('이야기는 최대 255자까지 입력 가능합니다');
    textarea?.focus();
    return;
  }
  
  if (!currentPostId) {
    showError('게시글 ID가 없습니다.');
    return;
  }
  
  try {
    const result = await createComment(currentPostId, content);
    if (result?.isSuccess) {
      showSuccess('이야기를 남겼습니다');
      // 댓글 수 증가
      commentCount++;
      updateCommentCountUI();
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
    showError(`이야기를 남기는 데 실패했습니다: ${e.message || e}`);
  }
}

// 댓글 수정
async function handleEditComment(commentId, commentEl) {
  const contentEl = commentEl.querySelector('.comment-content');
  const currentContent = contentEl?.textContent || '';
  
  const newContent = await showInputModal('이야기 다시 쓰기', currentContent, {
    placeholder: '조용히 공감을 전하거나, 비슷한 마음을 나눠주세요',
    confirmText: '다시 쓰기',
    cancelText: '그대로 두기'
  });
  
  if (newContent === null) return; // 취소
  if (!newContent.trim()) {
    showWarning('이야기 내용을 입력해주세요');
    return;
  }

  // 댓글 길이 검증 (최대 255자)
  if (newContent.trim().length > 255) {
    showWarning('이야기는 최대 255자까지 입력 가능합니다');
    return;
  }
  
  try {
    const result = await updateComment(commentId, newContent.trim());
    if (result?.isSuccess) {
      showSuccess('이야기를 다시 썼습니다');
      // 댓글 내용만 업데이트
      if (contentEl) contentEl.textContent = newContent.trim();
    } else {
      throw new Error(result?.message || '댓글 수정 실패');
    }
  } catch (e) {
    console.error('댓글 수정 실패:', e);
    showError(`수정에 실패했습니다: ${e.message || e}`);
  }
}

// 댓글 삭제
async function handleDeleteComment(commentId, commentEl) {
  const confirmed = await showConfirmModal(
    '이야기를 지우시겠습니까?',
    '한 번 지운 이야기는 되돌릴 수 없습니다',
    {
      isDanger: true,
      confirmText: '지우기',
      cancelText: '남기기'
    }
  );

  if (!confirmed) return;

  try {
    const result = await deleteComment(commentId);
    if (result?.isSuccess) {
      showSuccess('이야기가 조용히 사라졌습니다');
      // 댓글 수 감소
      commentCount--;
      updateCommentCountUI();
      // DOM에서 제거
      commentEl?.remove();
    } else {
      throw new Error(result?.message || '댓글 삭제 실패');
    }
  } catch (e) {
    console.error('댓글 삭제 실패:', e);
    showError(`삭제에 실패했습니다: ${e.message || e}`);
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
    showError(`댓글 목록 조회 실패: ${e.message || e}`);
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
    showError('잘못된 접근입니다. 게시글 ID가 없습니다.');
    setTimeout(() => {
      window.location.href = '/pages/post-list.html';
    }, 1000);
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
    
    // 댓글 수 저장
    commentCount = comments;

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
        <div class="stat-pill like-pill" style="cursor:pointer; opacity:${isLiked ? '1' : '0.6'};">
          <strong>${likeCount}</strong><span>공감</span>
        </div>
        <div class="stat-pill"><strong>${views}</strong><span>읽음</span></div>
        <div class="stat-pill"><strong>${comments}</strong><span>이야기</span></div>
      `;

      // 공감 클릭 이벤트
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
    
    // 댓글 입력 글자 수 카운터
    const commentTextarea = qs('.comment-editor textarea');
    const charCount = qs('.char-count');
    if (commentTextarea && charCount) {
      commentTextarea.addEventListener('input', () => {
        const length = commentTextarea.value.length;
        charCount.textContent = `${length} / 255`;
        // 255자 초과 시 빨간색으로 표시
        if (length > 255) {
          charCount.style.color = '#ff4444';
        } else {
          charCount.style.color = '#999';
        }
      });
    }
  } catch (e) {
    console.error('게시글 상세 조회 실패:', e);
    showError(`게시글 상세 조회 실패: ${e.message || e}`);
    window.location.href = '/pages/post-list.html';
  }
})();
