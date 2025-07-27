// filename: QuickStatsPanel.jsx
import React from 'react';
import { format } from 'date-fns';

const QuickStatsPanel = ({ scheduleItems, selectedDate, eventsByDate }) => {
    const todayEventsCount = eventsByDate[format(new Date(), 'yyyy-MM-dd')]?.length || 0;
    const selectedDateEventsCount = eventsByDate[format(selectedDate, 'yyyy-MM-dd')]?.length || 0;

    return (
        <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">Quick Stats</h3>
            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Total Items</span>
                    <span className="font-bold text-blue-600 dark:text-blue-400">{scheduleItems.length}</span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Today's Items</span>
                    <span className="font-bold text-green-600 dark:text-green-400">
                        {todayEventsCount}
                    </span>
                </div>
                <div className="flex justify-between items-center">
                    <span className="text-gray-600 dark:text-gray-400">Selected Date</span>
                    <span className="font-bold text-purple-600 dark:text-purple-400">{selectedDateEventsCount}</span>
                </div>
            </div>
        </div>
    );
};

export default QuickStatsPanel;