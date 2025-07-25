import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import AdminDashboard from "../../admin/AdminDash";
import UploadStats from "../../admin/components/UploadStats"; // Assuming UploadStats is a component, not a page
import AdminSettings from "../../admin/components/AdminSettings"; // Assuming AdminSettings is a component, not a page
import RecentUploadsTable from "../../admin/components/RecentUploadsTable"; // Assuming RecentUploadsTable is a component, not a page
import AdminLayout from "../../admin/AdminLayout";
import SchedulePage from "../../admin/SchedulePage";

const AdminRoutes = () => {
    const { firebaseUser, mongoUser } = useAuth();
    const isAuthenticated = !!firebaseUser;
    const isAdmin = mongoUser && (mongoUser.role === 'admin' || mongoUser.role === 'superadmin');

    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    if (!isAdmin) {
        return <Navigate to="/" replace />;
    }
    return (
        <AdminLayout>
            <Routes>
                <Route index element={<AdminDashboard />} />
                <Route path="user" element={<AdminDashboard />} />
                <Route path="upload-stats" element={<UploadStats />} />
                <Route path="settings" element={<AdminSettings />} />
                <Route path="uploads" element={<RecentUploadsTable />} />
                <Route path="schedule" element={<SchedulePage />} /> {/* <--- NEW ROUTE */}
                <Route path="*" element={<Navigate to="/admin" replace />} />
            </Routes>
        </AdminLayout>
    );
};

export default AdminRoutes;