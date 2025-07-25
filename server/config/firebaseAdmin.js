import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import fs from 'fs';

export const initializeFirebaseAdmin = () => {
    const serviceAccount = JSON.parse(
        fs.readFileSync('./firebase-admin-sdk.json', 'utf-8') // Adjust path if needed
    );

    initializeApp({
        credential: cert(serviceAccount)
    });

    console.log('Firebase Admin initialized');
};
