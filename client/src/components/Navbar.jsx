/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import { Menu, X, Sun, Moon, Settings, User, LogOut, Bell, Search, ChevronRight } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../App';
import axios from 'axios';
import debounce from 'lodash.debounce';
import NotificationDropdown from './Notification';

const getBreadcrumbs = (pathname) => {
    const routes = {
        '/': [{ label: 'Dashboard', to: '/' }],
        '/write': [{ label: 'Dashboard', to: '/' }, { label: 'Write', to: '/write' }],
        '/my-blogs': [{ label: 'Dashboard', to: '/' }, { label: 'My Blogs', to: '/my-blogs' }],
        '/liked': [{ label: 'Dashboard', to: '/' }, { label: 'Liked Posts', to: '/liked' }],
        '/bookmarks': [{ label: 'Dashboard', to: '/' }, { label: 'Bookmarks', to: '/bookmarks' }],
        '/trending': [{ label: 'Dashboard', to: '/' }, { label: 'Trending', to: '/trending' }],
        '/following': [{ label: 'Dashboard', to: '/' }, { label: 'Following', to: '/following' }],
        '/profile': [{ label: 'Dashboard', to: '/' }, { label: 'Profile', to: '/profile' }],
        '/settings': [{ label: 'Dashboard', to: '/' }, { label: 'Settings', to: '/settings' }],
        '/admin': [{ label: 'Dashboard', to: '/' }, { label: 'Admin Panel', to: '/admin' }],
    };

    if (pathname.startsWith('/blog/')) {
        return [
            { label: 'Dashboard', to: '/' },
            { label: 'Blog Details' }
        ];
    }
    if (pathname.startsWith('/category/')) {
        const category = pathname.split('/')[2];
        return [
            { label: 'Dashboard', to: '/' },
            { label: 'Categories', to: '/categories' },
            { label: category.charAt(0).toUpperCase() + category.slice(1) }
        ];
    }
    if (pathname.startsWith('/edit-blog/')) {
        return [
            { label: 'Dashboard', to: '/' },
            { label: 'My Blogs', to: '/my-blogs' },
            { label: 'Edit Blog' }
        ];
    }

    return routes[pathname] || [{ label: 'Dashboard', to: '/' }];
};

