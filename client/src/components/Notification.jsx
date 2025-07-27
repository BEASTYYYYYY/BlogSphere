// Notification.jsx
import React, { useEffect, useState, useRef } from 'react';
import { Bell, UserPlus, Heart, MessageCircle, XCircle, Trash2 } from 'lucide-react'; // Import Trash2 icon
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const NotificationDropdown = () => {
    const { firebaseUser, mongoUser, refreshMongoUser } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [open, setOpen] = useState(false);
    const navigate = useNavigate();
    const dropdownRef = useRef(null);
    const bellButtonRef = useRef(null);
    const { darkMode } = useTheme();

    const fetchNotifications = async () => {
        if (!firebaseUser) {
            setNotifications([]);
            return;
        }
        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.get(`${API_BASE_URL}/notifications`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setNotifications(res.data);
        } catch (err) {
            console.error('Failed to fetch notifications:', err);
        }
    };

    // Keep existing markAsRead function if you want to retain the 'mark as read' functionality
    const markAsRead = async (id) => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.put(`${API_BASE_URL}/notifications/${id}/read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                // Update the local state to reflect the change
                setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
                toast.success("Notification marked as read!");
            }
        } catch (err) {
            console.error('Failed to mark as read:', err);
            toast.error("Failed to mark notification as read.");
        }
    };

    // Keep existing handleMarkAllAsRead if you want to retain the 'mark all as read' functionality
    const handleMarkAllAsRead = async () => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.put(`${API_BASE_URL}/notifications/mark-all-read`, {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                // Update all notifications in state to isRead: true
                setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
                toast.success("All notifications marked as read!");
                setOpen(false);
            }
        } catch (err) {
            console.error("Failed to mark all as read:", err);
            toast.error("Failed to update notifications.");
        }
    };

    // NEW: Function to delete a single notification
    const handleDeleteNotification = async (id) => {
        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.delete(`${API_BASE_URL}/notifications/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            if (res.data.success) {
                setNotifications(prev => prev.filter(n => n._id !== id));
                toast.success("Notification deleted permanently!");
            }
        } catch (err) {
            console.error('Failed to delete notification:', err);
            toast.error("Failed to delete notification.");
        }
    };

    // NEW: Function to delete all notifications
    const handleDeleteAllNotifications = async () => {
        if (window.confirm("Are you sure you want to delete all notifications? This action cannot be undone.")) {
            try {
                const token = await firebaseUser.getIdToken();
                const res = await axios.delete(`${API_BASE_URL}/notifications`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.data.success) {
                    setNotifications([]); // Clear all notifications from state
                    toast.success("All notifications deleted permanently!");
                    setOpen(false); // Close the dropdown
                }
            } catch (err) {
                console.error("Failed to delete all notifications:", err);
                toast.error("Failed to delete all notifications.");
            }
        }
    };

    const handleVisitProfile = (senderId) => {
        if (!senderId) {
            toast.error("Invalid user ID");
            return;
        }
        setOpen(false);
        navigate(`/profile/${senderId}`);
    };

    const handleFollowBack = async (senderId) => {
        if (!firebaseUser || !mongoUser) {
            toast.error('Please log in to follow users.');
            return;
        }
        if (mongoUser._id === senderId) {
            toast('You cannot follow yourself!', { icon: '😅' });
            return;
        }

        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.post(`${API_BASE_URL}/users/follow/${senderId}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.data.success) {
                // Remove the specific follow notification if follow back is successful
                setNotifications(prev => prev.filter(n => !(n.sender?._id === senderId && n.type === 'follow')));
                toast.success("Followed back successfully!");
                refreshMongoUser();
            } else {
                toast.error(res.data.message || "Failed to follow back.");
            }
        } catch (err) {
            console.error("Error following back:", err.response?.data || err.message);
            toast.error("Failed to follow back.");
        }
    };

    const renderMessage = (n) => {
        const blogTitle = n.blog?.title ? `"${n.blog.title}"` : "your blog";
        switch (n.type) {
            case 'like':
                return (
                    <>
                        <Heart className="w-4 h-4 text-pink-500 mr-2 flex-shrink-0" />
                        <span className="flex-grow">
                            <strong>{n.sender?.name || 'Someone'}</strong> liked the blog <strong>{blogTitle}</strong>
                        </span>
                    </>
                );
            case 'comment':
                return (
                    <>
                        <MessageCircle className="w-4 h-4 text-blue-500 mr-2 flex-shrink-0" />
                        <span className="flex-grow">
                            <strong>{n.sender?.name || 'Someone'}</strong> commented on the blog <strong>{blogTitle}</strong>
                        </span>
                    </>
                );
            case 'follow':
                return (
                    <>
                        <UserPlus className="w-4 h-4 text-green-500 mr-2 flex-shrink-0" />
                        <span className="flex-grow"><strong>{n.sender?.name || 'Someone'}</strong> followed you</span>
                    </>
                );
            default:
                return (
                    <span className="flex items-center">
                        <XCircle className="w-4 h-4 text-red-500 mr-2" /> Unknown notification
                    </span>
                );
        }
    };

    useEffect(() => {
        let interval;
        if (firebaseUser) {
            fetchNotifications();
            interval = setInterval(fetchNotifications, 60000);
        } else {
            setNotifications([]);
            if (interval) clearInterval(interval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [firebaseUser]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
                bellButtonRef.current && !bellButtonRef.current.contains(event.target)) {
                setOpen(false);
            }
        };

        if (open) {
            document.addEventListener('mousedown', handleClickOutside);
        } else {
            document.removeEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [open]);

    return (
        <div className="relative">
            <button
                ref={bellButtonRef}
                className={`p-2.5 rounded-xl relative hover:scale-105 transition ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-100'}`}
                onClick={() => setOpen(!open)}
            >
                <Bell className={`${darkMode ? 'text-white' : 'text-gray-900'} w-5 h-5`} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1 -translate-y-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-gray-900">
                        {notifications.filter(n => !n.isRead).length}
                    </span>
                )}
            </button>
            {open && (
                <div
                    ref={dropdownRef}
                    className={`absolute right-0 mt-2 w-96 max-h-96 overflow-y-auto border z-50 rounded-xl shadow-xl animate-in slide-in-from-top-2 duration-200
                        ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>
                    <div className="flex justify-between items-center px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                        <span className="text-lg font-bold">Notifications</span>
                        {notifications.length > 0 && (
                            <div className="flex gap-2"> {/* Group buttons */}
                                {/* Existing Mark all as read button */}
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="px-3 py-1 text-sm rounded-lg bg-blue-100 text-blue-700 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                                >
                                    Mark all as read
                                </button>
                                {/* NEW: Delete all button */}
                                <button
                                    onClick={handleDeleteAllNotifications}
                                    className="px-3 py-1 text-sm rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 transition-colors"
                                >
                                    Delete All
                                </button>
                            </div>
                        )}
                    </div>
                    {notifications.length === 0 ? (
                        <div className="p-6 text-center text-gray-500 dark:text-gray-400">
                            <Bell className="w-12 h-12 mx-auto mb-3 opacity-60" />
                            <p className="font-medium">No new notifications</p>
                            <p className="text-sm">You're all caught up!</p>
                        </div>
                    ) : (
                        <div className="py-2">
                            {notifications.map(n => (
                                <div key={n._id} className={`flex flex-col gap-1 px-4 py-3 border-b border-gray-100 dark:border-gray-800
                                    ${!n.isRead ? (darkMode ? 'bg-gray-800/50 hover:bg-gray-800' : 'bg-blue-50 hover:bg-blue-100') : (darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50')} transition-colors cursor-pointer`}>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center flex-grow">
                                            {renderMessage(n)}
                                        </div>
                                        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2 flex-shrink-0">
                                            {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    {n.type === 'follow' && n.sender && (
                                        <div className="flex gap-2 mt-3">
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleFollowBack(n.sender._id); }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
                                            >
                                                Follow Back
                                            </button>
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleVisitProfile(n.sender._id); }}
                                                className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-gray-200 text-gray-800 hover:bg-gray-300 dark:bg-gray-700 dark:text-gray-200 dark:hover:bg-gray-600 transition-colors"
                                            >
                                                Visit Profile
                                            </button>
                                        </div>
                                    )}
                                    {n.type === 'comment' && n.blog?._id && (
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                navigate(`/blog/${n.blog._id}#commentSection`);
                                                setOpen(false);
                                            }}
                                            className="text-xs mt-1 self-start px-2 py-1 rounded-md text-blue-600 dark:text-blue-400 hover:underline"
                                        >
                                            Wanna see?
                                        </button>
                                    )}
                                    <div className="flex justify-end gap-2 mt-2">
                                        {/* Existing Mark as read button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); markAsRead(n._id); }}
                                            className="text-xs px-2 py-0.5 rounded-md text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
                                        >
                                            Mark as read
                                        </button>
                                        {/* NEW: Delete this button */}
                                        <button
                                            onClick={(e) => { e.stopPropagation(); handleDeleteNotification(n._id); }}
                                            className="text-xs px-2 py-0.5 rounded-md text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 transition-colors flex items-center gap-1"
                                        >
                                            <Trash2 className="w-3 h-3" /> Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationDropdown;