/**
 * 유효성 검증 미들웨어
 * 요청 데이터의 유효성을 검증하는 미들웨어 함수들
 */

import { Request, Response, NextFunction } from 'express';

/**
 * 인증 관련 데이터 유효성 검증
 * 이메일과 비밀번호 형식을 검증
 */
export const validateAuth = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;

  // 이메일 검증
  if (!email || typeof email !== 'string') {
    return res.status(400).json({
      success: false,
      message: '이메일이 필요합니다.'
    });
  }

  // 이메일 형식 검증
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      success: false,
      message: '올바른 이메일 형식을 입력해주세요.'
    });
  }

  // 비밀번호 검증
  if (!password || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: '비밀번호가 필요합니다.'
    });
  }

  // 회원가입의 경우 추가 검증
  if (req.path === '/register') {
    // 이름 검증
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        success: false,
        message: '이름은 2자 이상이어야 합니다.'
      });
    }

    // 비밀번호 길이 검증
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: '비밀번호는 6자 이상이어야 합니다.'
      });
    }
  }

  next();
};

/**
 * 작업 데이터 유효성 검증
 */
export const validateTask = (req: Request, res: Response, next: NextFunction) => {
  const { title, description } = req.body;

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return res.status(400).json({
      success: false,
      message: '작업 제목이 필요합니다.'
    });
  }

  if (description && typeof description !== 'string') {
    return res.status(400).json({
      success: false,
      message: '작업 설명은 문자열이어야 합니다.'
    });
  }

  next();
};

/**
 * ID 파라미터 유효성 검증
 */
export const validateId = (req: Request, res: Response, next: NextFunction) => {
  const { id } = req.params;

  if (!id || typeof id !== 'string') {
    return res.status(400).json({
      success: false,
      message: '유효한 ID가 필요합니다.'
    });
  }

  next();
};