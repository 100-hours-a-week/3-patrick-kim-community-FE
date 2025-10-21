// express 불러오기
const express = require('express');
const path = require('path');

// express 인스턴스 생성
const app = express();
const { createProxyMiddleware } = require('http-proxy-middleware');

// 포트 정보
const port = process.env.PORT || 3000;

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// 백엔드 API 프록시 (브라우저 CORS 회피)
app.use('/backend', createProxyMiddleware({
	target: 'http://localhost:8080',
	changeOrigin: true,
	pathRewrite: { '^/backend': '' },
}));

// 첫 화면: 로그인 페이지로 리디렉션
app.get('/', (req, res) => {
	return res.redirect('/pages/index.html');
});

// 편의 라우트: 의미 있는 경로 제공 (파일 경로로 리디렉션)
app.get('/login', (req, res) => res.redirect('/pages/index.html'));
app.get('/signup', (req, res) => res.redirect('/pages/signup.html'));
app.get('/posts', (req, res) => res.redirect('/pages/post-list.html'));
app.get('/posts/detail', (req, res) => res.redirect('/pages/post-detail.html'));
app.get('/posts/create', (req, res) => res.redirect('/pages/post-new.html'));
app.get('/posts/edit', (req, res) => res.redirect('/pages/post-edit.html'));
app.get('/profile', (req, res) => res.redirect('/pages/profile-edit.html'));
app.get('/password', (req, res) => res.redirect('/pages/password-edit.html'));



// 페이지들은 /component/app.css를 직접 링크하도록 변경됨

// 서버 시작
app.listen(port, () => {
	console.log(`Server listening on http://localhost:${port}`);
});

