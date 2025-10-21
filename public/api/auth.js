// 인증 관련 API 호출

const BASE_URL = 'http://localhost:8080';

/**
 * 로그인 API
 * @param {string} email - 이메일
 * @param {string} password - 비밀번호
 */
export async function login(email, password) {
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
 */
export async function logout() {
  try {
    const token = localStorage.getItem('accessToken');
    console.log('로그아웃 토큰:', token);
    
    const response = await fetch(`${BASE_URL}/auth`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('로그아웃에 실패했습니다.');
    }

    // 로컬 스토리지에서 토큰 제거
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');

    // 204 No Content이므로 응답 바디 없음
    return { isSuccess: true };
  } catch (error) {
    console.error('로그아웃 API 오류:', error);
    throw error;
  }
}


/**
 * 회원가입API -> 2단계 
 * 1. 이미지 업로드 
 * 2. 회원가입 
 */

export async function signup(email, password, nickname, profileImageId) {
    try {
        const response = await fetch(`${BASE_URL}/users`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password, nickname, profileImageId })
        });

        const result = await response.json();

        if (!response.ok) {
            console.error('회원가입 API 오류:', result);
            throw new Error(result?.message || '회원가입에 실패했습니다.');
        }

        if (result?.isSuccess) {
            return result;
        } else {
            throw new Error(result?.message || '회원가입에 실패했습니다.');
        }
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
  return !!localStorage.getItem('accessToken');
}

/**
 * 인증 토큰 가져오기
 * @returns {string|null} Access Token
 */
export function getAccessToken() {
  return localStorage.getItem('accessToken');
}

// json 만들기
export function createJson(data) { 
    return JSON.stringify(data);
}


