// filename: EmptyState.jsx
import React from 'react';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

const EmptyState = ({ selectedDate, onAddNew }) => {
    return (
        <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-r from-gray-100 to-slate-100 dark:from-gray-700 dark:to-gray-600 rounded-full mb-6">
                <CalendarIcon className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">No items scheduled</h3>
            <p className="text-gray-500 dark:text-gray-400 text-lg mb-6">
                Your calendar is clear for {format(selectedDate, 'PPPP')}. Perfect time to plan something new!
            </p>
            <button
                onClick={onAddNew}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-105"
            >
                Add Your First Item
            </button>
        </div>
    );
};

export default EmptyState;