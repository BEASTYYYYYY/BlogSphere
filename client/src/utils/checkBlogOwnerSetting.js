// utils/checkBlogOwnerSetting.js
import axios from 'axios';
import { getAuth } from 'firebase/auth'; // Import getAuth to get the Firebase user for token

const API_BASE_URL = 'http://localhost:5000/api'; // Ensure this matches your frontend's API_BASE_URL

const checkBlogOwnerSetting = async (authorId, settingKey) => {
    if (!authorId || !settingKey) {
        console.error("Author ID or setting key missing for checkBlogOwnerSetting.");
        return true; // Default to true if arguments are missing
    }

    try {
        const auth = getAuth();
        const firebaseUser = auth.currentUser;
        let config = {};

        if (firebaseUser) {
            const token = await firebaseUser.getIdToken();
            config.headers = { Authorization: `Bearer ${token}` };
        } else {
            // If no user is logged in, you might default to true (allow interaction)
            // or return false if your public endpoint setup implies default restrictions.
            // For now, if no user, we can't fetch settings, so allow.
            return true;
        }

        // Make an API call to your backend to get the author's settings
        const response = await axios.get(`${API_BASE_URL}/users/${authorId}/settings`, config);
        const settings = response.data;

        // Return true if the setting is explicitly true or undefined (meaning no restriction)
        // Return false if the setting is explicitly false
        return settings?.[settingKey] !== false;
    } catch (error) {
        console.error(`Error checking setting '${settingKey}' for user ${authorId}:`, error.response?.data || error.message);
        // If there's an error (e.g., user not found, server error),
        // default to allowing the interaction to avoid blocking by mistake.
        return true;
    }
};

export default checkBlogOwnerSetting;