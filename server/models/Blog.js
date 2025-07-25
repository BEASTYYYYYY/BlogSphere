import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    text: { type: String, required: true },
    date: { type: Date, default: Date.now },
    replies: [replySchema],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

const blogSchema = new mongoose.Schema({
    authorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: String,
    content: String,
    category: String,
    tags: [String],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    viewers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    views: { type: Number, default: 0 },
    comments: [commentSchema],
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    previewImage: { type: String },
    imageGallery: [String],
    status: { type: String, enum: ["draft", "published"], default: "draft" }
}, { timestamps: true });

export default mongoose.model("Blog", blogSchema);
