// src/routes/authRoutes.ts
import { Router } from 'express';
import { 
  register, 
  login, 
  verifyCode,
  forgotPassword,      
  resetPassword        
} from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/verify-code', verifyCode);
router.post('/forgot-password', forgotPassword);     
router.post('/reset-password', resetPassword);       

export default router;