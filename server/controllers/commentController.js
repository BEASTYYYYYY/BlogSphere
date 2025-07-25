import Blog from '../models/Blog.js';
import { injectCommentNotification } from './notificationController.js';
export const addComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        blog.comments.push({
            userId: req.user._id,
            text: req.body.text
        });
        await blog.save();
        await injectCommentNotification(blog.authorId, req.user._id, blog._id);

        const populatedBlog = await Blog.findById(req.params.blogId)
            .populate('comments.userId', 'name avatar')
            .populate('comments.replies.userId', 'name avatar');
        console.log("✅ Comment notification created for blog:", blog._id);
        res.status(201).json(populatedBlog);
    } catch (error) {
        console.error('Error adding comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const deleteComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        blog.comments = blog.comments.filter(c => c._id.toString() !== req.params.commentId);
        await blog.save();
        res.json({ success: true });
    } catch (error) {
        console.error('Error deleting comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const addReply = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        console.log('Available comment IDs:', blog.comments.map(c => c._id.toString()));
        const comment = blog.comments.find(c => c._id.toString() === req.params.commentId);
        if (!comment) {
            console.log('Comment not found, available comment IDs:', blog.comments.map(c => c._id.toString()));
            return res.status(404).json({ error: 'Comment not found' });
        }
        console.log('Comment found:', comment._id.toString());
        if (!comment.replies) {
            comment.replies = [];
        }

        comment.replies.push({
            userId: req.user._id,
            text: req.body.text,
            createdAt: new Date()
        });
        await blog.save();
        const populatedBlog = await Blog.findById(req.params.blogId)
            .populate('comments.userId', 'name avatar')
            .populate('comments.replies.userId', 'name avatar');

        res.status(201).json(populatedBlog);
    } catch (error) {
        console.error('Error adding reply:', error);
        res.status(500).json({ error: 'Server error' });
    }
};
export const likeComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const comment = blog.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userId = req.user._id.toString();

        // Initialize likes and dislikes arrays if they don't exist
        if (!comment.likes) comment.likes = [];
        if (!comment.dislikes) comment.dislikes = [];

        // Remove from dislikes if present
        comment.dislikes = comment.dislikes.filter(id => id.toString() !== userId);

        // Toggle like
        if (comment.likes.some(id => id.toString() === userId)) {
            comment.likes.pull(userId);
        } else {
            comment.likes.push(userId);
        }

        await blog.save();

        // Populate the blog with user data before sending response
        const populatedBlog = await Blog.findById(req.params.blogId)
            .populate('comments.userId', 'name avatar')
            .populate('comments.replies.userId', 'name avatar');

        res.json(populatedBlog);
    } catch (error) {
        console.error('Error liking comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};

export const dislikeComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.blogId);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        const comment = blog.comments.id(req.params.commentId);
        if (!comment) {
            return res.status(404).json({ error: 'Comment not found' });
        }

        const userId = req.user._id.toString();

        // Initialize likes and dislikes arrays if they don't exist
        if (!comment.likes) comment.likes = [];
        if (!comment.dislikes) comment.dislikes = [];

        // Remove from likes if present
        comment.likes = comment.likes.filter(id => id.toString() !== userId);

        // Toggle dislike
        if (comment.dislikes.some(id => id.toString() === userId)) {
            comment.dislikes.pull(userId);
        } else {
            comment.dislikes.push(userId);
        }

        await blog.save();

        // Populate the blog with user data before sending response
        const populatedBlog = await Blog.findById(req.params.blogId)
            .populate('comments.userId', 'name avatar')
            .populate('comments.replies.userId', 'name avatar');

        res.json(populatedBlog);
    } catch (error) {
        console.error('Error disliking comment:', error);
        res.status(500).json({ error: 'Server error' });
    }
};