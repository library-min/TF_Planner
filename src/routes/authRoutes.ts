/**
 * 인증 관련 라우트
 * 로그인, 회원가입, 토큰 검증 등의 인증 API 엔드포인트를 정의
 */

import { Router } from 'express';
import { authController } from '../controllers/authController';

const router = Router();

// 회원가입 라우트
router.post('/register', authController.register);

// 로그인 라우트
router.post('/login', authController.login);

// 로그아웃 라우트
router.post('/logout', authController.logout);

// 토큰 검증 라우트
router.get('/verify', authController.verifyToken);

// 토큰 갱신 라우트
router.post('/refresh', authController.refreshToken);

export default router;