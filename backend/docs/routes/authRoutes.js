"use strict";
/**
 * 인증 관련 라우트
 * 로그인, 회원가입, 토큰 검증 등의 인증 API 엔드포인트를 정의
 */
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const authController_1 = require("../controllers/authController");
const router = (0, express_1.Router)();
// 회원가입 라우트
router.post('/register', authController_1.authController.register);
// 로그인 라우트
router.post('/login', authController_1.authController.login);
// 로그아웃 라우트
router.post('/logout', authController_1.authController.logout);
// 토큰 검증 라우트
router.get('/verify', authController_1.authController.verifyToken);
// 토큰 갱신 라우트
router.post('/refresh', authController_1.authController.refreshToken);
exports.default = router;
//# sourceMappingURL=authRoutes.js.map