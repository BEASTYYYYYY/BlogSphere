/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard'; // Now imports the single, combined BlogCard
import { Frown, Sparkles, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Dashboard = () => {
    const { mongoUser, firebaseUser } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isFeedPersonalized, setIsFeedPersonalized] = useState(false);
    const { darkMode } = useTheme();

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError(null);
            try {
                let url;
                let config = {};

                if (firebaseUser) {
                    const token = await firebaseUser.getIdToken();
                    config.headers = { Authorization: `Bearer ${token}` };
                }

                if (mongoUser && mongoUser.following && mongoUser.following.length > 0) {
                    url = `${API_BASE_URL}/blogs/followed`;
                    setIsFeedPersonalized(true);
                } else {
                    url = `${API_BASE_URL}/blogs`;
                    setIsFeedPersonalized(false);
                }

                const response = await axios.get(url, config);
                setBlogs(response.data);
            } catch (err) {
                console.error("Failed to fetch blogs:", err.response?.data || err.message);
                setError("Failed to load blogs. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchBlogs();
    }, [mongoUser, firebaseUser]);

    const handleEditBlog = (blog) => {
        // This function could navigate to an edit page or open a modal
        // For Dashboard, it's typically just a placeholder as direct editing
        // might be from 'My Blogs' section.
    };

    const handleDeleteBlog = async (blogId) => {
        // This functionality would typically be on 'My Blogs' page
        if (!window.confirm("Are you sure you want to delete this blog?")) {
            return;
        }
        try {
            const token = await firebaseUser.getIdToken();
            await axios.delete(`${API_BASE_URL}/blogs/${blogId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setBlogs(prevBlogs => prevBlogs.filter(blog => blog._id !== blogId));
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
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading blog feed...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} pt-16`}>
                <div className={`text-center p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} `}>
                    <Frown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Error Loading Feed</h2>
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
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} `}>
            <div className="max-w-6xl mx-auto px-6 py-8">
                {blogs.length === 0 && isFeedPersonalized ? (
                    <div className={`text-center p-10 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} shadow-lg`}>
                        <Sparkles className="w-20 h-20 mx-auto mb-4 text-purple-400" />
                        <h2 className="text-2xl font-semibold mb-2">Your Personalized Feed is Empty!</h2>
                        <p className="text-lg mb-4">
                            It looks like the people you follow haven't posted yet, or you're not following anyone.
                        </p>
                        <p className="text-lg mb-6">
                            Start following other users to see their posts here!
                        </p>
                        <Link
                            to="/following"
                            className={`inline-flex items-center px-6 py-3 rounded-lg text-lg font-semibold transition-colors
                                ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                        >
                            <UserPlus className="w-5 h-5 mr-2" /> Find People to Follow
                        </Link>
                    </div>
                ) : blogs.length === 0 && !isFeedPersonalized ? (
                    <div className={`text-center p-10 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} shadow-lg`}>
                        <Frown className="w-20 h-20 mx-auto mb-4 text-red-400" />
                        <h2 className="text-2xl font-semibold mb-2">No Blogs Available</h2>
                        <p className="text-lg">There are no public blogs to display yet. Be the first to write one!</p>
                        <Link
                            to="/write"
                            className={`inline-flex items-center mt-6 px-6 py-3 rounded-lg text-lg font-semibold transition-colors
                                ${darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                        >
                            Start Writing
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {blogs.map(blog => (
                            <BlogCard
                                key={blog._id}
                                blog={blog}
                                onEdit={handleEditBlog}
                                onDelete={handleDeleteBlog}
                                // Removed darkMode prop here! BlogCard now gets it internally.
                                isAuthorView={mongoUser && blog.authorId && (blog.authorId._id === mongoUser._id || blog.authorId === mongoUser._id)}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;