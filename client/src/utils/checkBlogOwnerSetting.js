// utils/checkBlogOwnerSetting.js
import axios from 'axios';
import { getAuth } from 'firebase/auth'; 

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api'; 

const checkBlogOwnerSetting = async (authorId, settingKey) => {
    if (!authorId || !settingKey) {
        console.error("Author ID or setting key missing for checkBlogOwnerSetting.");
        return true; 
    }

    try {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        let config = {};

        if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            config.headers = { Authorization: `Bearer ${token}` };
        } else {
            return true;
        }
        const response = await axios.get(`${API_BASE_URL}/users/${authorId}/settings`, config);
        const settings = response.data;
        return settings?.[settingKey] !== false;
    } catch (error) {
        console.error(`Error checking setting '${settingKey}' for user ${authorId}:`, error.response?.data || error.message);
        return true;
    }
};

export default checkBlogOwnerSetting;