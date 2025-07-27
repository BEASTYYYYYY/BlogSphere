/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext'; 
import BlogCard from '../components/BlogCard'; 
import { TrendingUp, ThumbsUp, Bookmark, Hash, Frown } from 'lucide-react';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const Trending = () => {
    const { firebaseUser } = useAuth();
    const [activeTab, setActiveTab] = useState('likes'); 
    const [trendingContent, setTrendingContent] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { darkMode } = useTheme();

    useEffect(() => {
        const fetchTrendingContent = async () => {
            setLoading(true);
            setError(null);
            try {
                let url;
                let config = {};
                if (firebaseUser) {
                    const token = await firebaseUser.getIdToken();
                    config.headers = { Authorization: `Bearer ${token}` };
                }

                switch (activeTab) {
                    case 'likes':
                        url = `${API_BASE_URL}/blogs/trending/likes`;
                        break;
                    case 'bookmarks':
                        url = `${API_BASE_URL}/blogs/trending/bookmarks`;
                        break;
                    case 'tags':
                        url = `${API_BASE_URL}/blogs/trending/tags`;
                        break;
                    default:
                        return; 
                }
                const response = await axios.get(url, config); 
                setTrendingContent(response.data);
            } catch (err) {
                console.error(`Failed to fetch trending ${activeTab}:`, err.response?.data || err.message);
                setError(`Failed to load trending ${activeTab}. Please try again later.`);
            } finally {
                setLoading(false);
            }
        };

        fetchTrendingContent();
    }, [activeTab, firebaseUser]); 

    const renderContent = () => {
        if (loading) {
            return (
                <div className="flex items-center justify-center py-10">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mr-4"></div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading trending {activeTab}...</p>
                </div>
            );
        }

        if (error) {
            return (
                <div className={`text-center p-6 rounded-lg shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                    <Frown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>Error</h2>
                    <p className={`${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
                </div>
            );
        }

        if (trendingContent.length === 0) {
            return (
                <div className={`text-center p-10 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600'} shadow-lg`}>
                    <Frown className="w-20 h-20 mx-auto mb-4 text-blue-400" />
                    <h2 className="text-2xl font-semibold mb-2">No Trending {activeTab === 'tags' ? 'Tags' : 'Blogs'} Found</h2>
                    <p className="text-lg">Looks like nothing is trending yet. Check back soon!</p>
                </div>
            );
        }

        if (activeTab === 'tags') {
            return (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {trendingContent.map((tagData, index) => (
                        <div
                            key={tagData._id}
                            className={`p-5 rounded-xl shadow-md transition-transform duration-200 hover:scale-[1.02]
                                ${darkMode ? 'bg-gray-800 border border-gray-700 text-white' : 'bg-white border border-gray-200 text-gray-900'}`}
                        >
                            <div className="flex items-center justify-between mb-3">
                                <span className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>#{tagData._id}</span>
                                <span className={`text-lg font-semibold ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>{tagData.count} posts</span>
                            </div>
                            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                This tag has been used in {tagData.count} {tagData.count === 1 ? 'post' : 'posts'}.
                            </p>
                            <button
                                onClick={() => window.location.href = `/tag/${tagData._id}`}
                                className={`mt-4 w-full py-2 rounded-lg text-sm font-semibold transition-colors
    ${darkMode ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-500 hover:bg-blue-600 text-white'}`}
                            >
                                View Posts
                            </button>
                            <button
                                onClick={() => window.location.href = `/tag/${tagData._id}?famous=1`}
                                className={`mt-2 w-full py-2 rounded-lg text-sm font-semibold transition-colors
    ${darkMode ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-purple-500 hover:bg-purple-600 text-white'}`}
                            >
                                Most Famous Post
                            </button>
                        </div>
                    ))}
                </div>
            );
        } else {
            return (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {trendingContent.map(blog => (
                        <BlogCard
                            key={blog._id}
                            blog={blog}
                            darkMode={darkMode}
                            // Pass isAuthorView to allow edit/delete for the actual author of the trending blog
                            isAuthorView={firebaseUser?.uid && blog.authorId?.uid === firebaseUser.uid}
                        />
                    ))}
                </div>
            );
        }
    };

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'} `}>
            {/* Removed sticky, top-0, z-40 for header overlap fix */}
            <header className={`border-b ${darkMode ? 'bg-gray-900/80 border-gray-800' : 'bg-gray-50/80 border-gray-100'}`}>
                <div className="max-w-6xl mx-auto px-6 py-4">

                    <div className={`flex mt-6 p-1 rounded-xl shadow-inner ${darkMode ? 'bg-gray-800' : 'bg-gray-200'}`}>
                        <button
                            onClick={() => setActiveTab('likes')}
                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${activeTab === 'likes'
                                    ? darkMode ? 'bg-blue-600 text-white shadow' : 'bg-blue-500 text-white shadow'
                                    : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <ThumbsUp className="w-4 h-4" />
                            <span>Most Liked</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('bookmarks')}
                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${activeTab === 'bookmarks'
                                    ? darkMode ? 'bg-blue-600 text-white shadow' : 'bg-blue-500 text-white shadow'
                                    : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <Bookmark className="w-4 h-4" />
                            <span>Most Bookmarked</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('tags')}
                            className={`flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
                                ${activeTab === 'tags'
                                    ? darkMode ? 'bg-blue-600 text-white shadow' : 'bg-blue-500 text-white shadow'
                                    : darkMode ? 'text-gray-300 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-300'
                                }`}
                        >
                            <Hash className="w-4 h-4" />
                            <span>Trending Tags</span>
                        </button>
                    </div>
                </div>
            </header>

            <div className="max-w-6xl mx-auto px-6 py-8">
                {renderContent()}
            </div>
        </div>
    );
};

export default Trending;