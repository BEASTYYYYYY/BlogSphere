// routes/notificationRoutes.js
import express from 'express';
import { getNotifications, markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications } from '../controllers/notificationController.js'; // Import new functions
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/notifications
router.get('/', verifyFirebaseToken, getNotifications);
router.put('/:id/read', verifyFirebaseToken, markAsRead); // Existing
router.put('/mark-all-read', verifyFirebaseToken, markAllAsRead); // Existing

// NEW: Delete a specific notification
router.delete('/:id', verifyFirebaseToken, deleteNotification);
// NEW: Delete all notifications for a user
router.delete('/', verifyFirebaseToken, deleteAllNotifications);

export default router;