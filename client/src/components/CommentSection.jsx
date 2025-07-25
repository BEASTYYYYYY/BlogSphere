/* eslint-disable no-unused-vars */
// CommentSection.jsx
import React, { useEffect, useState } from 'react';
import { X, Send, MessageCircle, Heart, Reply, ChevronDown, ChevronUp, ThumbsUp, ThumbsDown } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export default function CommentSection({ blogId, isOpen, onClose, onCommentsUpdate }) {
    const { firebaseUser, mongoUser } = useAuth();
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [replyingTo, setReplyingTo] = useState(null);
    const [replyText, setReplyText] = useState('');
    const [expandedComments, setExpandedComments] = useState(new Set());
    const [submittingReply, setSubmittingReply] = useState(false);
    const [likingComment, setLikingComment] = useState(null);
    const { darkMode } = useTheme();

    useEffect(() => {
        if (isOpen && blogId) {
            fetchComments();
        }
    }, [blogId, isOpen, firebaseUser]); // Added firebaseUser to dependency array

    const fetchComments = async () => {
        setLoading(true);
        try {
            let config = {};
            if (firebaseUser) { // Check if user is logged in to get token
                const token = await firebaseUser.getIdToken();
                config.headers = { Authorization: `Bearer ${token}` };
            }

            const res = await axios.get(`${API_BASE_URL}/blogs/${blogId}`, config);
            const safeComments = Array.isArray(res.data.comments) ? res.data.comments : [];

            // Sort comments by creation date (newest first)
            const sortedComments = safeComments.sort((a, b) => {
                return new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date);
            });

            setComments(sortedComments);
            if (onCommentsUpdate) {
                onCommentsUpdate(sortedComments.length);
            }
        } catch (error) {
            console.error('Error fetching comments:', error);
            setComments([]);
            if (onCommentsUpdate) {
                onCommentsUpdate(0);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleAddComment = async (e) => {
        e.preventDefault();
        if (!firebaseUser || !commentText.trim() || submitting) return;

        setSubmitting(true);
        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.post(
                `${API_BASE_URL}/comments/${blogId}`,
                { text: commentText.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            await fetchComments();
            setCommentText('');
        } catch (error) {
            console.error('Error adding comment:', error);
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddReply = async (commentId) => {
        if (!firebaseUser || !replyText.trim() || submittingReply) return;

        setSubmittingReply(true);
        try {
            const token = await firebaseUser.getIdToken();
            await axios.post(
                `${API_BASE_URL}/comments/${blogId}/${commentId}/reply`,
                { text: replyText.trim() },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh comments to get the updated list with new reply
            await fetchComments();
            setReplyText('');
            setReplyingTo(null);
        } catch (error) {
            console.error('Error adding reply:', error);
        } finally {
            setSubmittingReply(false);
        }
    };

    const handleLikeComment = async (commentId) => {
        if (!firebaseUser || likingComment === commentId) return;

        setLikingComment(commentId);
        try {
            const token = await firebaseUser.getIdToken();
            await axios.post(
                `${API_BASE_URL}/comments/${blogId}/${commentId}/like`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh comments to get updated like status
            await fetchComments();
        } catch (error) {
            console.error('Error liking comment:', error);
        } finally {
            setLikingComment(null);
        }
    };

    const handleDislikeComment = async (commentId) => {
        if (!firebaseUser || likingComment === commentId) return;

        setLikingComment(commentId);
        try {
            const token = await firebaseUser.getIdToken();
            await axios.post(
                `${API_BASE_URL}/comments/${blogId}/${commentId}/dislike`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Refresh comments to get updated dislike status
            await fetchComments();
        } catch (error) {
            console.error('Error disliking comment:', error);
        } finally {
            setLikingComment(null);
        }
    };

    const handleReply = (commentId) => {
        setReplyingTo(commentId);
        setReplyText('');
    };

    const toggleCommentExpansion = (commentId) => {
        const newExpanded = new Set(expandedComments);
        if (newExpanded.has(commentId)) {
            newExpanded.delete(commentId);
        } else {
            newExpanded.add(commentId);
        }
        setExpandedComments(newExpanded);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays}d`;
        if (diffDays <= 30) return `${Math.ceil(diffDays / 7)}w`;

        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            ...(date.getFullYear() !== now.getFullYear() && { year: 'numeric' })
        });
    };

    const truncateText = (text, maxLength = 150) => {
        if (text.length <= maxLength) return text;
        return text.substring(0, maxLength) + '...';
    };

    const isUserLiked = (comment) => {
        return mongoUser && comment.likes && comment.likes.some(like =>
            like.toString() === mongoUser._id.toString()
        );
    };

    const isUserDisliked = (comment) => {
        return mongoUser && comment.dislikes && comment.dislikes.some(dislike =>
            dislike.toString() === mongoUser._id.toString()
        );
    };

    if (!isOpen) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/20 backdrop-blur-sm z-[9998]"
                onClick={onClose}
            />

            {/* Comment Panel */}
            <div
                className={`
        fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[80vh] max-h-[600px] z-[9999]
        rounded-2xl shadow-2xl border overflow-hidden flex flex-col
        ${darkMode
                        ? 'bg-slate-800/95 border-slate-700/60 text-white'
                        : 'bg-white/95 border-gray-200/60 text-gray-900'
                    }
        backdrop-blur-xl animate-in fade-in zoom-in-95 duration-300
    `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className={`
                    flex items-center justify-between p-4 border-b sticky top-0 z-10
                    ${darkMode
                        ? 'border-slate-700/60 bg-slate-800/95 backdrop-blur-xl'
                        : 'border-gray-200/60 bg-white/95 backdrop-blur-xl'
                    }
                `}>
                    <div className="flex items-center space-x-3">
                        <div className={`
                            p-2 rounded-full
                            ${darkMode ? 'bg-blue-500/20 text-blue-400' : 'bg-blue-50 text-blue-600'}
                        `}>
                            <MessageCircle className="w-4 h-4" />
                        </div>
                        <div>
                            <span className="font-semibold">Comments</span>
                            <span className={`
                                ml-2 px-2 py-0.5 rounded-full text-xs font-medium
                                ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-100 text-gray-600'}
                            `}>
                                {comments.length}
                            </span>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className={`
                            p-2 rounded-full transition-all duration-200
                            ${darkMode
                                ? 'hover:bg-slate-700 text-slate-400 hover:text-white'
                                : 'hover:bg-gray-100 text-gray-500 hover:text-gray-700'
                            }
                        `}
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>

                {/* Comment Input */}
                <div className="p-4 border-b border-slate-700/30">
                    {mongoUser ? (
                        <form onSubmit={handleAddComment} className="space-y-3">
                            <div className="flex space-x-3">
                                <div className={`
                                    flex-shrink-0 w-8 h-8 rounded-full overflow-hidden
                                    ${darkMode ? 'ring-1 ring-slate-600' : 'ring-1 ring-gray-200'}
                                `}>
                                    {mongoUser.avatar ? (
                                        <img
                                            src={mongoUser.avatar}
                                            alt={mongoUser.name}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className={`
                                            w-full h-full flex items-center justify-center text-xs font-semibold
                                            ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}
                                        `}>
                                            {mongoUser.name?.charAt(0).toUpperCase() || 'U'}
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1">
                                    <textarea
                                        className={`
                                            w-full rounded-lg px-3 py-2 text-sm border resize-none
                                            focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none
                                            ${darkMode
                                                ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                                                : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                            }
                                        `}
                                        placeholder="Add a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        disabled={submitting}
                                        rows={2}
                                        maxLength={500}
                                    />
                                </div>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className={`
                                    text-xs
                                    ${darkMode ? 'text-slate-400' : 'text-gray-500'}
                                `}>
                                    {commentText.length}/500
                                </span>
                                <button
                                    type="submit"
                                    disabled={submitting || !commentText.trim()}
                                    className={`
                                        px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                        ${submitting || !commentText.trim()
                                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            : 'bg-blue-500 text-white hover:bg-blue-600 hover:scale-105'
                                        }
                                    `}
                                >
                                    {submitting ? 'Posting...' : 'Post'}
                                </button>
                            </div>
                        </form>
                    ) : (
                        <div className={`
                            text-center py-6 px-4 rounded-lg
                            ${darkMode ? 'bg-slate-700/30' : 'bg-gray-50'}
                        `}>
                            <MessageCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
                            <p className={`text-sm ${darkMode ? 'text-slate-400' : 'text-gray-500'}`}>
                                Sign in to join the conversation
                            </p>
                        </div>
                    )}
                </div>

                {/* Comments List */}
                <div className="flex-1 overflow-y-auto max-h-[calc(85vh-200px)]">
                    {loading ? (
                        <div className="flex justify-center items-center py-8">
                            <div className="animate-spin rounded-full h-6 w-6 border-2 border-blue-500 border-t-transparent"></div>
                        </div>
                    ) : comments.length === 0 ? (
                        <div className={`
                            flex flex-col items-center justify-center py-12
                            ${darkMode ? 'text-slate-400' : 'text-gray-500'}
                        `}>
                            <MessageCircle className="w-12 h-12 mb-3 opacity-20" />
                            <p className="text-sm font-medium mb-1">No comments yet</p>
                            <p className="text-xs opacity-75">Be the first to comment!</p>
                        </div>
                    ) : (
                        <div className="space-y-1">
                            {comments.map((comment, idx) => {
                                const isExpanded = expandedComments.has(comment._id);
                                const needsTruncation = comment.text.length > 150;
                                const userLiked = isUserLiked(comment);
                                const userDisliked = isUserDisliked(comment);

                                return (
                                    <div key={comment._id || idx} className={`
                                        p-4 border-b border-opacity-30 hover:bg-opacity-50 transition-colors
                                        ${darkMode ? 'border-slate-700 hover:bg-slate-700' : 'border-gray-200 hover:bg-gray-50'}
                                    `}>
                                        <div className="flex space-x-3">
                                            <div className={`
                                                flex-shrink-0 w-8 h-8 rounded-full overflow-hidden
                                                ${darkMode ? 'ring-1 ring-slate-600' : 'ring-1 ring-gray-200'}
                                            `}>
                                                {comment.userId?.avatar ? (
                                                    <img
                                                        src={comment.userId.avatar}
                                                        alt={comment.userId.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className={`
                                                        w-full h-full flex items-center justify-center text-xs font-semibold
                                                        ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}
                                                    `}>
                                                        {comment.userId?.name?.charAt(0).toUpperCase() || 'U'}
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-center space-x-2 mb-1">
                                                    <span className={`
                                                        text-sm font-medium
                                                        ${darkMode ? 'text-slate-200' : 'text-gray-800'}
                                                    `}>
                                                        {comment.userId?.name || 'Anonymous'}
                                                    </span>
                                                    {(comment.createdAt || comment.date) && (
                                                        <span className={`
                                                            text-xs
                                                            ${darkMode ? 'text-slate-400' : 'text-gray-500'}
                                                        `}>
                                                            {formatDate(comment.createdAt || comment.date)}
                                                        </span>
                                                    )}
                                                </div>
                                                <p className={`
                                                    text-sm leading-relaxed mb-2
                                                    ${darkMode ? 'text-slate-300' : 'text-gray-700'}
                                                `}>
                                                    {isExpanded || !needsTruncation
                                                        ? comment.text
                                                        : truncateText(comment.text)
                                                    }
                                                </p>

                                                <div className="flex items-center space-x-4 mb-2">
                                                    {needsTruncation && (
                                                        <button
                                                            onClick={() => toggleCommentExpansion(comment._id)}
                                                            className={`
                                                                text-xs font-medium flex items-center space-x-1
                                                                ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}
                                                            `}
                                                        >
                                                            <span>{isExpanded ? 'Show less' : 'Show more'}</span>
                                                            {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                                                        </button>
                                                    )}

                                                    {mongoUser && (
                                                        <button
                                                            onClick={() => handleReply(comment._id)}
                                                            className={`
                                                                text-xs font-medium flex items-center space-x-1
                                                                ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'}
                                                            `}
                                                        >
                                                            <Reply className="w-3 h-3" />
                                                            <span>Reply</span>
                                                        </button>
                                                    )}

                                                    {mongoUser && (
                                                        <>
                                                            <button
                                                                onClick={() => handleLikeComment(comment._id)}
                                                                disabled={likingComment === comment._id}
                                                                className={`
                                                                    text-xs font-medium flex items-center space-x-1 transition-colors
                                                                    ${userLiked
                                                                        ? (darkMode ? 'text-green-400' : 'text-green-600')
                                                                        : (darkMode ? 'text-slate-400 hover:text-green-400' : 'text-gray-500 hover:text-green-600')
                                                                    }
                                                                `}
                                                            >
                                                                <ThumbsUp className="w-3 h-3" />
                                                                <span>{comment.likes?.length || 0}</span>
                                                            </button>
                                                            <button
                                                                onClick={() => handleDislikeComment(comment._id)}
                                                                disabled={likingComment === comment._id}
                                                                className={`
                                                                    text-xs font-medium flex items-center space-x-1 transition-colors
                                                                    ${userDisliked
                                                                        ? (darkMode ? 'text-red-400' : 'text-red-600')
                                                                        : (darkMode ? 'text-slate-400 hover:text-red-400' : 'text-gray-500 hover:text-red-600')
                                                                    }
                                                                `}
                                                            >
                                                                <ThumbsDown className="w-3 h-3" />
                                                                <span>{comment.dislikes?.length || 0}</span>
                                                            </button>
                                                        </>
                                                    )}
                                                </div>

                                                {/* Reply Input */}
                                                {replyingTo === comment._id && (
                                                    <div className="mt-3 pl-4 border-l-2 border-blue-500">
                                                        <div className="flex space-x-2">
                                                            <input
                                                                type="text"
                                                                placeholder={`Reply to ${comment.userId?.name || 'Anonymous'}...`}
                                                                value={replyText}
                                                                onChange={(e) => setReplyText(e.target.value)}
                                                                className={`
                                                                    flex-1 px-3 py-2 text-sm rounded-lg border
                                                                    focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:outline-none
                                                                    ${darkMode
                                                                        ? 'bg-slate-700/50 border-slate-600 text-white placeholder-slate-400'
                                                                        : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-500'
                                                                    }
                                                                `}
                                                                maxLength={300}
                                                            />
                                                            <button
                                                                onClick={() => setReplyingTo(null)}
                                                                className={`
                                                                    px-3 py-2 text-sm rounded-lg
                                                                    ${darkMode ? 'text-slate-400 hover:text-slate-300' : 'text-gray-500 hover:text-gray-700'}
                                                                `}
                                                            >
                                                                Cancel
                                                            </button>
                                                            <button
                                                                onClick={() => handleAddReply(comment._id)}
                                                                disabled={!replyText.trim() || submittingReply}
                                                                className={`
                                                                    px-3 py-2 text-sm rounded-lg
                                                                    ${(!replyText.trim() || submittingReply)
                                                                        ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                                                        : 'bg-blue-500 text-white hover:bg-blue-600'
                                                                    }
                                                                `}
                                                            >
                                                                {submittingReply ? 'Replying...' : 'Reply'}
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Display Replies */}
                                                {/* Display Replies */}
                                                {comment.replies && comment.replies.length > 0 && (
                                                    <div className="mt-3 pl-4 border-l-2 border-gray-300 space-y-3">
                                                        {comment.replies.map((reply, replyIdx) => (
                                                            <div key={reply._id || replyIdx} className="flex space-x-2">
                                                                <div className={`
                                                                    flex-shrink-0 w-6 h-6 rounded-full overflow-hidden
                                                                    ${darkMode ? 'ring-1 ring-slate-600' : 'ring-1 ring-gray-200'}
                                                                `}>
                                                                    {((reply.userId?.avatar && reply.userId.avatar.trim() !== '') ||
                                                                        (firebaseUser?.photoURL && firebaseUser.photoURL.trim() !== '')) ? (
                                                                        <img
                                                                            src={
                                                                                (reply.userId?.avatar && reply.userId.avatar.trim() !== '')
                                                                                    ? reply.userId.avatar
                                                                                    : firebaseUser?.photoURL
                                                                            }
                                                                            alt={reply.userId?.name || firebaseUser?.displayName}
                                                                            className="w-full h-full object-cover"
                                                                            onError={(e) => {
                                                                                e.target.style.display = 'none';
                                                                                e.target.nextSibling.style.display = 'flex';
                                                                            }}
                                                                        />
                                                                    ) : null}
                                                                    <div
                                                                        className={`
                                                                            w-full h-full flex items-center justify-center text-xs font-semibold
                                                                            ${darkMode ? 'bg-slate-700 text-slate-300' : 'bg-gray-200 text-gray-700'}
                                                                            ${((reply.userId?.avatar && reply.userId.avatar.trim() !== '') ||
                                                                                (firebaseUser?.photoURL && firebaseUser.photoURL.trim() !== '')) ? 'hidden' : 'flex'}
                                                                        `}
                                                                    >
                                                                        {(reply.userId?.name || firebaseUser?.displayName)?.charAt(0).toUpperCase() || 'U'}
                                                                    </div>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    <div className="flex items-center space-x-2 mb-1">
                                                                        <span className={`
                                                                            text-xs font-medium
                                                                            ${darkMode ? 'text-slate-200' : 'text-gray-800'}
                                                                        `}>
                                                                            {reply.userId?.name || firebaseUser?.displayName || 'Anonymous'}
                                                                        </span>
                                                                        {(reply.createdAt || reply.date) && (
                                                                            <span className={`
                                                                                text-xs
                                                                                ${darkMode ? 'text-slate-400' : 'text-gray-500'}
                                                                            `}>
                                                                                {formatDate(reply.createdAt || reply.date)}
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                    <p className={`
                                                                        text-xs leading-relaxed
                                                                        ${darkMode ? 'text-slate-300' : 'text-gray-700'}
                                                                    `}>
                                                                        {reply.text}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}