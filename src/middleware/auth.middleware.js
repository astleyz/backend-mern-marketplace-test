import jwt from 'jsonwebtoken';
import User from '../models/user.js';

export default async (req, res, next) => {
  if (req.method === 'OPTIONS') next();
  if (!req.headers.authorization) return res.status(401).json({ message: 'Not authorized' });

  try {
    const token = req.headers.authorization.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'Not authorized' });

    const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (decoded.type !== 'access') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const user = await User.findById(decoded.userId);
    req.user = user;
    next();
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError || e instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};
