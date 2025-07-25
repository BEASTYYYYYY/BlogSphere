// routes/settingsRoutes.js
import express from 'express';
import { getSettings, updateSettings, deleteAccount } from '../controllers/settingsController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyFirebaseToken, getSettings);
router.put('/', verifyFirebaseToken, updateSettings);
router.delete('/', verifyFirebaseToken, deleteAccount);

export default router;
