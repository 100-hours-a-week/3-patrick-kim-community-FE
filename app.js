// express 불러오기
const express = require('express');
const path = require('path');

// express 인스턴스 생성
const app = express();

// 포트 정보
const port = 3000;

// 정적 파일 서빙 (public 폴더)
app.use(express.static(path.join(__dirname, 'public')));

// 라우트 설정
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 서버 시작
app.listen(port, () => {
  console.log(`\n 서버가 시작되었습니다!`);

});

