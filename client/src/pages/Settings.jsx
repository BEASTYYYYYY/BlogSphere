/* eslint-disable no-unused-vars */
// pages/SettingsPage.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const SettingsPage = () => {
    const { firebaseUser } = useAuth();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({
        isPrivate: false,
        allowLikes: true,
        allowComments: true,
        showFollowerActivity: true,
    });

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const token = await firebaseUser.getIdToken();
                const res = await axios.get('/api/settings', {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (res.data) setSettings(res.data);
                setLoading(false);
            } catch {
                toast.error("Failed to load settings");
                setLoading(false);
            }
        };
        fetchSettings();
    }, [firebaseUser]);

    const handleChange = (e) => {
        const { name, checked } = e.target;
        setSettings(prev => ({ ...prev, [name]: checked }));
    };

    const handleSave = async () => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.put('/api/settings', settings, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Settings updated");
        } catch {
            toast.error("Failed to update settings");
        }
    };

    const handleDeleteAccount = async () => {
        if (!confirm("Are you sure you want to delete your account? This cannot be undone.")) return;
        try {
            const token = await firebaseUser.getIdToken();
            await axios.delete('/api/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Account deleted");
            // Optional: log out or redirect
        } catch {
            toast.error("Failed to delete account");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
                <div className="flex flex-col items-center space-y-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Loading settings...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header Section */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
                        Account Settings
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                        Manage your privacy and account preferences
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Main Settings Panel */}
                    <div className="lg:col-span-2">
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
                            {/* Privacy Settings Section
                            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-xl flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Privacy</h2>
                                        <p className="text-gray-600 dark:text-gray-400">Control who can see your content</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="flex items-start justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <div className="flex-1">
                                            <label className="text-lg font-medium text-gray-900 dark:text-white block mb-2">
                                                Private Account
                                            </label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">
                                                Only approved followers can see your content and activity.
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="isPrivate"
                                                checked={settings.isPrivate}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div> */}

                            {/* Interaction Settings Section */}
                            <div className="p-8 border-b border-gray-200 dark:border-gray-700">
                                <div className="flex items-center mb-6">
                                    <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-xl flex items-center justify-center mr-4">
                                        <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Interactions</h2>
                                        <p className="text-gray-600 dark:text-gray-400">Manage how others can interact with your content</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <div>
                                            <label className="text-lg font-medium text-gray-900 dark:text-white block">
                                                Allow Likes
                                            </label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Let others like your blog posts
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="allowLikes"
                                                checked={settings.allowLikes}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <div>
                                            <label className="text-lg font-medium text-gray-900 dark:text-white block">
                                                Allow Comments
                                            </label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Enable comments on your blog posts
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="allowComments"
                                                checked={settings.allowComments}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>

                                    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                                        <div>
                                            <label className="text-lg font-medium text-gray-900 dark:text-white block">
                                                Show Follower Activity
                                            </label>
                                            <p className="text-sm text-gray-600 dark:text-gray-400">
                                                Display your followers' recent activity
                                            </p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                name="showFollowerActivity"
                                                checked={settings.showFollowerActivity}
                                                onChange={handleChange}
                                                className="sr-only peer"
                                            />
                                            <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-6 peer-checked:after:border-white after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="p-8">
                                <div className="flex flex-col sm:flex-row gap-4">
                                    <button
                                        onClick={handleSave}
                                        className="flex-1 px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        <span>Save Settings</span>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-8 space-y-6">
                            {/* Quick Stats */}
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-200 dark:border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Info</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center text-sm">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${settings.isPrivate ? 'bg-red-500' : 'bg-green-500'}`}></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Account is {settings.isPrivate ? 'Private' : 'Public'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${settings.allowComments ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Comments {settings.allowComments ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                    <div className="flex items-center text-sm">
                                        <div className={`w-3 h-3 rounded-full mr-3 ${settings.allowLikes ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                        <span className="text-gray-600 dark:text-gray-400">
                                            Likes {settings.allowLikes ? 'Enabled' : 'Disabled'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Danger Zone */}
                            <div className="bg-red-50 dark:bg-red-900/20 rounded-2xl border border-red-200 dark:border-red-800 p-6">
                                <div className="flex items-center mb-4">
                                    <div className="w-10 h-10 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mr-3">
                                        <svg className="w-5 h-5 text-red-600 dark:text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
                                        </svg>
                                    </div>
                                    <h3 className="text-lg font-semibold text-red-900 dark:text-red-100">Danger Zone</h3>
                                </div>
                                <p className="text-sm text-red-700 dark:text-red-300 mb-4">
                                    This action cannot be undone. This will permanently delete your account and all associated data.
                                </p>
                                <button
                                    onClick={handleDeleteAccount}
                                    className="w-full px-4 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 flex items-center justify-center space-x-2"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                    <span>Delete Account</span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;