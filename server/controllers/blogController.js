import Blog from '../models/Blog.js';
import User from '../models/User.js';
import Category from '../models/Category.js';
import {
    injectCommentNotification,
    injectLikeNotification
} from './notificationController.js';
import cloudinary from '../config/cloudinary.js';
import checkBlogOwnerSetting from '../utils/checkBlogOwnerSetting.js';


function isGibberish(text) {
    const patterns = [
        /[asdfghjkl]{5,}/i,
        /[qwertyuiop]{5,}/i,
        /(.)\1{4,}/,
        /^[a-z]{10,}$/i,
        /[zxcvbnm]{5,}/i
    ];
    return patterns.some(p => p.test(text));
}

export const createBlog = async (req, res) => {
    try {
        const { title, content, category, tags, status, previewImage, imageGallery } = req.body;
        if (!title || !content || !category) {
            return res.status(400).json({ error: 'Title, content, and category are required' });
        }
        if (isGibberish(title) || isGibberish(content)) {
            return res.status(400).json({ error: 'Blog appears to be gibberish or spammy' });
        }
        const validCategory = await Category.findOne({ name: new RegExp(`^${category}$`, 'i') });
        if (!validCategory) {
            return res.status(400).json({ error: 'Invalid or unapproved category' });
        }

        const blog = new Blog({
            authorId: req.user._id,
            title: title.trim(),
            content: content.trim(),
            category: validCategory.name,
            tags: tags || [],
            status: status || 'published',
            previewImage: previewImage || "",
            imageGallery: Array.isArray(imageGallery) ? imageGallery : [],
        });
        await blog.save();
        res.status(201).json({ message: 'Blog created successfully' });
    } catch (error) {
        console.error('createBlog error:', error);
        res.status(500).json({ error: 'Failed to create blog' });
    }
};

export const getAllBlogs = async (req, res) => {
    try {
        const { search } = req.query;
        let query = { status: 'published' };
        if (search) {
            const regex = new RegExp(search, 'i');
            query.$or = [
                { title: { $regex: regex } },
                { content: { $regex: regex } },
                { tags: { $in: [regex] } },
                { category: { $regex: regex } }
            ];
        }
        const blogs = await Blog.find(query)
            .populate('authorId', 'name avatar')
            .populate('comments.userId', 'name avatar');
        res.json(blogs);
    } catch (err) {
        console.error('Error in getAllBlogs:', err.message);
        res.status(500).json({ error: 'Server error while searching blogs' });
    }
};
export const getUserBlogs = async (req, res) => {
    try {
        const blogs = await Blog.find({ authorId: req.params.userId })
            .populate('authorId', 'name avatar')
            .populate('comments.userId', 'name avatar');
        res.json(blogs);
    } catch (error) {
        console.error('Error in getUserBlogs:', error);
        res.status(500).json({ error: 'Failed to fetch user blogs' });
    }
};

export const getBlogById = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id)
            .populate('authorId', 'name avatar bio email')
            .populate('comments.userId', 'name avatar');

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json(blog);
    } catch (error) {
        console.error('Error in getBlogById:', error);
        res.status(500).json({ error: 'Failed to fetch blog' });
    }
};


export const updateBlog = async (req, res) => {
    try {
        const { title, content, category, tags, status, excerpt, image } = req.body;
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to update this blog' });
        }

        blog.title = title || blog.title;
        blog.content = content || blog.content;
        blog.category = category || blog.category;
        blog.tags = tags || blog.tags;
        blog.status = status || blog.status;
        blog.excerpt = excerpt || blog.excerpt;
        blog.image = image || blog.image;

        await blog.save();
        res.json(blog);
    } catch (error) {
        console.error('Error in updateBlog:', error);
        res.status(500).json({ error: 'Failed to update blog' });
    }
};

export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);

        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (blog.authorId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ error: 'Not authorized to delete this blog' });
        }

        await Blog.deleteOne({ _id: req.params.id });
        res.json({ message: 'Blog deleted successfully' });
    } catch (error) {
        console.error('Error in deleteBlog:', error);
        res.status(500).json({ error: 'Failed to delete blog' });
    }
};

export const likeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        const allowed = await checkBlogOwnerSetting(blog.authorId, 'allowLikes');
        if (!allowed) return res.status(403).json({ error: 'Likes are disabled by the author' });

        if (!blog.likes.includes(req.user._id)) {
            blog.likes.push(req.user._id);
            await blog.save();
            await injectLikeNotification(blog.authorId, req.user._id, blog._id); 
        }

        res.json({
            likes: blog.likes.length,
            likesArr: blog.likes,
            userLiked: true
        });
    } catch (error) {
        console.error('Error in likeBlog:', error);
        res.status(500).json({ error: 'Failed to like blog' });
    }
};


