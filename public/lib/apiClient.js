// 통합 fetch 클라이언트
import { BASE_URL, DEFAULT_FETCH_OPTIONS } from '/lib/config.js';
import { getAccessToken } from '/lib/storage.js';

function isJSONResponse(response) {
  const ct = response.headers.get('content-type') || '';
  return ct.includes('application/json');
}

export async function request(path, { method = 'GET', headers = {}, body, query, raw = false } = {}) {
  // query string
  const url = new URL(path.startsWith('http') ? path : `${BASE_URL}${path}`);
  if (query && typeof query === 'object') {
    Object.entries(query).forEach(([k, v]) => {
      if (v !== undefined && v !== null && v !== '') url.searchParams.set(k, v);
    });
  }

  const init = { method, ...DEFAULT_FETCH_OPTIONS, headers: { ...headers } };

  // Authorization 헤더 부착 (필요 시)
  const token = getAccessToken?.();
  if (token) {
    init.headers['Authorization'] = `Bearer ${token}`;
  }

  // Body 처리: FormData면 그대로, 객체면 JSON 직렬화
  if (body !== undefined && body !== null) {
    if (body instanceof FormData || body instanceof Blob) {
      init.body = body;
    } else if (typeof body === 'object') {
      init.headers['Content-Type'] = init.headers['Content-Type'] || 'application/json';
      init.body = JSON.stringify(body);
    } else {
      init.body = body;
    }
  }

  let response;
  try {
    response = await fetch(url.toString(), init);
  } catch (e) {
    console.error('[request] network error:', e);
    throw e;
  }

  if (!response.ok) {
    let errMsg = response.statusText;
    try {
      if (isJSONResponse(response)) {
        const errJson = await response.json();
        errMsg = errJson?.message || errMsg;
      }
    } catch (_) {}
    const error = new Error(errMsg);
    error.status = response.status;
    throw error;
  }

  if (raw) return response;
  if (isJSONResponse(response)) {
    return await response.json();
  }
  // JSON이 아닌 경우는 텍스트로 반환
  return await response.text();
}
