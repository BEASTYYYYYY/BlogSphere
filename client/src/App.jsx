/* eslint-disable no-unused-vars */
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation, useNavigate } from 'react-router-dom';
import React, { useState, useEffect, createContext, useContext, useRef } from 'react';
import { useAuth, AuthProvider } from "./context/AuthContext";
import { CategoryProvider } from "./context/CategoryContext";
import { AppSettingsProvider, useAppSettings } from './context/AppSettingsContext';
import Dashboard from "./pages/Dashboard";
import AuthPage from "./pages/AuthPage";
import CreateBlog from "./pages/CreateBlog";
import EditBlog from "./pages/EditBlog";
import BlogDetails from "./pages/BlogDetails";
import Profile from "./pages/Profile";
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import MyBlogsPage from "./pages/MyBlogsPage";
import LikedPosts from "./pages/LikedPosts";
import Bookmarks from "./pages/Bookmarks";
import Trending from "./pages/Trending";
import Following from "./pages/Following";
import CategoryPage from './pages/CategoryPage';
import AdminRoutes from './routes/AdminRoutes';
import TagPage from './pages/TagPage';
import SettingsPage from "./pages/Settings";
import LandingPage from './pages/LandingPage';
import toast, { Toaster } from 'react-hot-toast';
import axios from 'axios';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function MaintenanceWrapper({ children }) {
  const { mongoUser, firebaseUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMaintenanceMode, setIsMaintenanceMode] = useState(false);
  const [loadingMaintenanceStatus, setLoadingMaintenanceStatus] = useState(true);
  const maintenanceToastIdRef = useRef(null);

  // Function to fetch maintenance status
  const fetchMaintenanceStatus = async () => {
    // No need to check firebaseUser here, the axios interceptor handles token
    // and will reject if no user/token.
    try {
      const res = await axios.get(`${API_BASE_URL}/admin/settings`); // Interceptor adds Authorization header
      const { maintenanceMode } = res.data;
      setIsMaintenanceMode(maintenanceMode);
    } catch (error) {
      console.error("Failed to fetch maintenance status:", error);
      // If it's a 401, it means the user isn't authenticated, so maintenance mode
      // won't apply in the same way (or they can't access anyway).
      // We assume not in maintenance for unauthenticated users or on error.
      setIsMaintenanceMode(false);
    } finally {
      setLoadingMaintenanceStatus(false);
    }
  };

  useEffect(() => {
    // This useEffect will now run whenever firebaseUser changes,
    // which is the right trigger for authenticated fetches.
    if (firebaseUser !== undefined) { // Check if Firebase has initialized (could be null or a user)
      fetchMaintenanceStatus();
      const interval = setInterval(fetchMaintenanceStatus, 60000);
      return () => clearInterval(interval);
    } else {
      // If firebaseUser is explicitly undefined (during very initial auth state) or null
      // Set default states while waiting or if unauthenticated.
      setLoadingMaintenanceStatus(false);
      setIsMaintenanceMode(false);
    }
  }, [firebaseUser]);

  useEffect(() => {
    const isAdmin = mongoUser?.role === 'admin' || mongoUser?.role === 'superadmin';
    const isAuthPage = location.pathname.startsWith('/auth');
    const isAdminPage = location.pathname.startsWith('/admin');
    const isLandingPage = location.pathname === '/';
    const shouldRedirect = isMaintenanceMode && !isAdmin && !isLandingPage && !isAuthPage && !isAdminPage;

    if (shouldRedirect) {
      navigate('/', { replace: true });
      if (!maintenanceToastIdRef.current) {
        maintenanceToastIdRef.current = toast.error(
          "Site is currently undergoing maintenance. Please check back later!",
          {
            duration: Infinity,
            id: 'maintenance-toast',
          }
        );
      }
    } else {
      if (maintenanceToastIdRef.current) {
        toast.dismiss(maintenanceToastIdRef.current);
        maintenanceToastIdRef.current = null;
      }
    }
    if (isMaintenanceMode && !isAdmin && isLandingPage) {
      if (!maintenanceToastIdRef.current || toast.current(maintenanceToastIdRef.current)?.message !== "Site is currently undergoing maintenance. Only admins can access other pages.") {
        if (maintenanceToastIdRef.current) {
          toast.dismiss(maintenanceToastIdRef.current);
        }
        maintenanceToastIdRef.current = toast.error(
          "Site is currently undergoing maintenance. Only admins can access other pages.",
          {
            duration: Infinity,
            id: 'maintenance-landing-toast',
          }
        );
      }
    } else {
      if (maintenanceToastIdRef.current && toast.current(maintenanceToastIdRef.current)?.id === 'maintenance-landing-toast') {
        toast.dismiss(maintenanceToastIdRef.current);
        maintenanceToastIdRef.current = null;
      }
    }

  }, [isMaintenanceMode, mongoUser, location.pathname, navigate]);

  if (loadingMaintenanceStatus) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <p className="text-xl text-gray-700 dark:text-gray-300">Loading site status...</p>
      </div>
    );
  }

  return children;
}


