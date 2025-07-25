/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react';
import {
    Sparkles, PenTool, Heart, BookOpen, Coffee,
    Sun, Moon
} from 'lucide-react';
import LoginForm from './Login';
import axios from 'axios';
import SignupForm from './SignUp';
import { signInWithGoogle } from '../utils/googleAuth';

export default function AuthPage() {
    const [isLogin, setIsLogin] = useState(true);
    const [darkMode, setDarkMode] = useState(false);
    const [floatingElements, setFloatingElements] = useState([]);

    useEffect(() => {
        const elements = [];
        for (let i = 0; i < 20; i++) {
            elements.push({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                size: Math.random() * 8 + 4,
                delay: Math.random() * 5,
                duration: Math.random() * 10 + 10
            });
        }
        setFloatingElements(elements);
    }, []);

    const handleGoogleAuth = async () => {
        try {
            const user = await signInWithGoogle();
            const token = await user.getIdToken();
            await axios.post('/api/auth/login', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
        } catch (err) {
            console.error(err.message);
        }
      };

    const FloatingIcon = ({ icon: Icon, className, style }) => (
        <div className={`absolute opacity-20 animate-pulse ${className}`} style={style}>
            <Icon className="w-6 h-6" />
        </div>
    );

    return (
        <div className={`min-h-screen transition-all duration-500 relative overflow-hidden ${darkMode
            ? 'bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900'
            : 'bg-gradient-to-br from-blue-50 via-white to-purple-50'
            }`}>
            {/* Animated Background */}
            <div className="absolute inset-0 overflow-hidden">
                {floatingElements.map((el) => (
                    <div
                        key={el.id}
                        className={`absolute w-2 h-2 rounded-full animate-bounce ${darkMode ? 'bg-white/10' : 'bg-blue-200/30'}`}
                        style={{
                            left: `${el.x}%`,
                            top: `${el.y}%`,
                            animationDelay: `${el.delay}s`,
                            animationDuration: `${el.duration}s`
                        }}
                    />
                ))}
                <FloatingIcon icon={PenTool} className="top-20 left-20 text-blue-300" style={{ animationDelay: '0s' }} />
                <FloatingIcon icon={Heart} className="top-40 right-32 text-pink-300" style={{ animationDelay: '2s' }} />
                <FloatingIcon icon={BookOpen} className="bottom-32 left-16 text-green-300" style={{ animationDelay: '4s' }} />
                <FloatingIcon icon={Coffee} className="bottom-20 right-20 text-yellow-300" style={{ animationDelay: '1s' }} />
            </div>

            {/* Theme Toggle */}
            <button
                onClick={() => setDarkMode(!darkMode)}
                className={`fixed top-6 right-6 z-20 p-3 rounded-full transition-all duration-300 hover:scale-110 ${darkMode
                    ? 'bg-white/10 text-yellow-300 hover:bg-white/20'
                    : 'bg-gray-900/10 text-gray-700 hover:bg-gray-900/20'
                    }`}>
                {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>

            {/* Auth Content */}
            <div className="flex items-center justify-center min-h-screen p-4">
                <div className="w-full max-w-md">
                    {/* Brand */}
                    <div className="text-center mb-8">
                        <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-4 ${darkMode ? 'bg-white/10' : 'bg-blue-500'}`}>
                            <Sparkles className="w-8 h-8 text-white" />
                        </div>
                        <h1 className={`text-3xl font-bold mb-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>BlogSphere</h1>
                        <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Your stories, beautifully crafted</p>
                    </div>

                    {/* Card */}
                    <div className={`backdrop-blur-xl rounded-3xl p-8 shadow-2xl border transition-all duration-300 ${darkMode
                        ? 'bg-white/10 border-white/20'
                        : 'bg-white/80 border-white/50'
                        }`}>
                        {/* Tabs */}
                        <div className={`flex rounded-2xl p-1 mb-8 ${darkMode ? 'bg-white/10' : 'bg-gray-100'}`}>
                            <button
                                onClick={() => setIsLogin(true)}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${isLogin
                                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                                    : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                Sign In
                            </button>
                            <button
                                onClick={() => setIsLogin(false)}
                                className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 ${!isLogin
                                    ? 'bg-blue-500 text-white shadow-lg scale-105'
                                    : darkMode ? 'text-gray-300 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                                Sign Up
                            </button>
                        </div>

                        {/* Google Button */}
                        <button
                            onClick={handleGoogleAuth}
                            className={`w-full flex items-center justify-center space-x-3 py-4 px-6 rounded-2xl font-medium hover:scale-105 mb-6 transition-all duration-300 ${darkMode
                                ? 'bg-white/10 hover:bg-white/20 text-white border border-white/20'
                                : 'bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 shadow-md'}`}>
                            <svg className="w-5 h-5" viewBox="0 0 24 24">
                                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                            </svg>
                            <span>Continue with Google</span>
                        </button>

                        {/* Divider */}
                        <div className="relative mb-6">
                            <div className={`absolute inset-0 flex items-center ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <div className={`w-full border-t ${darkMode ? 'border-white/20' : 'border-gray-300'}`} />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className={`px-4 ${darkMode ? 'bg-gray-800/50 text-gray-300' : 'bg-white text-gray-500'}`}>
                                    or continue with email
                                </span>
                            </div>
                        </div>

                        {/* Form */}
                        {isLogin
                            ? <LoginForm darkMode={darkMode} />
                            : <SignupForm darkMode={darkMode} />
                        }

                        {/* Footer switch */}
                        <div className="mt-8 text-center">
                            <p className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                                {isLogin ? "Don't have an account?" : "Already have an account?"}
                                <button
                                    onClick={() => setIsLogin(!isLogin)}
                                    className={`font-medium ml-1 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'}`}>
                                    {isLogin ? 'Sign up' : 'Sign in'}
                                </button>
                            </p>
                        </div>
                    </div>

                    {/* Terms */}
                    <p className={`text-center text-xs mt-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        By continuing, you agree to our{' '}
                        <a href="#" className={`underline ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Terms of Service</a>{' '}
                        and{' '}
                        <a href="#" className={`underline ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Privacy Policy</a>.
                    </p>
                </div>
            </div>
        </div>
    );
}
