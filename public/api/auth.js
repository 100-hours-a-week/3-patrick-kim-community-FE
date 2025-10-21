// 인증 관련 API 호출 (공통 클라이언트 사용)
import { request } from '/lib/apiClient.js';
import { setTokens, clearTokens, getAccessToken } from '/lib/storage.js';

/**
 * 로그인 API
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 */
export async function login(email, password) {
  try {
    const result = await request('/auth', {
      method: 'POST',
      body: { email, password },
    });
    if (result?.isSuccess && result?.data) {
      setTokens({ accessToken: result.data.accessToken, refreshToken: result.data.refreshToken });
      return result;
    }
    throw new Error(result?.message || '로그인에 실패했습니다.');
  } catch (error) {
    console.error('로그인 API 오류:', error);
    throw error;
  }
}

/**
 * 로그아웃 API
 */
export async function logout() {
  try {
    await request('/auth', { method: 'DELETE', raw: true });
  } catch (e) {
    // 204 응답이거나 CORS로 바디가 없을 수 있어도 토큰만 제거
  } finally {
    clearTokens();
  }
  return { isSuccess: true };
}


/**
 * 회원가입API -> 2단계 
 * 1. 이미지 업로드 
 * 2. 회원가입 
 */

export async function signup(email, password, nickname, profileImageId) {
  try {
    const result = await request('/users', {
      method: 'POST',
      body: { email, password, nickname, profileImageId },
    });
    if (result?.isSuccess) return result;
    throw new Error(result?.message || '회원가입에 실패했습니다.');
  } catch (error) {
    console.error('회원가입 API 오류:', error);
    throw error;
  }
}

/**
 * 인증 토큰 확인
 * @returns {boolean} 로그인 여부
 */
export function isAuthenticated() {
  return !!getAccessToken();
}

/**
 * 인증 토큰 가져오기
 * @returns {string|null} Access Token
 */
export { getAccessToken } from '/lib/storage.js';

// json 만들기
export function createJson(data) { 
    return JSON.stringify(data);
}


