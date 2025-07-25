import express from 'express';
import {
    getCurrentUser,
    updateProfile,
    followUser,
    unfollowUser,
    getUserById,
    getAllUsers,
    getUserStats,
    logoutUser,
    getFollowingAndFollowers,
    getSuggestedUsers,
    getUserStatsById,
    deleteUser,
    getUserSettings, // <--- ADD THIS
    updateUserSettings
} from '../controllers/userController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/suggestions', verifyFirebaseToken, getSuggestedUsers); // Move this up

router.get('/me', verifyFirebaseToken, getCurrentUser);
router.put('/me', verifyFirebaseToken, updateProfile);
router.get('/me/stats', verifyFirebaseToken, getUserStats);
router.get('/me/social', verifyFirebaseToken, getFollowingAndFollowers);

router.get('/', verifyFirebaseToken, getAllUsers);
router.post('/follow/:id', verifyFirebaseToken, followUser);
router.post('/unfollow/:id', verifyFirebaseToken, unfollowUser);

router.post('/logout', verifyFirebaseToken, logoutUser);
router.get('/:id', verifyFirebaseToken, getUserById); 
router.get('/:id/stats', verifyFirebaseToken, getUserStatsById);
router.get('/:id/settings', verifyFirebaseToken, getUserSettings); 
router.put('/me/settings', verifyFirebaseToken, updateUserSettings);
router.delete('/:id', verifyFirebaseToken, deleteUser);


export default router;
 