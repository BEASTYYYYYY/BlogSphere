// src/components/MainLayout.jsx
import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/Navbar'; 
import Sidebar from '../components/Sidebar'; 

export default function MainLayout() {
    const [darkMode, setDarkMode] = useState(true);
    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const toggleSidebarCollapse = () => {
        setIsSidebarCollapsed(!isSidebarCollapsed);
    };
    const toggleSidebarOpen = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };
    useEffect(() => {
        const savedDarkMode = localStorage.getItem('darkMode');
        if (savedDarkMode) {
            setDarkMode(JSON.parse(savedDarkMode));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('darkMode', JSON.stringify(darkMode));
        if (darkMode) {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }, [darkMode]);

    return (
        <div className={`flex min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'}`}>
            {/* Sidebar component */}
            <Sidebar
                darkMode={darkMode}
                isCollapsed={isSidebarCollapsed}
                setIsCollapsed={toggleSidebarCollapse} 
                isSidebarOpen={isSidebarOpen} 
                setIsSidebarOpen={toggleSidebarOpen} 
            />

            {/* Main content area */}
            <div className={`flex-1 flex flex-col transition-all duration-300 ${isSidebarCollapsed ? 'md:ml-16' : 'md:ml-64'}`}>
                {/* Navbar component */}
                <Navbar
                    darkMode={darkMode}
                    setDarkMode={setDarkMode} 
                    sidebarCollapsed={isSidebarCollapsed} 
                    setSidebarCollapsed={toggleSidebarCollapse} 
                    sidebarOpen={isSidebarOpen}
                    setSidebarOpen={toggleSidebarOpen} 
                />
                <main className={`flex-1 overflow-y-auto pt-16`}> 
                    <Outlet />
                </main>
            </div>
            {isSidebarOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
                    onClick={toggleSidebarOpen}
                >
                </div>
            )}
        </div>
    );
}
