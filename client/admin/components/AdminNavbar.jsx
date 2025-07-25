import { useState } from 'react';
import { Search, Bell, User, Menu, ChevronDown, Sun, Moon } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import NotificationBell from './utility/NotificationBell';

const AdminNavbar = ({ darkMode, setDarkMode, sidebarOpen, setSidebarOpen }) => {
    const [profileOpen, setProfileOpen] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const location = useLocation();
    const navigate = useNavigate();

    const sidebarItems = [
        { name: 'Dashboard', to: '/admin' },
        { name: 'Upload Stats', to: '/admin/upload-stats' },
        { name: 'Recent Uploads', to: '/admin/uploads' },
        { name: 'Settings', to: '/admin/settings' },
    ];

    const getCurrentPageName = () => {
        const currentItem = sidebarItems.find(item => item.to === location.pathname);
        return currentItem ? currentItem.name : 'Dashboard';
    };

    const confirmSignOut = async () => {
        const auth = getAuth();
        try {
            await auth.signOut();
            navigate('/login');
        } catch (err) {
            console.error('Sign-out error:', err);
            alert('Failed to sign out. Please try again.');
        }
    };

    return (
        <>
            <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
                <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center space-x-4">
                        <button
                            onClick={() => setSidebarOpen(!sidebarOpen)}
                            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        </button>
                        <nav className="flex items-center space-x-2 text-sm">
                            <span className="text-gray-500 dark:text-gray-400">Admin</span>
                            <span className="text-gray-400">/</span>
                            <span className="text-blue-600 dark:text-blue-400 font-medium">{getCurrentPageName()}</span>
                        </nav>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="relative hidden sm:block">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="pl-10 pr-4 py-2 w-64 bg-gray-100 dark:bg-gray-700 border-0 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white dark:focus:bg-gray-600 transition-all duration-200 text-gray-900 dark:text-white placeholder-gray-500"
                            />
                        </div>
                        <button
                            onClick={() => setDarkMode(!darkMode)}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                        >
                            {darkMode ? (
                                <Sun className="w-5 h-5 text-yellow-500" />
                            ) : (
                                <Moon className="w-5 h-5 text-gray-600" />
                            )}
                        </button>
                        <NotificationBell />
                        <div className="relative">
                            <button
                                onClick={() => setProfileOpen(!profileOpen)}
                                className="flex items-center space-x-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                            >
                                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
                                    <User className="w-4 h-4 text-white" />
                                </div>
                                <ChevronDown className="w-4 h-4 text-gray-500" />
                            </button>

                            {profileOpen && (
                                <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 py-2 z-50">
                                    <a href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Profile</a>
                                    <a href="/admin/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700">Settings</a>
                                    <div className="border-t border-gray-200 dark:border-gray-700 my-2"></div>
                                    <button
                                        onClick={() => setShowModal(true)}
                                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                                    >
                                        Sign out
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </header>

            {/* Sign Out Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-xl w-full max-w-sm">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Confirm Sign Out</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">Are you sure you want to sign out?</p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded hover:bg-gray-300 dark:hover:bg-gray-600"
                            >Cancel</button>
                            <button
                                onClick={confirmSignOut}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                            >Sign Out</button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default AdminNavbar;
