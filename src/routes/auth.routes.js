import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';

const router = Router();

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

      const { email, password } = req.body;
      const user = await User.findOne({ email }).lean();
      if (!user) return res.status(400).json({ message: 'Wrong email or password' });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Wrong email or password' });

      const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
      res.json({ token, userId: user.id });
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
      if (candidates.flat().length) {
        return res.status(400).json({ message: 'Login or email is not available' });
      }
      if (password !== rPassword) return res.status(400).json({ message: 'Password mismatch' });

      const hashedPassword = await bcrypt.hash(password, 10);
      const user = new User({ login, email, password: hashedPassword });
      await user.save();
      res.status(201).json({ message: 'User created' });
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }
);

export default router;
