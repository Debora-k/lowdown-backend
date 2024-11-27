import express from 'express';
import {
  loginWithEmail,
  loginWithGoogle,
  requestPasswordReset,
  resetPassword,
} from '../controllers/authController.js';

const router = express.Router();

router.post('/login', loginWithEmail);
router.post('/google', loginWithGoogle);
router.post('/forgotPassword', requestPasswordReset);
router.post('/resetPassword', resetPassword);

export default router;
