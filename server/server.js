import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import adminRoutes from './routes/adminRoutes.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import blogRoutes from './routes/blogRoutes.js';
import commentRoutes from './routes/commentRoutes.js';
import categoryRoutes from './routes/categoryRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';
import './config/emailTransporter.js';
import { connectDB } from './config/db.js';
import { initializeFirebaseAdmin } from './config/firebaseAdmin.js';

import { checkMaintenanceMode } from './middleware/maintenanceMiddleware.js';
import { verifyFirebaseToken } from './middleware/authMiddleware.js';
import scheduleRoutes from './routes/scheduleRoutes.js';
import settingsRoutes from './routes/settingRoutes.js';

dotenv.config();
const app = express();

connectDB();
initializeFirebaseAdmin();

app.use(cors());
app.use(express.json());

app.use(verifyFirebaseToken);
app.use(checkMaintenanceMode);

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/comments', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/admin/schedule', scheduleRoutes);

app.get('/', (req, res) => res.send('API is running...'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));