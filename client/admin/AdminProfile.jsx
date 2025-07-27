/* eslint-disable no-unused-vars */
// AdminProfile.jsx
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth'; // Assuming Firebase Auth is used for token
import { useAuth } from '../src/context/AuthContext'; // Assuming you have an AuthContext for firebaseUser
import {
    UserCog, BarChart2, Settings, Sun, Moon, CheckCircle, XCircle, Edit, Save,
    Users, BookOpen, Bell, ToggleLeft, ToggleRight, Type, Loader2, RefreshCcw,
    Mail, CalendarDays, Info, Activity, Copy, Shield, Clock, Globe,
    Smartphone, Monitor, MapPin, Calendar, Hash, Key, Eye, EyeOff, Download,
    Printer, Layout, Star, StarOff, Trash2, RotateCcw, Palette, Grid,
    List, BarChart, Percent, FileText, Image
} from 'lucide-react';

// Base URL for your backend API
const API_BASE_URL = "http://localhost:5000/api"; // Adjust if your API is hosted elsewhere

export default function AdminProfile() {
    const { firebaseUser } = useAuth(); // Get firebase user from context
    const [adminUser, setAdminUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [siteTitle, setSiteTitle] = useState(''); // Still needed for settings logic if we re-add it elsewhere
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false); // Still needed for settings logic
    const [loading, setLoading] = useState(true);
    const [isEditingSiteTitle, setIsEditingSiteTitle] = useState(false);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'
    const [isUpdatingSettings, setIsUpdatingSettings] = useState(false); // Still needed for settings logic
    const [showAdminId, setShowAdminId] = useState(false);
    const [copySuccess, setCopySuccess] = useState(false);

    // Local features state
    const [profileLayout, setProfileLayout] = useState('grid'); // 'grid' or 'list'
    const [isEditingBio, setIsEditingBio] = useState(false);
    const [editedBio, setEditedBio] = useState('');
    const [isDarkTheme, setIsDarkTheme] = useState(false);
    const [isPreviewMode, setIsPreviewMode] = useState(false);
    const [profileImage, setProfileImage] = useState(null);

    // Function to show feedback messages
    const showFeedback = (message, type) => {
        setFeedbackMessage(message);
        setFeedbackType(type);
        const timer = setTimeout(() => {
            setFeedbackMessage('');
            setFeedbackType('');
        }, 3000); // Message disappears after 3 seconds
        return () => clearTimeout(timer);
    };

    // Function to copy email to clipboard
    const copyEmailToClipboard = async () => {
        if (!adminUser?.email) return;

        try {
            await navigator.clipboard.writeText(adminUser.email);
            setCopySuccess(true);
            showFeedback('Email copied to clipboard!', 'success');
            setTimeout(() => setCopySuccess(false), 2000);
        } catch (err) {
            console.error('Failed to copy email: ', err);
            showFeedback('Failed to copy email to clipboard', 'error');
        }
    };

    // Function to copy profile link to clipboard
    const copyProfileLink = async () => {
        const profileLink = `${window.location.origin}/admin/profile/${adminUser?.id || firebaseUser?.uid}`;
        try {
            await navigator.clipboard.writeText(profileLink);
            showFeedback('Profile link copied to clipboard!', 'success');
        } catch (err) {
            showFeedback('Failed to copy profile link', 'error');
        }
    };

    // Function to handle profile image upload
    const handleImageUpload = (event) => {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setProfileImage(e.target.result);
                showFeedback('Profile image updated (preview only)', 'success');
            };
            reader.readAsDataURL(file);
        }
    };

    // Function to save bio changes
    const saveBioChanges = () => {
        // In a real app, this would save to backend
        setAdminUser(prev => ({ ...prev, bio: editedBio }));
        setIsEditingBio(false);
        showFeedback('Bio updated successfully!', 'success');
    };

    // Function to reset profile data
    const resetProfileData = () => {
        setProfileImage(null);
        setEditedBio('');
        setIsEditingBio(false);
        showFeedback('Profile data reset to defaults', 'success');
    };

    // Function to export profile as text
    const exportProfile = () => {
        const profileData = `
ADMIN PROFILE
=============
Name: ${adminUser?.name || 'N/A'}
Email: ${adminUser?.email || 'N/A'}
Role: ${adminUser?.role || 'N/A'}
Bio: ${adminUser?.bio || editedBio || 'N/A'}
Join Date: ${adminUser?.createdAt ? new Date(adminUser.createdAt).toLocaleDateString() : 'N/A'}

STATISTICS:
- Total Users: ${stats?.users?.total ?? 0}
- Active Users: ${stats?.users?.active ?? 0}
- Total Blogs: ${stats?.blogs?.total ?? 0}
- Published Blogs: ${stats?.blogs?.published ?? 0}

Generated on: ${new Date().toLocaleString()}
        `;

        const blob = new Blob([profileData], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `admin-profile-${new Date().toISOString().split('T')[0]}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        showFeedback('Profile exported successfully!', 'success');
    };
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await getAuth().currentUser.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };

            // Fetch current admin user data
            const userRes = await fetch(`${API_BASE_URL}/users/me`, { headers });
            const userData = await userRes.json();
            if (userRes.ok) {
                setAdminUser(userData);
                setEditedBio(userData.bio || '');
                // Set profile image from MongoDB or null if undefined/null
                setProfileImage(userData.profileImage || null);
            } else {
                showFeedback(`Failed to fetch admin user data: ${userData.error}`, 'error');
            }

            // Fetch admin statistics
            const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
            const statsData = await statsRes.json();
            if (statsRes.ok) {
                setStats(statsData);
            } else {
                showFeedback(`Failed to fetch admin stats: ${statsData.error}`, 'error');
            }

            // Fetch site settings (still needed to maintain state, even if not displayed here)
            const settingsRes = await fetch(`${API_BASE_URL}/admin/settings`, { headers });
            const settingsData = await settingsRes.json();
            if (settingsRes.ok) {
                setSiteTitle(settingsData.siteTitle || '');
                setIsMaintenanceMode(settingsData.maintenanceMode || false);
            } else {
                showFeedback(`Failed to fetch site settings: ${settingsData.error}`, 'error');
            }

        } catch (error) {
            console.error("Error fetching admin profile data:", error);
            showFeedback("Failed to load admin data. Please try again.", 'error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (firebaseUser) {
            fetchData();
        }
    }, [firebaseUser]);


    if (loading) {
        return (
            <div className="p-8 space-y-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 min-h-screen text-gray-900 dark:text-gray-100">
                {/* Header Skeleton */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div className="space-y-2">
                        <div className="h-10 rounded-lg w-64 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                        <div className="h-5 rounded w-48 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    </div>
                </div>

                {/* Feedback Message Skeleton */}
                <div className="h-10 rounded-lg w-full bg-slate-100 dark:bg-slate-800 animate-pulse"></div>

                {/* Profile Card Skeleton */}
                <div className="rounded-2xl p-7 border shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700 animate-pulse">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-24 h-24 rounded-full bg-slate-100 dark:bg-slate-700"></div>
                        <div className="space-y-2">
                            <div className="h-6 rounded w-48 bg-slate-100 dark:bg-slate-700"></div>
                            <div className="h-4 rounded w-32 bg-slate-100 dark:bg-slate-700"></div>
                        </div>
                    </div>
                    <div className="h-4 rounded w-full mb-2 bg-slate-100 dark:bg-slate-700"></div>
                    <div className="h-4 rounded w-3/4 bg-slate-100 dark:bg-slate-700"></div>
                </div>

                {/* Stats Cards Skeleton */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="rounded-2xl p-7 h-32 bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 dark:from-gray-900 dark:via-slate-900 dark:to-indigo-950 min-h-screen text-gray-900 dark:text-gray-100 font-inter">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
                        <UserCog className="w-9 h-9 text-indigo-500" /> Admin Overview
                    </h1>
                    <p className="text-lg mt-2 text-slate-600 dark:text-slate-300">
                        Welcome, {adminUser?.name || 'Administrator'}! Here's your personalized admin profile.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    
                    <button
                        onClick={fetchData}
                        className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                        disabled={loading || isUpdatingSettings}
                    >
                        <RefreshCcw className={`w-5 h-5 ${loading || isUpdatingSettings ? 'animate-spin' : ''}`} /> Refresh Data
                    </button>
                </div>
            </div>

            {/* Feedback Message */}
            {feedbackMessage && (
                <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm ${feedbackType === 'success' ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                    {feedbackType === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <p className="font-medium">{feedbackMessage}</p>
                </div>
            )}

            {/* Local Profile Features */}
            <div className="rounded-2xl p-7 border shadow-xl bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                    <h2 className="text-2xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <Settings className="w-6 h-6 text-slate-500" /> Profile Features
                    </h2>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setProfileLayout(profileLayout === 'grid' ? 'list' : 'grid')}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                            {profileLayout === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
                            {profileLayout === 'grid' ? 'List View' : 'Grid View'}
                        </button>
                        <button
                            onClick={exportProfile}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
                        >
                            <Download className="w-4 h-4" />
                            Export
                        </button>

                        <button
                            onClick={copyProfileLink}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50 transition-colors"
                        >
                            <Copy className="w-4 h-4" />
                            Copy Link
                        </button>
                        <button
                            onClick={resetProfileData}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            Reset
                        </button>
                    </div>
                </div>

                <div className={`grid gap-6 ${profileLayout === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
                    {/* Profile Image Upload */}
                    <div className="rounded-xl p-5 border bg-slate-50 border-slate-200 dark:bg-slate-700 dark:border-slate-600">
                        <h4 className="font-semibold text-slate-800 dark:text-white mb-3 flex items-center gap-2">
                            <Image className="w-4 h-4" />
                            Profile Picture
                        </h4>
                        <div className="text-center">
                            <div className="mb-4">
                                {profileImage || adminUser?.profileImage ? (
                                    <img
                                        src={profileImage || adminUser.profileImage}
                                        alt="Profile"
                                        className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-indigo-500"
                                    />
                                ) : (
                                    <div className="w-20 h-20 rounded-full mx-auto bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-2xl font-bold flex items-center justify-center">
                                        AD
                                    </div>
                                )}
                            </div>
                            <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                    className="hidden"
                                />
                                <Image className="w-4 h-4" />
                                Upload Image
                            </label>
                        </div>
                    </div>

                    {/* Bio Editor */}
                    <div className="rounded-xl p-5 border bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-semibold text-blue-800 dark:text-blue-200 flex items-center gap-2">
                                <FileText className="w-4 h-4" />
                                Bio
                            </h4>
                            <button
                                onClick={() => {
                                    if (isEditingBio) {
                                        saveBioChanges();
                                    } else {
                                        setIsEditingBio(true);
                                    }
                                }}
                                className="p-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                            >
                                {isEditingBio ? <Save className="w-4 h-4" /> : <Edit className="w-4 h-4" />}
                            </button>
                        </div>
                        {isEditingBio ? (
                            <textarea
                                value={editedBio}
                                onChange={(e) => setEditedBio(e.target.value)}
                                className="w-full p-3 rounded-lg border border-blue-300 dark:border-blue-600 bg-white dark:bg-gray-800 text-slate-900 dark:text-white resize-none"
                                rows="4"
                                placeholder="Tell us about yourself..."
                            />
                        ) : (
                            <p className="text-blue-700 dark:text-blue-300">
                                {adminUser?.bio || editedBio || 'No bio added yet. Click edit to add one!'}
                            </p>
                        )}
                    </div>

                    {/* Character Counter for Bio */}
                    {isEditingBio && (
                        <div className="rounded-xl p-5 border bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800">
                            <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-3 flex items-center gap-2">
                                <Type className="w-4 h-4" />
                                Character Count
                            </h4>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                                    {editedBio.length}
                                </div>
                                <div className="text-sm text-yellow-600 dark:text-yellow-400">
                                    characters
                                </div>
                                <div className="mt-2 w-full bg-yellow-200 dark:bg-yellow-800 rounded-full h-2">
                                    <div
                                        className="bg-yellow-600 h-2 rounded-full transition-all"
                                        style={{ width: `${Math.min((editedBio.length / 200) * 100, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Admin Personal Profile Card */}
            <div className="rounded-2xl p-8 border shadow-xl bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                    <UserCog className="w-6 h-6 text-slate-500" /> Your Admin Profile
                </h2>
                <div className="flex flex-col lg:flex-row items-center lg:items-start gap-8">
                    <div className="flex-shrink-0">
                        {profileImage || adminUser?.profileImage ? (
                            <img
                                src={profileImage || adminUser.profileImage}
                                alt="Admin Avatar"
                                className="w-28 h-28 rounded-full object-cover border-4 border-indigo-500 shadow-xl"
                            />
                        ) : (
                            <div className="w-28 h-28 rounded-full flex items-center justify-center bg-gradient-to-br from-indigo-400 to-purple-500 text-white text-4xl font-bold border-4 border-white dark:border-gray-700 shadow-xl">
                                AD
                            </div>
                        )}
                    </div>
                    <div className="flex-grow text-center lg:text-left space-y-4">
                        <div>
                            <p className="text-3xl font-extrabold text-slate-900 dark:text-white mb-2">{adminUser?.name || 'Administrator'}</p>
                            <div className="flex items-center justify-center lg:justify-start gap-2 mb-2">
                                <Mail className="w-5 h-5 text-slate-400" />
                                <span className="text-lg text-slate-600 dark:text-slate-300">{adminUser?.email || 'N/A'}</span>
                                <button
                                    onClick={copyEmailToClipboard}
                                    className={`p-2 rounded-lg transition-all duration-200 ${copySuccess ? 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-slate-100 hover:bg-slate-200 text-slate-600 dark:bg-slate-700 dark:hover:bg-slate-600 dark:text-slate-400'}`}
                                    title="Copy email to clipboard"
                                >
                                    <Copy className="w-4 h-4" />
                                </button>
                            </div>
                            <p className="text-md font-semibold text-indigo-600 dark:text-indigo-400 flex items-center justify-center lg:justify-start gap-2 mb-3">
                                <Shield className="w-5 h-5" /> Role: <span className="capitalize bg-indigo-100 dark:bg-indigo-900/30 px-2 py-1 rounded-lg">{adminUser?.role || 'N/A'}</span>
                            </p>
                        </div>
                        {(adminUser?.bio || editedBio) && (
                            <p className="text-slate-700 dark:text-slate-200 text-base flex items-start justify-center lg:justify-start gap-2">
                                <Info className="w-5 h-5 text-slate-400 flex-shrink-0 mt-1" />
                                <span className="text-left">{adminUser?.bio || editedBio}</span>
                            </p>
                        )}
                        {adminUser?.createdAt && (
                            <p className="text-sm text-slate-500 dark:text-slate-400 flex items-center justify-center lg:justify-start gap-2">
                                <CalendarDays className="w-4 h-4" /> Joined: {new Date(adminUser.createdAt).toLocaleDateString()}
                            </p>
                        )}
                    </div>
                </div>
            </div>

            {/* Admin Statistics Section */}
            <div className="rounded-2xl p-7 border shadow-xl bg-white/80 backdrop-blur-sm border-gray-200 dark:bg-gray-800/80 dark:border-gray-700">
                <h2 className="text-2xl font-bold mb-6 text-slate-800 dark:text-white flex items-center gap-2">
                    <BarChart2 className="w-6 h-6 text-slate-500" /> Platform Statistics
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {/* Total Users Card */}
                    <div className="rounded-xl p-6 border bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200 dark:from-slate-700 dark:to-slate-800 dark:border-slate-600 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-medium text-slate-600 dark:text-slate-300">Total Users</p>
                                <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{stats?.users?.total ?? 0}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-slate-200 dark:bg-slate-600">
                                <Users className="w-6 h-6 text-slate-600 dark:text-slate-400" />
                            </div>
                        </div>
                    </div>

                    {/* Active Users Card */}
                    <div className="rounded-xl p-6 border bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200 dark:from-emerald-900/20 dark:to-emerald-900/30 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-medium text-emerald-700 dark:text-emerald-400">Active Users</p>
                                <p className="text-3xl font-bold mt-1 text-emerald-900 dark:text-emerald-200">{stats?.users?.active ?? 0}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-emerald-200 dark:bg-emerald-900/40">
                                <CheckCircle className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                            </div>
                        </div>
                    </div>

                    {/* Total Blogs Card */}
                    <div className="rounded-xl p-6 border bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 dark:from-blue-900/20 dark:to-blue-900/30 dark:border-blue-800 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-medium text-blue-700 dark:text-blue-400">Total Blogs</p>
                                <p className="text-3xl font-bold mt-1 text-blue-900 dark:text-blue-200">{stats?.blogs?.total ?? 0}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-blue-200 dark:bg-blue-900/40">
                                <BookOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                            </div>
                        </div>
                    </div>

                    {/* Published Blogs Card */}
                    <div className="rounded-xl p-6 border bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 dark:from-purple-900/20 dark:to-purple-900/30 dark:border-purple-800 shadow-lg hover:shadow-xl transition-shadow">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-base font-medium text-purple-700 dark:text-purple-400">Published Blogs</p>
                                <p className="text-3xl font-bold mt-1 text-purple-900 dark:text-purple-200">{stats?.blogs?.published ?? 0}</p>
                            </div>
                            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-purple-200 dark:bg-purple-900/40">
                                <Bell className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}