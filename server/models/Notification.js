// models/Notification.js
import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
    recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    type: { type: String, enum: ['like', 'comment', 'follow'], required: true },
    blog: { type: mongoose.Schema.Types.ObjectId, ref: 'Blog' },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now } 
});

export default mongoose.model('Notification', notificationSchema);
