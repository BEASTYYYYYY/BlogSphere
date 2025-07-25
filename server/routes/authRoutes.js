import express from 'express';
import { loginWithToken } from '../controllers/authController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/login', verifyFirebaseToken, loginWithToken);

export default router;
