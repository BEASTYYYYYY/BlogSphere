import express from 'express';
import { getAllCategories, suggestCategory, getPopularCategories } from '../controllers/categoryController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import { getBlogsByCategorySlug } from '../controllers/categoryController.js';

const router = express.Router();

router.get('/', getAllCategories);
router.post('/suggest', verifyFirebaseToken, suggestCategory);
router.get('/popular', getPopularCategories);
router.get('/slug/:slug', verifyFirebaseToken, getBlogsByCategorySlug);

export default router;
 