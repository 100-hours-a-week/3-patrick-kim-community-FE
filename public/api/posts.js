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


/**
 * 게시글 상세 조회
 */

export async function getPostDetail(postId) {
    const result = await request(`/posts/${postId}`, {
        method: 'GET',
    });
    return result;
}

/**
 * 게시글 작성
 * @param {Object} data - { title, content, postImageUrl? }
 * @returns {Promise<{isSuccess:boolean, message:string, data:{postId:number}}>}
 */
export async function createPost({ title, content, postImageId }) {
  const result = await request('/posts', {
    method: 'POST',
    body: {
      title,
      content,
      ...(postImageId ? { postImageId } : {}),
    },
  });
  return result;
}

/**
 * 좋아요 추가
 * @param {number} postId - 게시글 ID
 * @returns {Promise<{isSuccess:boolean, message:string, data:{postId:number, liked:boolean}}>}
 */
export async function addLike(postId) {
  const result = await request(`/posts/${postId}/likes`, {
    method: 'POST',
  });
  return result;
}

/**
 * 좋아요 삭제
 * @param {number} postId - 게시글 ID
 * @returns {Promise<{isSuccess:boolean, message:string, data:{postId:number, liked:boolean}}>}
 */
export async function removeLike(postId) {
  const result = await request(`/posts/${postId}/likes`, {
    method: 'DELETE',
  });
  return result;
}

/**
 * 게시글 삭제
 * @param {number} postId - 게시글 ID
 * @returns {Promise<{isSuccess:boolean, message:string}>}
 */
export async function deletePost(postId) {
  const result = await request(`/posts/${postId}`, {
    method: 'DELETE',
  });
  return result;
}
