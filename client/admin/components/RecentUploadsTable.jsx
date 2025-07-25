/* eslint-disable no-unused-vars */
import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Eye, Trash2, User, Shield, ShieldOff, ChevronLeft, ChevronRight } from "lucide-react"; // Import ChevronLeft and ChevronRight

// Add CSS styles for blog content
const blogContentStyles = `
    .blog-content h1, .blog-content h2, .blog-content h3, .blog-content h4, .blog-content h5, .blog-content h6 {
        font-weight: bold;
        margin: 1.5em 0 0.5em 0;
        line-height: 1.2;
    }
    .blog-content h1 { font-size: 2em; }
    .blog-content h2 { font-size: 1.7em; }
    .blog-content h3 { font-size: 1.4em; }
    .blog-content h4 { font-size: 1.2em; }
    .blog-content h5 { font-size: 1.1em; }
    .blog-content h6 { font-size: 1em; }
    
    .blog-content p {
        margin: 1em 0;
        line-height: 1.6;
    }
    
    .blog-content strong, .blog-content b {
        font-weight: bold;
    }
    
    .blog-content em, .blog-content i {
        font-style: italic;
    }
    
    .blog-content u {
        text-decoration: underline;
    }
    
    .blog-content ul, .blog-content ol {
        margin: 1em 0;
        padding-left: 2em;
    }
    
    .blog-content ul li {
        list-style-type: disc;
        margin: 0.5em 0;
    }
    
    .blog-content ol li {
        list-style-type: decimal;
        margin: 0.5em 0;
    }
    
    .blog-content blockquote {
        border-left: 4px solid #e5e7eb;
        padding-left: 1em;
        margin: 1em 0;
        font-style: italic;
        color: #6b7280;
    }
    
    .blog-content a {
        color: #3b82f6;
        text-decoration: underline;
    }
    
    .blog-content a:hover {
        color: #1d4ed8;
    }
    
    .blog-content img {
        max-width: 100%;
        height: auto;
        margin: 1em 0;
        border-radius: 0.5rem;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .blog-content pre {
        background-color: #f3f4f6;
        padding: 1em;
        border-radius: 0.5rem;
        overflow-x: auto;
        margin: 1em 0;
    }
    
    .blog-content code {
        background-color: #f3f4f6;
        padding: 0.2em 0.4em;
        border-radius: 0.25rem;
        font-family: 'Courier New', monospace;
    }
    
    .blog-content table {
        width: 100%;
        border-collapse: collapse;
        margin: 1em 0;
    }
    
    .blog-content th, .blog-content td {
        border: 1px solid #d1d5db;
        padding: 0.75em;
        text-align: left;
    }
    
    .blog-content th {
        background-color: #f9fafb;
        font-weight: bold;
    }
    
    .blog-content hr {
        border: none;
        border-top: 2px solid #e5e7eb;
        margin: 2em 0;
    }
`;

const ITEMS_PER_PAGE = 10; // Set items per page to 10-15, decided on 10 for consistency

