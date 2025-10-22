// 댓글 관련 API
import { request } from '/lib/apiClient.js';

/**
 * 댓글 목록 조회 (커서 기반)
 * @param {number} postId - 게시글 ID
 * @param {number|string} cursorId - 다음 커서 (선택)
 * @param {number} limit - 페이지 크기 (기본 10)
 * @returns {Promise<{isSuccess:boolean, message:string, data:{comments: any[], nextCursorId?: number, hasNext:boolean}}>}
 */
export async function getComments(postId, cursorId, limit = 10) {
  const result = await request(`/posts/${postId}/comments`, {
    method: 'GET',
    query: {
      ...(cursorId ? { cursorId } : {}),
      ...(limit ? { limit } : {}),
    },
  });
  return result;
}

/**
 * 댓글 작성
 * @param {number} postId - 게시글 ID
 * @param {string} content - 댓글 내용
 * @returns {Promise<{isSuccess:boolean, message:string, data:{commentId:number}}>}
 */
export async function createComment(postId, content) {
  const result = await request(`/posts/${postId}/comments`, {
    method: 'POST',
    body: { content },
  });
  return result;
}

/**
 * 댓글 수정
 * @param {number} commentId - 댓글 ID
 * @param {string} content - 댓글 내용
 * @returns {Promise<{isSuccess:boolean, message:string}>}
 */
export async function updateComment(commentId, content) {
  const result = await request(`/comments/${commentId}`, {
    method: 'PATCH',
    body: { content },
  });
  return result;
}

/**
 * 댓글 삭제
 * @param {number} commentId - 댓글 ID
 * @returns {Promise<{isSuccess:boolean, message:string}>}
 */
export async function deleteComment(commentId) {
  const result = await request(`/comments/${commentId}`, {
    method: 'DELETE',
  });
  return result;
}
