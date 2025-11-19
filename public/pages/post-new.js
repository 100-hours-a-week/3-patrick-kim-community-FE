// 게시글 작성 페이지 로직
import { createPost } from '/js-api/posts.js';
import { uploadImage } from '/js-api/image.js';
import { loadHeader, loadFooter } from '/component/layout.js';
import { showSuccess, showError, showWarning } from '/lib/toast.js';

await loadHeader(true, '/pages/post-list.html'); // 뒤로가기 버튼 있는 헤더
await loadFooter();

document.querySelector('form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const title = document.getElementById('title')?.value?.trim();
  const content = document.getElementById('content')?.value?.trim();
  const imageFile = document.getElementById('image')?.files?.[0];

  // 유효성 검증
  if (!title) {
    showWarning('제목을 입력하세요.');
    return;
  }
  if (title.length > 26) {
    showError('제목은 최대 26글자입니다.');
    return;
  }
  if (!content) {
    showWarning('내용을 입력하세요.');
    return;
  }

  // 내용 글자 수 제한 ... 추가 할 필요가 있어보임.
  if(content.length > 255) {
    showError('내용은 최대 255글자입니다.');
    return;
  }

  try {
    let postImageId = null;

    // 이미지 업로드 (선택)
    if (imageFile) {
      console.log('이미지 업로드 시작...');
      const uploadResult = await uploadImage(imageFile, 'post');
      postImageId = uploadResult?.imageId || uploadResult?.id || uploadResult;
      console.log('이미지 업로드 성공:', postImageId);
    }

    // 게시글 작성 API 호출
    const result = await createPost({ title, content, postImageId });
    if (!result?.isSuccess) throw new Error(result?.message || '게시글 작성 실패');

    showSuccess('게시글이 작성되었습니다!');
    // 작성 완료 후 목록 또는 상세로 이동
    const postId = result?.data?.postId;
    setTimeout(() => {
      if (postId) {
        window.location.href = `/pages/post-detail.html?postId=${postId}`;
      } else {
        window.location.href = '/pages/post-list.html';
      }
    }, 500);
  } catch (error) {
    console.error('게시글 작성 실패:', error);
    showError(`게시글 작성 실패: ${error?.message || '다시 시도해주세요.'}`);
  }
});


// 제목 입력시 글자수 제한 안내
const titleInput = document.getElementById('title');
const titleCountEl = document.getElementById('title-count');
titleInput?.addEventListener('input', () => {
    const currentLength = titleInput.value.length;
    if (titleCountEl) {
        titleCountEl.textContent = `${currentLength} / 26`;
    }
    if (currentLength > 26) {
        titleInput.value = titleInput.value.slice(0, 26);
    }
}
);
