import { getMyProfile, updateMyProfile } from '/api/member.js';
import { uploadImage } from '/api/image.js';
import { isValidNickname } from '/lib/validators.js';
import { loadHeader, loadFooter } from '/component/layout.js';
import { showSuccess, showError } from '/lib/toast.js';

await loadHeader();
await loadFooter();

let currentImageUrl = '';

(async function init() {
  // 프로필 정보 불러오기
  try {
    const res = await getMyProfile();
    if (res?.isSuccess && res.data) {
      const { email, nickname, profileImageUrl } = res.data;
      document.getElementById('nickname').value = nickname || '';
      document.getElementById('email').value = email || '';
      currentImageUrl = profileImageUrl || '';
      document.getElementById('profile-image-preview').src = currentImageUrl || '/public/component/default-profile.png';
    }
  } catch (e) {
    showError('회원정보를 불러오지 못했습니다.');
  }

  // 이미지 미리보기 및 파일 선택
  const fileInput = document.getElementById('profile-image');
  const previewImg = document.getElementById('profile-image-preview');
  // previewImg 클릭 이벤트 제거 (label[for]로 충분)
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        previewImg.src = ev.target.result;
      };
      reader.readAsDataURL(file);
    } else {
      previewImg.src = currentImageUrl || '/public/component/default-profile.png';
    }
  });

  // 닉네임 실시간 유효성 검사
  const nicknameInput = document.getElementById('nickname');
  const nicknameHelper = nicknameInput?.parentElement.querySelector('.helper');
  nicknameInput?.addEventListener('input', () => {
    const value = nicknameInput.value.trim();
    if (!isValidNickname(value)) {
      nicknameHelper.textContent = '닉네임은 2~20자여야 합니다.';
      nicknameHelper.style.color = 'red';
    } else {
      nicknameHelper.textContent = '사용 가능한 닉네임입니다.';
      nicknameHelper.style.color = 'green';
    }
  });

  // 폼 제출(수정하기)
  document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const nickname = nicknameInput.value.trim();
    if (!isValidNickname(nickname)) {
      nicknameHelper.textContent = '닉네임은 2~20자여야 합니다.';
      nicknameHelper.style.color = 'red';
      nicknameInput.focus();
      return;
    }
    const file = fileInput.files[0];
    let profileImageId;
    if (file) {
      const uploadRes = await uploadImage(file, 'profile');
      profileImageId = uploadRes?.imageId || uploadRes?.id;
    }
    try {
      const res = await updateMyProfile({ nickname, profileImageId });
      if (res?.isSuccess) {
        showSuccess('회원정보가 수정되었습니다.');
        // 수정완료 버튼에서만 이동
      } else {
        throw new Error(res?.message || '수정 실패');
      }
    } catch (e) {
      showError('회원정보 수정 실패: ' + (e.message || e));
    }
  });

  // 수정완료 버튼 클릭 시 이전 페이지로 이동
  const completeBtn = document.querySelector('button[type="button"].btn');
  if (completeBtn) {
    completeBtn.addEventListener('click', () => {
      window.history.back();
    });
  }
})();
