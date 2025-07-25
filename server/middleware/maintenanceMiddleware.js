// middleware/maintenanceMiddleware.js
import Setting from '../models/Setting.js'; // Assuming you have this model
import User from '../models/User.js';     // To check user role

export const checkMaintenanceMode = async (req, res, next) => {
    try {
        const maintenanceMode = await Setting.getSetting('maintenanceMode');

        if (maintenanceMode) {
            // Check if the request is for the API, not just frontend assets/pages
            if (req.originalUrl.startsWith('/api')) {
                // If maintenance mode is on, check if the user is an admin
                // The Firebase token verification would have already run via router.use(verifyFirebaseToken)
                // so req.user should be populated if authenticated.
                const firebaseUser = req.user; // Assuming req.user is populated by verifyFirebaseToken middleware

                let isAdmin = false;
                if (firebaseUser && firebaseUser._id) { // Check if user is authenticated and has an _id
                    const dbUser = await User.findById(firebaseUser._id).select('role');
                    if (dbUser && (dbUser.role === 'admin' || dbUser.role === 'superadmin')) {
                        isAdmin = true;
                    }
                }

                if (!isAdmin) {
                    // For API requests, send a 503 Service Unavailable status
                    return res.status(503).json({
                        message: 'Application is currently under maintenance. Please try again later.',
                        maintenanceMode: true
                    });
                }
            }
            // If it's a non-API request (e.g., serving HTML) or an admin, proceed.
            // Frontend will handle redirecting non-admins to a maintenance page.
            // Or, if this middleware is applied globally before routing, it might redirect here.
            // For now, it primarily flags API access.
        }
        next(); // Proceed if not in maintenance or if user is admin
    } catch (error) {
        console.error('Error in maintenanceMode middleware:', error);
        // Even if there's an error fetching settings, let the request proceed to avoid blocking everything
        next();
    }
};