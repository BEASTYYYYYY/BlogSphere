// filename: ErrorAlert.jsx
import React from 'react';
import { XCircle } from 'lucide-react';

const ErrorAlert = ({ error, onDismiss }) => {
    if (!error) return null;

    return (
        <div className="max-w-4xl mx-auto mb-6">
            <div className="bg-gradient-to-r from-red-50 to-rose-50 border-l-4 border-red-400 text-red-700 p-4 rounded-lg shadow-md" role="alert">
                <div className="flex items-center">
                    <XCircle className="w-5 h-5 mr-3 flex-shrink-0" />
                    <div>
                        <strong className="font-bold">Error!</strong>
                        <span className="block sm:inline ml-2">{error}</span>
                    </div>
                    {onDismiss && (
                        <button
                            onClick={onDismiss}
                            className="ml-auto p-1.5 rounded-full hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-500"
                            title="Dismiss"
                        >
                            <XCircle className="w-5 h-5 text-red-600" />
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ErrorAlert;