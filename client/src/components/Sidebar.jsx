/* eslint-disable no-unused-vars */
// Enhanced Floating Sidebar with smooth animations and gradients
import React, { useEffect, useRef, useState } from 'react';
import {
    Home, PenTool, BookOpen, Heart, Bookmark, TrendingUp,
    Users, ChevronLeft, ChevronRight, Plus, Sparkles, Settings, // Import UserShield for Admin link
} from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useCategory } from '../context/CategoryContext';
import { useTheme } from '../App';
import { useAppSettings } from '../context/AppSettingsContext'; // Correct import path assuming context is separate
import { useAuth } from '../context/AuthContext';

const mainNavItems = [
    { label: 'Feed', icon: Home, to: '/user' },
    { label: 'Write', icon: PenTool, to: '/write' },
    { label: 'My Blogs', icon: BookOpen, to: '/my-blogs' },
    { label: 'Liked Posts', icon: Heart, to: '/liked' },
    { label: 'Bookmarks', icon: Bookmark, to: '/bookmarks' },
    { label: 'Trending', icon: TrendingUp, to: '/trending' },
    { label: 'Following', icon: Users, to: '/following' },
];

const slugify = (str) => str.toLowerCase().replace(/\s+/g, '-');

const Sidebar = ({ isCollapsed, setIsCollapsed, isSidebarOpen, setIsSidebarOpen }) => {
    const location = useLocation();
    const navigate = useNavigate();
    const { topCategories } = useCategory();
    const [showAllCategories, setShowAllCategories] = useState(false);
    const fullPanelRef = useRef(null);
    const { darkMode } = useTheme();
    const { isAdmin } = useAppSettings(); // Removed siteTitle
    const currentPath = location.pathname === '/' ? '/user' : location.pathname;

    const isActiveRoute = (routePath) => currentPath === routePath || (routePath === '/user' && currentPath === '/');
    const isActiveCategory = (name) => currentPath === `/category/${slugify(name)}`;
    const isCategorySection = currentPath.startsWith('/category/');

    const displayedCategories = Array.isArray(topCategories) ? topCategories.slice(0, 5) : [];

    useEffect(() => {
        if (isSidebarOpen) {
            setIsSidebarOpen(false);
        }
    }, [location.pathname, isSidebarOpen, setIsSidebarOpen]);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (fullPanelRef.current && !fullPanelRef.current.contains(e.target)) {
                setShowAllCategories(false);
            }
        };
        if (showAllCategories) document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [showAllCategories]);

    return (
        <>
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            <aside className={`fixed top-2 z-50 transition-all duration-500 ease-in-out
                ${isCollapsed ? 'w-16 left-2' : 'w-64 left-2'}
                ${isSidebarOpen ? 'left-2' : '-left-full md:left-2'} md:h-[calc(100vh-1rem)] md:top-2 md:block
            `}>
                <div className={`h-full rounded-2xl shadow-2xl backdrop-blur-xl transition-all duration-500 ease-in-out ${darkMode
                    ? 'bg-gradient-to-br from-gray-900/90 via-gray-800/90 to-gray-900/90 border border-gray-700/50'
                    : 'bg-gradient-to-br from-white/90 via-gray-50/90 to-white/90 border border-gray-200/50'
                    }`}>
                    <div className="flex flex-col h-full">
                        <div className={`flex items-center justify-between p-4 ${darkMode ? 'border-b border-gray-700/50' : 'border-b border-gray-200/50'
                            }`}>
                            {!isCollapsed && (
                                <div className="flex items-center space-x-3">
                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 via-purple-600 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                                        <Sparkles className="w-5 h-5 text-white" />
                                    </div>
                                    <div>
                                        <h1 className={`font-bold text-lg transition-colors duration-300 ${darkMode ? 'text-white' : 'text-gray-900'
                                            }`}>BlogSphere</h1> {/* Changed to hardcoded "BlogSphere" or your site's default name */}
                                        <p className={`text-xs transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>Your creative space</p>
                                    </div>
                                </div>
                            )}
                            <button
                                onClick={() => setIsCollapsed(!isCollapsed)}
                                className={`p-2 rounded-lg transition-all duration-300 hover:scale-105 ${darkMode
                                    ? 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
                                    : 'hover:bg-gray-100/50 text-gray-600 hover:text-gray-900'
                                    }`}
                            >
                                {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
                            </button>
                        </div>

                        <div className="flex-[2] overflow-y-auto p-4">
                            {!isCollapsed && (
                                <h2 className={`text-xs font-semibold uppercase tracking-widest mb-4 transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`}>Navigation</h2>
                            )}
                            <nav className="space-y-2">
                                {mainNavItems.map(item => {
                                    const isActive = isActiveRoute(item.to) && !isCategorySection;
                                    return (
                                        <Link
                                            key={item.to}
                                            to={item.to}
                                            className={`group flex items-center px-3 py-3 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] ${isActive
                                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                                                : darkMode
                                                    ? 'text-gray-300 hover:bg-gray-800/50 hover:text-white'
                                                    : 'text-gray-700 hover:bg-gray-100/50 hover:text-gray-900'
                                                }`}
                                            title={isCollapsed ? item.label : ''}
                                        >
                                            <item.icon className={`w-5 h-5 ${isCollapsed ? 'mx-auto' : 'mr-3'} flex-shrink-0`} />
                                            {!isCollapsed && <span className="flex-1 transition-all duration-300">{item.label}</span>}
                                        </Link>
                                    );
                                })}

                               
                                {isAdmin && (
                                    <button
                                        onClick={() => navigate('/admin')}
                                        className={`w-full flex items-center space-x-3 px-3 py-3 mt-4 rounded-xl font-medium transition-all duration-300 transform hover:scale-[1.02] ${darkMode
                                            ? 'text-blue-400 hover:bg-gray-800/50 hover:text-blue-300'
                                            : 'text-blue-600 hover:bg-blue-100/50 hover:text-blue-700'
                                            }`}
                                        title={isCollapsed ? 'Admin Dashboard' : ''}
                                    >
                                        
                                        {!isCollapsed && <span className="flex-1 transition-all duration-300">Go to Admin Dashboard</span>}
                                    </button>
                                )}
                            </nav>
                        </div>

                        {/* Categories */}
                        {!isCollapsed && (
                            <div className={`flex-[0.8] p-4 border-t transition-colors duration-300 ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                                }`}>
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className={`text-xs font-semibold uppercase tracking-widest transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                        }`}>Categories</h2>
                                    <button
                                        onClick={() => setShowAllCategories(true)}
                                        className={`p-1.5 rounded-lg transition-all duration-300 hover:scale-110 ${darkMode
                                            ? 'hover:bg-gray-800/50 text-gray-400 hover:text-white'
                                            : 'hover:bg-gray-100/50 text-gray-600 hover:text-gray-900'
                                            }`}
                                        title="View All Categories"
                                    >
                                        <Plus className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                                <div className="space-y-1.5">
                                    {displayedCategories.length === 0 ? (
                                        <p className={`text-sm transition-colors duration-300 ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>No categories available</p>
                                    ) : (
                                        displayedCategories.map((category) => {
                                            const isActive = isActiveCategory(category.name);
                                            return (
                                                <Link
                                                    key={category.name}
                                                    to={`/category/${slugify(category.name)}`}
                                                    className={`group flex items-center px-3 py-2 rounded-lg transition-all duration-300 hover:scale-[1.02] ${isActive
                                                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                                                        : darkMode
                                                            ? 'hover:bg-gray-800/50 text-gray-300 hover:text-white'
                                                            : 'hover:bg-gray-100/50 text-gray-700 hover:text-gray-900'
                                                        }`}
                                                >
                                                    <div className="flex items-center flex-1">
                                                        <div className={`w-2.5 h-2.5 rounded-full mr-3 flex-shrink-0 transition-all duration-300 ${isActive ? 'bg-white/80' : category.color || 'bg-gray-500'
                                                            }`} />
                                                        <span className={`flex-1 text-sm capitalize ${isActive ? 'font-semibold' : 'font-medium'
                                                            }`}>{category.name}</span>
                                                    </div>
                                                    <span className={`px-2 py-0.5 text-xs rounded-full font-medium transition-all duration-300 ${isActive
                                                        ? 'bg-white/20 text-white'
                                                        : darkMode
                                                            ? 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                                                            : 'bg-gray-200 text-gray-600 group-hover:bg-gray-300'
                                                        }`}>{category.count}</span>
                                                </Link>
                                            );
                                        })
                                    )}
                                </div>

                                {/* All Categories Modal */}
                                {showAllCategories && (
                                    <div
                                        ref={fullPanelRef}
                                        className={`fixed top-20 left-72 w-64 max-h-[80vh] overflow-y-auto rounded-xl z-[999] shadow-2xl transition-all duration-300 ${darkMode
                                            ? 'bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 text-white border border-gray-700/50'
                                            : 'bg-gradient-to-br from-white/95 via-gray-50/95 to-white/95 text-gray-900 border border-gray-200/50'
                                            }`}
                                    >
                                        <div className={`p-4 font-semibold text-sm border-b flex justify-between items-center transition-colors duration-300 ${darkMode ? 'border-gray-700/50' : 'border-gray-200/50'
                                            }`}>
                                            <span>All Categories</span>
                                            <button
                                                onClick={() => setShowAllCategories(false)}
                                                className="text-xs text-red-400 hover:text-red-600 transition-colors duration-300"
                                            >
                                                Close
                                            </button>
                                        </div>
                                        <div className="p-4 space-y-2">
                                            {Array.isArray(topCategories) && topCategories.map((category) => (
                                                <Link
                                                    key={category.name}
                                                    to={`/category/${slugify(category.name)}`}
                                                    className={`block px-3 py-2 rounded-lg text-sm transition-all duration-300 hover:scale-105 ${isActiveCategory(category.name)
                                                        ? 'bg-blue-500 text-white'
                                                        : darkMode
                                                            ? 'hover:bg-gray-800/50 text-gray-300'
                                                            : 'hover:bg-gray-100/50 text-gray-800'
                                                        }`}
                                                    onClick={() => setShowAllCategories(false)}
                                                >
                                                    {category.name}
                                                </Link>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </aside>
        </>
    );
};

export default Sidebar;