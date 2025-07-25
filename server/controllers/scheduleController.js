// controllers/scheduleController.js
import ScheduleItem from '../models/ScheduleItem.js';
import User from '../models/User.js'; 
import mongoose from 'mongoose';

export const getAllScheduleItems = async (req, res) => {
    try {
        // Only admins should access this route, assumed handled by middleware
        const items = await ScheduleItem.find()
            .populate('assignedTo', 'name avatar') // Populate assigned users' names and avatars
            .populate('createdBy', 'name avatar')  // Populate creator's name and avatar
            .populate('blogPost', 'title');       // Populate linked blog post title

        res.json(items);
    } catch (error) {
        console.error('Error fetching schedule items:', error);
        res.status(500).json({ error: 'Failed to fetch schedule items' });
    }
};

export const getScheduleItemById = async (req, res) => {
    try {
        const item = await ScheduleItem.findById(req.params.id)
            .populate('assignedTo', 'name avatar')
            .populate('createdBy', 'name avatar')
            .populate('blogPost', 'title');

        if (!item) {
            return res.status(404).json({ error: 'Schedule item not found' });
        }
        res.json(item);
    } catch (error) {
        console.error('Error fetching schedule item by ID:', error);
        res.status(500).json({ error: 'Failed to fetch schedule item' });
    }
};

export const createScheduleItem = async (req, res) => {
    try {
        const { title, description, type, date, startTime, endTime, assignedTo, blogPost, status, location } = req.body;

        if (!title || !type || !date) {
            return res.status(400).json({ error: 'Title, type, and date are required.' });
        }

        const assignedToIds = Array.isArray(assignedTo) ? assignedTo.filter(id => mongoose.isValidObjectId(id)) : [];
        const blogPostId = mongoose.isValidObjectId(blogPost) ? blogPost : null;

        const newItem = new ScheduleItem({
            title,
            description,
            type,
            date,
            startTime,
            endTime,
            assignedTo: assignedToIds,
            createdBy: req.user._id, 
            blogPost: blogPostId,
            status,
            location
        });

        await newItem.save();
        // Populate the fields for the response
        await newItem.populate('assignedTo', 'name avatar');
        await newItem.populate('createdBy', 'name avatar');
        await newItem.populate('blogPost', 'title');

        res.status(201).json(newItem);
    } catch (error) {
        console.error('Error creating schedule item:', error);
        res.status(500).json({ error: 'Failed to create schedule item' });
    }
};

// PUT /api/admin/schedule/:id - Update a schedule item
export const updateScheduleItem = async (req, res) => {
    try {
        const { title, description, type, date, startTime, endTime, assignedTo, blogPost, status, location } = req.body;
        const assignedToIds = Array.isArray(assignedTo) ? assignedTo.filter(id => mongoose.isValidObjectId(id)) : [];
        const blogPostId = mongoose.isValidObjectId(blogPost) ? blogPost : null;


        const updatedItem = await ScheduleItem.findByIdAndUpdate(
            req.params.id,
            { title, description, type, date, startTime, endTime, assignedTo: assignedToIds, blogPost: blogPostId, status, location },
            { new: true, runValidators: true } // Return the updated document and run schema validators
        )
            .populate('assignedTo', 'name avatar')
            .populate('createdBy', 'name avatar')
            .populate('blogPost', 'title');

        if (!updatedItem) {
            return res.status(404).json({ error: 'Schedule item not found' });
        }
        res.json(updatedItem);
    } catch (error) {
        console.error('Error updating schedule item:', error);
        res.status(500).json({ error: 'Failed to update schedule item' });
    }
};

// DELETE /api/admin/schedule/:id - Delete a schedule item
export const deleteScheduleItem = async (req, res) => {
    try {
        const deletedItem = await ScheduleItem.findByIdAndDelete(req.params.id);
        if (!deletedItem) {
            return res.status(404).json({ error: 'Schedule item not found' });
        }
        res.json({ message: 'Schedule item deleted successfully' });
    } catch (error) {
        console.error('Error deleting schedule item:', error);
        res.status(500).json({ error: 'Failed to delete schedule item' });
    }
};

// Optional: Get schedule items for a specific admin/user
export const getMyScheduleItems = async (req, res) => {
    try {
        const userId = req.user._id; // Get current user's ID
        const items = await ScheduleItem.find({ assignedTo: userId })
            .populate('assignedTo', 'name avatar')
            .populate('createdBy', 'name avatar')
            .populate('blogPost', 'title');
        res.json(items);
    } catch (error) {
        console.error('Error fetching my schedule items:', error);
        res.status(500).json({ error: 'Failed to fetch your schedule items' });
    }
};