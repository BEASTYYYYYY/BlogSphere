import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { Users, UserPlus, UserMinus, Frown, Sparkles } from 'lucide-react';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

const Following = () => {
    const { mongoUser, firebaseUser } = useAuth();
    const [followers, setFollowers] = useState([]);
    const [following, setFollowing] = useState([]);
    const [suggestedUsers, setSuggestedUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { darkMode } = useTheme();

    useEffect(() => {
        const fetchSocialData = async () => {
            if (!mongoUser || !firebaseUser) {
                setLoading(false);
                setError("Please log in to view your social connections and suggestions.");
                return;
            }

            try {
                setLoading(true);
                setError(null);
                const token = await firebaseUser.getIdToken();
                const config = { headers: { Authorization: `Bearer ${token}` } };

                const [socialResponse, suggestedResponse] = await Promise.all([
                    axios.get(`${API_BASE_URL}/users/me/social`, config),
                    axios.get(`${API_BASE_URL}/users/suggestions`, config)
                ]);

                setFollowers(socialResponse.data.followers || []);
                setFollowing(socialResponse.data.following || []);
                setSuggestedUsers(suggestedResponse.data || []);

            } catch (err) {
                console.error("Failed to fetch social data:", err.response?.data || err.message);
                setError("Failed to load your connections and suggestions. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSocialData();
    }, [mongoUser, firebaseUser]);

    const handleFollowToggle = async (targetUserId, isFollowing) => {
        if (!firebaseUser || !mongoUser) {
            alert('Please log in to follow/unfollow users.');
            return;
        }

        try {
            const token = await firebaseUser.getIdToken();
            const config = { headers: { Authorization: `Bearer ${token}` } };

            const endpoint = isFollowing ? 'unfollow' : 'follow';
            const response = await axios.post(`${API_BASE_URL}/users/${endpoint}/${targetUserId}`, {}, config);

            if (response.data.success) {
                if (isFollowing) {
                    setFollowing(prev => prev.filter(user => user._id !== targetUserId));
                } else {
                    const userToAdd =
                        suggestedUsers.find(u => u._id === targetUserId) ||
                        followers.find(u => u._id === targetUserId);

                    if (userToAdd) {
                        setFollowing(prev => [...prev, userToAdd]);
                    }
                }
                setFollowers(prev =>
                    prev.map(user => user._id === targetUserId ? { ...user } : user
                    )
                );
                try {
                    const suggestedRes = await axios.get(`${API_BASE_URL}/users/suggestions`, config);
                    setSuggestedUsers(suggestedRes.data || []);
                } catch {
                    // Optional: handle error silently
                }
            }
        } catch (err) {
            console.error("Failed to toggle follow status:", err.response?.data || err.message);
            alert("Failed to update follow status. Please try again.");
        }
    };

    const UserCard = ({ user, type, compact = false }) => {
        const isCurrentlyFollowing = mongoUser && following.some(f => f._id === user._id);
        const isMyProfile = mongoUser && mongoUser._id === user._id;

        return (
            <div className={`relative overflow-hidden rounded-xl transition-all duration-300  
                ${darkMode ? 'bg-gradient-to-br from-gray-800 to-gray-900 border border-gray-700' : 'bg-gradient-to-br from-white to-gray-50 border border-gray-200'}
                ${compact ? 'p-3' : 'p-4'}`}>
                <div className="flex items-center space-x-3">
                    {/* Avatar */}
                    <div className={`relative ${compact ? 'w-10 h-10' : 'w-12 h-12'} rounded-full overflow-hidden flex-shrink-0`}>
                        {user.avatar ? (
                            <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                        ) : (
                            <div className={`w-full h-full flex items-center justify-center font-bold rounded-full
                                ${darkMode ? 'bg-blue-600 text-blue-100' : 'bg-blue-100 text-blue-600'}
                                ${compact ? 'text-lg' : 'text-xl'}`}
                            >
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                        )}
                        {type === 'suggestion' && (
                            <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full flex items-center justify-center">
                                <Sparkles className="w-2 h-2 text-yellow-800" />
                            </div>
                        )}
                    </div>

                    {/* User Info */}
                    <div className="flex-1 min-w-0">
                        <h3 className={`font-semibold truncate ${darkMode ? 'text-white' : 'text-gray-900'}
                            ${compact ? 'text-sm' : 'text-base'}`}
                        >
                            {user.name || 'Unknown User'}
                        </h3>
                        <p className={`text-xs truncate ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                            {user.bio || `${type.charAt(0).toUpperCase() + type.slice(1)}`}
                        </p>
                    </div>

                    {/* Follow Button */}
                    {!isMyProfile && (
                        <button
                            onClick={() => handleFollowToggle(user._id, isCurrentlyFollowing)}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium 
                                transition-all duration-200 whitespace-nowrap
                                ${isCurrentlyFollowing
                                    ? 'bg-red-500 hover:bg-red-600 text-white'
                                    : 'bg-blue-500 hover:bg-blue-600 text-white'
                                }`}
                        >
                            {isCurrentlyFollowing ? (
                                <>
                                    <UserMinus className="w-3 h-3" />
                                    <span className="hidden sm:inline">Unfollow</span>
                                </>
                            ) : (
                                <>
                                    <UserPlus className="w-3 h-3" />
                                    <span className="hidden sm:inline">Follow</span>
                                </>
                            )}
                        </button>
                    )}
                </div>
            </div>
        );
    };

    const SectionCard = ({ title, icon, count, children, className = "" }) => (
        <div className={`${className} h-full`}>
            <div className={`rounded-2xl overflow-hidden ${darkMode ? 'bg-gray-800/50' : 'bg-white'} 
                border ${darkMode ? 'border-gray-700' : 'border-gray-200'} h-full flex flex-col`}
            >
                <div className={`px-6 py-4 border-b ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-100 bg-gray-50'}`}>
                    <h2 className={`text-xl font-bold flex items-center gap-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                        {icon}
                        {title}
                        <span className={`text-sm font-normal px-2 py-1 rounded-full 
                            ${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600'}`}
                        >
                            {count}
                        </span>
                    </h2>
                </div>
                <div className="p-6 flex-1">
                    {children}
                </div>
            </div>
        </div>
    );

    if (loading) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className={`${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>Loading your connections...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`min-h-screen flex items-center justify-center ${darkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
                <div className={`text-center p-8 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'} max-w-md mx-4`}>
                    <Frown className="w-16 h-16 text-red-500 mx-auto mb-4" />
                    <h2 className={`text-xl font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        Connection Error
                    </h2>
                    <p className={`mb-6 ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors font-medium"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`min-h-screen transition-colors duration-300 ${darkMode ? 'bg-gray-900' : 'bg-gray-50'} `}>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                    <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-blue-900/30 border border-blue-800' : 'bg-blue-50 border border-blue-200'}`}>
                        <UserPlus className="w-6 h-6 text-blue-500 mx-auto mb-1" />
                        <div className={`text-2xl font-bold ${darkMode ? 'text-blue-300' : 'text-blue-700'}`}>{following.length}</div>
                        <div className={`text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>Following</div>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-purple-900/30 border border-purple-800' : 'bg-purple-50 border border-purple-200'}`}>
                        <UserMinus className="w-6 h-6 text-purple-500 mx-auto mb-1" />
                        <div className={`text-2xl font-bold ${darkMode ? 'text-purple-300' : 'text-purple-700'}`}>{followers.length}</div>
                        <div className={`text-sm ${darkMode ? 'text-purple-400' : 'text-purple-600'}`}>Followers</div>
                    </div>
                    <div className={`p-4 rounded-xl text-center ${darkMode ? 'bg-yellow-900/30 border border-yellow-800' : 'bg-yellow-50 border border-yellow-200'}`}>
                        <Sparkles className="w-6 h-6 text-yellow-500 mx-auto mb-1" />
                        <div className={`text-2xl font-bold ${darkMode ? 'text-yellow-300' : 'text-yellow-700'}`}>{suggestedUsers.length}</div>
                        <div className={`text-sm ${darkMode ? 'text-yellow-400' : 'text-yellow-600'}`}>Suggestions</div>
                    </div>
                </div>

                {/* Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    {/* Following */}
                    <SectionCard
                        title="Following"
                        icon={<UserPlus className="w-5 h-5 text-blue-500" />}
                        count={following.length}
                    >
                        {following.length === 0 ? (
                            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <UserPlus className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Start following people to build your network!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {following.map(user => (
                                    <UserCard key={user._id} user={user} type="following" compact />
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* Followers */}
                    <SectionCard
                        title="Followers"
                        icon={<UserMinus className="w-5 h-5 text-purple-500" />}
                        count={followers.length}
                    >
                        {followers.length === 0 ? (
                            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Share great content to attract followers!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {followers.map(user => (
                                    <UserCard key={user._id} user={user} type="follower" compact />
                                ))}
                            </div>
                        )}
                    </SectionCard>

                    {/* Suggestions */}
                    <SectionCard
                        title="Discover"
                        icon={<Sparkles className="w-5 h-5 text-yellow-500" />}
                        count={suggestedUsers.length}
                    >
                        {suggestedUsers.length === 0 ? (
                            <div className={`text-center py-6 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>Check back soon for new suggestions!</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {suggestedUsers.map(user => (
                                    <UserCard key={user._id} user={user} type="suggestion" compact />
                                ))}
                            </div>
                        )}
                    </SectionCard>
                </div>
            </div>
        </div>
    );
};

export default Following;