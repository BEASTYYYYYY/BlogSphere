/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { ArrowLeft, Calendar, Clock, Eye, MessageCircle, Share2, User, BookOpen, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import LikeButton from "../components/LikeButton";
import CommentSection from '../components/CommentSection';
import checkBlogOwnerSetting from '../utils/checkBlogOwnerSetting';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const BlogDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { hash } = useLocation();
    const { mongoUser, firebaseUser } = useAuth();
    const [blog, setBlog] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [likes, setLikes] = useState([]);
    const [views, setViews] = useState(0);
    const [showComments, setShowComments] = useState(false);
    const [imageGalleryIndex, setImageGalleryIndex] = useState(0);
    const [showImageGallery, setShowImageGallery] = useState(false);
    const { darkMode } = useTheme();
    const [canLike, setCanLike] = useState(true);
    const [canComment, setCanComment] = useState(true);

    // Integrate checkBlogOwnerSetting logic
    useEffect(() => {
        const fetchPermissions = async () => {
            if (!blog?.authorId?._id) return;
            try {
                const [likeRes, commentRes] = await Promise.all([
                    checkBlogOwnerSetting(blog.authorId._id, 'allowLikes'),
                    checkBlogOwnerSetting(blog.authorId._id, 'allowComments')
                ]);
                setCanLike(likeRes);
                setCanComment(commentRes);
            } catch (error) {
                console.error('Error fetching interaction permissions', error);
                setCanLike(true);
                setCanComment(true);
            }
        };
        if (blog?.authorId?._id) fetchPermissions();
    }, [blog]);

    // Handle hash for comment section
    useEffect(() => {
        if (hash === '#commentSection' && blog) {
            setShowComments(true);
        }
    }, [hash, blog]);

    useEffect(() => {
        const fetchBlog = async () => {
            if (!id) {
                setError('Blog ID is required');
                setLoading(false);
                return;
            }

            try {
                setLoading(true);
                setError(null);

                let config = {};
                let token;

                if (firebaseUser) {
                    token = await firebaseUser.getIdToken();
                    config.headers = { Authorization: `Bearer ${token}` };
                }
                const blogRes = await axios.get(`${API_BASE_URL}/blogs/${id}`, config);
                setBlog(blogRes.data);
                setLikes(Array.isArray(blogRes.data.likes) ? blogRes.data.likes : []);
                setViews(blogRes.data.views || 0);
                if (mongoUser && firebaseUser && blogRes.data?.authorId?._id !== mongoUser._id) {
                    try {
                        const viewToken = await firebaseUser.getIdToken();
                        const viewRes = await axios.post(
                            `${API_BASE_URL}/blogs/${id}/view`,
                            {},
                            { headers: { Authorization: `Bearer ${viewToken}` } }
                        );
                        setViews(viewRes.data.views);
                    } catch (err) {
                        console.error('Failed to update view count:', err.response?.data || err.message);
                    }
                }
            } catch (err) {
                console.error('Failed to fetch blog or update view:', err.response?.data || err.message);
                setError(err.response?.status === 404 ? 'Blog post not found' : 'Server error. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchBlog();
    }, [id, mongoUser, firebaseUser]);

    const formatDate = (dateString) => {
        if (!dateString) return 'Unknown date';
        try {
            return new Date(dateString).toLocaleDateString('en-US', {
                year: 'numeric', month: 'long', day: 'numeric'
            });
        } catch {
            return 'Invalid date';
        }
    };

    const getReadingTime = (content) => {
        if (!content) return '0 min read';
        const wordCount = content.split(/\s+/).length;
        return `${Math.ceil(wordCount / 200)} min read`;
    };

    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title: blog.title,
                    text: blog.excerpt || blog.content?.slice(0, 120) + '...',
                    url: window.location.href,
                });
            } catch (err) {
                console.log('Error sharing:', err);
            }
        } else {
            try {
                await navigator.clipboard.writeText(window.location.href);
                alert('Link copied to clipboard!');
            } catch (err) {
                console.log('Failed to copy link');
            }
        }
    };

    const heroImage = blog?.previewImage;
    const galleryImages = Array.isArray(blog?.imageGallery) ? blog.imageGallery : [];

    const allImages = [
        ...(heroImage ? [heroImage] : []),
        ...galleryImages,
    ].filter((img, index, arr) => arr.indexOf(img) === index);

    const openImageGallery = (imageUrl) => {
        const index = allImages.indexOf(imageUrl);
        setImageGalleryIndex(index >= 0 ? index : 0);
        setShowImageGallery(true);
    };

    const nextImage = () => {
        setImageGalleryIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevImage = () => {
        setImageGalleryIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const closeImageGallery = () => {
        setShowImageGallery(false);
    };

    useEffect(() => {
        const handleKeyDown = (e) => {
            if (e.key === 'g' && allImages.length > 0 && !showImageGallery) {
                openImageGallery(allImages[0]);
            }
            if (!showImageGallery) return;
            if (e.key === 'Escape') closeImageGallery();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'ArrowRight') nextImage();
        };

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [showImageGallery, allImages]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-6"></div>
                        <div className="absolute inset-0 rounded-full h-16 w-16 border-4 border-blue-200 border-t-transparent mx-auto opacity-30"></div>
                    </div>
                    <p className={`text-lg font-medium ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your story...</p>
                    <p className={`text-sm mt-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Please wait while we fetch the content</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center max-w-md mx-auto p-8">
                    <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 ${darkMode ? 'bg-red-900/20' : 'bg-red-50'}`}>
                        <User className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Oops!</h2>
                    <p className={`text-lg mb-8 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{error}</p>
                    <div className="flex gap-4 justify-center">
                        <button
                            onClick={() => window.location.reload()}
                            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg"
                        >
                            Try Again
                        </button>
                        <button
                            onClick={() => navigate(-1)}
                            className={`px-6 py-3 rounded-xl font-semibold transition-all duration-200 transform hover:scale-105 shadow-lg ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                        >
                            Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!blog) return null;

    const tags = Array.isArray(blog?.tags) ? blog.tags : [];
    const commentsCount = Array.isArray(blog?.comments) ? blog.comments.length : 0;

    // Determine author's profile picture or initial
    const authorProfilePic = blog.authorId?.profilePicture || blog.authorId?.avatar;
    const authorName = blog.authorId?.name || 'Unknown Author';

    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} transition-colors duration-300`}>
            {/* Enhanced Image Gallery Modal */}
            {showImageGallery && allImages.length > 0 && (
                <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-2 sm:p-4" onClick={closeImageGallery}>
                    <div
                        className="relative w-full h-full max-w-7xl max-h-full flex items-center justify-center"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <button
                            onClick={closeImageGallery}
                            className="absolute top-4 right-4 z-10 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-200 backdrop-blur-sm"
                        >
                            <X className="w-5 h-5 sm:w-6 sm:h-6" />
                        </button>
                        <div className="relative max-w-full max-h-full overflow-hidden touch-pinch-zoom">
                            <img
                                src={allImages[imageGalleryIndex]}
                                alt={`Gallery image ${imageGalleryIndex + 1}`}
                                className="max-w-[90vw] max-h-[80vh] object-contain rounded-lg shadow-2xl"
                                onError={(e) => {
                                    console.error('Image failed to load:', allImages[imageGalleryIndex]);
                                    e.target.style.display = 'none';
                                }}
                            />
                        </div>
                        {allImages.length > 1 && (
                            <>
                                <button
                                    onClick={prevImage}
                                    className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-200 backdrop-blur-sm"
                                >
                                    <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                                <button
                                    onClick={nextImage}
                                    className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 text-white bg-black/50 hover:bg-black/70 rounded-full p-2 sm:p-3 transition-all duration-200 backdrop-blur-sm"
                                >
                                    <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
                                </button>
                            </>
                        )}
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-sm sm:text-base bg-black/50 px-3 py-1 rounded-full backdrop-blur-sm">
                            {imageGalleryIndex + 1} / {allImages.length}
                        </div>
                    </div>
                </div>
            )}
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
                {/* Back Button */}
                <div className="mb-8">
                    <button
                        onClick={() => navigate(-1)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:scale-105 ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        <span>Back to Blogs</span>
                    </button>
                </div>

                {/* Hero Section with Gallery */}
                <div className="mb-12">
                    {allImages.length > 0 && (
                        <div className="mb-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {allImages.map((img, index) => (
                                    <div
                                        key={index}
                                        className="relative aspect-square w-full overflow-hidden rounded-xl shadow-lg cursor-pointer group"
                                        onClick={() => openImageGallery(img)}
                                    >
                                        <img
                                            src={img}
                                            alt={`Gallery image ${index + 1}`}
                                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            onError={(e) => {
                                                console.error('Gallery image failed to load:', img);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                                Click to expand
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <h1 className={`text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-black mb-6 leading-tight bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent`}>
                        {blog.title}
                    </h1>

                    {/* Author Info */}
                    <div className={`p-4 sm:p-6 rounded-2xl mb-8 ${darkMode ? 'bg-gray-800/50' : 'bg-white/50'} backdrop-blur-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-4">
                            {blog.authorId && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden ring-2 ring-blue-500 ring-offset-2 ring-offset-gray-100">
                                        {authorProfilePic ? (
                                            <img
                                                src={authorProfilePic}
                                                alt={authorName}
                                                className="w-full h-full object-cover"
                                                onError={(e) => { // Fallback if image fails to load
                                                    e.target.onerror = null; // Prevent infinite loop
                                                    e.target.style.display = 'none'; // Hide the broken image
                                                    e.target.nextSibling.style.display = 'flex'; // Show the fallback initial
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600 text-white text-lg font-bold">
                                                {authorName?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                        )}
                                    </div>
                                    <div>
                                        <p className={`font-bold text-base sm:text-lg ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                            {authorName}
                                        </p>
                                        <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            Author
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-sm">
                            <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Calendar className="w-4 h-4" />
                                <span>{formatDate(blog.createdAt)}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Clock className="w-4 h-4" />
                                <span>{getReadingTime(blog.content)}</span>
                            </div>
                            <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <BookOpen className="w-4 h-4" />
                                <span>{blog.content?.split(/\s+/).length || 0} words</span>
                            </div>
                            <div className={`flex items-center gap-2 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Eye className="w-4 h-4" />
                                <span>{views.toLocaleString()} views</span>
                            </div>
                        </div>
                    </div>

                    {blog.excerpt && blog.excerpt.trim().length > 0 && (
                        <div className={`p-4 sm:p-6 rounded-2xl border-l-4 border-blue-500 ${darkMode ? 'bg-blue-900/20 text-gray-300' : 'bg-blue-50 text-gray-700'}`}>
                            <p className="text-lg sm:text-xl leading-relaxed font-medium italic">
                                "{blog.excerpt}"
                            </p>
                        </div>
                    )}
                </div>

                {/* Main Content */}
                <article className={`prose prose-sm sm:prose-base lg:prose-lg max-w-none mb-12 ${darkMode ? 'prose-invert' : ''}`}>
                    {blog.content?.split('\n').map((block, i) => {
                        let processedBlock = block;

                        const imgMatch = processedBlock.match(/!\[.*?\]\((.*?)\)/);
                        if (imgMatch) {
                            const imgSrc = imgMatch[1];
                            return (
                                <div key={i} className="my-6 sm:my-8">
                                    <div className="relative group cursor-pointer" onClick={() => openImageGallery(imgSrc)}>
                                        <img
                                            src={imgSrc}
                                            alt="Content image"
                                            className="w-full rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 group-hover:scale-[1.02]"
                                            onError={(e) => {
                                                console.error('Content image failed to load:', imgSrc);
                                                e.target.style.display = 'none';
                                            }}
                                        />
                                        <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl flex items-center justify-center">
                                            <div className="bg-black/50 text-white px-3 py-1 rounded-full text-sm backdrop-blur-sm">
                                                Click to expand
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        }

                        if (processedBlock.startsWith('### ')) {
                            return (
                                <h3 key={i} className={`text-xl sm:text-2xl font-bold mt-8 sm:mt-10 mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {processedBlock.substring(4)}
                                </h3>
                            );
                        } else if (processedBlock.startsWith('## ')) {
                            return (
                                <h2 key={i} className={`text-2xl sm:text-3xl font-bold mt-10 sm:mt-12 mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {processedBlock.substring(3)}
                                </h2>
                            );
                        } else if (processedBlock.startsWith('# ')) {
                            return (
                                <h1 key={i} className={`text-3xl sm:text-4xl font-bold mt-10 sm:mt-12 mb-4 sm:mb-6 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                    {processedBlock.substring(2)}
                                </h1>
                            );
                        }

                        processedBlock = processedBlock.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold">$1</strong>');
                        processedBlock = processedBlock.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
                        processedBlock = processedBlock.replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-blue-500 hover:text-blue-600 hover:underline inline-flex items-center gap-1">$1 <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path></svg></a>');

                        if (processedBlock.trim() === '') return null;

                        return (
                            <p key={i} className={`text-base sm:text-lg leading-relaxed mb-4 sm:mb-6 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`} dangerouslySetInnerHTML={{ __html: processedBlock }} />
                        );
                    })}
                </article>

                {/* Tags */}
                {tags.length > 0 && (
                    <div className="mb-10">
                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>Tags</h3>
                        <div className="flex flex-wrap gap-2 sm:gap-3">
                            {tags.map((tag) => (
                                <span key={tag} className={`px-3 sm:px-4 py-1 sm:py-2 rounded-full text-sm font-medium shadow-sm transition-all duration-200 hover:scale-105 cursor-pointer ${darkMode ? 'bg-blue-900/30 text-blue-300 hover:bg-blue-900/50' : 'bg-blue-100 text-blue-700 hover:bg-blue-200'}`}>
                                    #{tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Action Bar */}
                <div className={`sticky bottom-6 mx-auto max-w-sm sm:max-w-md ${darkMode ? 'bg-gray-800/90' : 'bg-white/90'} backdrop-blur-lg rounded-2xl shadow-2xl border ${darkMode ? 'border-gray-700' : 'border-gray-200'} p-3 sm:p-4`}>
                    <div className="flex items-center justify-around">
                        {canLike && (
                            <LikeButton blog={blog} likes={likes} setLikes={setLikes} darkMode={darkMode} />)}
                        <button
                            onClick={() => setShowComments(!showComments)}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-medium text-sm sm:text-base">{commentsCount}</span>
                        </button>
                        <button
                            onClick={handleShare}
                            className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-xl transition-all duration-200 hover:scale-105 ${darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-600 hover:bg-gray-100'}`}
                        >
                            <Share2 className="w-4 h-4 sm:w-5 sm:h-5" />
                            <span className="font-medium text-sm sm:text-base">Share</span>
                        </button>
                    </div>
                </div>

                {/* Comments */}
                {showComments && (
                    <div className="mt-12" id="commentSection">
                        <CommentSection
                            blogId={blog._id}
                            darkMode={darkMode}
                            isOpen={showComments}
                            onClose={() => setShowComments(false)}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogDetails;