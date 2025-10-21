// 이미지 업로드 API

const BASE_URL = 'http://localhost:8080';


export async function uploadImage(imageFile) {
    try {
        if (!imageFile) {
            throw new Error('이미지 파일이 없습니다.');
        }

        const formData = new FormData();
        formData.append('image', imageFile);
        console.log('[uploadImage] fetch start:', `${BASE_URL}/images`);
        let response;
        try {
            response = await fetch(`${BASE_URL}/images`, {
                method: 'POST',
                body: formData
            });
        } catch (networkError) {
            alert('이미지 업로드 네트워크 에러: ' + networkError);
            throw networkError;
        }
        console.log('[uploadImage] fetch done, status:', response.status);
        let result = null;
        const contentType = response.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
            result = await response.json();
        }
        if (!response.ok) {
            const msg = result?.message || response.statusText || response.status;
            console.error('이미지 업로드 API 오류:', msg);
            alert('이미지 업로드 API 오류: ' + msg);
            throw new Error(msg || '이미지 업로드에 실패했습니다.');
        }
        if (result?.isSuccess) {
            return result.data; // { id: '...' }
        } else if (response.status === 204) {
            return null;
        } else {
            throw new Error(result?.message || '이미지 업로드에 실패했습니다.');
        }
    } catch (error) {
        console.error('이미지 업로드 API 오류:', error);
        throw error;
    }
}
