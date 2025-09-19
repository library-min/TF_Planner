/**
 * 채팅 관련 라우트
 * 채팅방 생성, 메시지 조회, 사용자 관리 등의 채팅 API 엔드포인트를 정의
 */

import { Router } from 'express';

const router = Router();

// 채팅방 목록 조회
router.get('/rooms', (req, res) => {
  res.json({
    success: true,
    message: '채팅방 목록 조회 성공',
    rooms: []
  });
});

// 채팅방 생성
router.post('/rooms', (req, res) => {
  res.json({
    success: true,
    message: '채팅방 생성 성공'
  });
});

// 특정 채팅방 메시지 조회
router.get('/rooms/:roomId/messages', (req, res) => {
  res.json({
    success: true,
    message: '메시지 조회 성공',
    messages: []
  });
});

export default router;