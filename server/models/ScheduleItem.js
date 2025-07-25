// models/ScheduleItem.js
import mongoose from 'mongoose';

const scheduleItemSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    },
    type: { // e.g., 'meeting', 'assignment', 'deadline', 'event'
        type: String,
        enum: ['meeting', 'assignment', 'deadline', 'event'],
        required: true
    },
    date: { // The date of the event
        type: Date,
        required: true
    },
    startTime: { // Time of day for the event (optional)
        type: String, // e.g., "10:00", "14:30"
        match: /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])$/
    },
    endTime: { // End time of day for the event (optional)
        type: String,
        match: /^(?:2[0-3]|[01]?[0-9]):(?:[0-5]?[0-9])$/
    },
    assignedTo: [{ // Array of user IDs assigned to this task/meeting (for multi-admin collaboration)
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdBy: { // Admin who created the schedule item
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    blogPost: { // Optional: Link to a specific blog post if it's an assignment/deadline
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Blog'
    },
    status: { // e.g., 'pending', 'completed', 'in-progress', 'cancelled'
        type: String,
        enum: ['pending', 'completed', 'in-progress', 'cancelled'],
        default: 'pending'
    },
    location: { // Optional: for meetings
        type: String,
        trim: true
    }
}, { timestamps: true });

export default mongoose.model('ScheduleItem', scheduleItemSchema);