const ProtectedRoute = ({ children }) => {
  const { mongoUser } = useAuth();
  const location = useLocation();

  useEffect(() => {
    if (!mongoUser && location.pathname !== '/' && location.pathname !== '/auth') {
      toast.error("Please sign in or create an account to access this page.");
    }
  }, [mongoUser, location.pathname]);

  if (!mongoUser) {
    return <Navigate to="/" replace />;
  }

  return children;
};

const PublicRoute = ({ children }) => {
  const { mongoUser } = useAuth();
  return mongoUser ? <Navigate to="/user" /> : children;
};

const LandingRoute = ({ children }) => {
  return children;
};

function AppContent() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();
  const { mongoUser } = useAuth(); // Get mongoUser to check admin role

  const isAuthOrAdminPage = location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin');
  const isLandingPage = location.pathname === '/';

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [darkMode]);

  useEffect(() => {
    const pathsToExclude = [
      '/',
      '/dashboard',
      '/user',
      '/trending',
      '/my-blogs'
    ];

    const shouldExclude = pathsToExclude.some(path => {
      if (path === location.pathname) return true;
      if (path === '/trending' && location.pathname.startsWith('/trending')) return true;
      return false;
    });

    if (!shouldExclude) {
      window.scrollTo({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [location.pathname]);

  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
        {!isAuthOrAdminPage && !isLandingPage && (
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            activeTab={location.pathname}
          />
        )}

        <div className={`flex-1 flex flex-col transition-all duration-300 ${!isAuthOrAdminPage && !isLandingPage && sidebarCollapsed
          ? 'md:ml-16'
          : !isAuthOrAdminPage && !isLandingPage
            ? 'md:ml-64'
            : ''
          }`}>
          {!isAuthOrAdminPage && !isLandingPage && (
            <Sidebar
              isCollapsed={sidebarCollapsed}
              setIsCollapsed={setSidebarCollapsed}
              isSidebarOpen={sidebarOpen}
              setIsSidebarOpen={setSidebarOpen}
              activeTab={location.pathname}
            />
          )}

          <main className={`flex-1 overflow-x-hidden overflow-y-auto ${!isAuthOrAdminPage && !isLandingPage ? 'pt-20' : ''}`}>
            {/* Wrap routes with MaintenanceWrapper */}
            <MaintenanceWrapper>
              <Routes>
                {/* Landing page - accessible to everyone */}
                <Route path="/" element={<LandingRoute><LandingPage /></LandingRoute>} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/user" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/profile/:id" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
                <Route path="/write" element={<ProtectedRoute><CreateBlog /></ProtectedRoute>} />
                <Route path="/edit-blog/:id" element={<ProtectedRoute><EditBlog /></ProtectedRoute>} />
                <Route path="/blog/:id" element={<ProtectedRoute><BlogDetails /></ProtectedRoute>} />
                <Route path="/my-blogs" element={<ProtectedRoute><MyBlogsPage /></ProtectedRoute>} />
                <Route path="/liked" element={<ProtectedRoute><LikedPosts /></ProtectedRoute>} />
                <Route path="/bookmarks" element={<ProtectedRoute><Bookmarks /></ProtectedRoute>} />
                <Route path="/trending" element={<ProtectedRoute><Trending /></ProtectedRoute>} />
                <Route path="/following" element={<ProtectedRoute><Following /></ProtectedRoute>} />
                <Route path="/category/:name" element={<ProtectedRoute><CategoryPage /></ProtectedRoute>} />
                <Route path="/tag/:name" element={<ProtectedRoute><TagPage /></ProtectedRoute>} />

                {/* Auth route */}
                <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
                <Route path="/admin/*" element={<ProtectedRoute><AdminRoutes /></ProtectedRoute>} />
                <Route path="*" element={<ProtectedRoute><Navigate to="/user" replace /></ProtectedRoute>} />
              </Routes>
            </MaintenanceWrapper>
          </main>
        </div>

        {!isAuthOrAdminPage && !isLandingPage && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
      <Toaster position="top-center" reverseOrder={false} /> {/* Toast container */}
    </ThemeContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <CategoryProvider>
          <AppSettingsProvider>
            <AppContent />
          </AppSettingsProvider>
        </CategoryProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;