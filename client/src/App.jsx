import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useState, useEffect, createContext, useContext, } from 'react';
import { useAuth, AuthProvider } from "./context/AuthContext";
import { CategoryProvider } from "./context/CategoryContext";
import { AppSettingsProvider, useAppSettings } from './context/AppSettingsContext'; // UPDATED IMPORT
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
import MaintenancePage from './components/MaintenancePage';
import SettingsPage from "./pages/Settings";


// Theme Context (assuming it's here and correctly exported)
const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);


// Existing ProtectedRoute
const ProtectedRoute = ({ children }) => {
  const { mongoUser } = useAuth();
  const { maintenanceMode, isSettingsLoading, isAdmin } = useAppSettings(); // siteTitle removed
  const location = useLocation();

  if (isSettingsLoading) {
    return null; // Or a smaller loading indicator
  }

  // If maintenance mode is ON and user is NOT an admin, redirect them to /maintenance
  if (maintenanceMode && !isAdmin && location.pathname !== '/maintenance') {
    return <Navigate to="/maintenance" replace />;
  }

  return mongoUser ? children : <Navigate to="/auth" />;
};

// Existing PublicRoute
const PublicRoute = ({ children }) => {
  const { mongoUser } = useAuth();
  const { maintenanceMode, isSettingsLoading, isAdmin } = useAppSettings(); // siteTitle removed
  const location = useLocation();

  if (isSettingsLoading) {
    return null; // Or a smaller loading indicator
  }

  // If maintenance mode is ON and user is NOT an admin, and current path is not /maintenance, redirect
  if (maintenanceMode && !isAdmin && location.pathname !== '/maintenance') {
    return <Navigate to="/maintenance" replace />;
  }

  return mongoUser ? <Navigate to="/" /> : children;
};


function AppContent() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem("theme") === "dark";
  });
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const location = useLocation();

  const isAuthOrAdminPage = location.pathname.startsWith('/auth') || location.pathname.startsWith('/admin');

  // Get app settings from context
  const { maintenanceMode, isSettingsLoading, isAdmin } = useAppSettings(); // siteTitle removed

  // Apply theme class to <html> tag
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

  if (isSettingsLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600"></div>
        <p className="ml-4 text-xl text-gray-700">Loading application settings...</p>
      </div>
    );
  }

  // If maintenance mode is ON and user is NOT an admin, render only MaintenancePage
  if (maintenanceMode && !isAdmin) {
    return (
      <Routes>
        <Route path="/maintenance" element={<MaintenancePage />} />
        <Route path="*" element={<Navigate to="/maintenance" replace />} />
      </Routes>
    );
  }


  return (
    <ThemeContext.Provider value={{ darkMode, setDarkMode }}>
      <div className="flex min-h-screen bg-gray-100 text-gray-900 dark:bg-gray-900 dark:text-white transition-colors duration-300 ease-in-out">
        {!isAuthOrAdminPage && (
          <Navbar
            sidebarOpen={sidebarOpen}
            setSidebarOpen={setSidebarOpen}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            activeTab={location.pathname}
          // siteTitle={siteTitle} // Removed siteTitle prop
          />
        )}

        <div className={`flex-1 flex flex-col transition-all duration-300 ${!isAuthOrAdminPage && sidebarCollapsed ? 'md:ml-16' : !isAuthOrAdminPage ? 'md:ml-64' : ''}`}>
          {!isAuthOrAdminPage && (
            <Sidebar
              isCollapsed={sidebarCollapsed}
              setIsCollapsed={setSidebarCollapsed}
              isSidebarOpen={sidebarOpen}
              setIsSidebarOpen={setSidebarOpen}
              activeTab={location.pathname}
            />
          )}

          <main className="flex-1 overflow-x-hidden overflow-y-auto">
            <Routes>
              <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
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
              <Route path="/auth" element={<PublicRoute><AuthPage /></PublicRoute>} />
              <Route path="/admin/*" element={<ProtectedRoute><AdminRoutes /></ProtectedRoute>} />

              <Route path="/maintenance" element={
                maintenanceMode && !isAdmin ? <MaintenancePage /> : <Navigate to="/" replace />
              } />
            </Routes>
          </main>
        </div>

        {!isAuthOrAdminPage && sidebarOpen && (
          <div
            className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
            onClick={() => setSidebarOpen(false)}
          ></div>
        )}
      </div>
    </ThemeContext.Provider>
  );
}

function App() {
  return (
    <Router>
      <AuthProvider> {/* AuthProvider as outermost */}
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