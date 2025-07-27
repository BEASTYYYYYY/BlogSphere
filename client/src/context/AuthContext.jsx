import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, getIdToken } from "firebase/auth";
import { auth } from "../firebase/firebaseConfig";
import axios from "axios";

const AuthContext = createContext();
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ; 

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
            const res = await axios.get(`${API_BASE_URL}/users/me`, { 
                headers: { Authorization: `Bearer ${token}` }
            });
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
            await signOut(auth);
            const token = firebaseUser ? await firebaseUser.getIdToken() : null; 
            if (token) {
                await axios.post(`${API_BASE_URL}/users/logout`, {}, { 
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
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