import Category from '../models/Category.js';
import SuggestedCategory from '../models/SuggestedCategory.js';
import Blog from '../models/Blog.js';

// 🔹 Fetch ALL categories (with post count per category)
export const getAllCategories = async (req, res) => {
    try {
        const categories = await Category.find().sort({ popularity: -1 });
        const top5 = categories.slice(0, 5);
        const others = categories.slice(5);
        const counts = await Promise.all(
            top5.map(cat => Blog.countDocuments({ category: cat.name }))
        );
        const enrichedTop5 = top5.map((cat, index) => ({
            ...cat.toObject(),
            count: counts[index]
        }));
        const finalList = [...enrichedTop5, ...others.map(cat => cat.toObject())];
        res.json(finalList);
    } catch (err) {
        console.error('Category fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch categories' });
    }
};
export const suggestCategory = async (req, res) => {
    const { name } = req.body;

    if (!name || name.trim().length < 3) {
        return res.status(400).json({ error: 'Category name must be at least 3 characters' });
    }

    const cleanName = name.trim();
    try {
        const exists = await SuggestedCategory.findOne({ name: new RegExp(`^${cleanName}$`, 'i') });
        if (exists) {
            return res.status(409).json({ message: 'Category already suggested' });
        }

        const suggested = new SuggestedCategory({
            name: cleanName,
            submittedBy: req.user._id,
        });

        await suggested.save();
        res.status(201).json({ message: 'Category suggestion submitted for review' });
    } catch (err) {
        console.error('Suggestion error:', err);
        res.status(500).json({ error: 'Failed to submit suggestion' });
    }
};

// 🔹 Get TOP 5 Popular Categories (based on blog usage)
export const getPopularCategories = async (req, res) => {
    try {
        const popular = await Blog.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        const enriched = await Promise.all(
            popular.map(async (item) => {
                const cat = await Category.findOne({ name: item._id });
                return cat ? { ...cat.toObject(), count: item.count } : null;
            })
        );

        res.json(enriched.filter(Boolean));
    } catch (err) {
        console.error('Popular category fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch popular categories' });
    }
};

export const getBlogsByCategorySlug = async (req, res) => {
    try {
        const { slug } = req.params;
        const name = slug
            .split('-')
            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
            .join(' ');

        // FIX: Changed comma-separated fields to space-separated fields in populate
        const blogs = await Blog.find({ category: new RegExp(`^${name}$`, 'i') })
            .populate('authorId', 'name avatar profilePicture'); // Corrected line

        if (!blogs || blogs.length === 0) {
            return res.status(404).json({ error: 'No blogs found in this category' });
        }

        res.json(blogs);
    } catch (err) {
        console.error('Error fetching blogs by category slug:', err);
        res.status(500).json({ error: 'Server error' });
    }
};