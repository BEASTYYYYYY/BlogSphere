// src/components/ProfileCard.jsx
import { Camera, Edit3 } from 'lucide-react';

// ProfileCard component now accepts explicit counts for posts, followers, and following
export default function ProfileCard({ userProfile, setShowProfileEdit, darkMode, postsCount = 0, followersCount = 0, followingCount = 0 }) {
    return (
        <div className={`p-6 rounded-2xl border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
            <div className="flex items-center space-x-4 mb-6">
                <div className="relative">
                    {userProfile.avatar ? (
                        <img
                            src={userProfile.avatar}
                            alt="Profile"
                            className="w-16 h-16 rounded-full object-cover"
                        />
                    ) : (
                        // Fallback for avatar if not available
                        <div className={`w-16 h-16 rounded-full flex items-center justify-center text-3xl font-bold
                            ${darkMode ? 'bg-blue-700 text-blue-200' : 'bg-blue-100 text-blue-700'}`}>
                            {userProfile.name?.charAt(0).toUpperCase() || 'U'}
                        </div>
                    )}
                    <button className={`absolute -bottom-1 -right-1 bg-blue-500 text-white p-1.5 rounded-full hover:bg-blue-600`}>
                        <Camera className="w-3 h-3" />
                    </button>
                </div>
                <div className="flex-1">
                    <h3 className={`text-xl font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{userProfile.name || 'User'}</h3>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>{userProfile.bio || 'No bio yet.'}</p>
                </div>
                <button
                    onClick={() => setShowProfileEdit(true)}
                    className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
                >
                    <Edit3 className="w-4 h-4" />
                </button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                    {/* Display actual postsCount */}
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{postsCount}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Posts</p>
                </div>
                <div>
                    {/* Display actual followersCount */}
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{followersCount}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Followers</p>
                </div>
                <div>
                    {/* Display actual followingCount */}
                    <p className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{followingCount}</p>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Following</p>
                </div>
            </div>
        </div>
    );
}
