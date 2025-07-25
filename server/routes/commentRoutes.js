import express from 'express';
import {
    addComment,
    deleteComment,
    addReply,
    likeComment,
    dislikeComment
} from '../controllers/commentController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/:blogId', verifyFirebaseToken, addComment);
router.delete('/:blogId/:commentId', verifyFirebaseToken, deleteComment);
router.post('/:blogId/:commentId/reply', verifyFirebaseToken, addReply);
router.post('/:blogId/:commentId/like', verifyFirebaseToken, likeComment);
router.post('/:blogId/:commentId/dislike', verifyFirebaseToken, dislikeComment);

export default router;
