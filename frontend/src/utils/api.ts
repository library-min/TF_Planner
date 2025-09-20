/**
 * API 통신을 위한 유틸리티 함수들
 * 백엔드 서버와의 HTTP 통신을 담당
 */

// 백엔드 서버 URL
const API_BASE_URL = 'http://localhost:3001/api';

/**
 * 헬스 체크 API 호출
 */
export const checkHealth = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Health check failed:', error);
    throw error;
  }
};

/**
 * 로그인 API 호출
 */
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Login failed:', error);
    throw error;
  }
};

/**
 * 작업 목록 조회 API 호출
 */
export const getTasks = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/tasks`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Get tasks failed:', error);
    throw error;
  }
};