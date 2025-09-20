/**
 * 사용자 모델 정의
 * 사용자 데이터의 타입과 인터페이스를 정의
 */
export interface User {
    id: string;
    name: string;
    email: string;
    password: string;
    role: 'admin' | 'user';
    avatar?: string;
    department?: string;
    position?: string;
    phone?: string;
    isActive?: boolean;
    lastLoginAt?: Date;
    createdAt: Date;
    updatedAt: Date;
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
export interface UserResponse extends Omit<User, 'password'> {
}
/**
 * JWT 토큰 페이로드 타입
 */
export interface TokenPayload {
    userId: string;
    email: string;
    role: string;
    iat?: number;
    exp?: number;
}
//# sourceMappingURL=User.d.ts.map