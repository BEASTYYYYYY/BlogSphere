// CategoryContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CategoryContext = createContext();

export const useCategory = () => useContext(CategoryContext);
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ; 

export const CategoryProvider = ({ children }) => {
    const [topCategories, setTopCategories] = useState([]);
    const { firebaseUser } = useAuth(); 
    const fetchTopCategories = async () => {
        try {
            let config = {};
            if (firebaseUser) {
                const token = await firebaseUser.getIdToken();
                config.headers = { Authorization: `Bearer ${token}` };
            }
            const res = await axios.get(`${API_BASE_URL}/categories/popular`, config);
            setTopCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch popular categories", err);
        }
    };

    useEffect(() => {
        if (firebaseUser) {
            fetchTopCategories();
        }
    }, [firebaseUser]);

    return (
        <CategoryContext.Provider value={{ topCategories, refreshCategories: fetchTopCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};