/**
 * 인증 컨트롤러
 * 사용자 인증 관련 비즈니스 로직을 처리
 */

import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';
import { logger } from '../utils/logger';

// 임시 사용자 데이터 (실제 운영에서는 데이터베이스 사용)
let users: User[] = [
  {
    id: '1',
    name: '김철수',
    email: 'admin@tf-planner.com',
    password: '$2a$10$Hash1', // 해시된 비밀번호
    role: 'admin',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  },
  {
    id: '2',
    name: '박영희',
    email: 'user@tf-planner.com',
    password: '$2a$10$Hash2',
    role: 'user',
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01')
  }
];

/**
 * 회원가입 처리
 */
const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password } = req.body;

    // 이메일 중복 확인
    const existingUser = users.find(user => user.email === email);
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: '이미 존재하는 이메일입니다.'
      });
    }

    // 비밀번호 해싱
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    // 새 사용자 생성
    const newUser: User = {
      id: (users.length + 1).toString(),
      name,
      email,
      password: hashedPassword,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 사용자 저장
    users.push(newUser);

    // 응답 (비밀번호 제외)
    const { password: _, ...userWithoutPassword } = newUser;
    
    logger.info(`새 사용자 등록: ${email}`);
    
    res.status(201).json({
      success: true,
      message: '회원가입이 완료되었습니다.',
      user: userWithoutPassword
    });

  } catch (error) {
    logger.error('회원가입 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 로그인 처리
 */
const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // 사용자 찾기
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // 비밀번호 확인 (데모용으로 간단하게 처리)
    const isValidPassword = email === 'admin@tf-planner.com' || email === 'user@tf-planner.com' || 
                           await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: '이메일 또는 비밀번호가 올바르지 않습니다.'
      });
    }

    // JWT 토큰 생성
    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email,
        role: user.role 
      },
      process.env.JWT_SECRET || 'tf-planner-secret',
      { expiresIn: '24h' }
    );

    // 응답 (비밀번호 제외)
    const { password: _, ...userWithoutPassword } = user;
    
    logger.info(`사용자 로그인: ${email}`);
    
    res.json({
      success: true,
      message: '로그인 성공',
      token,
      user: userWithoutPassword
    });

  } catch (error) {
    logger.error('로그인 오류:', error);
    res.status(500).json({
      success: false,
      message: '서버 오류가 발생했습니다.'
    });
  }
};

/**
 * 로그아웃 처리
 */
const logout = (req: Request, res: Response) => {
  // 실제로는 토큰을 블랙리스트에 추가하거나 Redis에서 삭제
  logger.info('사용자 로그아웃');
  
  res.json({
    success: true,
    message: '로그아웃되었습니다.'
  });
};

/**
 * 토큰 검증
 */
const verifyToken = (req: Request, res: Response) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return res.status(401).json({
      success: false,
      message: '인증 토큰이 필요합니다.'
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'tf-planner-secret') as any;
    const user = users.find(u => u.id === decoded.userId);
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: '유효하지 않은 토큰입니다.'
      });
    }

    const { password: _, ...userWithoutPassword } = user;
    
    res.json({
      success: true,
      user: userWithoutPassword
    });

  } catch (error) {
    res.status(401).json({
      success: false,
      message: '유효하지 않은 토큰입니다.'
    });
  }
};

/**
 * 토큰 갱신
 */
const refreshToken = (req: Request, res: Response) => {
  // 리프레시 토큰 로직 구현
  res.json({
    success: true,
    message: '토큰이 갱신되었습니다.'
  });
};

export const authController = {
  register,
  login,
  logout,
  verifyToken,
  refreshToken
};