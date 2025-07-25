// filename: MiniCalendar.jsx
import React from 'react';
import { format, startOfWeek, endOfWeek, addDays, startOfMonth, endOfMonth, addMonths, subMonths, isSameDay, isToday } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const MiniCalendar = ({ currentDate, setCurrentDate, eventsByDate }) => {
    const startDayOfMonth = startOfMonth(currentDate);
    const endDayOfMonth = endOfMonth(currentDate);

    const days = [];
    let day = startOfWeek(startDayOfMonth);
    const endDate = endOfWeek(endDayOfMonth);

    while (day <= endDate) {
        days.push(day);
        day = addDays(day, 1);
    }

    const handlePrevMonth = () => setCurrentDate(subMonths(currentDate, 1));
    const handleNextMonth = () => setCurrentDate(addMonths(currentDate, 1));

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={handlePrevMonth}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                    <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
                <h3 className="text-xl font-bold text-gray-800 dark:text-white bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    {format(currentDate, 'MMMM yyyy')}
                </h3>
                <button
                    onClick={handleNextMonth}
                    className="p-2.5 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-all duration-200 hover:scale-110 active:scale-95"
                >
                    <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                </button>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center mb-3">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(dayName => (
                    <div key={dayName} className="text-xs font-semibold text-gray-500 dark:text-gray-400 py-2">
                        {dayName}
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center">
                {days.map(d => (
                    <button
                        key={d.getTime()}
                        onClick={() => setCurrentDate(d)}
                        className={`relative p-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 active:scale-95 min-h-[36px] flex items-center justify-center
                            ${isSameDay(d, currentDate)
                                ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg transform scale-105'
                                : isToday(d)
                                    ? 'bg-gradient-to-r from-blue-100 to-purple-100 text-blue-700 dark:from-blue-900/40 dark:to-purple-900/40 dark:text-blue-300 ring-2 ring-blue-300 dark:ring-blue-600'
                                    : 'text-gray-700 hover:bg-gradient-to-r hover:from-gray-100 hover:to-gray-50 dark:text-gray-300 dark:hover:from-gray-700 dark:hover:to-gray-600'
                            }
                            ${format(d, 'MM') !== format(currentDate, 'MM') ? 'opacity-40' : ''}
                        `}
                    >
                        {format(d, 'd')}
                        {eventsByDate[format(d, 'yyyy-MM-dd')] && (
                            <div className="absolute top-1 right-1">
                                <div className="w-2 h-2 bg-gradient-to-r from-red-500 to-pink-500 rounded-full shadow-sm"></div>
                            </div>
                        )}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default MiniCalendar;