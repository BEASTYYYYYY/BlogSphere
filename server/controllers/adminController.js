// adminController.js
import User from '../models/User.js';
import Blog from '../models/Blog.js';
import Setting from '../models/Setting.js';
import Notification from '../models/Notification.js'; // Import Notification model
import UserSettings from '../models/UserSettings.js'; // Import UserSettings model
import transporter from '../config/emailTransporter.js';

// GET /api/admin/users
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};
export const getSingleUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.json(user);
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid user ID format' });
        }
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};
export const getAdminStats = async (req, res) => {
    try {
        const users = await User.find();
        const blogs = await Blog.find();
        res.json({
            users: {
                total: users.length,
                active: users.filter(u => u.status === 'active').length,
                blocked: users.filter(u => u.status === 'blocked').length,
                admins: users.filter(u => u.role === 'admin' || u.role === 'superadmin').length
            },
            blogs: {
                total: blogs.length,
                published: blogs.filter(b => b.status === 'published').length,
                drafts: blogs.filter(b => b.status === 'draft').length
            }
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch stats' });
    }
};

// PUT /api/admin/user/:id/status
export const updateUserStatus = async (req, res) => {
    try {
        const { status } = req.body;
        if (!['active', 'blocked'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user status' });
    }
};

export const changeUserRole = async (req, res) => {
    try {
        const { role } = req.body;
        if (!['user', 'admin', 'superadmin'].includes(role)) {
            return res.status(400).json({ error: 'Invalid role' });
        }
        const user = await User.findByIdAndUpdate(
            req.params.id,
            { role },
            { new: true }
        );
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update user role' });
    }
};

// DELETE /api/admin/user/:id
export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        // Find the user to ensure it exists before proceeding
        const userToDelete = await User.findById(userId);
        if (!userToDelete) {
            return res.status(404).json({ error: 'User not found' });
        }

        // 1. Delete all blogs created by the user
        await Blog.deleteMany({ authorId: userId });

        // 2. Remove user's comments and likes from all other blogs
        await Blog.updateMany(
            {}, // Affect all blog documents
            {
                $pull: {
                    comments: { userId: userId }, // Remove comments by this user
                    likes: userId, // Remove likes by this user
                    viewers: userId, // Remove user from viewers array
                    bookmarks: userId // Remove user from bookmarks array
                }
            }
        );

        // 3. Delete notifications where the user is sender or recipient
        await Notification.deleteMany({
            $or: [{ sender: userId }, { recipient: userId }]
        });

        // 4. Remove user from followers and following lists of all other users
        await User.updateMany({}, {
            $pull: {
                followers: userId,
                following: userId
            }
        });

        // 5. Delete the user's settings document
        await UserSettings.deleteOne({ user: userId });

        // 6. Finally, delete the user document itself
        await User.findByIdAndDelete(userId);

        res.json({ success: true, message: "User and all associated data deleted." });
    } catch (err) {
        console.error('Error deleting user:', err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};

// DELETE /api/admin/blogs/:id
export const deleteBlog = async (req, res) => {
    try {
        const blog = await Blog.findByIdAndDelete(req.params.id);
        if (!blog) {
            return res.status(404).json({ error: 'Blog not found' });
        }
        res.json({ message: 'Blog deleted successfully' });
    } catch (err) {
        if (err.name === 'CastError') {
            return res.status(400).json({ error: 'Invalid blog ID format' });
        }
        res.status(500).json({ error: 'Failed to delete blog' });
    }
};

// GET /api/admin/uploads
export const getAllUploads = async (req, res) => {
    try {
        const uploads = await Blog.find().populate('authorId', 'name email');
        res.json(uploads);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch uploads' });
    }
};

export const emailBroadcast = async (req, res) => {
    try {
        const { subject, message, recipientType } = req.body;

        if (!subject || !message || !recipientType) {
            return res.status(400).json({ error: 'Subject, message, and recipient type are required.' });
        }

        let recipients = [];
        let userEmails = [];
        if (recipientType === 'all') {
            recipients = await User.find().select('email');
        } else if (recipientType === 'users') {
            recipients = await User.find({ role: 'user' }).select('email');
        } else if (recipientType === 'admins') {
            recipients = await User.find({ role: { $in: ['admin', 'superadmin'] } }).select('email');
        } else {
            return res.status(400).json({ error: 'Invalid recipient type.' });
        }

        userEmails = recipients.map(user => user.email).filter(email => email);

        if (userEmails.length === 0) {
            return res.status(404).json({ message: 'No recipients found for the selected type.' });
        }
        const mailOptions = {
            from: process.env.EMAIL_USER,
            bcc: userEmails.join(', '),
            subject: subject,
            html: `
                <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
                    <p>${message.replace(/\n/g, '<br>')}</p>
                    <br>
                    <p>Best regards,</p>
                    <p>The BlogSphere Admin Team</p>
                    <p style="font-size: 0.8em; color: #777;">This is an automated email, please do not reply.</p>
                </div>
            `
        };
        await transporter.sendMail(mailOptions);

        res.json({ success: true, message: `Broadcast email sent to ${userEmails.length} recipients.` });
    } catch (err) {
        console.error('Error sending broadcast email:', err);
        res.status(500).json({ error: 'Failed to send broadcast email.' });
    }
};

export const getSettings = async (req, res) => {
    try {
        const siteTitleSetting = await Setting.getSetting('siteTitle');
        const maintenanceModeSetting = await Setting.getSetting('maintenanceMode');

        res.json({
            siteTitle: siteTitleSetting,
            maintenanceMode: maintenanceModeSetting || false
        });
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
};

// New: PUT /api/admin/settings
export const updateSettings = async (req, res) => {
    try {
        const { siteTitle, maintenanceMode } = req.body;

        if (siteTitle !== undefined) {
            await Setting.setSetting('siteTitle', siteTitle);
        }
        if (maintenanceMode !== undefined) {
            await Setting.setSetting('maintenanceMode', maintenanceMode);
        }

        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        console.error('Error updating settings:', err);
        res.status(500).json({ error: 'Failed to update settings' });
    }
};
