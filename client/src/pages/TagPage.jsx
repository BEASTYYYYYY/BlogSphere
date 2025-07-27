import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import BlogCard from '../components/BlogCard';
import { useTheme } from '../App';
import { Frown, ArrowLeft } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const TagPage = () => {
    const { name } = useParams();
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const showFamous = searchParams.get('famous') === '1';
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { darkMode } = useTheme();

    useEffect(() => {
        const fetchBlogs = async () => {
            setLoading(true);
            setError(null);
            try {
                const endpoint = showFamous
                    ? `${API_BASE_URL}/blogs/tag/${name}/most-liked`
                    : `${API_BASE_URL}/blogs/tag/${name}`;
                const res = await axios.get(endpoint);
                setBlogs(Array.isArray(res.data) ? res.data : [res.data]);
            } catch (err) {
                setError('Failed to load blogs for this tag', err);
            } finally {
                setLoading(false);
            }
        };
        fetchBlogs();
    }, [name, showFamous]);

    const handleBackToTrending = () => {
        navigate('/trending');
    };

    if (loading) return <p className="p-8 pt-24">Loading...</p>;
    if (error) return <p className="p-8 pt-24 text-red-500">{error}</p>;
    if (blogs.length === 0) return (
        <div className="text-center p-10 pt-24">
            <Frown className="w-10 h-10 mx-auto text-blue-500 mb-4" />
            <p>No blogs found for tag: <strong>{name}</strong></p>
            <button
                onClick={handleBackToTrending}
                className={`mt-6 flex items-center gap-2 mx-auto px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${darkMode
                        ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white border border-gray-600'
                        : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 border border-gray-200'
                    }`}
            >
                <ArrowLeft size={18} />
                Back to Trending
            </button>
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 pt-24">
            {/* Back Button */}
            <div className="mb-6">
                <button
                    onClick={handleBackToTrending}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 shadow-lg hover:shadow-xl ${darkMode
                            ? 'bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white border border-gray-600'
                            : 'bg-gradient-to-r from-blue-50 to-indigo-50 hover:from-blue-100 hover:to-indigo-100 text-gray-700 border border-gray-200'
                        }`}
                >
                    <ArrowLeft size={18} />
                    Back to Trending
                </button>
            </div>

            {/* Page Title */}
            <h1 className="text-2xl font-bold mb-6">
                {showFamous ? (
                    <>
                        Most Famous Blogs tagged with <span className="text-blue-500">#{name}</span>
                    </>
                ) : (
                    <>
                        Blogs tagged with <span className="text-blue-500">#{name}</span>
                    </>
                )}
            </h1>

            {/* Blogs Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {blogs.map(blog => (
                    <BlogCard key={blog._id} blog={blog} darkMode={darkMode} />
                ))}
            </div>
        </div>
    );
};

export default TagPage;