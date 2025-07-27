// src/context/AppSettingsContext.js
import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { getAuth } from 'firebase/auth'; // For Firebase user info

// 1. Create the Context
const AppSettingsContext = createContext();

// 2. Custom Hook to Consume the Context
export const useAppSettings = () => {
    const context = useContext(AppSettingsContext);
    if (context === undefined) {
        // This throw helps debug if component is rendered outside the Provider
        throw new Error('useAppSettings must be used within an AppSettingsProvider');
    }
    return context;
};

// 3. The Provider Component
export const AppSettingsProvider = ({ children }) => {
    // Removed siteTitle from state
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [isSettingsLoading, setIsSettingsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false); // State to hold admin status

    const fetchAndSetSettings = useCallback(async (user) => {
        setIsSettingsLoading(true);
        let token = null;

        if (user) {
            token = await user.getIdToken();
        }

        try {
            const settingsResponse = await fetch("/api/admin/settings", {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            });

            if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json();
                setMaintenanceMode(settingsData.maintenanceMode || false);
            } else {
                console.error("Failed to fetch app settings:", settingsResponse.statusText);
            }
            if (user) {
                const userTokenResult = await user.getIdTokenResult();
                if (userTokenResult.claims.role === 'admin' || userTokenResult.claims.role === 'superadmin') {
                    setIsAdmin(true);
                } else {
                    const dbUserResponse = await fetch(`/api/users/me`, { 
                        headers: {
                            "Authorization": token ? `Bearer ${token}` : ""
                        }
                    });
                    if (dbUserResponse.ok) {
                        const dbUserData = await dbUserResponse.json();
                        if (dbUserData.role === 'admin' || dbUserData.role === 'superadmin') {
                            setIsAdmin(true);
                        }
                    }
                }
            } else {
                setIsAdmin(false); 
            }
        } catch (error) {
            console.error("Error fetching app settings or user role:", error);
        } finally {
            setIsSettingsLoading(false);
        }
    }, []); 

    useEffect(() => {
        const unsubscribe = getAuth().onAuthStateChanged(user => {
            fetchAndSetSettings(user); 
        });

        return () => unsubscribe(); 
    }, [fetchAndSetSettings]); 

    const updateGlobalSettings = useCallback((newMaintenanceMode) => {
        setMaintenanceMode(newMaintenanceMode);
    }, []);


    const value = {
        maintenanceMode,
        isSettingsLoading,
        isAdmin,
        updateGlobalSettings 
    };

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
};