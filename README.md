# TF-Planner

프로젝트 관리를 위한 웹 애플리케이션

## 📁 프로젝트 구조

```
tf-planner/
├── frontend/         # 🟨 프론트엔드 (React + TypeScript + Vite)
├── backend/          # 🟦 백엔드 (Node.js + Express + TypeScript)
└── docs/            # 📚 문서
```

## 🚀 실행 방법

### 백엔드 실행
```bash
cd backend
npm install
npm run dev
```
- 서버: http://localhost:3001

### 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```
- 애플리케이션: http://localhost:5173 (또는 자동 할당된 포트)

## 🔗 API 엔드포인트

### 인증
- `POST /api/auth/login` - 로그인
- `POST /api/auth/register` - 회원가입
- `GET /api/auth/verify` - 토큰 검증

### 작업 관리
- `GET /api/tasks` - 작업 목록 조회
- `POST /api/tasks` - 작업 생성
- `PUT /api/tasks/:id` - 작업 수정
- `DELETE /api/tasks/:id` - 작업 삭제

### 기타
- `GET /api/health` - 서버 상태 확인

## 🛠 기술 스택

### 프론트엔드
- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router DOM

### 백엔드
- Node.js
- Express.js
- TypeScript
- Socket.IO (실시간 채팅)
- Winston (로깅)

## 📋 주요 기능

- ✅ 사용자 인증 (로그인/회원가입)
- ✅ 대시보드 (프로젝트 현황)
- ✅ 작업 관리 (CRUD)
- ✅ 실시간 채팅
- ✅ 회의 관리
- ✅ 일정 관리
- ✅ 팀 멤버 관리
- ✅ 다크/라이트 모드

## 👥 데모 계정

- **관리자**: admin@tf-planner.com / admin
- **사용자**: user@tf-planner.com / user