export default function Navbar({
    sidebarOpen,
    setSidebarOpen,
    sidebarCollapsed,
    setSidebarCollapsed
}) {
    const { darkMode, setDarkMode } = useTheme();
    const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [showResults, setShowResults] = useState(false);
    const [isToggling, setIsToggling] = useState(false);
    const dropdownRef = useRef(null);
    const location = useLocation();
    const navigate = useNavigate();
    const { firebaseUser, mongoUser, logout } = useAuth(); // Get mongoUser

    const breadcrumbs = getBreadcrumbs(location.pathname);

    const stripHtmlTags = (html) => {
        if (!html) return '';
        return html.replace(/<[^>]*>/g, '').trim();
    };
    const debouncedSearch = useRef(
        debounce(async (query) => {
            if (!query || query.trim().length === 0) {
                setSearchResults([]);
                setShowResults(false);
                return;
            }
            try {
                const res = await axios.get(`/api/blogs?search=${encodeURIComponent(query.trim())}`);
                setSearchResults(res.data);
                setShowResults(true);
            } catch {
                setSearchResults([]);
                setShowResults(false);
            }
        }, 400)
    ).current;

    const handleSearch = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedSearch(value);
    };

    const handleResultClick = (blogId) => {
        setShowResults(false);
        setSearchTerm('');
        navigate(`/blog/${blogId}`);
    };
    const handleThemeToggle = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        setIsToggling(true);
        setTimeout(() => setIsToggling(false), 300);
        document.documentElement.classList.toggle("dark", newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
    };
    const handleLogout = async () => {
        try {
            await logout();
            navigate('/auth');
            setProfileDropdownOpen(false);
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setProfileDropdownOpen(false);
            }
            if (!event.target.closest('.search-container')) {
                setShowResults(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        setSearchTerm('');
        setSearchResults([]);
        setShowResults(false);
    }, [location.pathname]);

    const profileMenuItems = [
        { label: 'Profile', icon: User, to: `/profile/${mongoUser?._id}` }, // Link to current user's profile
        { label: 'Settings', icon: Settings, to: '/settings' },
        { label: 'Logout', icon: LogOut, action: 'logout', danger: true }
    ];

    // Determine the profile picture to display
    const userProfilePic = mongoUser?.profilePicture || mongoUser?.avatar;
    const userDisplayName = mongoUser?.displayName || mongoUser?.name || firebaseUser?.displayName || 'User';
    const userHandle = mongoUser?.email?.split('@')[0] || 'user';


    return (
        <>
            <nav className={`fixed top-2 right-4 z-40 rounded-2xl backdrop-blur-xl shadow-2xl transition-all duration-300 ${sidebarCollapsed ? 'left-20' : 'left-68'
                } ${darkMode
                    ? 'bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-gray-700/50 shadow-black/20'
                    : 'bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 border border-gray-200/50 shadow-gray-900/10'
                }`}>
                <div className="px-4 sm:px-6 lg:px-8 py-1">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center space-x-4">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className={`lg:hidden p-2 rounded-lg transition-all duration-200 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                            >
                                {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                            </button>

                            <nav className="flex items-center space-x-2">
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={index} className="flex items-center">
                                        {crumb.to ? (
                                            <Link to={crumb.to} className={`text-sm font-medium transition-colors cursor-pointer ${index === breadcrumbs.length - 1
                                                ? darkMode ? 'text-blue-400' : 'text-blue-600'
                                                : darkMode ? 'text-gray-400 hover:text-gray-300' : 'text-gray-600 hover:text-gray-800'}`}>{crumb.label}</Link>
                                        ) : (
                                            <span className={`text-sm font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>{crumb.label}</span>
                                        )}
                                        {index < breadcrumbs.length - 1 && (
                                            <ChevronRight className={`w-4 h-4 mx-2 ${darkMode ? 'text-gray-600' : 'text-gray-400'}`} />
                                        )}
                                    </div>
                                ))}
                            </nav>
                        </div>

                        {/* Search Bar */}
                        <div className="flex-1 max-w-md mx-4 relative search-container">
                            <div className="relative">
                                <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 transition-colors ${searchFocused
                                    ? 'text-blue-500'
                                    : darkMode ? 'text-gray-400' : 'text-gray-500'
                                    }`} />
                                <input
                                    type="text"
                                    placeholder="Search blogs..."
                                    value={searchTerm}
                                    onFocus={() => { setSearchFocused(true); setShowResults(true); }}
                                    onBlur={() => setSearchFocused(false)}
                                    onChange={handleSearch}
                                    className={`w-full pl-10 pr-4 py-2.5 rounded-xl border-2 transition-all duration-200 ${searchFocused
                                        ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-lg'
                                        : darkMode
                                            ? 'border-gray-700 bg-gray-800 text-white placeholder-gray-400'
                                            : 'border-gray-300 bg-white text-gray-900 placeholder-gray-500'
                                        } focus:outline-none`}
                                />
                            </div>

                            {/* Floating Search Dropdown */}
                            {showResults && (
                                <div className={`absolute left-0 right-0 mt-2 rounded-2xl backdrop-blur-xl shadow-2xl z-50 max-h-72 overflow-y-auto transform transition-all duration-300 ease-out ${showResults ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
                                    } ${darkMode
                                        ? 'bg-gray-800/95 border border-gray-700/50 shadow-black/20'
                                        : 'bg-white/95 border border-gray-200/50 shadow-gray-900/10'
                                    }`}>
                                    {searchResults.length === 0 && searchTerm.length > 0 ? (
                                        <div className="px-6 py-4 text-center">
                                            <div className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                No results found for "{stripHtmlTags(searchTerm)}"
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="py-2">
                                            {searchResults.map((blog, index) => (
                                                <div
                                                    key={blog._id}
                                                    className={`mx-2 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 transform hover:scale-[1.02] ${darkMode
                                                        ? 'hover:bg-blue-900/30 text-white'
                                                        : 'hover:bg-blue-50 text-gray-900'
                                                        } ${index !== searchResults.length - 1 ? 'mb-1' : ''}`}
                                                    onMouseDown={() => handleResultClick(blog._id)}
                                                >
                                                    <div className={`font-semibold text-sm line-clamp-1 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                                        {stripHtmlTags(blog.title)}
                                                    </div>
                                                    {blog.tags && (
                                                        <div className="flex flex-wrap gap-1 mt-1">
                                                            {blog.tags.slice(0, 3).map((tag, i) => (
                                                                <span key={i} className="text-xs px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400">
                                                                    {stripHtmlTags(tag)}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    <div className={`text-xs mt-1 line-clamp-2 ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                                        {stripHtmlTags(blog.content)?.slice(0, 100)}...
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Right side actions */}
                        <div className="flex items-center space-x-3">
                            <NotificationDropdown darkMode={darkMode} />

                            {/* Smooth Dark mode toggle */}
                            <button
                                onClick={handleThemeToggle}
                                disabled={isToggling}
                                className={`p-2.5 rounded-xl transition-all duration-300 hover:scale-105 ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                    } ${isToggling ? 'animate-pulse' : ''}`}
                            >
                                <div className={`transition-all duration-300 ${isToggling ? 'rotate-180' : ''}`}>
                                    {darkMode ? (
                                        <Sun className="w-5 h-5 text-yellow-400" />
                                    ) : (
                                        <Moon className="w-5 h-5 text-gray-700" />
                                    )}
                                </div>
                            </button>

                            {/* Floating Profile dropdown */}
                            <div className="relative" ref={dropdownRef}>
                                <button
                                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                                    className={`flex items-center space-x-3 p-2 rounded-xl transition-all duration-200 hover:scale-105 ${profileDropdownOpen
                                        ? 'ring-2 ring-blue-500/20 bg-blue-50 dark:bg-blue-900/20'
                                        : darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'
                                        }`}
                                >
                                    {userProfilePic ? (
                                        <img
                                            src={userProfilePic}
                                            alt="Profile"
                                            className="w-8 h-8 rounded-full ring-2 ring-white dark:ring-gray-800 shadow-md object-cover"
                                        />
                                    ) : (
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0
                                            ${darkMode ? 'bg-blue-600 text-blue-100' : 'bg-blue-100 text-blue-600'}`}
                                        >
                                            {userDisplayName?.charAt(0).toUpperCase()}
                                        </div>
                                    )}
                                    <div className="hidden sm:block text-left">
                                        <p className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            {userDisplayName}
                                        </p>
                                        <p className={`text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                            @{userHandle}
                                        </p>
                                    </div>
                                </button>

                                {/* Floating Profile Menu */}
                                {profileDropdownOpen && (
                                    <div className={`absolute right-0 mt-2 w-56 rounded-2xl backdrop-blur-xl shadow-2xl z-50 transform transition-all duration-300 ease-out ${profileDropdownOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-4 scale-95'
                                        } ${darkMode
                                            ? 'bg-gray-800/95 border border-gray-700/50 shadow-black/20'
                                            : 'bg-white/95 border border-gray-200/50 shadow-gray-900/10'
                                        }`}>
                                        <div className="py-2">
                                            {profileMenuItems.map((item, index) => (
                                                <div key={index} className="px-2">
                                                    {item.action === 'logout' ? (
                                                        <button
                                                            onClick={handleLogout}
                                                            className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] ${item.danger
                                                                ? 'text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600'
                                                                : darkMode
                                                                    ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                                    : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                                }`}
                                                        >
                                                            <item.icon className="w-4 h-4" />
                                                            <span>{item.label}</span>
                                                        </button>
                                                    ) : (
                                                        <Link
                                                            to={item.to}
                                                            onClick={() => setProfileDropdownOpen(false)}
                                                            className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 transform hover:scale-[1.02] ${darkMode
                                                                ? 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                                                : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                                                                }`}
                                                        >
                                                            <item.icon className="w-4 h-4" />
                                                            <span>{item.label}</span>
                                                        </Link>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </nav>
        </>
    );
}