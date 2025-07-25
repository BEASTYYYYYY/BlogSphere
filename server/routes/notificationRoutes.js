// routes/notificationRoutes.js
import express from 'express';
import { getNotifications, markAsRead, markAllAsRead } from '../controllers/notificationController.js';
import {verifyFirebaseToken} from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notifications
router.get('/', verifyFirebaseToken, getNotifications);
router.put('/:id/read', verifyFirebaseToken, markAsRead);
router.put('/mark-all-read', verifyFirebaseToken, markAllAsRead);

export default router;
 