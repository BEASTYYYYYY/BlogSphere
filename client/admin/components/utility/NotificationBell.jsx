import { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { Bell, Trash2 } from "lucide-react";

const NotificationBell = () => {
    const [unblockRequests, setUnblockRequests] = useState([]);
    const [open, setOpen] = useState(false);

    const fetchRequests = async () => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            const res = await fetch("/api/users/unblock-requests", {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (data.success) {
                setUnblockRequests(data.requests);
            }
        } catch (err) {
            console.error("Failed to load unblock requests", err);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const markAsReviewed = async (uid) => {
        try {
            const token = await getAuth().currentUser.getIdToken();
            await fetch(`/api/users/unblock-requests/${uid}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
            setUnblockRequests((prev) => prev.filter((req) => req.uid !== uid));
        } catch (err) {
            console.error("Failed to mark request reviewed:", err);
        }
    };

    return (
        <div className="relative">
            <button
                onClick={() => setOpen(!open)}
                className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors relative"
            >
                <Bell className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                {unblockRequests.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-4 h-4 text-[10px] font-bold bg-red-500 text-white rounded-full flex items-center justify-center">
                        {unblockRequests.length}
                    </span>
                )}
            </button>

            {open && (
                <div className="absolute right-0 mt-2 w-80 max-h-80 overflow-y-auto bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-gray-200 dark:border-gray-700 font-semibold text-gray-700 dark:text-gray-200">
                        Unblock Requests
                    </div>
                    {unblockRequests.length === 0 ? (
                        <div className="p-4 text-sm text-gray-500 dark:text-gray-400">No requests</div>
                    ) : (
                        <ul className="divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                            {unblockRequests.map((req) => (
                                <li
                                    key={req.uid}
                                    className="p-3 flex justify-between items-start gap-3 text-gray-800 dark:text-gray-100"
                                >
                                    <div className="flex-1">
                                        <strong>{req.name || req.email || req.uid}</strong>
                                        <p className="text-sm text-gray-500 dark:text-gray-400">{req.email}</p>
                                        <p className="mt-1 text-gray-600 dark:text-gray-400 italic">{req.message}</p>
                                        <button
                                            onClick={() => {
                                                localStorage.setItem("highlightUser", req.uid);
                                                window.location.href = "/admin";
                                            }}
                                            className="mt-2 text-xs text-blue-600 hover:underline"
                                        >
                                            Take me to this user
                                        </button>
                                    </div>
                                    <button
                                        onClick={() => markAsReviewed(req.uid)}
                                        className="text-gray-400 hover:text-red-500 transition mt-1"
                                        title="Remove"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationBell;
