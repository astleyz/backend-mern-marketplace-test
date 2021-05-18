import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth.middleware.js';
import User from '../models/user.js';

const router = Router();

router.get('/', auth, (req, res) => {
  res.status(200).json({
    name: req.user.login,
    img:
      'https://thumbs.dreamstime.com/b/cute-smiling-girl-avatar-logo-flat-vector-illustration-logo-character-design-cute-smiling-girl-avatar-logo-flat-vector-122640507.jpg',
  });
});

export default router;
