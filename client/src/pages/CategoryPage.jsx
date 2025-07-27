/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import BlogCard from '../components/BlogCard';
import { useTheme } from '../App';

const CategoryPage = () => {
    const { name } = useParams();
    const { firebaseUser } = useAuth();
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const { darkMode } = useTheme();
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                setLoading(true);
                const token = await firebaseUser.getIdToken();
                const res = await axios.get(`/api/categories/slug/${name}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setBlogs(res.data);
            } catch (err) {
                setError('Failed to fetch blogs in this category.');
            } finally {
                setLoading(false);
            }
        };
        if (firebaseUser) fetchBlogs();
    }, [name, firebaseUser]);

    return (
        <div className={`min-h-screen relative transition-all duration-500 ${darkMode
                ? 'bg-gradient-to-br from-slate-900 via-gray-900 to-slate-800'
                : 'bg-gradient-to-br from-blue-50 via-white to-indigo-50'
            } `}>
            {/* Floating Background Shapes */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className={`absolute top-20 left-10 w-32 h-32 rounded-full blur-2xl opacity-30 animate-pulse ${darkMode ? 'bg-blue-600' : 'bg-blue-200'
                    }`}></div>
                <div className={`absolute top-40 right-20 w-24 h-24 rounded-full blur-xl opacity-40 animate-bounce ${darkMode ? 'bg-purple-600' : 'bg-purple-200'
                    }`} style={{ animationDuration: '3s' }}></div>
                <div className={`absolute bottom-32 left-1/4 w-16 h-16 rounded-full blur-lg opacity-50 animate-ping ${darkMode ? 'bg-cyan-500' : 'bg-cyan-300'
                    }`} style={{ animationDuration: '4s' }}></div>
            </div>

            {/* Header with Glass Effect */}
            <div className={`relative z-10 backdrop-blur-sm border-b transition-all duration-300 ${darkMode
                    ? 'bg-gray-900/80 border-gray-700/50'
                    : 'bg-white/80 border-gray-200/50'
                }`}>
               
            </div>
            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={`rounded-2xl p-6 animate-pulse ${darkMode ? 'bg-gray-800/50' : 'bg-white/70'
                                } backdrop-blur-sm border ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                                }`}>
                                <div className="flex items-center space-x-3 mb-4">
                                    <div className={`w-10 h-10 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}></div>
                                    <div className={`h-4 w-24 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}></div>
                                </div>
                                <div className={`h-7 w-5/6 rounded mb-3 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}></div>
                                <div className={`h-4 w-full rounded mb-2 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}></div>
                                <div className={`h-4 w-3/4 rounded mb-6 ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                    }`}></div>
                                <div className="flex items-center justify-between">
                                    <div className={`h-6 w-16 rounded-full ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}></div>
                                    <div className={`h-4 w-20 rounded ${darkMode ? 'bg-gray-700' : 'bg-gray-200'
                                        }`}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {error && (
                    <div className={`max-w-lg mx-auto rounded-2xl p-8 text-center backdrop-blur-sm border ${darkMode
                            ? 'bg-red-900/20 border-red-700/50 text-red-300'
                            : 'bg-red-50/80 border-red-200/50 text-red-700'
                        }`}>
                        <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${darkMode ? 'bg-red-800/30' : 'bg-red-100'
                            }`}>
                            <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold mb-2">Oops! Something went wrong</h3>
                        <p>{error}</p>
                    </div>
                )}
                {blogs.length === 0 && !loading && !error && (
                    <div className="text-center py-16">
                        <div className={`w-24 h-24 mx-auto mb-6 rounded-2xl flex items-center justify-center ${darkMode
                                ? 'bg-gradient-to-br from-gray-700 to-gray-600'
                                : 'bg-gradient-to-br from-gray-100 to-gray-200'
                            }`}>
                            <svg className={`w-12 h-12 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-gray-200' : 'text-gray-800'
                            }`}>
                            No articles found
                        </h3>
                        <p className={`${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            This category is empty. New articles will appear here soon!
                        </p>
                    </div>
                )}
                {blogs.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                        {blogs.map((blog, index) => (
                            <div
                                key={blog._id}
                                // className={`group transform transition-all duration-500 hover:scale-[1.02] ${darkMode
                                //         ? 'hover:shadow-2xl hover:shadow-blue-900/25'
                                //         : 'hover:shadow-2xl hover:shadow-gray-900/15'
                                //     }`}
                               >
                                <BlogCard blog={blog} darkMode={darkMode} />
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* CSS Animation */}
            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
};

export default CategoryPage;