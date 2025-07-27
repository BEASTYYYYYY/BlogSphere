import React, { useState, } from 'react';
import { Sun, Moon, Sparkles } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../App';

const LandingPageNavbar = () => {
    const { darkMode, setDarkMode } = useTheme();
    const { mongoUser } = useAuth(); // Get mongoUser to check auth status
    const navigate = useNavigate();
    const [isToggling, setIsToggling] = useState(false);

    const handleThemeToggle = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        setIsToggling(true);
        setTimeout(() => setIsToggling(false), 300);
        document.documentElement.classList.toggle("dark", newMode);
        localStorage.setItem("theme", newMode ? "dark" : "light");
    };

    return (
        <nav className={`fixed top-2 right-4 z-40 rounded-2xl backdrop-blur-xl shadow-2xl transition-all duration-300 left-4
            ${darkMode
                ? 'bg-gradient-to-r from-gray-900/95 via-gray-800/95 to-gray-900/95 border border-gray-700/50 shadow-black/20'
                : 'bg-gradient-to-r from-white/95 via-gray-50/95 to-white/95 border border-gray-200/50 shadow-gray-900/10'
            }`}>
            <div className="px-4 sm:px-6 lg:px-8 py-1">
                <div className="flex items-center justify-between h-16">
                    {/* Brand/Logo */}
                    <Link to="/" className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        <h1 className="text-xl lg:text-2xl font-bold">BlogSphere</h1>
                    </Link>

                    {/* Right side actions */}
                    <div className="flex items-center space-x-3">
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

                        {/* Conditional Sign Up / Sign In buttons */}
                        {!mongoUser && ( // Only show if user is NOT logged in
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => navigate('/auth')}
                                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors duration-200 shadow-md"
                                >
                                    Sign In
                                </button>
                                <button
                                    onClick={() => navigate('/auth')}
                                    className={`px-4 py-2 rounded-xl text-sm font-semibold border-2 ${darkMode ? 'border-blue-500 text-blue-300 hover:bg-blue-900/20' : 'border-blue-600 text-blue-600 hover:bg-blue-50'} transition-colors duration-200 shadow-md`}
                                >
                                    Sign Up
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default LandingPageNavbar;