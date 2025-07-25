// routes/adminRoutes.js
import express from 'express';
import {
    getAdminStats,
    getAllUsers,
    getSingleUser,
    updateUserStatus,
    changeUserRole,
    deleteUser,
    getAllUploads,
    deleteBlog,
    emailBroadcast,
    getSettings,    // <--- New
    updateSettings  // <--- New
} from '../controllers/adminController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(verifyFirebaseToken); // Apply token verification to all admin routes

router.get('/users', getAllUsers);
router.get('/users/:id', getSingleUser);
router.get('/stats', getAdminStats);
router.put('/user/:id/status', updateUserStatus);
router.put('/user/:id/role', changeUserRole);
router.delete('/user/:id', deleteUser);
router.get('/uploads', getAllUploads);
router.delete('/blogs/:id', deleteBlog);
router.post('/email-broadcast', emailBroadcast);

// New Settings Routes
router.get('/settings', getSettings);      // <--- Route to fetch settings
router.put('/settings', updateSettings);   // <--- Route to update settings

export default router;