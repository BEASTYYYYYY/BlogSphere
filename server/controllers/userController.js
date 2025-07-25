import User from '../models/User.js';
import Blog from '../models/Blog.js'; 
import { canViewPrivateProfile } from '../utils/privacyUtils.js';
import UserSettings from '../models/UserSettings.js';
import { injectFollowNotification } from './notificationController.js';

export const getCurrentUser = async (req, res) => {
    try {
        res.json(req.user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const updateProfile = async (req, res) => {
    try {
        const { name, bio, avatar, profilePicture, coverImage } = req.body;

        req.user.name = name ?? req.user.name;
        req.user.bio = bio ?? req.user.bio;
        req.user.avatar = avatar ?? req.user.avatar;
        req.user.profilePicture = profilePicture ?? req.user.profilePicture;
        req.user.coverImage = coverImage ?? req.user.coverImage;

        await req.user.save();

        res.json(req.user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update profile' });
    }
};

export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password');
        res.json(users);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

export const getUserById = async (req, res) => {
    try {
        const targetUserId = req.params.id;
        const viewerId = req.user?._id;

        const canView = await canViewPrivateProfile(targetUserId, viewerId);
        if (!canView) {
            return res.status(403).json({ error: 'This account is private.' });
        }

        const user = await User.findById(targetUserId).select('-password');
        if (!user) return res.status(404).json({ error: 'User not found' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

export const deleteUser = async (req, res) => {
    try {
        const userId = req.params.id;
        await Blog.deleteMany({ authorId: userId });
        await Notification.deleteMany({
            $or: [{ sender: userId }, { recipient: userId }]
        });
        await User.updateMany({}, {
            $pull: {
                followers: userId,
                following: userId
            }
        });
        await User.findByIdAndDelete(userId);

        res.json({ success: true, message: "User and all associated data deleted." });
    } catch (error) {
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Failed to delete user" });
    }
};

export const followUser = async (req, res) => {
    try {
        const { userIdToFollow } = req.params;
        const currentUserId = req.user._id;

        if (userIdToFollow === currentUserId.toString()) {
            return res.status(400).json({ error: 'Cannot follow yourself' });
        }

        const userToFollow = await User.findById(userIdToFollow);
        const currentUser = await User.findById(currentUserId);

        if (!userToFollow || !currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        if (!userToFollow.followers.includes(currentUserId)) {
            userToFollow.followers.push(currentUserId);
            currentUser.following.push(userIdToFollow);

            await userToFollow.save();
            await currentUser.save();

            // 🔥 Add this line to send notification
            await injectFollowNotification(userIdToFollow, currentUserId);
        }

        res.json({ success: true });
    } catch (err) {
        console.error('Error in followUser:', err);
        res.status(500).json({ error: 'Failed to follow user' });
    }
};
export const unfollowUser = async (req, res) => {
    try {
        const { id: targetUserId } = req.params;
        const userId = req.user._id;

        const targetUser = await User.findById(targetUserId);
        const currentUser = await User.findById(userId);

        if (!targetUser || !currentUser) {
            return res.status(404).json({ error: 'User not found' });
        }

        currentUser.following = currentUser.following.filter(id => id.toString() !== targetUserId);
        await currentUser.save();

        targetUser.followers = targetUser.followers.filter(id => id.toString() !== userId);
        await targetUser.save();

        res.json({ success: true });
    } catch (err) {
        console.error('unfollowUser error:', err);
        res.status(500).json({ error: 'Failed to unfollow user' });
    }
};
  
export const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const posts = await Blog.countDocuments({ authorId: userId });
        const followers = user.followers ? user.followers.length : 0;
        const following = user.following ? user.following.length : 0;

        res.json({ posts, followers, following });
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch user stats' });
    }
};

export const getUserStatsById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ error: 'User not found' });

        const posts = await Blog.countDocuments({ authorId: userId, status: { $ne: 'draft' } });
        const followers = user.followers?.length || 0;
        const following = user.following?.length || 0;

        res.json({ posts, followers, following });
    } catch (err) {
        console.error("getUserStatsById error:", err);
        res.status(500).json({ error: 'Failed to get user stats' });
    }
  };

export const logoutUser = async (req, res) => {
    try {
        const user = await User.findByIdAndUpdate(req.user._id, { active: false }, { new: true });
        if (!user) return res.status(404).json({ error: 'User not found' });

        res.json({ success: true, message: 'User logged out and marked inactive.' });
    } catch (err) {
        console.error('Logout error:', err.message);
        res.status(500).json({ error: 'Failed to logout user' });
    }
};

export const getFollowingAndFollowers = async (req, res) => {
    try {
        const user = await User.findById(req.user._id)
            .populate('followers', 'name avatar')
            .populate('following', 'name avatar');

        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        res.json({
            followers: user.followers || [],
            following: user.following || []
        });
    } catch (error) {
        console.error('Error in getFollowingAndFollowers:', error);
        res.status(500).json({ error: 'Failed to fetch following and followers' });
    }
};

export const getSuggestedUsers = async (req, res) => {
    try {
        console.log('\n--- getSuggestedUsers function triggered ---');
        console.log('req.user:', req.user);

        if (!req.user || !req.user.uid) {
            console.error('getSuggestedUsers Error: Missing req.user or UID');
            return res.status(401).json({ error: 'Authentication required or UID missing.' });
        }

        // Fetch user by UID instead of _id
        const currentUser = await User.findOne({ uid: req.user.uid }).select('following');
        if (!currentUser) {
            console.warn(`getSuggestedUsers: No user found in DB with UID: ${req.user.uid}`);
            return res.status(404).json({ error: 'User profile not found in database.' });
        }

        const followingIds = currentUser.following.map(id => id.toString());
        followingIds.push(currentUser._id.toString()); // Exclude self

        const suggestedUsers = await User.find({ _id: { $nin: followingIds } })
            .select('name avatar bio followers')
            .limit(10);

        res.json(suggestedUsers);
    } catch (error) {
        console.error('getSuggestedUsers Fatal Error:', error);
        res.status(500).json({ error: 'Failed to fetch suggested users.' });
    }
};
export const getUserSettings = async (req, res) => {
    try {
        const userId = req.params.id;
        // Ensure user is authorized to view settings (e.g., only their own, or admin)
        // For blog owner settings, this might be simpler: any authenticated user can check *another* user's public settings
        const settings = await UserSettings.findOne({ user: userId });

        if (!settings) {
            // If no explicit settings, return defaults (or empty object)
            return res.json({ allowLikes: true, allowComments: true, isPrivate: false });
        }
        res.json(settings);
    } catch (error) {
        console.error('Error fetching user settings:', error);
        res.status(500).json({ message: 'Server error fetching settings' });
    }
};

// New: Update User Settings (for the authenticated user themselves)
export const updateUserSettings = async (req, res) => {
    try {
        const userId = req.user._id; // Get ID from authenticated user
        const { allowLikes, allowComments, isPrivate } = req.body;

        const updatedSettings = await UserSettings.findOneAndUpdate(
            { user: userId },
            { $set: { allowLikes, allowComments, isPrivate } },
            { upsert: true, new: true, setDefaultsOnInsert: true } // Create if not exists, return new doc
        );
        res.json(updatedSettings);
    } catch (error) {
        console.error('Error updating user settings:', error);
        res.status(500).json({ message: 'Server error updating settings' });
    }
};