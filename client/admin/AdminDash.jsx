// AdminDash.jsx
/* eslint-disable no-unused-vars */
import React, { useEffect, useState, useRef } from "react";
import { getAuth } from "firebase/auth";
import { useAuth } from "../src/context/AuthContext";
import process from "process";
import { Search, Filter, MoreVertical, Shield, ShieldCheck, Users, UserCheck, UserX, Eye, Edit, Trash2 } from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export default function AdminDashboard() { 
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [statusFilter, setStatusFilter] = useState("all");
    const [loading, setLoading] = useState(true);
    const [dropdownOpen, setDropdownOpen] = useState(null);
    const dropdownRef = useRef(null);
    const { firebaseUser } = useAuth();

    useEffect(() => {
        const fetchUsers = async () => {
            try {
                const token = await getAuth().currentUser.getIdToken();
                const res = await fetch(`${API_BASE_URL}/admin/users`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setUsers(data);
                setFilteredUsers(data);
            } catch (error) {
                console.error("Error fetching users:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [firebaseUser]);

    useEffect(() => {
        let filtered = users.filter(user => {
            const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesRole = roleFilter === "all" || user.role === roleFilter;
            const matchesStatus = statusFilter === "all" || user.status === statusFilter;
            return matchesSearch && matchesRole && matchesStatus;
        });
        setFilteredUsers(filtered);
    }, [users, searchTerm, roleFilter, statusFilter]);
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownOpen]);


    const handleBlockToggle = async (userId, status) => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            await fetch(`${API_BASE_URL}/admin/user/${userId}/status`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ status })
            });
            setUsers(users => users.map(u => u._id === userId ? { ...u, status } : u));
        } catch (error) {
            console.error("Error updating user status:", error);
        }
        setDropdownOpen(null);
    };

    const handleRoleChange = async (userId, newRole) => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            await fetch(`${API_BASE_URL}/admin/user/${userId}/role`, {
                method: "PUT",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ role: newRole })
            });
            setUsers(users => users.map(u => u._id === userId ? { ...u, role: newRole } : u));
        } catch (error) {
            console.error("Error updating user role:", error);
        }
        setDropdownOpen(null);
    };

    const handleDeleteUser = async (userId) => {
        if (!confirm("Are you sure you want to delete this user?")) return;
        try {
            const token = await getAuth().currentUser.getIdToken();
            await fetch(`${API_BASE_URL}/admin/user/${userId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });
            setUsers(users => users.filter(u => u._id !== userId));
        } catch (error) {
            console.error("Error deleting user:", error);
        }
        setDropdownOpen(null);
    };

    const getRoleIcon = (role) => {
        switch (role) {
            case 'superadmin': return <ShieldCheck className="w-5 h-5 text-purple-500 dark:text-purple-400" />;
            case 'admin': return <Shield className="w-5 h-5 text-indigo-500 dark:text-indigo-400" />;
            default: return <Users className="w-5 h-5 text-slate-400 dark:text-slate-500" />;
        }
    };

    const getStatusBadge = (status) => {
        const isActive = status === 'active';
        return (
            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${isActive
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800'
                : 'bg-red-50 text-red-700 border border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800'
                }`}>
                <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500' : 'bg-red-500'}`} />
                {status}
            </div>
        );
    };

    if (loading) {
        return (
            <div className="p-8 space-y-8 bg-gray-50 dark:bg-gray-900 min-h-screen">
                <div className="flex justify-between items-center">
                    <div className="space-y-2">
                        <div className="h-8 rounded-lg w-48 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                        <div className="h-4 rounded w-32 bg-slate-200 dark:bg-slate-700 animate-pulse"></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="h-32 rounded-2xl bg-slate-100 dark:bg-slate-800 animate-pulse"></div>
                    ))}
                </div>
                <div className="rounded-2xl p-7 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700">
                    <div className="h-12 rounded-xl bg-slate-100 dark:bg-slate-700 animate-pulse w-full"></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="rounded-2xl p-7 h-48 bg-white dark:bg-gray-800 shadow-sm border border-gray-200 dark:border-gray-700 animate-pulse"></div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-8 p-8 bg-gray-50 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-gray-100">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                        User Management
                    </h1>
                    <p className="text-lg mt-2 text-slate-600 dark:text-slate-300">
                        Oversee and manage {filteredUsers.length} of {users.length} registered users.
                    </p>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="rounded-2xl p-7 border shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-base font-medium text-slate-600 dark:text-slate-400">Total Users</p>
                            <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">{users.length}</p>
                        </div>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-slate-100 dark:bg-slate-700">
                            <Users className="w-7 h-7 text-slate-600 dark:text-slate-400" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl p-7 border shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-base font-medium text-slate-600 dark:text-slate-400">Active Users</p>
                            <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                                {users.filter(u => u.status === 'active').length}
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-emerald-100 dark:bg-emerald-900/20">
                            <UserCheck className="w-7 h-7 text-emerald-600 dark:text-emerald-400" />
                        </div>
                    </div>
                </div>

                <div className="rounded-2xl p-7 border shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-base font-medium text-slate-600 dark:text-slate-400">Admins</p>
                            <p className="text-3xl font-bold mt-1 text-slate-900 dark:text-white">
                                {users.filter(u => u.role === 'admin' || u.role === 'superadmin').length}
                            </p>
                        </div>
                        <div className="w-14 h-14 rounded-full flex items-center justify-center bg-indigo-100 dark:bg-indigo-900/20">
                            <Shield className="w-7 h-7 text-indigo-600 dark:text-indigo-400" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="rounded-2xl p-7 border shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                <div className="flex flex-col sm:flex-row gap-5 items-center">
                    <div className="relative flex-1 w-full">
                        <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-400" />
                        <input
                            type="text"
                            placeholder="Search users by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-5 py-3 rounded-xl placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200
                                bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                        <select
                            value={roleFilter}
                            onChange={(e) => setRoleFilter(e.target.value)}
                            className="px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 w-full sm:w-auto
                                bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="all">All Roles</option>
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                            <option value="superadmin">Superadmin</option>
                        </select>

                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="px-5 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all duration-200 w-full sm:w-auto
                                bg-slate-50 border border-slate-200 text-slate-900 dark:bg-slate-700 dark:border-slate-600 dark:text-white"
                        >
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="blocked">Blocked</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Grid/List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.length > 0 ? (
                    filteredUsers.map((user, index) => (
                        <div
                            key={user._id}
                            className="relative rounded-2xl p-7 border shadow-sm transition-all duration-200 hover:shadow-lg
                                bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700"
                            style={{
                                opacity: 0,
                                animation: `fadeInUp 0.3s ease-out ${index * 50}ms forwards`
                            }}
                        >
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-full flex items-center justify-center text-lg font-bold bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <p className="font-semibold text-xl text-slate-900 dark:text-white">{user.name}</p>
                                    <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
                                </div>
                            </div>

                            <div className="space-y-3 mb-5">
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Role:</span>
                                    <div className="flex items-center gap-2">
                                        {getRoleIcon(user.role)}
                                        <span className="text-base font-medium capitalize text-slate-800 dark:text-slate-200">
                                            {user.role}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Status:</span>
                                    {getStatusBadge(user.status)}
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Joined:</span>
                                    <span className="text-base text-slate-800 dark:text-slate-200">
                                        {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                            </div>

                            <div className="absolute top-4 right-4" ref={dropdownRef}>
                                <button
                                    onClick={() => setDropdownOpen(dropdownOpen === user._id ? null : user._id)}
                                    className="p-2 rounded-lg transition-all duration-150 text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-700"
                                >
                                    <MoreVertical className="w-5 h-5" />
                                </button>

                                {dropdownOpen === user._id && (
                                    <div className="absolute right-0 mt-2 w-56 rounded-lg shadow-xl border py-1 z-30 animate-in slide-in-from-top-2 duration-200
                                        bg-white border-gray-200 dark:bg-gray-700 dark:border-gray-600">
                                        <div className="px-4 py-2 border-b border-slate-200 dark:border-slate-600">
                                            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Change Role</p>
                                        </div>
                                        {['user', 'admin', 'superadmin'].map(role => (
                                            <button
                                                key={role}
                                                onClick={() => handleRoleChange(user._id, role)}
                                                className={`w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
                                                    ${user.role === role
                                                        ? 'text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-900/20'
                                                        : 'text-slate-700 hover:bg-slate-50 dark:text-slate-200 dark:hover:bg-slate-600'
                                                    }`}
                                            >
                                                {getRoleIcon(role)} <span className="capitalize">{role}</span>
                                            </button>
                                        ))}
                                        <div className="mt-1 pt-1 border-t border-slate-200 dark:border-slate-600">
                                            <button
                                                onClick={() => handleBlockToggle(user._id, user.status === "active" ? "blocked" : "active")}
                                                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
                                                    text-amber-600 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-900/20"
                                            >
                                                {user.status === "active" ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                {user.status === "active" ? "Block User" : "Unblock User"}
                                            </button>
                                            <button
                                                onClick={() => handleDeleteUser(user._id)}
                                                className="w-full text-left px-4 py-2.5 text-sm transition-colors flex items-center gap-2
                                                    text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete User
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="md:col-span-3 text-center py-16 rounded-2xl border shadow-sm bg-white border-gray-200 dark:bg-gray-800 dark:border-gray-700">
                        <Users className="w-16 h-16 mx-auto mb-6 text-slate-300 dark:text-slate-600" />
                        <p className="font-semibold text-lg text-slate-700 dark:text-slate-300">No users found</p>
                        <p className="text-base mt-2 text-slate-400 dark:text-slate-500">Try adjusting your search or filters to see more results.</p>
                    </div>
                )}
            </div>

            <style jsx>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(10px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div>
    );
}