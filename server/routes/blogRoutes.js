import express from 'express';
import { createBlog, getAllBlogs, getBlogById, updateBlog, deleteBlog, likeBlog, unlikeBlog, viewBlog, addComment, getUserBlogs, bookmarkBlog, unbookmarkBlog, getLikedBlogsForUser, getBookmarkedBlogsForUser, getTrendingByLikes, getTrendingByBookmarks, getTrendingTags, getFollowedBlogs, getBlogsByCategory, getBlogsByTag, getMostLikedBlogByTag } from '../controllers/blogController.js';
import { verifyFirebaseToken } from '../middleware/authMiddleware.js';
import multer from 'multer';
import { uploadImage } from '../controllers/blogController.js';

const upload = multer({ dest: 'uploads/' });

const router = express.Router();
router.get('/my-likes', verifyFirebaseToken, getLikedBlogsForUser);
router.get('/my-bookmarks', verifyFirebaseToken, getBookmarkedBlogsForUser);
router.get('/followed', verifyFirebaseToken, getFollowedBlogs);
router.get('/trending/likes', getTrendingByLikes);
router.get('/trending/bookmarks', getTrendingByBookmarks);
router.get('/trending/tags', getTrendingTags);
router.get('/user/:userId', verifyFirebaseToken, getUserBlogs);
router.get('/', getAllBlogs);
router.get('/tag/:name', getBlogsByTag);
router.get('/tag/:name/most-liked', getMostLikedBlogByTag);
router.get('/:id', getBlogById);
router.post('/', verifyFirebaseToken, createBlog);
router.put('/:id', verifyFirebaseToken, updateBlog);
router.delete('/:id', verifyFirebaseToken, deleteBlog); 
router.post('/:id/like', verifyFirebaseToken, likeBlog);
router.post('/:id/unlike', verifyFirebaseToken, unlikeBlog);
router.post('/:id/comment', verifyFirebaseToken, addComment);
router.post('/:id/view', verifyFirebaseToken, viewBlog);
router.post('/:id/bookmark', verifyFirebaseToken, bookmarkBlog);
router.post('/:id/bookmark/unbookmark', verifyFirebaseToken, unbookmarkBlog);
router.get('/category/:name', verifyFirebaseToken, getBlogsByCategory);
router.post('/upload-image', verifyFirebaseToken, upload.single('image'), uploadImage);



export default router;
