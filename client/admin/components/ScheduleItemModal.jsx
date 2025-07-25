// filename: ScheduleItemModal.jsx
import React, { useState, useEffect } from 'react';
import { XCircle, Info } from 'lucide-react';
import { format } from 'date-fns';

const ScheduleItemModal = ({ isOpen, onClose, editingItem, onSubmit, allAdmins, error }) => {
    const [formState, setFormState] = useState({
        title: '',
        description: '',
        type: 'assignment',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '',
        endTime: '',
        assignedTo: [],
        blogPost: '',
        status: 'pending',
        location: ''
    });

    useEffect(() => {
        if (editingItem) {
            setFormState({
                title: editingItem.title,
                description: editingItem.description,
                type: editingItem.type,
                date: format(new Date(editingItem.date), 'yyyy-MM-dd'),
                startTime: editingItem.startTime || '',
                endTime: editingItem.endTime || '',
                assignedTo: editingItem.assignedTo.map(u => u._id),
                blogPost: editingItem.blogPost ? editingItem.blogPost._id : '',
                status: editingItem.status,
                location: editingItem.location || ''
            });
        } else {
            setFormState({
                title: '',
                description: '',
                type: 'assignment',
                date: format(new Date(), 'yyyy-MM-dd'), // Default to current date if adding new
                startTime: '',
                endTime: '',
                assignedTo: [],
                blogPost: '',
                status: 'pending',
                location: ''
            });
        }
    }, [editingItem, isOpen]); // Reset form when modal opens or editingItem changes

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormState(prevState => ({
            ...prevState,
            [name]: value
        }));
    };

    const handleAssignedToChange = (e) => {
        const options = e.target.options;
        const value = [];
        for (let i = 0, l = options.length; i < l; i++) {
            if (options[i].selected) {
                value.push(options[i].value);
            }
        }
        setFormState(prevState => ({
            ...prevState,
            assignedTo: value
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formState);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl p-8 max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-300">
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {editingItem ? 'Edit Schedule Item' : 'Add New Schedule Item'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                    >
                        <XCircle className="w-6 h-6 text-gray-500" />
                    </button>
                </div>

                {error && (
                    <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg mb-6" role="alert">
                        <div className="flex items-center">
                            <XCircle className="w-5 h-5 mr-3" />
                            <div>
                                <strong className="font-bold">Error!</strong>
                                <span className="block sm:inline ml-2">{error}</span>
                            </div>
                        </div>
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Title */}
                    <div>
                        <label htmlFor="title" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formState.title}
                            onChange={handleChange}
                            className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white text-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                            placeholder="Enter a descriptive title"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label htmlFor="description" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Description
                        </label>
                        <textarea
                            id="description"
                            name="description"
                            rows="4"
                            value={formState.description}
                            onChange={handleChange}
                            className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 resize-none"
                            placeholder="Add detailed description..."
                        />
                    </div>

                    {/* Type and Status Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="type" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="type"
                                name="type"
                                value={formState.type}
                                onChange={handleChange}
                                className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                                required
                            >
                                <option value="assignment">📚 Assignment</option>
                                <option value="meeting">👥 Meeting</option>
                                <option value="deadline">⏰ Deadline</option>
                                <option value="event">✨ Event</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="status" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Status
                            </label>
                            <select
                                id="status"
                                name="status"
                                value={formState.status}
                                onChange={handleChange}
                                className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            >
                                <option value="pending">🔄 Pending</option>
                                <option value="in-progress">⚡ In Progress</option>
                                <option value="completed">✅ Completed</option>
                                <option value="cancelled">❌ Cancelled</option>
                            </select>
                        </div>
                    </div>

                    {/* Date */}
                    <div>
                        <label htmlFor="date" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Date <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="date"
                            id="date"
                            name="date"
                            value={formState.date}
                            onChange={handleChange}
                            className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            required
                        />
                    </div>

                    {/* Time Range */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label htmlFor="startTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Start Time
                            </label>
                            <input
                                type="time"
                                id="startTime"
                                name="startTime"
                                value={formState.startTime}
                                onChange={handleChange}
                                className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                        <div>
                            <label htmlFor="endTime" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                End Time
                            </label>
                            <input
                                type="time"
                                id="endTime"
                                name="endTime"
                                value={formState.endTime}
                                onChange={handleChange}
                                className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            />
                        </div>
                    </div>

                    {/* Location */}
                    <div>
                        <label htmlFor="location" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Location
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formState.location}
                            onChange={handleChange}
                            className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                            placeholder="e.g., Conference Room A, Zoom, or Remote"
                        />
                    </div>

                    {/* Assigned To */}
                    <div>
                        <label htmlFor="assignedTo" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                            Assigned To (Team Members)
                        </label>
                        <select
                            id="assignedTo"
                            name="assignedTo"
                            multiple
                            value={formState.assignedTo}
                            onChange={handleAssignedToChange}
                            className="w-full rounded-xl border-gray-300 shadow-sm p-4 bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                        >
                            {allAdmins.map(admin => (
                                <option key={admin._id} value={admin._id} className="p-2">
                                    {admin.name} ({admin.email})
                                </option>
                            ))}
                        </select>
                        <p className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            Hold Ctrl/Cmd to select multiple team members
                        </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200 dark:border-gray-700">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-3 rounded-xl bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-all duration-200 shadow-md hover:shadow-lg"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105 active:scale-95"
                        >
                            {editingItem ? '✏️ Update Item' : '➕ Create Item'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ScheduleItemModal;