// CategoryContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

const CategoryContext = createContext();

export const useCategory = () => useContext(CategoryContext);

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
            const res = await axios.get(`http://localhost:5000/api/categories/popular`, config);
            setTopCategories(res.data);
        } catch (err) {
            console.error("Failed to fetch popular categories", err);
            // You might want to handle specific error messages or states here if needed
        }
    };

    useEffect(() => {
        if (firebaseUser) {
            fetchTopCategories();
        }
    }, [firebaseUser]); // Re-fetch when firebaseUser changes (login/logout)

    return (
        <CategoryContext.Provider value={{ topCategories, refreshCategories: fetchTopCategories }}>
            {children}
        </CategoryContext.Provider>
    );
};