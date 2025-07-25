// filename: LoadingState.jsx
import React from 'react';

const LoadingState = () => {
    return (
        <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-100 to-purple-100 rounded-full mb-4">
                <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent"></div>
            </div>
            <p className="text-lg text-gray-600 dark:text-gray-400">Loading your schedule...</p>
        </div>
    );
};

export default LoadingState;