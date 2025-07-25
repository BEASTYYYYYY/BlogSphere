// filename: ScheduleItemCard.jsx
import React from 'react';
import { Clock, MapPin, User, BookOpen, Edit, Trash2, Users, CalendarDays, Info, Sparkles } from 'lucide-react';

const ScheduleItemCard = ({ item, onEdit, onDelete }) => {
    const renderIcon = (type) => {
        const iconClass = "w-5 h-5";
        switch (type) {
            case 'meeting': return <Users className={`${iconClass} text-blue-500`} />;
            case 'assignment': return <BookOpen className={`${iconClass} text-green-500`} />;
            case 'deadline': return <CalendarDays className={`${iconClass} text-red-500`} />;
            case 'event': return <Sparkles className={`${iconClass} text-purple-500`} />;
            default: return <Info className={`${iconClass} text-gray-500`} />;
        }
    };

    const getStatusClass = (status) => {
        switch (status) {
            case 'completed': return 'bg-gradient-to-r from-green-100 to-emerald-100 text-green-700 border border-green-200';
            case 'in-progress': return 'bg-gradient-to-r from-yellow-100 to-amber-100 text-yellow-700 border border-yellow-200';
            case 'cancelled': return 'bg-gradient-to-r from-red-100 to-rose-100 text-red-700 border border-red-200';
            default: return 'bg-gradient-to-r from-blue-100 to-indigo-100 text-blue-700 border border-blue-200';
        }
    };

    const getTypeGradient = (type) => {
        switch (type) {
            case 'meeting': return 'from-blue-500 to-cyan-500';
            case 'assignment': return 'from-green-500 to-emerald-500';
            case 'deadline': return 'from-red-500 to-rose-500';
            case 'event': return 'from-purple-500 to-pink-500';
            default: return 'from-gray-500 to-slate-500';
        }
    };

    return (
        <div
            key={item._id}
            className="group relative bg-gradient-to-r from-white to-gray-50 dark:from-gray-800 dark:to-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
        >
            {/* Type indicator bar */}
            <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${getTypeGradient(item.type)} rounded-l-xl`}></div>

            <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                    {/* Header with icon and title */}
                    <div className="flex items-center space-x-3 mb-3">
                        <div className={`p-2 rounded-lg bg-gradient-to-r ${getTypeGradient(item.type)} bg-opacity-10`}>
                            {renderIcon(item.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white truncate">
                                {item.title}
                            </h3>
                            <div className="flex items-center space-x-2 mt-1">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold capitalize ${getStatusClass(item.status)}`}>
                                    {item.status}
                                </span>
                                <span className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                                    {item.type}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    {item.description && (
                        <p className="text-gray-600 dark:text-gray-300 mb-4 text-lg leading-relaxed">
                            {item.description}
                        </p>
                    )}

                    {/* Details Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {(item.startTime || item.endTime) && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <Clock className="w-5 h-5 mr-3 text-blue-500 flex-shrink-0" />
                                <span className="font-medium">
                                    {item.startTime} {item.endTime ? `- ${item.endTime}` : ''}
                                </span>
                            </div>
                        )}

                        {item.location && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300">
                                <MapPin className="w-5 h-5 mr-3 text-green-500 flex-shrink-0" />
                                <span className="font-medium truncate">{item.location}</span>
                            </div>
                        )}

                        {item.assignedTo && item.assignedTo.length > 0 && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300 md:col-span-2">
                                <User className="w-5 h-5 mr-3 text-purple-500 flex-shrink-0" />
                                <div>
                                    <span className="font-medium">Assigned to: </span>
                                    <span className="text-blue-600 dark:text-blue-400">
                                        {item.assignedTo.map(u => u.name).join(', ')}
                                    </span>
                                </div>
                            </div>
                        )}

                        {item.blogPost && item.blogPost.title && (
                            <div className="flex items-center text-gray-600 dark:text-gray-300 md:col-span-2">
                                <BookOpen className="w-5 h-5 mr-3 text-indigo-500 flex-shrink-0" />
                                <div>
                                    <span className="font-medium">Related Blog: </span>
                                    <span className="text-indigo-600 dark:text-indigo-400">
                                        {item.blogPost.title}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
                    <button
                        onClick={() => onEdit(item)}
                        className="p-3 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
                        title="Edit"
                    >
                        <Edit className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => onDelete(item._id)}
                        className="p-3 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/40 text-red-600 dark:text-red-400 transition-all duration-200 hover:scale-110 active:scale-95 shadow-md"
                        title="Delete"
                    >
                        <Trash2 className="w-5 h-5" />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ScheduleItemCard;