export const unlikeBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (!blog.likes) blog.likes = [];

        blog.likes = blog.likes.filter(id =>
            id.toString() !== req.user._id.toString()
        );

        await blog.save();

        res.json({
            likes: blog.likes.length,
            likesArr: blog.likes,
            userLiked: false
        });
    } catch (error) {
        console.error('Error in unlikeBlog:', error);
        res.status(500).json({ error: 'Failed to unlike blog' });
    }
};
export const addComment = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) return res.status(404).json({ error: 'Blog not found' });

        const allowed = await checkBlogOwnerSetting(blog.authorId, 'allowComments');
        if (!allowed) return res.status(403).json({ error: 'Comments are disabled by the author' });

        blog.comments.push({
            userId: req.user._id,
            text: req.body.text.trim(),
            createdAt: new Date()
        });

        await blog.save();
        await blog.populate('comments.userId', 'name avatar');
        const newComment = blog.comments[blog.comments.length - 1];

        await injectCommentNotification(blog.authorId, req.user._id, blog._id); // Injecting notification here

        res.status(201).json(newComment);
    } catch (error) {
        console.error('Error in addComment:', error);
        res.status(500).json({ error: 'Failed to add comment' });
    }
};

export const viewBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (!blog.viewers) blog.viewers = [];

        if (req.user && blog.authorId.toString() !== req.user._id.toString()) {
            if (!blog.viewers.includes(req.user._id)) {
                blog.viewers.push(req.user._id);
                blog.views = (blog.views || 0) + 1;
                await blog.save();
            }
        }

        res.json({ views: blog.views, viewers: blog.viewers.length });
    } catch (error) {
        console.error('Error in viewBlog:', error);
        res.status(500).json({ error: 'Failed to update view count' });
    }
};

export const bookmarkBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (!blog.bookmarks) blog.bookmarks = [];

        const userAlreadyBookmarked = blog.bookmarks.some(id =>
            id.toString() === req.user._id.toString()
        );

        if (!userAlreadyBookmarked) {
            blog.bookmarks.push(req.user._id);
            await blog.save();
        }

        res.json({
            bookmarked: true,
            bookmarksCount: blog.bookmarks.length
        });
    } catch (error) {
        console.error('Error in bookmarkBlog:', error);
        res.status(500).json({ error: 'Failed to bookmark blog' });
    }
};

export const unbookmarkBlog = async (req, res) => {
    try {
        const blog = await Blog.findById(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }

        if (!blog.bookmarks) blog.bookmarks = [];

        blog.bookmarks = blog.bookmarks.filter(id =>
            id.toString() !== req.user._id.toString()
        );

        await blog.save();

        res.json({
            bookmarked: false,
            bookmarksCount: blog.bookmarks.length
        });
    } catch (error) {
        console.error('Error in unbookmarkBlog:', error);
        res.status(500).json({ error: 'Failed to unbookmark blog' });
    }
};

export const getLikedBlogsForUser = async (req, res) => {
    try {
        const blogs = await Blog.find({ authorId: req.user._id })
            .populate('authorId', 'name avatar')
            .populate('likes', 'name avatar')
            .populate('comments.userId', 'name avatar');

        const likedBlogs = blogs.filter(blog => blog.likes && blog.likes.length > 0);
        likedBlogs.sort((a, b) => b.likes.length - a.likes.length);

        res.json(likedBlogs);
    } catch (error) {
        console.error('Error in getLikedBlogsForUser:', error);
        res.status(500).json({ error: 'Failed to fetch user\'s liked blogs' });
    }
};

export const getBookmarkedBlogsForUser = async (req, res) => {
    try {
        const blogs = await Blog.find({ bookmarks: req.user._id })
            .populate('authorId', 'name avatar')
            .populate('likes', 'name avatar')
            .populate('comments.userId', 'name avatar');

        res.json(blogs);
    } catch (error) {
        console.error('Error in getBookmarkedBlogsForUser:', error);
        res.status(500).json({ error: 'Failed to fetch bookmarked blogs' });
    }
};

export const getTrendingByLikes = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' })
            .populate('authorId', 'name avatar')
            .sort({ likes: -1 });
        res.json(blogs);
    } catch (error) {
        console.error('Error in getTrendingByLikes:', error);
        res.status(500).json({ error: 'Failed to fetch trending posts by likes' });
    }
};

