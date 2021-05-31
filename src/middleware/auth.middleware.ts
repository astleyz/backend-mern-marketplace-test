import jwt from 'jsonwebtoken';
import type { Request, Response, NextFunction } from 'express';
import type { TokenPayload } from '../interfaces';
import User from '../models/user';

export default async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<Response<any> | void> => {
  if (req.method === 'OPTIONS') return next();
  if (!req.headers.authorization) return res.status(401).json({ message: 'Not authorized' });

  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = <TokenPayload>jwt.verify(token, process.env.JWT_ACCESS_SECRET!);
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);
    req.user = user!;
    return next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError || e instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    return res.status(500).json({ message: 'Server Error' });
  }
};
