// 로그인 폼 제출 시 로그인 API 호출 (ESM)
import { login } from '/js-api/auth.js';
import { redirectIfLoggedIn } from '/lib/auth.js';
import { showSuccess, showError, showWarning } from '/lib/toast.js';


(function () {
    redirectIfLoggedIn();
    const form = document.getElementById('login-form');
    if (!form) return;

    form.addEventListener('submit', async (e) => {
        e.preventDefault();

        const email = document.getElementById('email')?.value?.trim();
        const password = document.getElementById('password')?.value;

        if (!email || !password) {
            showWarning('이메일과 비밀번호를 입력하세요.');
            return;
        }

        try {
            const result = await login(email, password);
            showSuccess('로그인 성공! 서재로 이동합니다.');
            // 로그인 성공 시 홈(서재)으로 이동
            setTimeout(() => {
                window.location.href = '/pages/home.html';
            }, 500);
        } catch (error) {
            showError(`로그인 실패: ${error?.message || '다시 시도해주세요.'}`);
        }
    });
})();