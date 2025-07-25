import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    uid: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    avatar: { type: String },
    profilePicture: String,
    coverImage: String,     
    bio: String,
    role: { type: String, enum: ['user', 'admin', 'superadmin'], default: 'user' },
    status: { type: String, enum: ['active', 'blocked'], default: 'active' },
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true });
 
export default mongoose.model("User", userSchema);
