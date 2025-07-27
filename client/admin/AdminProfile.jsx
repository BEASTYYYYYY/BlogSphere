/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from 'react';
import { getAuth } from 'firebase/auth'; 
import { useAuth } from '../src/context/AuthContext'; 
import {
    UserCog, BarChart2,  CheckCircle, XCircle,
    Users, BookOpen, Bell,
    Mail, CalendarDays, Info, Copy, Shield,
} from 'lucide-react';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL; 

export default function AdminProfile() {
    const { firebaseUser } = useAuth(); 
    const [adminUser, setAdminUser] = useState(null);
    const [stats, setStats] = useState(null);
    const [isMaintenanceMode, setIsMaintenanceMode] = useState(false); 
    const [loading, setLoading] = useState(true);
    const [feedbackMessage, setFeedbackMessage] = useState('');
    const [feedbackType, setFeedbackType] = useState(''); 
    const [copySuccess, setCopySuccess] = useState(false);
    const [editedBio, setEditedBio] = useState('');
    const [profileImage, setProfileImage] = useState(null);

    const showFeedback = (message, type) => {
        setFeedbackMessage(message);
        setFeedbackType(type);
        const timer = setTimeout(() => {
            setFeedbackMessage('');
            setFeedbackType('');
        }, 3000); 
        return () => clearTimeout(timer);
    };
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
    const fetchData = async () => {
        setLoading(true);
        try {
            const token = await getAuth().currentUser.getIdToken();
            const headers = { Authorization: `Bearer ${token}` };
            const userRes = await fetch(`${API_BASE_URL}/users/me`, { headers });
            const userData = await userRes.json();
            if (userRes.ok) {
                setAdminUser(userData);
                setEditedBio(userData.bio || '');
                setProfileImage(userData.profileImage || null);
            } else {
                showFeedback(`Failed to fetch admin user data: ${userData.error}`, 'error');
            }
            const statsRes = await fetch(`${API_BASE_URL}/admin/stats`, { headers });
            const statsData = await statsRes.json();
            if (statsRes.ok) {
                setStats(statsData);
            } else {
                showFeedback(`Failed to fetch admin stats: ${statsData.error}`, 'error');
            }
            const settingsRes = await fetch(`${API_BASE_URL}/admin/settings`, { headers });
            const settingsData = await settingsRes.json();
            if (settingsRes.ok) {
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
                <div className="h-10 rounded-lg w-full bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
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
            </div>

            {/* Feedback Message */}
            {feedbackMessage && (
                <div className={`flex items-center gap-3 p-4 rounded-xl shadow-lg backdrop-blur-sm ${feedbackType === 'success' ? 'bg-emerald-100/80 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800' : 'bg-red-100/80 text-red-800 dark:bg-red-900/30 dark:text-red-400 border border-red-200 dark:border-red-800'}`}>
                    {feedbackType === 'success' ? <CheckCircle className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                    <p className="font-medium">{feedbackMessage}</p>
                </div>
            )}

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