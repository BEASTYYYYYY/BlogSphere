import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

export const initializeFirebaseAdmin = () => {
    try {
        const firebaseConfig = process.env.FIREBASE_ADMIN_SDK_CONFIG;

        if (!firebaseConfig) {
            throw new Error('FIREBASE_ADMIN_SDK_CONFIG environment variable is not set.');
        }

        const serviceAccount = JSON.parse(firebaseConfig);

        initializeApp({
            credential: cert(serviceAccount)
        });

        console.log('Firebase Admin initialized');
    } catch (error) {
        console.error('Failed to initialize Firebase Admin:', error.message);
        process.exit(1);
    }
};