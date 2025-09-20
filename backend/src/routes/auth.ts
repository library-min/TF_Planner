/**
 * 인증 관련 API 라우트
 * 로그인, 회원가입, 토큰 검증 등의 인증 기능을 처리
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { authController } from '../controllers/authController';
import { validateAuth } from '../middleware/validation';

const router = express.Router();

/**
 * POST /api/auth/register
 * 회원가입 API
 * 
 * @body {string} name - 사용자 이름
 * @body {string} email - 이메일 주소
 * @body {string} password - 비밀번호
 * @returns {object} 생성된 사용자 정보 (비밀번호 제외)
 */
router.post('/register', validateAuth, authController.register);

/**
 * POST /api/auth/login
 * 로그인 API
 * 
 * @body {string} email - 이메일 주소
 * @body {string} password - 비밀번호
 * @returns {object} JWT 토큰과 사용자 정보
 */
router.post('/login', validateAuth, authController.login);

/**
 * POST /api/auth/logout
 * 로그아웃 API (토큰 무효화)
 * 
 * @header {string} Authorization - Bearer 토큰
 * @returns {object} 로그아웃 성공 메시지
 */
router.post('/logout', authController.logout);

/**
 * GET /api/auth/verify
 * 토큰 검증 API
 * 
 * @header {string} Authorization - Bearer 토큰
 * @returns {object} 사용자 정보
 */
router.get('/verify', authController.verifyToken);

/**
 * POST /api/auth/refresh
 * 토큰 갱신 API
 * 
 * @body {string} refreshToken - 리프레시 토큰
 * @returns {object} 새로운 액세스 토큰
 */
router.post('/refresh', authController.refreshToken);

export default router;