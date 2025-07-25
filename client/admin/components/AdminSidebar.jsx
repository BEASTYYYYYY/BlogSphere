import React, { useState } from 'react';
import { BarChart3, LayoutDashboard, Users, Settings, Upload, Key, LogOut, X, User, CalendarDays } from 'lucide-react'; // NEW: CalendarDays icon
import { NavLink, useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';

const AdminSidebar = ({ sidebarOpen, setSidebarOpen }) => {
    const navigate = useNavigate();
    const [showModal, setShowModal] = useState(false);

    const sidebarItems = [
        { name: 'Dashboard', to: '/admin', icon: LayoutDashboard },
        { name: 'Upload Stats', to: '/admin/upload-stats', icon: BarChart3 },
        { name: 'Recent Uploads', to: '/admin/uploads', icon: Upload },
        { name: 'Schedule', to: '/admin/schedule', icon: CalendarDays }, // <--- NEW ITEM
        { name: 'Settings', to: '/admin/settings', icon: Settings },
    ];

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
            <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-800 shadow-xl transform ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} transition-transform duration-300 ease-in-out`}>
                <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                            <BarChart3 className="w-5 h-5 text-white" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800 dark:text-white">Admin</h2>
                    </div>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="lg:hidden p-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                <nav className="p-4 space-y-2">
                    {sidebarItems.map((item, index) => (
                        <NavLink
                            key={index}
                            to={item.to}
                            end={item.to === '/admin'}
                            className={({ isActive }) => `w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-200 group ${isActive
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg shadow-blue-500/25'
                                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
                                }`}
                        >
                            {({ isActive }) => (
                                <>
                                    <item.icon className={`w-5 h-5 ${isActive ? 'text-white' : 'group-hover:scale-110 transition-transform'}`} />
                                    <span className="font-medium">{item.name}</span>
                                </>
                            )}
                        </NavLink>
                    ))}

                    {/* Go to User Dashboard */}
                    <button
                        onClick={() => navigate('/user')}
                        className="w-full flex items-center space-x-3 px-4 py-3 mt-4 rounded-xl text-sm font-medium text-blue-600 hover:bg-blue-100 dark:text-blue-400 dark:hover:bg-blue-900 transition-all"
                    >
                        <User className="w-5 h-5" />
                        <span>Go to User Dashboard</span>
                    </button>
                    <button
                        onClick={() => setShowModal(true)}
                        className="w-full flex items-center space-x-3 px-4 py-3 mt-2 rounded-xl text-sm font-medium text-red-600 hover:bg-red-100 dark:hover:bg-red-900 transition-all"
                    >
                        <LogOut className="w-5 h-5" />
                        <span>Sign Out</span>
                    </button>
                </nav>
            </div>
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

export default AdminSidebar;