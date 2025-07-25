import admin from 'firebase-admin';
import User from '../models/User.js';

export const verifyFirebaseToken = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'No token provided' });
        }
        const token = authHeader.split(' ')[1];
        const decoded = await admin.auth().verifyIdToken(token);

        let user = await User.findOne({ uid: decoded.uid });
        if (!user) {
            // First user ever becomes admin, others are normal users
            const userCount = await User.countDocuments();
            user = await User.create({
                uid: decoded.uid,
                name: decoded.name || "Anonymous User",
                email: decoded.email || `${decoded.uid}@example.com`,
                avatar: decoded.picture || null,
                role: userCount === 0 ? "admin" : "user",
                status: "active"
            });
        } else {
            // Always keep user info in sync with Firebase
            user.name = decoded.name || user.name;
            user.email = decoded.email || user.email;
            user.avatar = decoded.picture || user.avatar;
            await user.save();
        }

        req.user = user;
        next();
    } catch (err) {
        return res.status(401).json({ error: 'Invalid or expired token' });
    }
};