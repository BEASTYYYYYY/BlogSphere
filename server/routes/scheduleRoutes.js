// routes/scheduleRoutes.js
import express from 'express';
import {
    getAllScheduleItems,
    getScheduleItemById,
    createScheduleItem,
    updateScheduleItem,
    deleteScheduleItem,
    getMyScheduleItems
} from '../controllers/scheduleController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js'; 

const router = express.Router();
router.get('/', verifyFirebaseToken, getAllScheduleItems);
router.post('/', verifyFirebaseToken, createScheduleItem);
router.get('/me', verifyFirebaseToken, getMyScheduleItems); 
router.get('/:id', verifyFirebaseToken, getScheduleItemById);
router.put('/:id', verifyFirebaseToken, updateScheduleItem);
router.delete('/:id', verifyFirebaseToken, deleteScheduleItem);

export default router;