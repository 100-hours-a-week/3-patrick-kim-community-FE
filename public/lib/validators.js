// 폼 입력 유효성 검증 유틸
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function isValidPassword(password) {
  // 최소 8자, 영문+숫자, 일부 특수문자 허용
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d!@#$%^&*()_+]{8,}$/;
  return passwordRegex.test(password);
}

export function isValidNickname(nickname) {
  return typeof nickname === 'string' && nickname.trim().length >= 2 && nickname.trim().length <= 20;
}
