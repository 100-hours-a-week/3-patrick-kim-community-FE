// 회원 관련 API
import { request } from '/lib/apiClient.js';

/**
 * 회원정보 조회
 */
export async function getMyProfile() {
  return await request('/users/me', { method: 'GET' });
}

/**
 * 회원정보 수정
 * @param {Object} data - { nickname, profileImageId }
 */
export async function updateMyProfile({ nickname, profileImageId }) {
  return await request('/users/me', {
    method: 'PATCH',
    body: {
      ...(nickname ? { nickname } : {}),
      ...(profileImageId ? { profileImageId } : {}),
    },
  });
}

/**
 * 비밀번호 변경
 * @param {string} currentPassword
 * @param {string} newPassword
 */
export async function changePassword(currentPassword, newPassword) {
  return await request('/users/me/password', {
    method: 'PATCH',
    body: { currentPassword, newPassword },
  });
}
