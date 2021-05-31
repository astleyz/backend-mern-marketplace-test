import { Router } from 'express';
import { check } from 'express-validator';
import AuthController from '../controllers/auth.controller';

const router: Router = Router();

// /auth/login
router.post(
  '/login',
  [
    check('email', 'Email is not correct').normalizeEmail().isEmail(),
    check('password', "Password shouldn't be empty").trim().not().isEmpty(),
  ],
  AuthController.login
);

// /auth/register
router.post(
  '/register',
  [
    check('login', 'Login length should be 3-20 symbols')
      .isLength({ min: 3, max: 20 })
      .custom(value => !/\s/.test(value))
      .withMessage("Login shouldn't contain spaces"),
    check('email', 'Email is not correct').normalizeEmail().isEmail(),
    check('password', 'Password minimum length is 5').isLength({ min: 5 }),
    check('repeatPassword', 'Password mismatch').exists(),
  ],
  AuthController.register
);

// /auth/refresh-tokens
router.post('/refresh-tokens', AuthController.refresh);

// /auth/logout
router.post('/logout', AuthController.logout);

export default router;
