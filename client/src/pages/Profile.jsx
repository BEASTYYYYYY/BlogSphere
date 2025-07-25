/* eslint-disable no-unused-vars */
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProfileCard from '../components/ProfileCard'; // Assuming this is still used or can be removed if redundant
import QuickStats from '../components/QuickStats'; // Assuming this is still used or can be removed if redundant
import BlogCard from '../components/BlogCard';
import ProfileEditModal from '../components/ProfileEditModal';
import { Search, UserPlus, UserMinus, MoreHorizontal, Share2, MessageCircle, Camera, User } from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedValue(value);
        }, delay);

        return () => {
            clearTimeout(handler);
        };
    }, [value, delay]);

    return debouncedValue;
};

const ImageEditModal = React.memo(({
    show,
    onClose,
    onUpdate,
    title,
    currentUrl,
    darkMode,
    isUploading = false,
    previewClassName = "w-24 h-24 rounded-full"
}) => {
    const [newUrl, setNewUrl] = useState('');
    const [preview, setPreview] = useState('');

    useEffect(() => {
        if (!show) {
            setNewUrl('');
            setPreview('');
        } else {
            setNewUrl(currentUrl || ''); // Initialize newUrl with currentUrl when modal opens
            setPreview(currentUrl || ''); // Initialize preview with currentUrl
        }
    }, [show, currentUrl]);

    const handleFileUpload = useCallback((event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setPreview(e.target.result);
                setNewUrl(e.target.result);
            };
            reader.readAsDataURL(file);
        }
    }, []);

    const handleUpdate = useCallback(() => {
        if (newUrl.trim()) {
            onUpdate(newUrl);
        }
    }, [newUrl, onUpdate]);

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className={`max-w-md w-full rounded-xl p-6 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-2xl`}>
                <div className="flex justify-between items-center mb-4">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {title}
                    </h3>
                    <button
                        onClick={onClose}
                        className={`text-2xl transition-colors ${darkMode ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                        disabled={isUploading}
                    >
                        &times;
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Image URL
                        </label>
                        <input
                            type="url"
                            value={newUrl}
                            onChange={(e) => setNewUrl(e.target.value)}
                            placeholder="Enter image URL"
                            className={`w-full px-3 py-2 border rounded-lg transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            disabled={isUploading}
                        />
                    </div>

                    <div className="text-center">
                        <span className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>or</span>
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                            Upload from Computer
                        </label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={handleFileUpload}
                            className={`w-full px-3 py-2 border rounded-lg transition-colors ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'} focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            disabled={isUploading}
                        />
                    </div>

                    {(preview || newUrl) && (
                        <div className="flex justify-center py-4">
                            <img
                                src={preview || newUrl}
                                alt="Preview"
                                className={`${previewClassName} object-cover border-2 border-gray-300 shadow-lg`}
                            />
                        </div>
                    )}

                    <div className="flex gap-3 mt-6">
                        <button
                            onClick={onClose}
                            disabled={isUploading}
                            className={`flex-1 px-4 py-2 rounded-lg border transition-colors ${darkMode ? 'border-gray-600 text-gray-300 hover:bg-gray-700' : 'border-gray-300 text-gray-700 hover:bg-gray-50'} disabled:opacity-50`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleUpdate}
                            disabled={!newUrl.trim() || isUploading}
                            className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            {isUploading ? 'Updating...' : 'Update'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
});

ImageEditModal.displayName = 'ImageEditModal';

export default function Profile() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { mongoUser, firebaseUser } = useAuth();
    const [activeTab, setActiveTab] = useState('Published');
    const [searchQuery, setSearchQuery] = useState('');
    const [showProfileEdit, setShowProfileEdit] = useState(false);
    const [showProfilePicEdit, setShowProfilePicEdit] = useState(false);
    const [showCoverEdit, setShowCoverEdit] = useState(false);
    const [userProfile, setUserProfile] = useState({});
    const [myBlogs, setMyBlogs] = useState([]);
    const [userStats, setUserStats] = useState({ posts: 0, followers: 0, following: 0 });
    const [isFollowing, setIsFollowing] = useState(false);
    const [loading, setLoading] = useState(true);
    const [imageUploading, setImageUploading] = useState(false);
    const [error, setError] = useState(null);
    const [isPrivate, setIsPrivate] = useState(false); // Added isPrivate state
    const { darkMode } = useTheme();

    const profileId = useMemo(() => id || mongoUser?._id, [id, mongoUser?._id]);
    const isOwnProfile = useMemo(() => profileId === mongoUser?._id, [profileId, mongoUser?._id]);
    const debouncedSearchQuery = useDebounce(searchQuery, 300);

    const { publishedBlogs, draftBlogs, filteredBlogs } = useMemo(() => {
        const published = myBlogs.filter(blog => blog.status === 'published');
        const drafts = myBlogs.filter(blog => blog.status === 'draft');

        let currentBlogs = activeTab === 'Published' ? published : drafts;

        if (debouncedSearchQuery) {
            currentBlogs = currentBlogs.filter(blog =>
                blog.title?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                blog.content?.toLowerCase().includes(debouncedSearchQuery.toLowerCase()) ||
                blog.tags?.some(tag => tag.toLowerCase().includes(debouncedSearchQuery.toLowerCase()))
            );
        }
        return {
            publishedBlogs: published,
            draftBlogs: drafts,
            filteredBlogs: currentBlogs
        };
    }, [myBlogs, activeTab, debouncedSearchQuery]);

    const getApiConfig = useCallback(async () => {
        if (!firebaseUser) return null;
        const token = await firebaseUser.getIdToken();
        return { headers: { Authorization: `Bearer ${token}` } };
    }, [firebaseUser]);

    const fetchData = useCallback(async () => {
        if (!firebaseUser || !profileId) {
            setLoading(false);
            return;
        }
        try {
            setLoading(true);
            setError(null);
            setIsPrivate(false); // Reset private status on new fetch

            const config = await getApiConfig();
            const requests = [
                axios.get(`${API_BASE_URL}/users/${profileId}`, config),
                axios.get(`${API_BASE_URL}/blogs/user/${profileId}`, config),
                axios.get(`${API_BASE_URL}/users/${profileId}/stats`, config)
            ];
            if (!isOwnProfile) {
                requests.push(axios.get(`${API_BASE_URL}/users/me/social`, config));
            }
            const responses = await Promise.all(requests);
            const [profileRes, blogsRes, statsRes, followRes] = responses;
            setUserProfile(profileRes.data);
            setMyBlogs(blogsRes.data || []);
            setUserStats(statsRes.data || { posts: 0, followers: 0, following: 0 });

            if (!isOwnProfile && followRes) {
                setIsFollowing(followRes.data.following?.some(user => user._id === profileId) || false);
            }

            console.log('Profile data fetched:', profileRes.data);
        } catch (error) {
            console.error("Error loading profile data:", error);
            if (error.response && error.response.status === 403) {
                setIsPrivate(true); // Set to private if 403
                setError("This account is private.");
            } else {
                setError("Failed to load profile data.");
            }
        } finally {
            setLoading(false);
        }
    }, [firebaseUser, profileId, isOwnProfile, getApiConfig]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleEditBlog = useCallback((blog) => {
        navigate(`/write/${blog._id}`);
    }, [navigate]);

    const handleDeleteBlog = useCallback(async (blogId) => {
        if (!window.confirm('Are you sure you want to delete this blog?')) return;

        try {
            const config = await getApiConfig();
            await axios.delete(`${API_BASE_URL}/blogs/${blogId}`, config);
            setMyBlogs(prev => prev.filter(blog => blog._id !== blogId));
            setUserStats(prev => ({ ...prev, posts: Math.max(0, prev.posts - 1) }));
        } catch (error) {
            console.error('Error deleting blog:', error);
            alert('Failed to delete blog');
        }
    }, [getApiConfig]);

    const handleProfileSave = useCallback(async (newData) => {
        try {
            const config = await getApiConfig();
            const response = await axios.put(`${API_BASE_URL}/users/me`, newData, config);
            setUserProfile(prev => ({ ...prev, ...response.data }));
            setShowProfileEdit(false);
        } catch (error) {
            console.error('Error updating profile:', error);
            alert('Failed to update profile');
        }
    }, [getApiConfig]);

    const handleImageUpdate = useCallback(async (imageUrl, type) => {
        if (!imageUrl.trim()) return;

        try {
            setImageUploading(true);
            const config = await getApiConfig();
            const updateData = type === 'profile'
                ? { profilePicture: imageUrl }
                : { coverImage: imageUrl };

            console.log('Updating image:', { type, imageUrl, updateData });
            const response = await axios.put(`${API_BASE_URL}/users/me`, updateData, config);
            console.log('Backend response:', response.data);

            if (type === 'profile' && firebaseUser) {
                try {
                    await firebaseUser.updateProfile({
                        photoURL: imageUrl
                    });
                    console.log('Firebase profile updated successfully');
                } catch (firebaseError) {
                    console.warn('Firebase profile update failed:', firebaseError);
                }
            }

            setUserProfile(prev => {
                const updated = {
                    ...prev,
                    ...(type === 'profile'
                        ? { profilePicture: imageUrl }
                        : { coverImage: imageUrl }
                    )
                };
                console.log('Updated userProfile state:', updated);
                return updated;
            });

            if (type === 'profile') {
                setShowProfilePicEdit(false);
            } else {
                setShowCoverEdit(false);
            }

            setTimeout(() => {
                fetchData();
            }, 1000);

        } catch (error) {
            console.error(`Error updating ${type} image:`, error);

            if (error.response) {
                console.error('Response error:', error.response.data);
                alert(`Failed to update ${type} image: ${error.response.data.message || 'Server error'}`);
            } else if (error.request) {
                console.error('Request error:', error.request);
                alert(`Failed to update ${type} image: Network error`);
            } else {
                console.error('Error:', error.message);
                alert(`Failed to update ${type} image: ${error.message}`);
            }
        } finally {
            setImageUploading(false);
        }
    }, [getApiConfig, firebaseUser, fetchData]);

    const toggleFollow = useCallback(async () => {
        try {
            const config = await getApiConfig();
            const endpoint = isFollowing ? 'unfollow' : 'follow';
            await axios.post(`${API_BASE_URL}/users/${endpoint}/${profileId}`, {}, config);

            setIsFollowing(!isFollowing);
            setUserStats(prev => ({
                ...prev,
                followers: isFollowing ? prev.followers - 1 : prev.followers + 1
            }));
        } catch (error) {
            console.error("Failed to toggle follow status:", error);
            alert("Failed to update follow status");
        }
    }, [getApiConfig, isFollowing, profileId]);

    const handleShare = useCallback(async () => {
        try {
            await navigator.share({
                title: `${userProfile.displayName || userProfile.name}'s Profile`,
                url: window.location.href
            });
        } catch (error) {
            // Fallback to clipboard
            navigator.clipboard.writeText(window.location.href);
            alert('Profile link copied to clipboard!');
        }
    }, [userProfile]);

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className={darkMode ? 'text-gray-400' : 'text-gray-600'}>Loading profile...</p>
                </div>
            </div>
        );
    }

    // New: Handle private profile
    if (isPrivate) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center mt-10 text-gray-600 dark:text-gray-300">
                    <p className="italic text-lg">This account is private.</p>
                    <p className="text-sm mt-2">You need to follow this user to view their profile.</p>
                    <button
                        onClick={() => navigate(-1)}
                        className={`mt-4 px-4 py-2 rounded-lg font-semibold transition-all duration-200 hover:scale-105 ${darkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    if (error && !isPrivate) { // Display generic error if not a private profile error
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
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

    if (!userProfile._id) return null; // Ensure userProfile is loaded before rendering

    const tabs = isOwnProfile ? ['Published', 'Drafts'] : ['Published']; // Only show drafts for own profile


    return (
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-20`}>
            <div className="relative">
                {/* Cover Image Section */}
                <div className="h-64 sm:h-72 md:h-80 relative overflow-hidden">
                    <img
                        src={userProfile.coverImage || "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80"}
                        alt="Cover"
                        className="w-full h-full object-cover"
                        loading="lazy"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
                    {isOwnProfile && (
                        <button
                            onClick={() => setShowCoverEdit(true)}
                            className="absolute top-4 right-4 bg-black bg-opacity-50 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-sm hover:bg-opacity-70 transition-all duration-200 flex items-center gap-2"
                            disabled={imageUploading}
                        >
                            <Camera className="w-4 h-4" />
                            Edit Cover
                        </button>
                    )}
                </div>
                <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex flex-col items-center">
                        {/* Profile Image with improved margins and styling */}
                        <div className="relative mb-4">
                            <div className="w-32 h-32 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white ring-4 ring-white/20">
                                {userProfile.profilePicture ? (
                                    <img
                                        src={userProfile.profilePicture}
                                        alt={userProfile.displayName || userProfile.name || 'Profile'}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
                                        onError={(e) => { // Fallback if image fails to load
                                            e.target.onerror = null; // Prevent infinite loop
                                            e.target.style.display = 'none'; // Hide the broken image
                                            e.target.nextSibling.style.display = 'flex'; // Show the fallback initial
                                        }}
                                    />
                                ) : (
                                    <div className={`w-full h-full flex items-center justify-center text-3xl font-bold
                                        ${darkMode ? 'bg-blue-600 text-blue-100' : 'bg-blue-100 text-blue-600'}`}
                                    >
                                        {userProfile.displayName?.charAt(0).toUpperCase() || userProfile.name?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                )}
                            </div>
                            {isOwnProfile && (
                                <button
                                    onClick={() => setShowProfilePicEdit(true)}
                                    disabled={imageUploading}
                                    className="absolute bottom-0 right-0 w-10 h-10 bg-blue-500 text-white rounded-full flex items-center justify-center hover:bg-blue-600 transition-colors shadow-lg ring-4 ring-white disabled:opacity-50"
                                >
                                    <Camera className="w-4 h-4" />
                                </button>
                            )}
                        </div>

                        {/* Name with improved typography */}
                        <h1 className={`text-2xl sm:text-3xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-900'} mb-1`}>
                            {userProfile.displayName || userProfile.name || 'User Name'}
                        </h1>

                        {/* Optional username or handle */}
                        {userProfile.username && (
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'} mb-2`}>
                                @{userProfile.username}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Main Content with improved spacing */}
            <div className="pt-24 pb-8">
                <div className="max-w-6xl mx-auto px-4 sm:px-6">
                    {/* Stats Row with improved responsiveness */}
                    <div className="flex justify-center items-center space-x-8 sm:space-x-12 mb-8">
                        <div className="text-center">
                            <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {userStats.posts || 0}
                            </div>
                            <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Posts
                            </div>
                        </div>
                        <div className="text-center">
                            <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {userStats.followers || 0}
                            </div>
                            <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Followers
                            </div>
                        </div>
                        <div className="text-center">
                            <div className={`text-xl sm:text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                {userStats.following || 0}
                            </div>
                            <div className={`text-xs sm:text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                Following
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons with improved styling */}
                    <div className="flex justify-center items-center flex-wrap gap-3 mb-8">
                        {!isOwnProfile && (
                            <>
                                <button
                                    onClick={toggleFollow}
                                    className={`px-6 py-2.5 rounded-full font-medium transition-all duration-200 flex items-center gap-2 ${isFollowing
                                        ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        : 'bg-blue-500 text-white hover:bg-blue-600 shadow-lg hover:shadow-xl'
                                        }`}
                                >
                                    {isFollowing ? <UserMinus className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
                                    {isFollowing ? 'Unfollow' : 'Follow'}
                                </button>
                                <button
                                    className={`px-6 py-2.5 rounded-full border font-medium transition-all duration-200 flex items-center gap-2 ${darkMode
                                        ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                                        : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                        }`}
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    Message
                                </button>
                            </>
                        )}

                        {isOwnProfile && (
                            <button
                                onClick={() => setShowProfileEdit(true)}
                                className="px-6 py-2.5 bg-blue-500 text-white rounded-full font-medium hover:bg-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl"
                            >
                                Edit Profile
                            </button>
                        )}

                        <button
                            onClick={handleShare}
                            className={`p-2.5 rounded-full border transition-all duration-200 ${darkMode
                                ? 'border-gray-600 text-gray-300 hover:bg-gray-800'
                                : 'border-gray-300 text-gray-700 hover:bg-gray-50'
                                }`}
                        >
                            <Share2 className="w-4 h-4" />
                        </button>
                    </div>

                    {/* Introduction Section with improved styling */}
                    <div className={`mb-8 p-6 rounded-xl ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-sm border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                        <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            Introduction
                        </h3>
                        <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'} mb-4 leading-relaxed`}>
                            {userProfile.bio || "No bio available yet."}
                        </p>

                        {(userProfile.location || userProfile.email || userProfile.website || userProfile.workplace) && (
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                {userProfile.location && (
                                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <span className="mr-2">📍</span> {/* Using an emoji for location icon */}
                                        {userProfile.location}
                                    </div>
                                )}
                                {userProfile.email && (
                                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <span className="mr-2">✉️</span> {/* Using an emoji for email icon */}
                                        {userProfile.email}
                                    </div>
                                )}
                                {userProfile.website && (
                                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <span className="mr-2">🌐</span> {/* Using an emoji for website icon */}
                                        <a
                                            href={userProfile.website}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="hover:underline text-blue-500"
                                        >
                                            {userProfile.website}
                                        </a>
                                    </div>
                                )}
                                {userProfile.workplace && (
                                    <div className={`flex items-center text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                        <span className="mr-2">🏢</span> {/* Using an emoji for workplace icon */}
                                        {userProfile.workplace}
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Tab Navigation with improved styling */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                        <div className="flex space-x-1">
                            {tabs.map(tab => (
                                <button
                                    key={tab}
                                    onClick={() => setActiveTab(tab)}
                                    className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${activeTab === tab
                                        ? 'bg-blue-500 text-white shadow-lg'
                                        : darkMode
                                            ? 'text-gray-400 hover:text-white hover:bg-gray-800'
                                            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                                        }`}
                                >
                                    {tab} ({tab === 'Published' ? publishedBlogs.length : draftBlogs.length})
                                </button>
                            ))}
                        </div>

                        <div className="relative w-full sm:w-auto">
                            <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className={`pl-10 pr-4 py-2 w-full sm:w-64 rounded-lg border transition-colors ${darkMode
                                    ? 'bg-gray-800 border-gray-700 text-white placeholder-gray-400'
                                    : 'bg-white border-gray-200 text-gray-900 placeholder-gray-500'
                                    } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                            />
                        </div>
                    </div>

                    {/* Content Grid - preserved as requested */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {filteredBlogs.map(blog => (
                            <BlogCard
                                key={blog._id}
                                blog={blog}
                                onEdit={handleEditBlog}
                                onDelete={handleDeleteBlog}
                                darkMode={darkMode}
                                isAuthorView={isOwnProfile}
                            />
                        ))}

                        {/* Empty state */}
                        {filteredBlogs.length === 0 && (
                            <div className={`col-span-full text-center py-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                {searchQuery ? (
                                    <p>No posts found matching "{searchQuery}"</p>
                                ) : (
                                    <p>No {activeTab.toLowerCase()} to display yet.</p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Modals */}
            <ImageEditModal
                show={showProfilePicEdit}
                onClose={() => setShowProfilePicEdit(false)}
                onUpdate={(url) => handleImageUpdate(url, 'profile')}
                title="Update Profile Picture"
                currentUrl={userProfile.profilePicture}
                darkMode={darkMode}
                isUploading={imageUploading}
                previewClassName="w-24 h-24 rounded-full"
            />

            <ImageEditModal
                show={showCoverEdit}
                onClose={() => setShowCoverEdit(false)}
                onUpdate={(url) => handleImageUpdate(url, 'cover')}
                title="Update Cover Image"
                currentUrl={userProfile.coverImage}
                darkMode={darkMode}
                isUploading={imageUploading}
                previewClassName="w-full h-32 rounded-lg"
            />

            {isOwnProfile && (
                <ProfileEditModal
                    show={showProfileEdit}
                    setShow={setShowProfileEdit}
                    userProfile={userProfile}
                    onSave={handleProfileSave}
                    darkMode={darkMode}
                />
            )}
        </div>
    );
}