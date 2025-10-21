import { signup } from '/api/auth.js';



// 회원가입 폼 제출 시 회원가입 api 호출

document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email')?.value?.trim();
    const password = document.getElementById('password')?.value;
    const confirmPassword = document.getElementById('confirm-password')?.value;
    const nickname = document.getElementById('nickname')?.value?.trim();
    const profileImageUrl = document.getElementById('profile-image-url')?.value?.trim();
    
    if (!email || !password || !confirmPassword || !nickname) {
        alert('모든 필드를 입력하세요.');
        return;
    }
    if (password !== confirmPassword) {
        alert('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
        return;
    }
    
    try {
        const result = await signup(email, password, nickname, profileImageUrl);
        alert('회원가입 성공! 로그인 페이지로 이동합니다.');
        window.location.href = '/pages/index.html';
    }
    catch (error) {
        alert(`회원가입 실패: ${error?.message || '다시 시도해주세요.'}`);
    }


});



