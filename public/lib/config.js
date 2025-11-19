// 공통 환경 설정
// ALB 경로 기반 라우팅: /api/* -> Spring Boot, 나머지 -> Express
export const BASE_URL = window.location.hostname === 'localhost' 
  ? 'http://localhost:8080'  // 로컬 개발 환경
  : '/api';                   // 프로덕션: ALB가 /api/* 요청을 Spring Boot로 라우팅

// CORS 관련 fetch 기본 옵션
export const DEFAULT_FETCH_OPTIONS = {
  // credentials: 'include', 
};
