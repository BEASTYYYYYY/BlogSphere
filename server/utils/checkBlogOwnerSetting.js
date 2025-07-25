// utils/checkBlogOwnerSetting.js
import UserSettings from '../models/UserSettings.js';

const checkBlogOwnerSetting = async (userId, settingKey) => {
    const settings = await UserSettings.findOne({ user: userId });
    return settings?.[settingKey] !== false;
};

export default checkBlogOwnerSetting;