export default function RecentUploadsTable() {
    const [uploads, setUploads] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedBlog, setSelectedBlog] = useState(null);
    const [showBlogModal, setShowBlogModal] = useState(false);
    const [showUserModal, setShowUserModal] = useState(false);
    const [selectedUser, setSelectedUser] = useState(null);
    const [users, setUsers] = useState({});
    const [currentImageIndex, setCurrentImageIndex] = useState(0); // For image gallery
    const [currentPage, setCurrentPage] = useState(1); // For table pagination

    useEffect(() => {
        const fetchUploads = async () => {
            try {
                const token = await getAuth().currentUser.getIdToken();
                const res = await fetch("/api/admin/uploads", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const data = await res.json();
                setUploads(data);
                const userIds = [...new Set(data.map(upload => upload.authorId?._id).filter(Boolean))];
                const userPromises = userIds.map(async (userId) => {
                    const userRes = await fetch(`/api/admin/users/${userId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    return userRes.json();
                });

                const userDetails = await Promise.all(userPromises);
                const usersMap = {};
                userDetails.forEach(user => {
                    usersMap[user._id] = user;
                });
                setUsers(usersMap);
            } catch (error) {
                console.error("Error fetching uploads:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchUploads();
    }, []);

    const handleViewBlog = (upload) => {
        setSelectedBlog(upload);
        setCurrentImageIndex(0); // Reset image index when opening new blog
        setShowBlogModal(true);
    };

    const handleViewUser = async (userId) => { // Make it async
        try {
            const token = await getAuth().currentUser.getIdToken();
            const res = await fetch(`/api/admin/users/${userId}`, { // Fetch single user
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const userData = await res.json();
                setSelectedUser(userData);
                setShowUserModal(true);
            } else {
                console.error("Failed to fetch user details");
                alert("Failed to fetch user details.");
            }
        } catch (error) {
            console.error("Error fetching user details:", error);
            alert("Error fetching user details.");
        }
    };

    const handleDeleteBlog = async (blogId) => {
        if (!window.confirm("Are you sure you want to delete this blog?")) return;

        try {
            const token = await getAuth().currentUser.getIdToken();
            const res = await fetch(`/api/admin/blogs/${blogId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setUploads(uploads.filter(upload => upload._id !== blogId));
                alert("Blog deleted successfully!");
            } else {
                alert("Failed to delete blog");
            }
        } catch (error) {
            console.error("Error deleting blog:", error);
            alert("Error deleting blog");
        }
    };

    const handleBlockUser = async (userId, isBlocked) => {
        const action = isBlocked ? "unblock" : "block";
        if (!window.confirm(`Are you sure you want to ${action} this user?`)) return;

        try {
            const token = await getAuth().currentUser.getIdToken();
            const res = await fetch(`/api/admin/users/${userId}/${action}`, {
                method: "POST",
                headers: { Authorization: `Bearer ${token}` }
            });

            if (res.ok) {
                setUsers(prev => ({
                    ...prev,
                    [userId]: { ...prev[userId], isBlocked: !isBlocked }
                }));
                alert(`User ${action}ed successfully!`);
            } else {
                alert(`Failed to ${action} user`);
            }
        } catch (error) {
            console.error(`Error ${action}ing user:`, error);
            alert(`Error ${action}ing user`);
        }
    };
    const totalPages = Math.ceil(uploads.length / ITEMS_PER_PAGE);
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
    const endIndex = startIndex + ITEMS_PER_PAGE;
    const currentUploads = uploads.slice(startIndex, endIndex);

    const goToNextPage = () => {
        setCurrentPage(prevPage => Math.min(prevPage + 1, totalPages));
    };

    const goToPrevPage = () => {
        setCurrentPage(prevPage => Math.max(prevPage - 1, 1));
    };

    const handleNextImage = () => {
        if (selectedBlog?.imageGallery) {
            setCurrentImageIndex(prevIndex => (prevIndex + 1) % selectedBlog.imageGallery.length);
        }
    };

    const handlePrevImage = () => {
        if (selectedBlog?.imageGallery) {
            setCurrentImageIndex(prevIndex =>
                (prevIndex - 1 + selectedBlog.imageGallery.length) % selectedBlog.imageGallery.length
            );
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <>
            {/* Inject CSS styles */}
            <style dangerouslySetInnerHTML={{ __html: blogContentStyles }} />

            <div className="bg-white rounded-lg shadow-lg p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-800">Recent Uploads</h2>
                    <span className="text-sm text-gray-500">{uploads.length} total blogs</span>
                </div>

                {uploads.length === 0 ? (
                    <div className="text-center py-12">
                        <div className="text-gray-400 text-lg">No uploads found</div>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Title
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Author
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Date
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {currentUploads.map(upload => ( // Use currentUploads for pagination
                                    <tr key={upload._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                                {upload.title}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="text-sm text-gray-900">
                                                    {upload.authorId?.name || "Unknown"}
                                                </div>
                                                {upload.authorId?._id && (
                                                    <button
                                                        onClick={() => handleViewUser(upload.authorId._id)}
                                                        className="ml-2 text-blue-600 hover:text-blue-800"
                                                        title="View user profile"
                                                    >
                                                        <User size={16} />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {new Date(upload.createdAt).toLocaleDateString()}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex space-x-2">
                                                <button
                                                    onClick={() => handleViewBlog(upload)}
                                                    className="text-blue-600 hover:text-blue-800 p-1 rounded"
                                                    title="View blog"
                                                >
                                                    <Eye size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBlog(upload._id)}
                                                    className="text-red-600 hover:text-red-800 p-1 rounded"
                                                    title="Delete blog"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {totalPages > 1 && ( // Show pagination controls only if more than one page
                            <nav className="flex justify-end items-center gap-x-1 mt-4">
                                <button
                                    type="button"
                                    className="min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-3 text-sm rounded-lg focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                                    onClick={goToPrevPage}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={16} />
                                    <span>Previous</span>
                                </button>
                                <div className="text-sm text-gray-600">
                                    Page {currentPage} of {totalPages}
                                </div>
                                <button
                                    type="button"
                                    className="min-h-[38px] min-w-[38px] flex justify-center items-center text-gray-800 hover:bg-gray-100 py-2 px-3 text-sm rounded-lg focus:outline-none focus:bg-gray-100 disabled:opacity-50 disabled:pointer-events-none"
                                    onClick={goToNextPage}
                                    disabled={currentPage === totalPages}
                                >
                                    <span>Next</span>
                                    <ChevronRight size={16} />
                                </button>
                            </nav>
                        )}
                    </div>
                )}

                {/* Blog Modal */}
                {showBlogModal && selectedBlog && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-5xl w-full max-h-[95vh] overflow-hidden flex flex-col">
                            {/* Modal Header */}
                            <div className="flex justify-between items-center p-6 border-b border-gray-200">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-800">Blog Preview</h3>
                                    <p className="text-sm text-gray-500 mt-1">
                                        By {selectedBlog.authorId?.name || "Unknown"} • {new Date(selectedBlog.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowBlogModal(false)}
                                    className="text-gray-400 hover:text-gray-600 text-2xl w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100"
                                >
                                    ×
                                </button>
                            </div>

                            {/* Modal Body */}
                            <div className="flex-1 overflow-y-auto p-6">
                                <div className="max-w-none prose prose-lg">
                                    {/* Blog Title */}
                                    <h1 className="text-3xl font-bold text-gray-900 mb-6 leading-tight">
                                        {selectedBlog.title}
                                    </h1>

                                    {/* Featured Image / Image Gallery */}
                                    {(selectedBlog.previewImage || (selectedBlog.imageGallery && selectedBlog.imageGallery.length > 0)) && (
                                        <div className="mb-6 relative">
                                            <img
                                                src={selectedBlog.imageGallery && selectedBlog.imageGallery.length > 0
                                                    ? selectedBlog.imageGallery[currentImageIndex]
                                                    : selectedBlog.previewImage}
                                                alt={selectedBlog.title}
                                                className="w-full object-cover max-h-80 rounded-lg shadow-md mx-auto" // Adjusted max-height and added mx-auto for centering
                                                onError={(e) => {
                                                    e.target.style.display = 'none';
                                                }}
                                            />
                                            {selectedBlog.imageGallery && selectedBlog.imageGallery.length > 1 && (
                                                <>
                                                    <button
                                                        onClick={handlePrevImage}
                                                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
                                                    >
                                                        <ChevronLeft size={24} />
                                                    </button>
                                                    <button
                                                        onClick={handleNextImage}
                                                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-gray-800 bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 focus:outline-none"
                                                    >
                                                        <ChevronRight size={24} />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    )}

                                    {/* Blog Content */}
                                    <div
                                        className="blog-content text-gray-800 leading-relaxed"
                                        dangerouslySetInnerHTML={{
                                            __html: selectedBlog.content || "<p class='text-gray-500 italic'>No content available</p>"
                                        }}
                                        style={{
                                            wordWrap: 'break-word',
                                            maxWidth: '100%'
                                        }}
                                    />

                                    {/* Blog Metadata */}
                                    <div className="mt-8 pt-6 border-t border-gray-200">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                                            <div>
                                                <span className="font-semibold">Published:</span> {new Date(selectedBlog.createdAt).toLocaleString()}
                                            </div>
                                            <div>
                                                <span className="font-semibold">Last Updated:</span> {new Date(selectedBlog.updatedAt || selectedBlog.createdAt).toLocaleString()}
                                            </div>
                                            {selectedBlog.category && (
                                                <div>
                                                    <span className="font-semibold">Category:</span> {selectedBlog.category}
                                                </div>
                                            )}
                                            {selectedBlog.tags && selectedBlog.tags.length > 0 && (
                                                <div>
                                                    <span className="font-semibold">Tags:</span> {selectedBlog.tags.join(', ')}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* User Modal */}
                {showUserModal && selectedUser && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                        <div className="bg-white rounded-lg max-w-md w-full mx-4 p-6">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-800">User Profile</h3>
                                <button
                                    onClick={() => setShowUserModal(false)}
                                    className="text-gray-500 hover:text-gray-700 text-2xl"
                                >
                                    ×
                                </button>
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-semibold text-gray-700">Name:</h4>
                                    <p className="text-gray-900">{selectedUser.name}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700">Email:</h4>
                                    <p className="text-gray-900">{selectedUser.email}</p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700">Status:</h4>
                                    <p className={`text-sm font-medium ${selectedUser.isBlocked ? 'text-red-600' : 'text-green-600'}`}>
                                        {selectedUser.isBlocked ? 'Blocked' : 'Active'}
                                    </p>
                                </div>
                                <div>
                                    <h4 className="font-semibold text-gray-700">Joined:</h4>
                                    <p className="text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                                </div>
                                <div className="pt-4">
                                    <button
                                        onClick={() => handleBlockUser(selectedUser._id, selectedUser.isBlocked)}
                                        className={`w-full px-4 py-2 rounded-md text-white font-medium ${selectedUser.isBlocked
                                            ? 'bg-green-600 hover:bg-green-700'
                                            : 'bg-red-600 hover:bg-red-700'
                                            }`}
                                    >
                                        {selectedUser.isBlocked ? (
                                            <><ShieldOff className="inline mr-2" size={16} />Unblock User</>
                                        ) : (
                                            <><Shield className="inline mr-2" size={16} />Block User</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}