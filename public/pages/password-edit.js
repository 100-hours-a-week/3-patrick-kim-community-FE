import { changePassword } from '/api/member.js';
import { isValidPassword } from '/lib/validators.js';


// 비밀번호 실시간 유효성 검사
const pwInput = document.getElementById('pw');
const pw2Input = document.getElementById('pw2');
const pwHelper = pwInput?.parentElement.querySelector('.helper');
const pw2Helper = pw2Input?.parentElement.querySelector('.helper');

function validatePw() {
  const pw = pwInput.value;
  if (!isValidPassword(pw)) {
    pwHelper.textContent = '8자 이상, 영문+숫자 필수';
    pwHelper.style.color = 'red';
    return false;
  } else {
    pwHelper.textContent = '사용 가능한 비밀번호입니다.';
    pwHelper.style.color = 'green';
    return true;
  }
}

function validatePw2() {
  const pw = pwInput.value;
  const pw2 = pw2Input.value;
  if (pw2.length === 0) {
    pw2Helper.textContent = '* helper text';
    pw2Helper.style.color = '';
    return false;
  }
  if (pw !== pw2) {
    pw2Helper.textContent = '비밀번호가 일치하지 않습니다.';
    pw2Helper.style.color = 'red';
    return false;
  } else {
    pw2Helper.textContent = '비밀번호가 일치합니다.';
    pw2Helper.style.color = 'green';
    return true;
  }
}

pwInput?.addEventListener('input', () => {
  validatePw();
  validatePw2();
});
pw2Input?.addEventListener('input', validatePw2);

document.querySelector('form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const currentPassword = document.getElementById('current-password').value;
  const newPassword = pwInput.value;
  const newPassword2 = pw2Input.value;
  if (!currentPassword || !newPassword || !newPassword2) {
    alert('모든 항목을 입력해주세요.');
    return;
  }
  if (!validatePw() || !validatePw2()) {
    return;
  }
  try {
    const res = await changePassword(currentPassword, newPassword);
    if (res?.isSuccess) {
      alert('비밀번호가 변경되었습니다. 다시 로그인 해주세요.');
      location.href = '/pages/index.html';
    } else {
      throw new Error(res?.message || '변경 실패');
    }
  } catch (e) {
    alert('비밀번호 변경 실패: ' + (e.message || e));
  }
});
