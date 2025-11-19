// 이미지 업로드 API (공통 클라이언트 사용)
import { request } from '/lib/apiClient.js';

export async function uploadImage(imageFile, imageType = 'profile') {
  try {
    if (!imageFile) throw new Error('이미지 파일이 없습니다.');
    const formData = new FormData();
    formData.append('image', imageFile);
    const result = await request('/images', {
      method: 'POST',
      body: formData,
      query: { imageType },
    });
    if (result?.isSuccess) return result.data; // { id, s3_url, ... }
    return result;
  } catch (error) {
    console.error('이미지 업로드 API 오류:', error);
    throw error;
  }
}
