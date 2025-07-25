// models/UserSettings.js
import mongoose from 'mongoose';

const userSettingsSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    isPrivate: { type: Boolean, default: false },
    allowLikes: { type: Boolean, default: true },
    allowComments: { type: Boolean, default: true },
    showFollowerActivity: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.model('UserSettings', userSettingsSchema);
