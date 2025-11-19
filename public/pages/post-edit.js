// 게시글 수정 페이지 로직
import { getPostDetail, updatePost } from '/js-api/posts.js';
import { uploadImage } from '/js-api/image.js';
import { loadHeader, loadFooter } from '/component/layout.js';
import { showSuccess, showError, showWarning } from '/lib/toast.js';

await loadHeader(true, 'javascript:history.back()'); // 뒤로가기 버튼 있는 헤더
await loadFooter();

let currentPostId = null;
let currentImageId = null;
let selectedFile = null;

function qs(selector, root = document) {
  return root.querySelector(selector);
}

function getValue(el) {
  return el ? el.value?.trim() : '';
}

// 초기 데이터 로드
async function loadPostData() {
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
    const { title, content, postImageId } = data;

    // 폼에 기존 데이터 채우기
    const titleInput = qs('#title');
    const contentInput = qs('#content');

    if (titleInput) titleInput.value = title || '';
    if (contentInput) contentInput.value = content || '';
    
    currentImageId = postImageId;

    // 헤더 뒤로가기 링크에 postId 추가
    const backBtn = qs('.left .icon-btn');
    if (backBtn) {
      backBtn.setAttribute('href', `/pages/post-detail.html?postId=${postId}`);
    }
  } catch (e) {
    console.error('게시글 로드 실패:', e);
    showError(`게시글 로드 실패: ${e.message || e}`);
    setTimeout(() => {
      window.location.href = '/pages/post-list.html';
    }, 1000);
  }
}

// 게시글 수정
async function handleUpdate(e) {
  e.preventDefault();

  if (!currentPostId) {
    showError('게시글 ID가 없습니다.');
    return;
  }

  const titleInput = qs('#title');
  const contentInput = qs('#content');
  const title = getValue(titleInput);
  const content = getValue(contentInput);

  // 유효성 검사
  if (!title) {
    showWarning('제목을 입력해주세요.');
    titleInput?.focus();
    return;
  }
  if (title.length > 26) {
    showError('제목은 최대 26자까지 입력 가능합니다.');
    titleInput?.focus();
    return;
  }
  if (!content) {
    showWarning('내용을 입력해주세요.');
    contentInput?.focus();
    return;
  }
  if (content.length > 255) {
    showError('내용은 최대 255자까지 입력 가능합니다.');
    contentInput?.focus();
    return;
  }

  try {
    const submitBtn = qs('.btn[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = '수정 중...';
    }

    let postImageId = currentImageId;

    // 새 이미지가 선택된 경우 업로드
    if (selectedFile) {
      console.log('이미지 업로드 시작...');
      const uploadResult = await uploadImage(selectedFile, 'post');
      postImageId = uploadResult?.imageId || uploadResult?.id || uploadResult;
      console.log('이미지 업로드 성공:', postImageId);
    }

    // 게시글 수정 API 호출
    const res = await updatePost(currentPostId, {
      title,
      content,
      postImageId,
    });

    if (res?.isSuccess) {
      showSuccess('게시글이 수정되었습니다.');
      setTimeout(() => {
        window.location.href = `/pages/post-detail.html?postId=${currentPostId}`;
      }, 500);
    } else {
      throw new Error(res?.message || '게시글 수정 실패');
    }
  } catch (e) {
    console.error('게시글 수정 실패:', e);
    showError(`게시글 수정 실패: ${e.message || e}`);
  } finally {
    const submitBtn = qs('.btn[type="submit"]');
    if (submitBtn) {
      submitBtn.disabled = false;
      submitBtn.textContent = '수정하기';
    }
  }
}

// 파일 선택 이벤트
function handleFileChange(e) {
  const file = e.target.files?.[0];
  if (file) {
    selectedFile = file;
    console.log('선택된 파일:', file.name);
  }
}

// 제목 글자수 카운터
function setupTitleCounter() {
  const titleInput = qs('#title');
  const titleCountEl = qs('#title-count');
  
  titleInput?.addEventListener('input', () => {
    const currentLength = titleInput.value.length;
    if (titleCountEl) {
      titleCountEl.textContent = `${currentLength} / 26`;
    }
    if (currentLength > 26) {
      titleInput.value = titleInput.value.slice(0, 26);
    }
  });
}

// 초기화
(async function init() {
  await loadPostData();

  // 폼 제출 이벤트
  const form = qs('form');
  if (form) {
    form.addEventListener('submit', handleUpdate);
  }

  // 파일 입력 이벤트
  const fileInput = qs('#image');
  if (fileInput) {
    fileInput.addEventListener('change', handleFileChange);
  }

  // 제목 글자수 카운터
  setupTitleCounter();
})();
