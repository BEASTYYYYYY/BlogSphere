// controllers/settingsController.js
import UserSettings from '../models/UserSettings.js';
import User from '../models/User.js';

export const getSettings = async (req, res) => {
    try {
        const settings = await UserSettings.findOne({ user: req.user._id });
        res.json(settings || {});
    } catch (err) {
        res.status(500).json({ error: 'Failed to load settings' });
    }
};

export const updateSettings = async (req, res) => {
    try {
        const { isPrivate, allowLikes, allowComments, showFollowerActivity } = req.body;
        const settings = await UserSettings.findOneAndUpdate(
            { user: req.user._id },
            { isPrivate, allowLikes, allowComments, showFollowerActivity },
            { upsert: true, new: true }
        );
        res.json({ success: true, settings });
    } catch (err) {
        res.status(500).json({ error: 'Failed to update settings' });
    }
};

export const deleteAccount = async (req, res) => {
    try {
        await UserSettings.deleteOne({ user: req.user._id });
        await User.deleteOne({ _id: req.user._id });
        res.json({ success: true });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete account' });
    }
};
