/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { BarChart3, Users, FileText, Eye, TrendingUp, Calendar } from "lucide-react";

export default function UploadStats() {
    const [stats, setStats] = useState({
        blogs: { total: 0, published: 0, drafts: 0 },
        users: { total: 0, active: 0, blocked: 0 },
        views: { total: 0, today: 0, thisWeek: 0 },
        recent: { blogsToday: 0, usersToday: 0 }
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const token = await getAuth().currentUser.getIdToken();
                const res = await fetch("/api/admin/stats", {
                    headers: { Authorization: `Bearer ${token}` }
                });

                if (!res.ok) {
                    throw new Error(`HTTP error! status: ${res.status}`);
                }

                const data = await res.json();

                // Handle the original API response structure
                const normalizedStats = {
                    blogs: data.blogs || { total: 0, published: 0, drafts: 0 },
                    users: data.users || { total: 0, active: 0, blocked: 0 },
                    views: data.views || { total: 0, today: 0, thisWeek: 0 },
                    recent: data.recent || { blogsToday: 0, usersToday: 0 }
                };

                setStats(normalizedStats);
            } catch (error) {
                console.error("Error fetching stats:", error);
                setError(error.message);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const StatCard = ({ title, value, subtitle, icon: Icon, color, trend }) => (
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4" style={{ borderLeftColor: color }}>
            <div className="flex items-center justify-between">
                <div>
                    <div className="flex items-center">
                        <Icon className="mr-2" size={20} color={color} />
                        <h3 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
                            {title}
                        </h3>
                    </div>
                    <p className="text-2xl font-bold text-gray-900 mt-2">{value}</p>
                    {subtitle && (
                        <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
                    )}
                </div>
                {trend && (
                    <div className="text-right">
                        <div className="flex items-center text-green-600">
                            <TrendingUp size={16} />
                            <span className="ml-1 text-sm font-medium">+{trend}%</span>
                        </div>
                        <span className="text-xs text-gray-500">vs last week</span>
                    </div>
                )}
            </div>
        </div>
    );

    const QuickStat = ({ label, value, color }) => (
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">{label}</span>
            <span className="text-lg font-bold" style={{ color }}>{value}</span>
        </div>
    );

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="text-red-800 text-center">
                    <h3 className="text-lg font-semibold mb-2">Error Loading Stats</h3>
                    <p className="text-sm">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Retry
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                        <BarChart3 className="mr-3" size={28} />
                        Dashboard Statistics
                    </h2>
                    <div className="text-sm text-gray-500">
                        Last updated: {new Date().toLocaleString()}
                    </div>
                </div>
            </div>

            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard
                    title="Total Blogs"
                    value={stats.blogs?.total || 0}
                    subtitle={`${stats.blogs?.published || 0} published, ${stats.blogs?.drafts || 0} drafts`}
                    icon={FileText}
                    color="#3B82F6"
                />
                <StatCard
                    title="Users"
                    value={stats.users?.total || 0}
                    subtitle={`${stats.users?.active || 0} active, ${stats.users?.blocked || 0} blocked`}
                    icon={Users}
                    color="#10B981"
                />
                <StatCard
                    title="Total Views"
                    value={(stats.views?.total || 0).toLocaleString()}
                    subtitle={`${stats.views?.today || 0} today, ${stats.views?.thisWeek || 0} this week`}
                    icon={Eye}
                    color="#8B5CF6"
                />
                <StatCard
                    title="Today's Activity"
                    value={(stats.recent?.blogsToday || 0) + (stats.recent?.usersToday || 0)}
                    subtitle={`${stats.recent?.blogsToday || 0} blogs, ${stats.recent?.usersToday || 0} users`}
                    icon={Calendar}
                    color="#F59E0B"
                />
            </div>

            {/* Detailed Stats */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Blog Stats */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <FileText className="mr-2" size={20} />
                        Blog Statistics
                    </h3>
                    <div className="space-y-3">
                        <QuickStat label="Published Blogs" value={stats.blogs?.published || 0} color="#10B981" />
                        <QuickStat label="Draft Blogs" value={stats.blogs?.drafts || 0} color="#F59E0B" />
                        <QuickStat label="Average per Day" value={Math.round((stats.blogs?.total || 0) / 30)} color="#6B7280" />
                        <QuickStat label="Publish Rate" value={`${Math.round(((stats.blogs?.published || 0) / (stats.blogs?.total || 1)) * 100)}%`} color="#3B82F6" />
                    </div>
                </div>

                {/* User Stats */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <Users className="mr-2" size={20} />
                        User Statistics
                    </h3>
                    <div className="space-y-3">
                        <QuickStat label="Active Users" value={stats.users?.active || 0} color="#10B981" />
                        <QuickStat label="Blocked Users" value={stats.users?.blocked || 0} color="#EF4444" />
                        <QuickStat label="New This Week" value={(stats.recent?.usersToday || 0) * 7} color="#8B5CF6" />
                        <QuickStat label="Active Rate" value={`${Math.round(((stats.users?.active || 0) / (stats.users?.total || 1)) * 100)}%`} color="#3B82F6" />
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                    <TrendingUp className="mr-2" size={20} />
                    Performance Metrics
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg">
                        <div className="text-2xl font-bold text-blue-600">
                            {Math.round((stats.views?.total || 0) / (stats.blogs?.published || 1)) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Avg Views per Blog</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-green-50 to-green-100 rounded-lg">
                        <div className="text-2xl font-bold text-green-600">
                            {Math.round((stats.blogs?.total || 0) / (stats.users?.total || 1)) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Blogs per User</div>
                    </div>
                    <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-lg">
                        <div className="text-2xl font-bold text-purple-600">
                            {Math.round((stats.views?.total || 0) / (stats.users?.total || 1)) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Views per User</div>
                    </div>
                </div>
            </div>
        </div>
    );
}