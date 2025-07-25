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
            // Fetch general settings
            const settingsResponse = await fetch("/api/admin/settings", {
                headers: {
                    "Authorization": token ? `Bearer ${token}` : ""
                }
            });

            if (settingsResponse.ok) {
                const settingsData = await settingsResponse.json();
                // Removed setSiteTitle
                setMaintenanceMode(settingsData.maintenanceMode || false);
            } else {
                console.error("Failed to fetch app settings:", settingsResponse.statusText);
                // Continue with default settings if fetch fails
            }

            // Determine admin status
            if (user) {
                const userTokenResult = await user.getIdTokenResult();
                if (userTokenResult.claims.role === 'admin' || userTokenResult.claims.role === 'superadmin') {
                    setIsAdmin(true);
                } else {
                    // Fallback if roles are not in custom claims (less efficient)
                    const dbUserResponse = await fetch(`/api/users/me`, { // Using /api/users/me for current user
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
                setIsAdmin(false); // No user, not admin
            }
        } catch (error) {
            console.error("Error fetching app settings or user role:", error);
        } finally {
            setIsSettingsLoading(false);
        }
    }, []); // useCallback dependency array is empty because user comes from onAuthStateChanged

    useEffect(() => {
        // Listen for Firebase auth state changes to re-fetch settings and roles
        const unsubscribe = getAuth().onAuthStateChanged(user => {
            fetchAndSetSettings(user); // Call the memoized function with the user object
        });

        return () => unsubscribe(); // Clean up the listener on unmount
    }, [fetchAndSetSettings]); // Dependency on fetchAndSetSettings memoized function

    // Provide a way for AdminSettings component to update the context directly
    // Removed siteTitle from updateGlobalSettings
    const updateGlobalSettings = useCallback((newMaintenanceMode) => {
        setMaintenanceMode(newMaintenanceMode);
    }, []);


    const value = {
        maintenanceMode,
        isSettingsLoading,
        isAdmin,
        updateGlobalSettings // Expose updater function
    };

    return (
        <AppSettingsContext.Provider value={value}>
            {children}
        </AppSettingsContext.Provider>
    );
};