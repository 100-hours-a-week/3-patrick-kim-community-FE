

// 로그인 폼 제출 시 로그인 API 호출
(function () {
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email')?.value?.trim();
        const password = document.getElementById('password')?.value;

        if (!email || !password) {
            alert('이메일과 비밀번호를 입력하세요.');
            return;
        }

        try {
            const result = await login(email, password);
            alert('로그인 성공');
            // 로그인 성공 시 게시판으로 이동
            window.location.href = '/pages/post-list.html';
        } catch (error) {
            alert(`로그인 실패: ${error?.message || '다시 시도해주세요.'}`);
        }
    });
})();