import { Router } from 'express';
import { check } from 'express-validator';
import auth from '../middleware/auth.middleware';
import upload from '../middleware/upload.middleware';
import UserController from '../controllers/user.controller';

const router: Router = Router();

// /user
router.get('/', auth, UserController.getUserData);

// /user
router.put(
  '/',
  [
    check('name', 'Name length should be 3-20 symbols')
      .isLength({ min: 3, max: 20 })
      .custom(value => !/\s/.test(value))
      .withMessage("Login shouldn't contain spaces"),
  ],
  auth,
  UserController.putUsername
);

// /user/avatar
router.patch('/avatar', auth, upload.single('avatar'), UserController.changeAvatar);

export default router;
