// 게시글 관련 API
import { request } from '/lib/apiClient.js';

/**
 * 게시글 목록 조회 (커서 기반)
 * @param {number|string} cursorId - 다음 커서 (선택)
 * @param {number} limit - 페이지 크기 (기본 10)
 * @returns {Promise<{isSuccess:boolean, message:string, data:{posts: any[], nextCursorId?: number, hasNext:boolean}}>} 
 */
export async function getPosts(cursorId, limit = 10) {
  const result = await request('/posts', {
    method: 'GET',
    query: {
      ...(cursorId ? { cursorId } : {}),
      ...(limit ? { limit } : {}),
    },
  });
  return result;
}


