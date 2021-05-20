import { validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Token from '../models/token.js';
import config from '../config.js';
import { updateTokens } from '../helpers/authHelper.js';

export default class AuthController {
  static async login(req, res) {
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
        ...config.jwt.refreshCookie,
        maxAge: rememberme
          ? config.jwt.refreshCookie.extendedMaxAge
          : config.jwt.refreshCookie.maxAge,
      };
      res.cookie('refresh.token', tokens.refreshToken, cookieOptions);
      res.json({ token: `Bearer ${tokens.accessToken}` });
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }

  static async register(req, res) {
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

      res.cookie('refresh.token', tokens.refreshToken, config.jwt.refreshCookie);
      res.status(201).json({ token: `Bearer ${tokens.accessToken}` });
    } catch (e) {
      User.findByIdAndRemove(res.user._id).catch(err => console.log(err));
      res.status(500).json({ message: 'Server Error' });
    }
  }

  static async refresh(req, res) {
    const refreshToken = req.cookies['refresh.token'];
    try {
      const oldDBToken = await Token.findOneAndRemove({ token: refreshToken }).lean();
      res.clearCookie('refresh.token', { ...config.jwt.refreshCookie, maxAge: 0 });
      if (!oldDBToken) return res.status(401).json();

      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      if (decoded.type !== 'refresh') {
        return res.status(401).json({ message: 'Invalid token' });
      }

      const tokens = await updateTokens(oldDBToken.userId);
      res.cookie('refresh.token', tokens.refreshToken, config.jwt.refreshCookie);
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
  }

  static async logout(req, res) {
    const refreshToken = req.cookies['refresh.token'];
    if (!refreshToken) return res.status(401).send();

    try {
      await Token.deleteOne({ token: refreshToken });
      res.clearCookie('refresh.token', { ...config.jwt.refreshCookie, maxAge: 0 });
      res.send();
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }
}