export const getTrendingByBookmarks = async (req, res) => {
    try {
        const blogs = await Blog.find({ status: 'published' })
            .populate('authorId', 'name avatar')
            .sort({ bookmarks: -1 });
        res.json(blogs);
    } catch (error) {
        console.error('Error in getTrendingByBookmarks:', error);
        res.status(500).json({ error: 'Failed to fetch trending posts by bookmarks' });
    }
};

export const getTrendingTags = async (req, res) => {
    try {
        const tags = await Blog.aggregate([
            { $match: { status: 'published' } },
            { $unwind: '$tags' },
            { $group: { _id: '$tags', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ]);
        res.json(tags);
    } catch (error) {
        console.error('Error in getTrendingTags:', error);
        res.status(500).json({ error: 'Failed to fetch trending tags' });
    }
};


export const getFollowedBlogs = async (req, res) => {
    try {
        let currentUser = await User.findById(req.user._id).select('following');
        if (!currentUser && req.user.uid) {
            currentUser = await User.findOne({ uid: req.user.uid }).select('following');
        }

        if (!currentUser) {
            return res.status(404).json({ error: 'User not found in database.' });
        }

        const followedIds = currentUser.following.map(id => id.toString());
        const excludeIds = [...followedIds, req.user._id.toString()];

        const followedBlogs = await Blog.find({ authorId: { $in: followedIds }, status: 'published' })
            .populate('authorId', 'name avatar')
            .populate('comments.userId', 'name avatar')
            .sort({ createdAt: -1 });

        const LIMIT = 10;
        let extraBlogs = [];
        if (followedBlogs.length < LIMIT) {
            const extraLimit = LIMIT - followedBlogs.length;

            extraBlogs = await Blog.find({
                authorId: { $nin: excludeIds },
                status: 'published'
            })
                .populate('authorId', 'name avatar')
                .populate('comments.userId', 'name avatar')
                .sort({ createdAt: -1 })
                .limit(extraLimit);
        }

        const fullFeed = [...followedBlogs, ...extraBlogs];
        res.json(fullFeed);

    } catch (error) {
        console.error('getFollowedBlogs Error:', error);
        res.status(500).json({ error: 'Failed to fetch blogs from followed users' });
    }
};

export const getBlogsByCategory = async (req, res) => {
    try {
        const categorySlug = req.params.name;
        const category = await Category.findOne({ slug: categorySlug });
        if (!category) {
            return res.status(404).json({ error: 'Category not found' });
        }
        const blogs = await Blog.find({ category: category.name, status: 'published' })
            .sort({ createdAt: -1 })
            .populate('authorId', 'name avatar')
            .populate('comments.userId', 'name avatar');
        res.json(blogs);
    } catch (error) {
        console.error('getBlogsByCategory error:', error);
        res.status(500).json({ error: 'Failed to fetch blogs by category' });
    }
};

export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany({ recipient: req.user._id, isRead: false }, { isRead: true });
        res.json({ success: true });
    } catch (err) {
        console.error('markAllAsRead error:', err);
        res.status(500).json({ error: 'Failed to mark all as read' });
    }
};

export const uploadImage = async (req, res) => {
    try {
        const file = req.file;

        if (!file) return res.status(400).json({ error: 'No image file uploaded' });

        const result = await cloudinary.uploader.upload(file.path, {
            folder: 'blogs',
            resource_type: 'image'
        });

        res.status(200).json({
            url: result.secure_url,
            public_id: result.public_id
        });
    } catch (error) {
        console.error('Cloudinary Upload Error:', error);
        res.status(500).json({ error: 'Image upload failed' });
    }
};

export const getBlogsByTag = async (req, res) => {
    try {
        const tag = req.params.name;
        const blogs = await Blog.find({ tags: tag, status: 'published' })
            .sort({ createdAt: -1 })
            .populate('authorId', 'name avatar')
            .populate('comments.userId', 'name avatar');
        res.json(blogs);
    } catch (error) {
        console.error('getBlogsByTag error:', error);
        res.status(500).json({ error: 'Failed to fetch blogs by tag' });
    }
};

export const getMostLikedBlogByTag = async (req, res) => {
    try {
        const tag = req.params.name;
        const blog = await Blog.findOne({ tags: tag, status: 'published' })
            .sort({ likes: -1 })
            .populate('authorId', 'name avatar')
            .populate('comments.userId', 'name avatar');
        if (!blog) return res.status(404).json({ error: 'No blog found for this tag' });
        res.json(blog);
    } catch (error) {
        console.error('getMostLikedBlogByTag error:', error);
        res.status(500).json({ error: 'Failed to fetch top blog for tag' });
    }
};

