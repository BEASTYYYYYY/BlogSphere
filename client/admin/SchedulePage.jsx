// filename: SchedulePage.jsx
import React, { useState, useEffect } from 'react';
import { getAuth } from 'firebase/auth';
import { format } from 'date-fns';
import { Calendar as CalendarIcon, Plus } from 'lucide-react';

// Import refactored components
import ScheduleItemCard from './components/ScheduleItemCard'; 
import ScheduleItemModal from './components/ScheduleItemModal'; 
import QuickStatsPanel from './components/QuickStatsPanel'; 
import EmptyState from './components/EmptyState'; 
import LoadingState from './components/LoadingState'; 
import ErrorAlert from './components/ErrorAlert'; 
import MiniCalendar from './components/MiniCalendar';

// Main SchedulePage Component
export default function SchedulePage() {
    const API_BASE_URL = "/api/admin/schedule";
    const ALL_USERS_API = "/api/admin/users";

    const [scheduleItems, setScheduleItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [allAdmins, setAllAdmins] = useState([]);
    const [formError, setFormError] = useState(null); // Separate error for the modal form

    const eventsByDate = scheduleItems.reduce((acc, item) => {
        const dateKey = format(new Date(item.date), 'yyyy-MM-dd');
        if (!acc[dateKey]) {
            acc[dateKey] = [];
        }
        acc[dateKey].push(item);
        return acc;
    }, {});

    useEffect(() => {
        const fetchScheduleItems = async () => {
            setLoading(true);
            setError(null);
            try {
                const auth = getAuth();
                const token = await auth.currentUser.getIdToken();
                const response = await fetch(API_BASE_URL, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setScheduleItems(data);
            } catch (err) {
                console.error("Error fetching schedule items:", err);
                setError("Failed to load schedule items. Please try again.");
            } finally {
                setLoading(false);
            }
        };

        const fetchAllAdmins = async () => {
            try {
                const auth = getAuth();
                const token = await auth.currentUser.getIdToken();
                const response = await fetch(ALL_USERS_API, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                const data = await response.json();
                setAllAdmins(data.filter(user => user.role === 'admin' || user.role === 'superadmin'));
            } catch (err) {
                console.error("Error fetching admins:", err);
                // Optionally set an error for admin fetching, but don't block main schedule display
            }
        };

        fetchScheduleItems();
        fetchAllAdmins();
    }, []);

    const itemsForSelectedDate = eventsByDate[format(selectedDate, 'yyyy-MM-dd')] || [];

    const openModal = (item = null) => {
        setEditingItem(item);
        setFormError(null); 
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormError(null); 
    };

    const handleFormSubmit = async (formData) => {
        setFormError(null);

        if (!formData.title || !formData.type || !formData.date) {
            setFormError("Title, type, and date are required.");
            return;
        }

        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            const method = editingItem ? 'PUT' : 'POST';
            const url = editingItem ? `${API_BASE_URL}/${editingItem._id}` : API_BASE_URL;

            const response = await fetch(url, {
                method,
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            const savedItem = await response.json();

            setScheduleItems(prevItems => {
                if (editingItem) {
                    return prevItems.map(item => (item._id === savedItem._id ? savedItem : item));
                } else {
                    return [...prevItems, savedItem];
                }
            });
            closeModal();
        } catch (err) {
            console.error("Error saving schedule item:", err);
            setFormError(`Failed to save item: ${err.message}`);
        }
    };

    const handleDelete = async (itemId) => {
        if (!window.confirm("Are you sure you want to delete this schedule item?")) return;

        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();
            const response = await fetch(`${API_BASE_URL}/${itemId}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }

            setScheduleItems(prevItems => prevItems.filter(item => item._id !== itemId));
        } catch (err) {
            console.error("Error deleting schedule item:", err);
            setError(`Failed to delete item: ${err.message}`); // Use main error state for delete
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
            {/* Header Section */}
            <div className="px-6 pt-6 pb-4">
                <div className="text-center mb-6">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent mb-3">
                        Admin Schedule & Assignments
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 text-lg">Manage your team's schedule and track assignments efficiently</p>
                </div>

                <ErrorAlert error={error} onDismiss={() => setError(null)} />
            </div>

            <div className="max-w-7xl mx-auto px-6 pb-6">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                    {/* Sidebar - Calendar and Controls */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        {/* Calendar Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <MiniCalendar
                                currentDate={selectedDate}
                                setCurrentDate={setSelectedDate}
                                eventsByDate={eventsByDate}
                            />
                        </div>

                        {/* Add New Item Button */}
                        <button
                            onClick={() => openModal()}
                            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold py-4 px-6 rounded-xl flex items-center justify-center space-x-3 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 active:scale-95"
                        >
                            <Plus className="w-6 h-6" />
                            <span className="text-lg">Add New Item</span>
                        </button>

                        {/* Quick Stats Card */}
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
                            <QuickStatsPanel
                                scheduleItems={scheduleItems}
                                selectedDate={selectedDate}
                                eventsByDate={eventsByDate}
                            />
                        </div>
                    </div>

                    {/* Main Content - Schedule Items */}
                    <div className="lg:col-span-8 xl:col-span-9">
                        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-8">
                            {/* Enhanced Header */}
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">
                                        {format(selectedDate, 'PPPP')}
                                    </h2>
                                    <p className="text-gray-600 dark:text-gray-400 text-lg">
                                        {itemsForSelectedDate.length} {itemsForSelectedDate.length === 1 ? 'item' : 'items'} scheduled
                                    </p>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CalendarIcon className="w-8 h-8 text-blue-500" />
                                </div>
                            </div>

                            {loading ? (
                                <LoadingState />
                            ) : itemsForSelectedDate.length === 0 ? (
                                <EmptyState selectedDate={selectedDate} onAddNew={() => openModal()} />
                            ) : (
                                <div className="space-y-6">
                                    {itemsForSelectedDate.map(item => (
                                        <ScheduleItemCard
                                            key={item._id}
                                            item={item}
                                            onEdit={openModal}
                                            onDelete={handleDelete}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            <ScheduleItemModal
                isOpen={isModalOpen}
                onClose={closeModal}
                editingItem={editingItem}
                onSubmit={handleFormSubmit}
                allAdmins={allAdmins}
                error={formError}
            />
        </div>
    );
}