/**
 * 사용자 모델 정의
 * 사용자 데이터의 타입과 인터페이스를 정의
 */

export interface User {
  id: string;                    // 사용자 고유 ID
  name: string;                  // 사용자 이름
  email: string;                 // 이메일 주소 (로그인 ID)
  password: string;              // 해시된 비밀번호
  role: 'admin' | 'user';        // 사용자 권한 (관리자/일반사용자)
  avatar?: string;               // 프로필 이미지 URL (선택사항)
  department?: string;           // 부서 (선택사항)
  position?: string;             // 직책 (선택사항)
  phone?: string;                // 전화번호 (선택사항)
  isActive?: boolean;            // 활성 상태 (기본값: true)
  lastLoginAt?: Date;            // 마지막 로그인 시간
  createdAt: Date;               // 계정 생성 시간
  updatedAt: Date;               // 마지막 수정 시간
}

/**
 * 로그인 요청 데이터 타입
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * 회원가입 요청 데이터 타입
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  department?: string;
  position?: string;
}

/**
 * 사용자 정보 응답 타입 (비밀번호 제외)
 */
export interface UserResponse extends Omit<User, 'password'> {}

/**
 * JWT 토큰 페이로드 타입
 */
export interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  iat?: number;    // 토큰 발급 시간
  exp?: number;    // 토큰 만료 시간
}