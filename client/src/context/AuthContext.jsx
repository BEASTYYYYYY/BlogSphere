import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, getIdToken } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import axios from "axios"; // Ensure axios is imported

const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const AuthProvider = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [mongoUser, setMongoUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Axios Interceptor for Authorization Header
    useEffect(() => {
        const requestInterceptor = axios.interceptors.request.use(
            async (config) => {
                const user = auth.currentUser;
                if (user) {
                    try {
                        // Force refresh token if needed (true) or get current one
                        const token = await getIdToken(user, true); // Get fresh token, force refresh if near expiry
                        config.headers.Authorization = `Bearer ${token}`;
                    } catch (error) {
                        console.error("Error getting Firebase ID token:", error);
                        // If token acquisition fails, clear auth to force re-login
                        await signOut(auth);
                        setFirebaseUser(null);
                        setMongoUser(null);
                        // Reject the request to prevent it from going out without a token
                        return Promise.reject(error);
                    }
                }
                return config;
            },
            (error) => {
                return Promise.reject(error);
            }
        );

        // Cleanup function to eject the interceptor when component unmounts
        return () => {
            axios.interceptors.request.eject(requestInterceptor);
        };
    }, []); // Empty dependency array means this runs once on mount/unmount

    // Function to fetch or refresh MongoDB user data
    const fetchMongoUserData = useCallback(async (user) => {
        if (!user) {
            setMongoUser(null);
            return;
        }
        try {
            // No need to get token here, axios interceptor handles it
            const res = await axios.get(`${API_BASE_URL}/users/me`); // Interceptor adds Authorization header
            const userData = res.data;

            if (userData.status === 'blocked') {
                alert('🚫 Your account has been blocked.');
                await signOut(auth);
                setFirebaseUser(null);
                setMongoUser(null);
            } else {
                setMongoUser(userData);
            }
        } catch (err) {
            console.error('User fetch failed:', err.message);
            // Specifically handle 401/403 for user fetch
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                console.warn('Authentication issue fetching user data, attempting logout.');
                await signOut(auth); // Force logout if unauthorized
            }
            setMongoUser(null);
        }
    }, []);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            await fetchMongoUserData(user);
            setLoading(false);
        });
        return () => unsub();
    }, [fetchMongoUserData]);

    const refreshMongoUser = useCallback(() => {
        if (firebaseUser) {
            fetchMongoUserData(firebaseUser);
        }
    }, [firebaseUser, fetchMongoUserData]);

    // ✅ Logout Function
    const logout = async () => {
        try {
            // No need to get token here, interceptor will handle it for the logout API call
            // Only make the API call if firebaseUser exists to get a token
            if (firebaseUser) {
                await axios.post(`${API_BASE_URL}/users/logout`, {}); // Interceptor adds Authorization header
            }
            await signOut(auth); // Always sign out Firebase regardless of API call success
            setFirebaseUser(null);
            setMongoUser(null);
        } catch (err) {
            console.error("❌ Logout error:", err.message);
        }
    };

    return (
        <AuthContext.Provider value={{ firebaseUser, mongoUser, logout, refreshMongoUser }}>
            {!loading && children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);