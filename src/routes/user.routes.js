import { Router } from 'express';
import { check, validationResult } from 'express-validator';
import auth from '../middleware/auth.middleware.js';
import User from '../models/user.js';

const router = Router();

router.get('/', auth, (req, res) => {
  res.status(200).json({
    name: req.user.login,
    img: req.user.img,
  });
});

router.put(
  '/',
  [check('name', 'Name length should be 3-20 symbols').trim().isLength({ min: 3, max: 20 })],
  auth,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.errors[0].msg });
    }

    try {
      const user = await User.findByIdAndUpdate(
        req.user._id,
        { login: req.body.name },
        { new: true }
      );

      res.status(200).json({
        name: user.login,
        img: user.img,
      });
    } catch (e) {
      return res.status(500).json({ message: 'Server Error' });
    }
  }
);

export default router;
