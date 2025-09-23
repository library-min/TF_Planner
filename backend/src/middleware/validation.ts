import { Request, Response, NextFunction } from 'express';

// Basic email validation regex
const isEmail = (email: string): boolean => {
  const re = /\S+@\S+\.\S+/;
  return re.test(String(email).toLowerCase());
};

export const validateAuth = (req: Request, res: Response, next: NextFunction) => {
  const { email, password, name } = req.body;
  const path = req.path;

  if (path === '/register') {
    if (!name || typeof name !== 'string' || name.trim() === '') {
      return res.status(400).json({ message: 'Name is required.' });
    }
    if (!email || !isEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }
    if (!password || typeof password !== 'string' || password.length < 6) {
      return res.status(400).json({ message: 'Password must be at least 6 characters long.' });
    }
  } else if (path === '/login') {
    if (!email || !isEmail(email)) {
      return res.status(400).json({ message: 'A valid email is required.' });
    }
    if (!password || typeof password !== 'string' || password.length === 0) {
      return res.status(400).json({ message: 'Password is required.' });
    }
  }

  next();
};
