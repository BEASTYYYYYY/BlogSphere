// controllers/notificationController.js
import mongoose from 'mongoose';
import Notification from '../models/Notification.js';
import User from '../models/User.js'; // Assuming User model is needed elsewhere in controller
import Blog from '../models/Blog.js';   // Assuming Blog model is needed elsewhere in controller
import UserSettings from '../models/UserSettings.js'; // Ensure UserSettings is correctly imported

const { isValidObjectId, Types } = mongoose;

// Core helper: Create a notification
export const createNotification = async ({ recipient, sender, type, blog }) => {
    // FIX 1: Removed the global self-notification check from here.
    // This check was preventing ANY notification if sender and recipient were the same,
    // or if sender was undefined, blocking legitimate notifications.
    // Self-notification prevention will now be explicitly handled in specific 'inject' functions.
    if (!recipient || !type) {
        console.warn('Notification creation failed: Missing recipient or type.');
        return;
    }

    // Validate ObjectIds
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
        isRead: false // Ensure new notifications are explicitly set as unread by default
    });

    try {
        await newNotification.save();
        // console.log(`Notification saved to DB: Type=${type}, Recipient=${recipient}, Sender=${sender}, Blog=${blog}`); // For debugging
    } catch (error) {
        console.error("Error saving new notification to DB:", error);
    }
};

// Inject: for blog comment
export const injectCommentNotification = async (recipientId, senderId, blogId) => {
    // FIX: Explicitly prevent self-notification for comments here.
    if (recipientId.toString() === senderId.toString()) {
        // console.log('Prevented self-comment notification (sender == recipient).');
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
    // FIX: Explicitly prevent self-notification for likes here.
    if (recipientId.toString() === senderId.toString()) {
        // console.log('Prevented self-like notification (sender == recipient).');
        return;
    }
    try {
        const settings = await UserSettings.findOne({ user: recipientId });
        // FIX: Check for explicit 'false' to respect user's setting, otherwise allow by default
        if (settings && settings.showFollowerActivity === false) {
            // console.log(`Prevented like notification due to recipient settings: ${recipientId}`);
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
    // FIX: Explicitly prevent self-notification for follows here.
    if (recipientId.toString() === senderId.toString()) {
        // console.log('Prevented self-follow notification (sender == recipient).');
        return;
    }
    try {
        const settings = await UserSettings.findOne({ user: recipientId });
        // FIX: Check for explicit 'false' to respect user's setting, otherwise allow by default
        if (settings && settings.showFollowerActivity === false) {
            // console.log(`Prevented follow notification due to recipient settings: ${recipientId}`);
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

// FIX 3: Mark notification as read (UPDATE isRead to true, DO NOT DELETE)
export const markAsRead = async (req, res) => {
    try {
        const notification = await Notification.findOneAndUpdate(
            { _id: req.params.id, recipient: req.user._id }, // Ensure user owns the notification
            { isRead: true }, // Set isRead to true
            { new: true } // Return the updated document
        );

        if (!notification) {
            return res.status(404).json({ error: 'Notification not found or not authorized' });
        }

        // We only send success: true for the frontend to optimistically remove it.
        // The frontend doesn't necessarily need the full updated notification object here.
        res.json({ success: true, notificationId: notification._id });
    } catch (err) {
        console.error('markAsRead error:', err);
        res.status(500).json({ error: 'Failed to mark notification as read' });
    }
};

// FIX 4: Mark all notifications as read (UPDATE isRead to true, DO NOT DELETE)
export const markAllAsRead = async (req, res) => {
    try {
        // Find all notifications for the recipient and set isRead to true
        await Notification.updateMany(
            { recipient: req.user._id, isRead: false }, // Only update unread ones
            { isRead: true }
        );
        res.json({ success: true });
    } catch (err) {
        console.error('markAllAsRead error:', err);
        res.status(500).json({ error: 'Failed to mark all notifications as read' });
    }
};