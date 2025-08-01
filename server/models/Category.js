import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true,
    },
    color: {
        type: String,
        default: 'bg-gray-500',
    },
    createdAt: {
        type: Date,
        default: Date.now,
    }
});
export default mongoose.model('Category', categorySchema);
