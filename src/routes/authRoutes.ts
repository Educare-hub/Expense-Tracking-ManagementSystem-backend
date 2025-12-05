// src/routes/authRoutes.ts
import { Router } from 'express';
import { 
  register, 
  login, 
  verifyCode,
  forgotPassword,      // ← ADD THIS
  resetPassword        // ← ADD THIS
} from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.post('/forgot-password', forgotPassword);     // ← NEW
router.post('/reset-password', resetPassword);       // ← NEW

export default router;