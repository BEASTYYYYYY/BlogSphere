// src/components/MaintenancePage.jsx
import React from 'react';

export default function MaintenancePage() {
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100 p-4">
            <div className="text-center bg-white p-8 rounded-lg shadow-lg">
                <svg
                    className="mx-auto h-16 w-16 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                </svg>
                <h1 className="mt-4 text-3xl font-bold text-gray-900">Under Maintenance</h1>
                <p className="mt-2 text-gray-600">
                    We're currently performing essential maintenance to improve our service.
                    We apologize for the inconvenience and appreciate your patience.
                </p>
                <p className="mt-4 text-sm text-gray-500">
                    Please check back soon!
                </p>
            </div>
        </div>
    );
}