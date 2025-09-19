/**
 * 간단한 테스트용 백엔드 서버
 * 프론트엔드와의 연결 테스트를 위한 기본 서버
 */

import express from 'express';
import cors from 'cors';

const app = express();
const PORT = 3001;

// 미들웨어 설정
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:5174"],
  credentials: true
}));
app.use(express.json());

// 테스트 라우트
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: '백엔드 서버가 정상적으로 작동 중입니다.',
    timestamp: new Date().toISOString()
  });
});

// 인증 테스트 라우트
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  if (email === 'admin@tf-planner.com' && password === 'admin') {
    res.json({
      success: true,
      message: '로그인 성공',
      user: {
        id: '1',
        name: '김철수',
        email: 'admin@tf-planner.com',
        role: '관리자'
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: '이메일 또는 비밀번호가 올바르지 않습니다.'
    });
  }
});

// 작업 목록 테스트 라우트
app.get('/api/tasks', (req, res) => {
  res.json({
    success: true,
    message: '작업 목록 조회 성공',
    tasks: [
      {
        id: '1',
        title: '백엔드 API 개발',
        description: 'REST API 엔드포인트 구현',
        status: 'in-progress',
        priority: 'high',
        assignee: '김철수',
        dueDate: '2024-02-15'
      }
    ]
  });
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`🚀 TF-Planner 백엔드 서버가 포트 ${PORT}에서 실행 중입니다.`);
  console.log(`📱 프론트엔드 URL: http://localhost:5173`);
});

export default app;