// utils/privacyUtils.js
import UserSettings from '../models/UserSettings.js';
import User from '../models/User.js';

export const canViewPrivateProfile = async (targetUserId, viewerUserId) => {
    const settings = await UserSettings.findOne({ user: targetUserId });

    if (!settings?.isPrivate) return true;
    if (!viewerUserId) return false;

    const viewer = await User.findById(viewerUserId);
    return viewer?.following?.includes(targetUserId);
};
