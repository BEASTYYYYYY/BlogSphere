// controllers/notificationController.js
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import UserSettings from '../models/UserSettings.js';

const { isValidObjectId, Types } = mongoose;

// Core helper: Create a notification
export const createNotification = async ({ recipient, sender, type, blog }) => {
    if (!recipient || !type) {
        console.warn('Notification creation failed: Missing recipient or type.');
        return;
    }

    if (!isValidObjectId(recipient)) {
        console.warn('Invalid recipient ID for notification:', recipient);
        return;
    }
    if (sender && !isValidObjectId(sender)) {
        console.warn('Invalid sender ID for notification:', sender);
        return;
    }
    if (blog && !isValidObjectId(blog)) {
        console.warn('Invalid blog ID for notification:', blog);
        return;
    }

    const newNotification = new Notification({
        recipient: new Types.ObjectId(recipient),
        sender: sender ? new Types.ObjectId(sender) : undefined,
        type,
        blog: blog ? new Types.ObjectId(blog) : undefined,
        isRead: false
    });

    try {
        await newNotification.save();
    } catch (error) {
        console.error("Error saving new notification to DB:", error);
    }
};

// Inject: for blog comment
export const injectCommentNotification = async (recipientId, senderId, blogId) => {
    if (recipientId.toString() === senderId.toString()) {
        return;
    }
    await createNotification({
        recipient: recipientId,
        sender: senderId,
        type: 'comment',
        blog: blogId
    });
};

// Inject: for blog like
export const injectLikeNotification = async (recipientId, senderId, blogId) => {
    if (recipientId.toString() === senderId.toString()) {
        return;
    }
    try {
        const settings = await UserSettings.findOne({ user: recipientId });
        if (settings && settings.showFollowerActivity === false) {
            return;
        }

        await createNotification({
            recipient: recipientId,
            sender: senderId,
            type: 'like',
            blog: blogId
        });
    } catch (error) {
        console.error('Error in injectLikeNotification:', error);
    }
};

// Inject: for follow
export const injectFollowNotification = async (recipientId, senderId) => {
    if (recipientId.toString() === senderId.toString()) {
        return;
    }
    try {
        const settings = await UserSettings.findOne({ user: recipientId });
        if (settings && settings.showFollowerActivity === false) {
            return;
        }

        await createNotification({
            recipient: recipientId,
            sender: senderId,
            type: 'follow'
        });
    } catch (error) {
        console.error('Error in injectFollowNotification:', error);
    }
};

export const getNotifications = async (req, res) => {
    try {
        const notifications = await Notification.find({ recipient: req.user._id })
            .sort({ createdAt: -1 })
            .limit(20)
            .populate('sender', 'name avatar')
            .populate('blog', 'title');

        res.json(notifications);
    } catch (err) {
        console.error('getNotifications error:', err);
        res.status(500).json({ error: 'Failed to fetch notifications' });
    }
};

// Existing markAsRead (updates isRead status) - No change requested for this function
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id },
            { isRead: true },
            { new: true }
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found or not authorized' });
        }
        res.json({ success: true, notificationId: notification._id });
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

// Existing markAllAsRead (updates isRead status) - No change requested for this function
export const markAllAsRead = async (req, res) => {
    try {
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false },
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('markAllAsRead error:', err);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};

// NEW: Delete a specific notification
export const deleteNotification = async (req, res) => {
    try {
        const result = await Notification.deleteOne({
            _id: req.params.id,
            recipient: req.user._id // Ensure the user owns the notification
        });

        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Notification not found or not authorized' });
        }
        res.json({ success: true, message: 'Notification deleted successfully' });
    } catch (err) {
        console.error('deleteNotification error:', err);
        res.status(500).json({ error: 'Failed to delete notification' });
    }
};

// NEW: Delete all notifications for the current user
export const deleteAllNotifications = async (req, res) => {
    try {
        await Notification.deleteMany({ recipient: req.user._id });
        res.json({ success: true, message: 'All notifications deleted successfully' });
    } catch (err) {
        console.error('deleteAllNotifications error:', err);
        res.status(500).json({ error: 'Failed to delete all notifications' });
    }
};