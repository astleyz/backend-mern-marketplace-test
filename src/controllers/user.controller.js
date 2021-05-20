import { validationResult } from 'express-validator';

import User from '../models/user.js';

export default class UserController {
  static getUserData(req, res) {
    res.status(200).json({
      name: req.user.login,
      img: req.user.img,
    });
  }

  static async putUsername(req, res) {
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
}
