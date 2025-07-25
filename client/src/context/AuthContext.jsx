import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, getIdToken } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import axios from "axios";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [firebaseUser, setFirebaseUser] = useState(null);
    const [mongoUser, setMongoUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Function to fetch or refresh MongoDB user data
    const fetchMongoUserData = useCallback(async (user) => {
        if (!user) {
            setMongoUser(null);
            return;
        }
        try {
            const token = await getIdToken(user);
            // Ensure the base URL is correctly defined for Axios if not set globally
            const res = await axios.get('http://localhost:5000/api/users/me', { // Use full URL if not set with axios.defaults.baseURL
                headers: { Authorization: `Bearer ${token}` }
            });
            const userData = res.data;

            if (userData.status === 'blocked') {
                alert('🚫 Your account has been blocked.');
                // Optionally sign out the user if blocked
                await signOut(auth);
                setFirebaseUser(null);
                setMongoUser(null);
            } else {
                setMongoUser(userData);
            }
        } catch (err) {
            console.error('User fetch failed:', err.message);
            setMongoUser(null); // Clear mongoUser if fetch fails
        }
    }, []); // No dependencies for useCallback, as `user` is passed as argument

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, async (user) => {
            setFirebaseUser(user);
            await fetchMongoUserData(user); // Fetch MongoDB user data when Firebase user state changes
            setLoading(false);
        });
        return () => unsub();
    }, [fetchMongoUserData]); // Dependency on fetchMongoUserData

    // Expose refreshMongoUser to context consumers
    const refreshMongoUser = useCallback(() => {
        if (firebaseUser) {
            fetchMongoUserData(firebaseUser);
        }
    }, [firebaseUser, fetchMongoUserData]);


    // ✅ Logout Function
    const logout = async () => {
        try {
            // Firebase sign out
            await signOut(auth);

            // Set status to 'deactive' in MongoDB (backend must handle this)
            // This might also be handled by a Firebase Cloud Function trigger
            const token = firebaseUser ? await firebaseUser.getIdToken() : null; // Get token before clearing firebaseUser
            if (token) {
                await axios.post('http://localhost:5000/api/users/logout', {}, { // Use full URL
                    headers: { Authorization: `Bearer ${token}` }
                });
            }

            // Clear local states
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