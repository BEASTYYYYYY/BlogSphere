/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Trash2, Share2, Eye, MessageCircle, Bookmark, Calendar, User, ArrowRight, MoreHorizontal, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import LikeButton from './LikeButton';
import CommentSection from './CommentSection';
import axios from 'axios';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

const BlogCard = React.memo(({ blog, onEdit, onDelete, cardSize = 'normal', isAuthorView = false }) => {
    const { mongoUser, firebaseUser } = useAuth();
    const navigate = useNavigate();
    const isMyBlog = mongoUser && blog.authorId && (blog.authorId._id === mongoUser._id || blog.authorId === mongoUser._id);
    const { darkMode } = useTheme();
    const [likes, setLikes] = useState(Array.isArray(blog.likes) ? blog.likes : []);
    const [commentsCount, setCommentsCount] = useState(Array.isArray(blog.comments) ? blog.comments.length : 0);
    const [views, setViews] = useState(blog.views || 0);
    const [showComment, setShowComment] = useState(false);
    const [bookmarked, setBookmarked] = useState(
        mongoUser && Array.isArray(blog.bookmarks) && blog.bookmarks.includes(mongoUser._id)
    );
    const [bookmarksCount, setBookmarksCount] = useState(Array.isArray(blog.bookmarks) ? blog.bookmarks.length : 0);
    const [isHovered, setIsHovered] = useState(false);
    const [showActions, setShowActions] = useState(false);
    const [isContentOverflowing, setIsContentOverflowing] = useState(false);

    const contentRef = useRef(null);
    const tags = (blog && Array.isArray(blog.tags)) ? blog.tags : [];
    const hasImage = blog.previewImage && blog.previewImage.trim().length > 0;

    const getExcerptLength = () => {
        if (hasImage) {
            switch (cardSize) {
                case 'large': return 140;
                case 'wide': return 120;
                default: return 100;
            }
        } else {
            switch (cardSize) {
                case 'large': return 200;
                case 'wide': return 180;
                default: return 160;
            }
        }
    };

    const getLineClamp = () => hasImage ? 'line-clamp-3' : 'line-clamp-4';
    const getContentMaxHeight = () => hasImage ? 3 : 4; // in lines


    const getTruncatedHtmlContent = (htmlContent, maxLength) => {
        if (!htmlContent) return '';

        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlContent;
        const textContent = tempDiv.textContent || tempDiv.innerText || '';

        if (textContent.length <= maxLength) {
            return htmlContent;
        }

        let truncatedText = textContent.slice(0, maxLength);
        let lastSpace = truncatedText.lastIndexOf(' ');
        if (lastSpace > maxLength * 0.8) {
            truncatedText = truncatedText.substring(0, lastSpace);
        }

        let charCount = 0;
        let resultHtml = '';
        let inTag = false;
        const openTags = [];

        for (let i = 0; i < htmlContent.length; i++) {
            const char = htmlContent[i];

            if (char === '<') {
                inTag = true;
                resultHtml += char;
                if (htmlContent[i + 1] === '/') {
                    const tagEndIndex = htmlContent.indexOf('>', i);
                    const tagName = htmlContent.substring(i + 2, tagEndIndex).split(' ')[0].toLowerCase();
                    const lastOpenTagIndex = openTags.lastIndexOf(tagName);
                    if (lastOpenTagIndex !== -1) {
                        openTags.splice(lastOpenTagIndex, 1);
                    }
                } else {
                    const tagEndIndex = htmlContent.indexOf('>', i);
                    const fullTag = htmlContent.substring(i, tagEndIndex + 1);
                    if (!fullTag.endsWith('/>') && !fullTag.startsWith('<!') && !fullTag.startsWith('<img') && !fullTag.startsWith('<br')) {
                        const tagName = fullTag.substring(1, fullTag.indexOf(' ')).toLowerCase() || fullTag.substring(1, fullTag.length - 1).toLowerCase();
                        openTags.push(tagName);
                    }
                }
            } else {
                if (!inTag) {
                    charCount++;
                    if (charCount > truncatedText.length) {
                        break;
                    }
                }
                resultHtml += char;
            }
        }

        while (openTags.length > 0) {
            const tag = openTags.pop();
            resultHtml += `</${tag}>`;
        }

        return resultHtml;
    };

    const contentForExcerpt = blog.excerpt?.trim()?.length > 0 ? blog.excerpt : blog.content || '';
    const truncatedContent = getTruncatedHtmlContent(contentForExcerpt, getExcerptLength());
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = contentForExcerpt;
    const fullTextContent = tempDiv.textContent || tempDiv.innerText || '';
    const needsReadMore = fullTextContent.length > getExcerptLength();

    useEffect(() => {
        if (contentRef.current) {
            const lineHeight = parseFloat(getComputedStyle(contentRef.current).lineHeight);
            const maxHeight = lineHeight * getContentMaxHeight();
            const actualHeight = contentRef.current.scrollHeight;
            setIsContentOverflowing(actualHeight > maxHeight);
        }
    }, [truncatedContent, hasImage]);

    useEffect(() => {
        setBookmarked(mongoUser && Array.isArray(blog.bookmarks) && blog.bookmarks.includes(mongoUser._id));
        setBookmarksCount(Array.isArray(blog.bookmarks) ? blog.bookmarks.length : 0);
    }, [blog.bookmarks, mongoUser]);

    const handleCardClick = async (e) => {
        if (
            e.target.closest('button') ||
            e.target.closest('a') ||
            e.target.tagName === 'BUTTON' ||
            e.target.tagName === 'A' ||
            e.target.closest('.comment-section') ||
            e.target.closest('[data-comment-area]') ||
            showComment ||
            showActions
        ) {
            return;
        }
        navigate(`/blog/${blog._id || blog.id}`);
    };

    const handleBookmark = async (e) => {
        e.stopPropagation();
        if (!firebaseUser || !mongoUser) {
            alert('Please log in to bookmark blogs.');
            return;
        }

        try {
            const token = await firebaseUser.getIdToken();
            const url = `${API_BASE_URL}/blogs/${blog._id || blog.id}/bookmark`;
            let res;
            if (bookmarked) {
                res = await axios.post(`${url}/unbookmark`, {}, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                res = await axios.post(url, {}, { headers: { Authorization: `Bearer ${token}` } });
            }
            setBookmarked(res.data.bookmarked);
            setBookmarksCount(res.data.bookmarksCount);
        } catch (error) {
            console.error("Failed to toggle bookmark:", error.response?.data || error.message);
            alert("Failed to update bookmark status. Please try again.");
        }
    };

    const handleEdit = (blog) => {
        navigate(`/edit-blog/${blog._id || blog.id}`);
    };

    const handleDelete = async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog? This action cannot be undone.')) return;
        try {
            onDelete(blogId);
        } catch (error) {
            console.error('Error initiating delete from BlogCard:', error);
        }
    };

    const handleShare = (blogId) => {
        const url = `${window.location.origin}/blog/${blogId}`;
        navigator.clipboard.writeText(url).then(() => {
            alert('Blog link copied to clipboard!');
        }).catch(() => {
            document.execCommand('copy');
            alert('Blog link copied to clipboard!');
        });
    };

    const toggleComments = (e) => {
        e.stopPropagation();
        setShowComment(prev => !prev);
    };

    const toggleReadMore = (e) => {
        e.stopPropagation();
        navigate(`/blog/${blog._id || blog.id}`);
    };

    const updateCommentsCount = (newCount) => {
        setCommentsCount(newCount);
    };

    const getCardClasses = () => {
        const baseClasses = `
            group relative overflow-hidden rounded-3xl transition-all duration-500 ease-out border cursor-pointer
            flex flex-col backdrop-blur-sm hover:backdrop-blur-md transform-gpu
            ${darkMode
                ? 'bg-gradient-to-br from-slate-900/95 via-slate-800/90 to-slate-900/95 border-slate-700/50 hover:border-slate-600/70 shadow-2xl shadow-slate-900/20'
                : 'bg-gradient-to-br from-white/95 via-gray-50/90 to-white/95 border-gray-200/60 hover:border-gray-300/80 shadow-2xl shadow-gray-900/10'
            }
            before:absolute before:inset-0 before:bg-gradient-to-br before:from-transparent before:via-transparent before:to-black/5 before:opacity-0 before:transition-opacity before:duration-500
            hover:before:opacity-100 hover:shadow-3xl hover:scale-[1.02] hover:-translate-y-1
            active:scale-[0.98] active:transition-transform active:duration-150
        `;

        if (hasImage) {
            switch (cardSize) {
                case 'large':
                    return `${baseClasses} shadow-lg w-full max-w-[420px] h-[480px] min-h-[480px] p-6`;
                case 'wide':
                    return `${baseClasses} shadow-md w-full max-w-[380px] h-[450px] min-h-[450px] p-5`;
                default:
                    return `${baseClasses} shadow-sm w-full max-w-[340px] h-[420px] min-h-[420px] p-5`;
            }
        } else {
            switch (cardSize) {
                case 'large':
                    return `${baseClasses} shadow-lg w-full max-w-[350px] h-[480px] min-h-[480px] p-6`;
                case 'wide':
                    return `${baseClasses} shadow-md w-full max-w-[330px] h-[450px] min-h-[450px] p-5`;
                default:
                    return `${baseClasses} shadow-sm w-full max-w-[310px] h-[420px] min-h-[420px] p-5`;
            }
        }
    };

    const getImageHeight = () => {
        switch (cardSize) {
            case 'large': return 'h-40';
            case 'wide': return 'h-36';
            default: return 'h-32';
        }
    };

    const getTagsToShow = () => {
        switch (cardSize) {
            case 'large': return 5;
            case 'wide': return 4;
            default: return 3;
        }
    };

    const formatDate = (date) => {
        const blogDate = new Date(date);
        const now = new Date();
        const diffTime = Math.abs(now - blogDate);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 1) return 'Today';
        if (diffDays === 2) return 'Yesterday';
        if (diffDays <= 7) return `${diffDays} days ago`;

        return blogDate.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
        });
    };

    const getStatusColor = () => {
        if (blog.status === 'published') {
            return darkMode
                ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30 shadow-emerald-500/10'
                : 'bg-emerald-50 text-emerald-700 border-emerald-200 shadow-emerald-500/5';
        } else {
            return darkMode
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30 shadow-amber-500/10'
                : 'bg-amber-50 text-amber-700 border-amber-200 shadow-amber-500/5';
        }
    };

    // Determine author's profile picture or initial
    const authorProfilePic = blog.authorId?.profilePicture || blog.authorId?.avatar;
    const authorName = blog.authorId?.name || 'Unknown Author';

    return (
        <div className="relative">
            <div
                className={`${getCardClasses()}`}
                onClick={handleCardClick}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
            >
                {/* Animated background elements */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700">
                    <div className={`absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl transition-all duration-700 ${darkMode ? 'bg-blue-500/10' : 'bg-blue-500/5'}`}></div>
                    <div className={`absolute bottom-0 left-0 w-24 h-24 rounded-full blur-2xl transition-all duration-700 ${darkMode ? 'bg-purple-500/10' : 'bg-purple-500/5'}`}></div>
                </div>

                {/* Sparkle effect */}
                <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-500 delay-200 z-20">
                    <Sparkles className={`w-4 h-4 ${darkMode ? 'text-yellow-400' : 'text-yellow-500'} animate-pulse`} />
                </div>

                {/* Header Section */}
                <div className="relative z-30 flex items-start justify-between mb-4 flex-shrink-0">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className={`
                            relative px-3 py-1.5 rounded-full text-xs font-semibold capitalize border shadow-sm
                            transition-all duration-300 hover:scale-105 ${getStatusColor()}
                        `}>
                            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                            {blog.status || 'draft'}
                        </div>

                        {blog.authorId && (
                            <div className="flex items-center space-x-2 min-w-0 group/author">
                                <div className={`
                                    relative w-8 h-8 rounded-full overflow-hidden flex-shrink-0 ring-2 ring-offset-2 transition-all duration-300
                                    ${darkMode ? 'ring-slate-700 ring-offset-slate-900' : 'ring-gray-200 ring-offset-white'}
                                    group-hover/author:ring-blue-500/50
                                `}>
                                    {/* Conditionally render img or fallback div based on authorProfilePic */}
                                    {authorProfilePic ? (
                                        <img
                                            src={authorProfilePic}
                                            alt={authorName}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover/author:scale-110"
                                            onError={(e) => {
                                                e.target.style.display = 'none'; // Hide img on error
                                                if (e.target.nextElementSibling) { // Check if nextSibling exists
                                                    e.target.nextElementSibling.style.display = 'flex'; // Show fallback div
                                                }
                                            }}
                                        />
                                    ) : null}
                                    {/* Fallback div, always present but conditionally hidden/shown */}
                                    <div className={`w-full h-full flex items-center justify-center text-sm font-bold
                                        ${darkMode ? 'bg-gradient-to-br from-slate-700 to-slate-600 text-slate-300' : 'bg-gradient-to-br from-gray-200 to-gray-300 text-gray-700'}
                                        ${authorProfilePic ? 'hidden' : 'flex'} ` /* Hide if image exists, show otherwise */}
                                    >
                                        {authorName?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                </div>
                                <div className="min-w-0">
                                    <p className={`text-sm font-medium truncate transition-colors duration-300 ${darkMode ? 'text-slate-300 group-hover/author:text-white' : 'text-gray-700 group-hover/author:text-gray-900'}`}>
                                        {authorName}
                                    </p>
                                    <div className={`flex items-center space-x-1 text-xs ${darkMode ? 'text-slate-500' : 'text-gray-500'}`}>
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(blog.date || blog.createdAt)}</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {(isMyBlog || isAuthorView) && (
                        <div className="relative flex-shrink-0 z-50">
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    setShowActions(!showActions);
                                }}
                                className={`
                                    p-3 rounded-full transition-all duration-300 opacity-0 group-hover:opacity-100
                                    ${darkMode ? 'hover:bg-slate-700/80 bg-slate-800/80' : 'hover:bg-gray-100/80 bg-white/80'}
                                    ${showActions ? 'opacity-100' : ''}
                                    min-w-[44px] min-h-[44px] flex items-center justify-center backdrop-blur-sm
                                    shadow-lg border ${darkMode ? 'border-slate-600' : 'border-gray-200'}
                                `}
                            >
                                <MoreHorizontal className="w-5 h-5" />
                            </button>

                            {showActions && (
                                <div className={`
                                    absolute right-0 top-full mt-2 py-2 rounded-xl shadow-2xl border z-[9999] min-w-[140px]
                                    ${darkMode ? 'bg-slate-800/95 border-slate-700 backdrop-blur-md' : 'bg-white/95 border-gray-200 backdrop-blur-md'}
                                    animate-in fade-in slide-in-from-top-2 duration-200
                                `}>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleEdit(blog);
                                            setShowActions(false);
                                        }}
                                        className={`
                                            w-full px-4 py-3 text-left text-sm flex items-center space-x-3 transition-colors
                                            ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}
                                        `}
                                    >
                                        <Edit3 className="w-4 h-4" />
                                        <span>Edit</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(blog._id || blog.id);
                                            setShowActions(false);
                                        }}
                                        className={`
                                            w-full px-4 py-3 text-left text-sm flex items-center space-x-3 transition-colors
                                            ${darkMode ? 'hover:bg-red-900/20 text-red-400' : 'hover:bg-red-50 text-red-600'}
                                        `}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        <span>Delete</span>
                                    </button>
                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleShare(blog._id || blog.id);
                                            setShowActions(false);
                                        }}
                                        className={`
                                            w-full px-4 py-3 text-left text-sm flex items-center space-x-3 transition-colors
                                            ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-gray-50 text-gray-700'}
                                        `}
                                    >
                                        <Share2 className="w-4 h-4" />
                                        <span>Share</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Image Section (Conditional) */}
                {hasImage && (
                    <div className={`${getImageHeight()} mb-4 flex-shrink-0 relative z-10`}>
                        <div className="relative w-full h-full rounded-2xl overflow-hidden group/image">
                            <img
                                src={blog.previewImage}
                                alt="Preview"
                                className="w-full h-full object-cover transition-transform duration-700 group-hover/image:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover/image:opacity-100 transition-opacity duration-500"></div>
                        </div>
                    </div>
                )}

                {/* Title Section */}
                <div className="relative z-10 flex-shrink-0 mb-4">
                    <h3 className={`
                        text-xl font-bold leading-tight line-clamp-2 transition-all duration-300
                        ${darkMode ? 'text-white group-hover:text-blue-300' : 'text-gray-900 group-hover:text-blue-600'}
                        cursor-pointer relative
                    `}>
                        {blog.title}
                        <div className={`
                            absolute bottom-0 left-0 h-0.5 bg-gradient-to-r from-blue-500 to-purple-500 
                            transition-all duration-300 w-0 group-hover:w-full
                        `}></div>
                    </h3>
                </div>

                {/* Content Section */}
                <div className="relative z-10 mb-4 flex-grow overflow-hidden">
                    <div
                        ref={contentRef}
                        className={`
                            prose prose-sm max-w-none text-sm leading-relaxed overflow-hidden
                            ${darkMode ? 'prose-invert text-slate-300' : 'text-gray-700'}
                            transition-colors duration-300 ${getLineClamp()}
                        `}
                        dangerouslySetInnerHTML={{ __html: truncatedContent }}
                    />

                    {(needsReadMore || isContentOverflowing) && (
                        <button
                            onClick={toggleReadMore}
                            className={`
                                mt-2 inline-flex items-center space-x-1 text-sm font-medium transition-all duration-300
                                ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}
                                group/read-more
                            `}
                        >
                            <span>Read more</span>
                            <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover/read-more:translate-x-1" />
                        </button>
                    )}
                </div>

                {/* Tags Section */}
                <div className="relative z-10 flex-shrink-0 mb-4">
                    {tags.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                            {tags.slice(0, getTagsToShow()).map((tag, index) => (
                                <span
                                    key={tag}
                                    className={`
                                        px-3 py-1 rounded-full text-xs font-medium transition-all duration-300
                                        ${darkMode ? 'bg-slate-700/50 text-slate-300 hover:bg-slate-600/50 border border-slate-600/50' : 'bg-gray-100/80 text-gray-700 hover:bg-gray-200/80 border border-gray-200/80'}
                                        hover:scale-105 hover:shadow-md backdrop-blur-sm
                                    `}
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    #{tag}
                                </span>
                            ))}
                            {tags.length > getTagsToShow() && (
                                <span className={`
                                    px-3 py-1 rounded-full text-xs font-medium
                                    ${darkMode ? 'text-slate-500 bg-slate-700/30' : 'text-gray-500 bg-gray-100/60'}
                                `}>
                                    +{tags.length - getTagsToShow()}
                                </span>
                            )}
                        </div>
                    )}
                </div>

                {/* Footer Section */}
                <div className={`
                    relative z-10 flex items-center justify-between pt-4 border-t flex-shrink-0
                    ${darkMode ? 'border-slate-700/50' : 'border-gray-200/60'}
                `}>
                    <div className="flex items-center space-x-4">
                        <div className={`
                            flex items-center space-x-1 text-sm font-medium
                            ${darkMode ? 'text-slate-400' : 'text-gray-500'}
                        `}>
                            <Eye className="w-4 h-4" />
                            <span>{views || 0}</span>
                        </div>

                        <LikeButton blog={blog} likes={likes} setLikes={setLikes} darkMode={darkMode} />

                        <button
                            onClick={handleBookmark}
                            className={`
                                flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                                transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2
                                ${bookmarked
                                    ? darkMode
                                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 hover:bg-amber-500/30 focus:ring-amber-400/50 shadow-amber-500/10'
                                        : 'bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 focus:ring-amber-500/50 shadow-amber-500/5'
                                    : darkMode
                                        ? 'text-slate-400 border border-slate-600/50 hover:text-amber-400 hover:border-amber-500/50 hover:bg-amber-500/10 focus:ring-slate-400/50'
                                        : 'text-gray-600 border border-gray-300/60 hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50 focus:ring-gray-400/50'
                                }
                                shadow-sm hover:shadow-md
                            `}
                            title={bookmarked ? 'Remove Bookmark' : 'Save/Bookmark'}
                        >
                            <Bookmark className={`w-4 h-4 transition-all duration-300 ${bookmarked ? 'fill-current' : ''}`} />
                            <span>{bookmarksCount}</span>
                        </button>

                        <button
                            onClick={toggleComments}
                            className={`
                                flex items-center space-x-1 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-300
                                focus:outline-none focus:ring-2 focus:ring-offset-2 shadow-sm hover:shadow-md
                                ${showComment
                                    ? darkMode ? 'text-blue-300 bg-blue-900/30 border border-blue-500/30' : 'text-blue-600 bg-blue-50 border border-blue-200'
                                    : darkMode ? 'text-slate-400 hover:text-blue-400 hover:bg-slate-700/50 border border-slate-600/50' : 'text-gray-500 hover:text-blue-500 hover:bg-gray-50 border border-gray-300/60'
                                }
                                relative z-[60]
                            `}
                            title={showComment ? 'Hide comments' : 'Show comments'}
                        >
                            <MessageCircle className="w-4 h-4" />
                            <span>{commentsCount}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Comment Section - Outside the card */}
            {showComment && (
                <div className="relative z-[100] mt-4" data-comment-area>
                    <CommentSection
                        blogId={blog._id}
                        darkMode={darkMode}
                        isOpen={showComment}
                        onClose={() => setShowComment(false)}
                        onCommentsUpdate={updateCommentsCount}
                    />
                </div>
            )}
        </div>
    );
});

export default BlogCard;