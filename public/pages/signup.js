import { signup } from '/api/auth.js';
import { uploadImage } from '/api/image.js';
import { isValidEmail, isValidPassword, isValidNickname } from '/lib/validators.js';

// 프로필 이미지 선택 및 미리보기
const profileImageInput = document.getElementById('profile-image');
const profilePreview = document.getElementById('profile-preview');

// 프로필 placeholder 클릭 시 파일 선택
profilePreview?.addEventListener('click', () => {
    profileImageInput?.click();
});

// 이미지 선택 시 미리보기 표시
profileImageInput?.addEventListener('change', (e) => {
    const file = e.target.files?.[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
            profilePreview.style.backgroundImage = `url(${event.target.result})`;
            profilePreview.style.backgroundSize = 'cover';
            profilePreview.style.backgroundPosition = 'center';
            profilePreview.textContent = '';
        };
        reader.readAsDataURL(file);
    }
});

// 회원가입 폼 제출
document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();


    
    
    const email = document.getElementById('signup-email')?.value?.trim();
    const password = document.getElementById('signup-password')?.value;
    const confirmPassword = document.getElementById('signup-confirm')?.value;
    const nickname = document.getElementById('nickname')?.value?.trim();

    
    
    if (!email || !password || !confirmPassword || !nickname) {
        alert('모든 필드를 입력하세요.');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
    }

        // 유효성 검증 (공통 유틸 사용)
        if (!isValidEmail(email)) {
            alert('유효한 이메일 주소를 입력하세요.');
            return;
        }
        if (!isValidPassword(password)) {
            alert('비밀번호는 최소 8자 이상이며, 영문자와 숫자를 모두 포함해야 합니다.');
            return;
        }
        if (!isValidNickname(nickname)) {
            alert('닉네임은 2자 이상 20자 이하이어야 합니다.');
            return;
        }



    try {
        let profileImageId = null;
        // 이미지가 선택된 경우 업로드
        const imageFile = profileImageInput?.files?.[0];
        if (imageFile) {
            console.log('이미지 업로드 시작...');
            const uploadResult = await uploadImage(imageFile, 'profile');
            profileImageId = uploadResult?.imageId || uploadResult?.id || uploadResult;
            console.log('이미지 업로드 성공:', profileImageId);
        }
        // 회원가입 API 호출
        const result = await signup(email, password, nickname, profileImageId);
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        window.location.href = '/pages/index.html';
    } catch (error) {
        console.error('회원가입 실패:', error);
        alert(`회원가입 실패: ${error?.message || '다시 시도해주세요.'}`);
    }
});



// 비밀번호 일치 여부 실시간 확인
const passwordInput = document.getElementById('signup-password');
const confirmInput = document.getElementById('signup-confirm');

const passwordMatchMsg = document.getElementById('password-match-msg');

passwordInput.addEventListener('input', checkPasswordMatch);
confirmInput.addEventListener('input', checkPasswordMatch);

function checkPasswordMatch() {
    if (passwordInput.value && confirmInput.value) {
        if (passwordInput.value === confirmInput.value) {
            passwordMatchMsg.textContent = '비밀번호가 일치합니다.';
            passwordMatchMsg.style.color = 'green';
        } else {
            passwordMatchMsg.textContent = '비밀번호가 일치하지 않습니다.';
            passwordMatchMsg.style.color = 'red';
        }
    } else {
        passwordMatchMsg.textContent = '';
    }
}






