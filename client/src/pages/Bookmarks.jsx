/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import { Bookmark, Frown } from 'lucide-react';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const Bookmarks = () => {
    const { mongoUser, firebaseUser } = useAuth();
    const [bookmarkedBlogs, setBookmarkedBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { darkMode } = useTheme();

    useEffect(() => {
        const fetchBookmarkedBlogs = async () => {
            if (!mongoUser || !firebaseUser) {
                setLoading(false);
                setError("Please log in to view your bookmarks.");
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const token = await firebaseUser.getIdToken();
                // Fetch blogs bookmarked by the current user
                const response = await axios.get(`${API_BASE_URL}/blogs/my-bookmarks`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBookmarkedBlogs(response.data);
            } catch (err) {
                console.error("Failed to fetch bookmarked blogs:", err.response?.data || err.message);
                setError("Failed to load bookmarks. Please ensure your backend is running and you are logged in.");
            } finally {
                setLoading(false);
            }
        };

        fetchBookmarkedBlogs();
    }, [mongoUser, firebaseUser]);

    const handleEditBlog = (blog) => {
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) {
            return;
        }
        try {
            const token = await firebaseUser.getIdToken();
            await axios.delete(`${API_BASE_URL}/blogs/${blogId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBookmarkedBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== blogId));
        } catch (err) {
            console.error("Failed to delete blog:", err);
            setError("Failed to delete blog. Please try again.");
        }
    };
    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your bookmarks...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`text-center p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Frown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Error Loading Bookmarks</h2>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-6 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'}`}>
            <div className="max-w-6xl mx-auto px-6 py-8">
                {bookmarkedBlogs.length === 0 ? (
                    <div className={`text-center p-10 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} shadow-lg`}>
                        <Frown className="w-20 h-20 mx-auto mb-4 text-blue-400" />
                        <h2 className="text-2xl font-semibold mb-2">No Bookmarks Yet</h2>
                        <p className="text-lg">Save posts that interest you to find them easily here!</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {bookmarkedBlogs.map(blog => (
                            <BlogCard
                                key={blog._id}
                                blog={blog}
                                onEdit={handleEditBlog}
                                onDelete={handleDeleteBlog}
                                darkMode={darkMode}
                                isAuthorView={mongoUser && blog.authorId && (blog.authorId._id === mongoUser._id || blog.authorId === mongoUser._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Bookmarks;
