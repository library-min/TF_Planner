# TF-Planner: Real-Time Project Collaboration Tool

TF-Planner는 원활한 프로젝트 관리와 실시간 팀 협업을 위해 설계된 종합 웹 애플리케이션입니다. 직관적인 인터페이스와 강력한 기능으로 팀의 생산성을 극대화하세요.

## ✨ 주요 기능

-   **✅ 사용자 인증**: JWT 기반의 안전한 로그인/회원가입 및 세션 관리.
-   **✅ 대시보드**: 프로젝트 현황, 주요 작업, 최근 활동을 한눈에 파악할 수 있는 맞춤형 대시보드.
-   **✅ 작업 관리 (CRUD)**:
    -   직관적인 칸반 보드 스타일의 작업 관리.
    -   작업의 상태(대기, 진행 중, 완료), 우선순위, 담당자 지정.
    -   **인터랙티브 간트 차트**를 통한 시각적인 타임라인 관리 및 프로젝트 진행 상황 추적.
-   **✅ 실시간 채팅**:
    -   Socket.IO 기반의 1:1 및 그룹 채팅 기능.
    -   파일 공유(이미지, 문서 등) 및 다운로드.
    -   관리자 전체 공지 기능.
    -   사용자 접속 상태 및 '입력 중' 상태 표시.
-   **✅ 회의 및 일정 관리**: 팀 캘린더를 통한 회의 및 주요 일정 공유.
-   **✅ 팀 멤버 관리**: 역할 기반의 팀 멤버 초대 및 관리 기능.
-   **✅ 반응형 UI/UX**:
    -   어떤 디바이스에서도 최적화된 화면을 제공하는 반응형 디자인.
    -   사용자의 눈을 보호하고 집중력을 높이는 **다크/라이트 모드** 지원.

## 🛠 기술 스택

### 프론트엔드
-   **Core**: React 18, TypeScript, Vite
-   **Styling**: Tailwind CSS
-   **State Management**: React Context API
-   **Routing**: React Router DOM
-   **Icons**: Lucide React

### 백엔드
-   **Core**: Node.js, Express.js, TypeScript
-   **Real-Time**: Socket.IO
-   **Authentication**: JSON Web Tokens (JWT), bcryptjs
-   **Database**: (연동 예정)
-   **File Handling**: Multer
-   **Logging**: Winston

## 📁 프로젝트 구조

```
tf-planner/
├── frontend/         # 🟨 프론트엔드 (React + TypeScript + Vite)
├── backend/          # 🟦 백엔드 (Node.js + Express + TypeScript)
└── docs/             # 📚 문서 및 스크린샷
```

## 🚀 실행 방법

### 백엔드 실행
```bash
cd backend
npm install
npm run dev
```
-   **API 서버**: `http://localhost:3001`

### 프론트엔드 실행
```bash
cd frontend
npm install
npm run dev
```
-   **웹 애플리케이션**: `http://localhost:5173` (또는 실행 시 할당된 포트)

## 🔗 주요 API 엔드포인트

### 인증 (`/api/auth`)
-   `POST /register`: 회원가입
-   `POST /login`: 로그인
-   `POST /logout`: 로그아웃
-   `GET /verify`: 토큰 검증
-   `POST /refresh`: 토큰 갱신

### 작업 관리 (`/api/tasks`)
-   `GET /`: 작업 목록 조회
-   `POST /`: 작업 생성
-   `PUT /:id`: 작업 수정
-   `DELETE /:id`: 작업 삭제

### 기타
-   `GET /api/health`: 서버 상태 확인
-   `POST /api/chat/upload`: 채팅 파일 업로드

## 👥 데모 계정

-   **관리자**: `admin@tf-planner.com` / `admin`
-   **사용자**: `user@tf-planner.com` / `user`
