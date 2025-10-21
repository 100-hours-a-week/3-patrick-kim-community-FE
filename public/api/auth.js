// 인증 관련 API 호출

// 개발 환경(프론트 3000)에서는 프록시(/api)를 통해 백엔드를 호출하여 CORS 이슈를 피합니다.
const BASE_URL = (typeof window !== 'undefined' && window.location.host.includes('localhost:3000'))
  ? '/backend'
  : 'http://localhost:8080';

/**
 * 로그인 API
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 * @returns {Promise<Object>} API 응답 데이터
 */
async function login(email, password) {
  try {
    const response = await fetch(`${BASE_URL}/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('로그인 API 오류:', result);
      throw new Error(result?.message || '로그인에 실패했습니다.');
    }

    if (result?.isSuccess) {
      if (result?.data?.accessToken) {
        localStorage.setItem('accessToken', result.data.accessToken);
      }
      if (result?.data?.refreshToken) {
        localStorage.setItem('refreshToken', result.data.refreshToken);
      }
      return result;
    } else {
      throw new Error(result?.message || '로그인에 실패했습니다.');
    }
  } catch (error) {
    console.error('로그인 API 오류:', error);
    throw error;
  }
}

/**
 * 로그아웃 API
 * @returns {Promise<Object>} API 응답 데이터
 */
async function logout() {
  try {
    const token = localStorage.getItem('accessToken');
    
    const response = await fetch(`${BASE_URL}/auth`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

  const result = await response.json();

    if (!response.ok) {
      throw new Error(result.message || '로그아웃에 실패했습니다.');
    }

    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    return result;
  } catch (error) {
    console.error('로그아웃 API 오류:', error);
    throw error;
  }
}

/**
 * 인증 토큰 확인
 * @returns {boolean} 로그인 여부
 */
function isAuthenticated() {
  return !!localStorage.getItem('accessToken');
}

/**
 * 인증 토큰 가져오기
 * @returns {string|null} Access Token
 */
function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// json 만들기
function createJson(data) { 
    return JSON.stringify(data);
}

// 브라우저 전역 노출 (스크립트로 로드되는 환경)
window.login = login;
window.logout = logout;
window.isAuthenticated = isAuthenticated;
window.getAccessToken = getAccessToken;

