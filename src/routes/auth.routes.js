import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import auth from '../middleware/auth.middleware.js';
import User from '../models/user.js';
import Token from '../models/token.js';
import config from '../config.js';
import {
  generateAccessToken,
  generateRefreshToken,
  saveToDBRefreshToken,
} from '../helpers/authHelper.js';

const router = Router();

const updateTokens = async (userId, extendRefreshTokenMaxAge) => {
  const accessToken = generateAccessToken(userId);
  const refreshToken = generateRefreshToken(userId, extendRefreshTokenMaxAge);
  await saveToDBRefreshToken(refreshToken, userId);
  return { accessToken, refreshToken };
};

// /auth/login
router.post(
  '/login',
  [
    check('email', 'Email is not correct').normalizeEmail().isEmail(),
    check('password', "Password shouldn't be empty").trim().not().isEmpty(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Not correct data during the authorization',
        });
      }

      const { email, password, rememberme } = req.body;
      const candidate = await User.findOne({ email }).lean();
      if (!candidate) return res.status(400).json({ message: 'Wrong email or password' });
      const isMatch = await bcrypt.compare(password, candidate.password);
      if (!isMatch) return res.status(400).json({ message: 'Wrong email or password' });

      const tokens = await updateTokens(candidate._id, rememberme);
      const cookieOptions = {
        ...config.refreshCookie,
        maxAge: rememberme ? config.refreshCookie.extendedMaxAge : config.refreshCookie.maxAge,
      };
      res.cookie('refresh.token', tokens.refreshToken, cookieOptions);
      res.json({ token: `Bearer ${tokens.accessToken}` });
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

// /auth/register
router.post(
  '/register',
  [
    check('login', 'Login minimum length is 3').trim().isLength({ min: 3 }),
    check('email', 'Email is not correct').normalizeEmail().isEmail(),
    check('password', 'Password minimum length is 5').isLength({ min: 5 }),
    check('repeatPassword', 'Password mismatch').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          errors: errors.array(),
          message: 'Not correct data during the registration',
        });
      }

      const { login, email, password, repeatPassword: rPassword } = req.body;
      const candidates = await User.find({ $or: [{ login }, { email }] }).lean();
      if (candidates.length) {
        return res.status(400).json({ message: 'Login or email is not available' });
      }
      if (password !== rPassword) return res.status(400).json({ message: 'Password mismatch' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ login, email, password: hashedPassword });
      res.user = user;
      await user.save();
      const tokens = await updateTokens(user._id);

      res.cookie('refresh.token', tokens.refreshToken, config.refreshCookie);
      res.status(201).json({ token: `Bearer ${tokens.accessToken}` });
    } catch (e) {
      User.findByIdAndRemove(res.user._id).catch(err => console.log(err.message));
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

// /auth/refresh-tokens
router.post('/refresh-tokens', async (req, res) => {
  const refreshToken = req.cookies['refresh.token'];
  try {
    const oldDBToken = await Token.findOneAndRemove({ token: refreshToken }).lean();
    res.clearCookie('refresh.token', { ...config.refreshCookie, maxAge: 0 });
    if (!oldDBToken) return res.status(401).json();

    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    if (decoded.type !== 'refresh') {
      return res.status(401).json({ message: 'Invalid token' });
    }

    const tokens = await updateTokens(oldDBToken.userId);
    res.cookie('refresh.token', tokens.refreshToken, config.refreshCookie);
    res.json({ token: `Bearer ${tokens.accessToken}` });
  } catch (e) {
    if (e instanceof jwt.TokenExpiredError) {
      return res.status(401).json({ message: 'Token expired' });
    }
    if (e instanceof jwt.JsonWebTokenError) {
      return res.status(401).json({ message: 'Invalid token' });
    }
    res.status(500).json({ message: 'Server Error' });
  }
});

// /auth/logout
router.post('/logout', auth, async (req, res) => {
  const refreshToken = req.cookies['refresh.token'];
  try {
    await Token.deleteOne({ token: refreshToken });
    res.clearCookie('refresh.token', { ...config.refreshCookie, maxAge: 0 });
    res.redirect('/');
  } catch (e) {
    res.status(500).json({ message: 'Server Error' });
  }
});

export default router;
