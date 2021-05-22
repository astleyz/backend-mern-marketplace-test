import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { validationResult } from 'express-validator';
import User from '../models/user.js';

const exists = promisify(fs.exists);
const unlink = promisify(fs.unlink);

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

  static async changeAvatar(req, res) {
    try {
      const imgName = req.user.img.split('uploads/')[1];
      const isAvatarExist = await exists(path.resolve(path.join('uploads', String(imgName))));
      if (isAvatarExist) {
        await unlink(path.resolve(path.join('uploads', imgName)));
      }
      req.user.img = `${req.protocol}://${req.headers.host}/${req.file.path}`;
      await req.user.save();
      res.status(200).json();
    } catch (e) {
      res.status(500).json({ message: 'Server Error' });
    }
  }
}
