import React, { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";

export default function AdminSettings() {
    // State for general settings, initialized to null or empty until fetched
    // Removed siteTitle state
    const [maintenanceMode, setMaintenanceMode] = useState(false);
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [savingSettings, setSavingSettings] = useState(false);
    const [settingsFeedback, setSettingsFeedback] = useState({ message: "", type: "" });

    // State for Broadcast Email functionality
    const [broadcastSubject, setBroadcastSubject] = useState("");
    const [broadcastMessage, setBroadcastMessage] = useState("");
    const [recipientType, setRecipientType] = useState("all"); // 'all', 'users', 'admins'
    const [sendingEmail, setSendingEmail] = useState(false);
    const [emailFeedback, setEmailFeedback] = useState({ message: "", type: "" });

    // Optional: Predefined templates for topics
    const emailTemplates = {
        maintenance: {
            subject: "Scheduled Site Maintenance Notification",
            message: "Dear users,\n\nPlease be informed that our website will undergo scheduled maintenance on [Date/Time IST]. During this period, the site may be temporarily unavailable. We apologize for any inconvenience.\n\nThank you for your understanding,\nThe Admin Team"
        },
        newFeature: {
            subject: "Exciting New Feature Alert!",
            message: "Hello everyone,\n\nWe're thrilled to announce a new feature: [Feature Name]! You can now [brief description of feature]. Check it out and let us know what you think!\n\nBest regards,\nThe BlogSphere Team"
        },
        policyUpdate: {
            subject: "Important Update: Our Privacy Policy Has Changed",
            message: "Dear BlogSphere user,\n\nWe're updating our Privacy Policy to better explain how we collect, use, and protect your data. These changes will take effect on [Date]. We encourage you to review the updated policy at [Link to Policy].\n\nThank you for being part of BlogSphere,\nThe BlogSphere Team"
        },
        scheduleDate: { // Corrected name to match the button's purpose
            subject: "Admin Notification: Scheduled Site Work",
            message: "A site-wide professional work session has been scheduled for [DATE AND TIME]. During this period, certain functionalities or the entire site may be impacted. Please ensure all necessary preparations are made and be aware of potential disruptions. This is for internal admin awareness only."
        },
    };

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                setLoadingSettings(true);
                const auth = getAuth();
                const token = await auth.currentUser.getIdToken();

                const response = await fetch("/api/admin/settings", {
                    headers: {
                        "Authorization": `Bearer ${token}`
                    }
                });

                if (response.ok) {
                    const data = await response.json();
                    setMaintenanceMode(data.maintenanceMode || false);
                } else {
                    console.error("Failed to fetch settings:", response.statusText);
                    setSettingsFeedback({ message: "Failed to load settings.", type: "error" });
                }
            } catch (error) {
                console.error("Error fetching settings:", error);
                setSettingsFeedback({ message: `Error loading settings: ${error.message}`, type: "error" });
            } finally {
                setLoadingSettings(false);
            }
        };

        fetchSettings();
    }, []);

    const handleSaveGeneralSettings = async () => {
        setSavingSettings(true);
        setSettingsFeedback({ message: "", type: "" });

        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const response = await fetch("/api/admin/settings", {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({ maintenanceMode })
            });

            if (response.ok) {
                setSettingsFeedback({ message: "General settings saved successfully!", type: "success" });
            } else {
                const errorData = await response.json();
                setSettingsFeedback({ message: `Failed to save settings: ${errorData.error || response.statusText}`, type: "error" });
            }
        } catch (error) {
            console.error("Error saving general settings:", error);
            setSettingsFeedback({ message: `An unexpected error occurred: ${error.message}`, type: "error" });
        } finally {
            setSavingSettings(false);
            setTimeout(() => setSettingsFeedback({ message: "", type: "" }), 5000);
        }
    };

    const handleSendBroadcastEmail = async () => {
        if (!broadcastSubject.trim() || !broadcastMessage.trim()) {
            setEmailFeedback({ message: "Subject and Message cannot be empty.", type: "error" });
            return;
        }

        setSendingEmail(true);
        setEmailFeedback({ message: "", type: "" });

        try {
            const auth = getAuth();
            const token = await auth.currentUser.getIdToken();

            const response = await fetch("/api/admin/email-broadcast", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    subject: broadcastSubject,
                    message: broadcastMessage,
                    recipientType: recipientType
                })
            });

            if (response.ok) {
                setEmailFeedback({ message: "Broadcast email sent successfully!", type: "success" });
                setBroadcastSubject("");
                setBroadcastMessage("");
                setRecipientType("all");
            } else {
                const errorData = await response.json();
                setEmailFeedback({ message: `Failed to send email: ${errorData.error || response.statusText}`, type: "error" });
            }
        } catch (error) {
            console.error("Error sending broadcast email:", error);
            setEmailFeedback({ message: `An unexpected error occurred: ${error.message}`, type: "error" });
        } finally {
            setSendingEmail(false);
            setTimeout(() => setEmailFeedback({ message: "", type: "" }), 5000);
        }
    };

    const applyTemplate = (templateKey) => {
        const template = emailTemplates[templateKey];
        if (template) {
            setBroadcastSubject(template.subject);
            setBroadcastMessage(template.message);
        }
    };

    // NEW: Function to clear both subject and message
    const handleClearEmailFields = () => {
        setBroadcastSubject("");
        setBroadcastMessage("");
        setEmailFeedback({ message: "", type: "" }); // Clear feedback too
    };

    if (loadingSettings) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="ml-4 text-lg text-gray-700 dark:text-gray-300">Loading settings...</p>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6 bg-white dark:bg-gray-900 rounded-lg shadow-xl">
            <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-8 border-b pb-4 dark:border-gray-700">Admin Settings</h1>
            <section className="mb-10">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">General Settings</h2>
                {settingsFeedback.message && (
                    <div className={`mb-4 p-3 rounded-md text-sm ${settingsFeedback.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}>
                        {settingsFeedback.message}
                    </div>
                )}
                {/* Removed Site Title input field */}
                <div className="flex items-center justify-between mt-4 bg-gray-50 dark:bg-gray-800 p-4 rounded-md shadow-sm">
                    <span className="block text-gray-700 dark:text-gray-300 font-medium">Maintenance Mode:</span>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input
                            type="checkbox"
                            className="sr-only peer"
                            checked={maintenanceMode}
                            onChange={() => setMaintenanceMode(!maintenanceMode)}
                        />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                        <span className="ml-3 text-sm font-medium text-gray-900 dark:text-white">{maintenanceMode ? "On" : "Off"}</span>
                    </label>
                </div>
                <button
                    className={`mt-6 px-6 py-2 rounded-md text-white font-semibold transition duration-300 ${savingSettings ? 'bg-blue-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:bg-blue-700 dark:hover:bg-blue-800'}`}
                    onClick={handleSaveGeneralSettings}
                    disabled={savingSettings}
                >
                    {savingSettings ? "Saving..." : "Save General Settings"}
                </button>
            </section>
            <section className="mt-10 pt-6 border-t border-gray-200 dark:border-gray-700">
                <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-6">Broadcast Email</h2>
                <div className="mb-6 bg-yellow-50 p-4 rounded-md border border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700">
                    <h3 className="text-lg font-medium text-yellow-800 dark:text-yellow-300 mb-3">Quick Templates (Optional)</h3>
                    {/* Updated Flex container for buttons and Clear All */}
                    <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap gap-3"> {/* Group template buttons */}
                            <button
                                onClick={() => applyTemplate('maintenance')}
                                className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-md hover:bg-yellow-700 transition duration-150 ease-in-out dark:bg-yellow-700 dark:hover:bg-yellow-800"
                            >
                                Maintenance Email
                            </button>
                            <button
                                onClick={() => applyTemplate('newFeature')}
                                className="px-4 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 transition duration-150 ease-in-out dark:bg-purple-700 dark:hover:bg-purple-800"
                            >
                                New Feature Announcement
                            </button>
                            <button
                                onClick={() => applyTemplate('policyUpdate')}
                                className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-md hover:bg-teal-700 transition duration-150 ease-in-out dark:bg-teal-700 dark:hover:bg-teal-800"
                            >
                                Policy Update
                            </button>
                            <button
                                onClick={() => applyTemplate('scheduleDate')}
                                className="px-4 py-2 bg-orange-800 text-white text-sm font-medium rounded-md hover:bg-orange-900 transition duration-150 ease-in-out dark:bg-orange-900 dark:hover:bg-orange-950"
                            >
                                Schedule Work
                            </button>
                        </div>
                        {/* NEW: Clear All button on the right */}
                        <button
                            onClick={handleClearEmailFields}
                            className="px-4 py-2 text-sm font-medium rounded-md
                                       bg-gradient-to-br from-indigo-100 to-fuchsia-100 text-gray-800
                                       hover:from-indigo-200 hover:to-fuchsia-200
                                       dark:from-indigo-900/30 dark:to-fuchsia-900/30 dark:text-gray-200
                                       dark:hover:from-indigo-900/50 dark:hover:to-fuchsia-900/50
                                       border border-gray-300 dark:border-gray-700
                                       transition duration-150 ease-in-out"
                        >
                            Clear All
                        </button>
                    </div>
                    <p className="text-sm text-yellow-700 dark:text-yellow-200 mt-3">Clicking a template button will pre-fill the subject and message fields below.</p>
                </div>

                <div className="mb-4">
                    <label htmlFor="broadcastSubject" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Subject:</label>
                    <input
                        type="text"
                        id="broadcastSubject"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                        value={broadcastSubject}
                        onChange={(e) => setBroadcastSubject(e.target.value)}
                        placeholder="Enter email subject"
                    />
                </div>

                <div className="mb-4">
                    <label htmlFor="broadcastMessage" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Message:</label>
                    <textarea
                        id="broadcastMessage"
                        rows="8"
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 p-3 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:focus:border-blue-500 dark:focus:ring-blue-500/50"
                        value={broadcastMessage}
                        onChange={(e) => setBroadcastMessage(e.target.value)}
                        placeholder="Compose your broadcast email message here..."
                    ></textarea>
                </div>

                <div className="mb-6">
                    <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Send to:</span>
                    <div className="flex space-x-4">
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-blue-600 h-4 w-4 dark:text-blue-400"
                                name="recipientType"
                                value="all"
                                checked={recipientType === "all"}
                                onChange={(e) => setRecipientType(e.target.value)}
                            />
                            <span className="ml-2 text-gray-900 dark:text-white">All Users (including Admins)</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-blue-600 h-4 w-4 dark:text-blue-400"
                                name="recipientType"
                                value="users"
                                checked={recipientType === "users"}
                                onChange={(e) => setRecipientType(e.target.value)}
                            />
                            <span className="ml-2 text-gray-900 dark:text-white">Only Regular Users</span>
                        </label>
                        <label className="inline-flex items-center">
                            <input
                                type="radio"
                                className="form-radio text-blue-600 h-4 w-4 dark:text-blue-400"
                                name="recipientType"
                                value="admins"
                                checked={recipientType === "admins"}
                                onChange={(e) => setRecipientType(e.target.value)}
                            />
                            <span className="ml-2 text-gray-900 dark:text-white">Only Admins</span>
                        </label>
                    </div>
                </div>

                <button
                    onClick={handleSendBroadcastEmail}
                    className={`w-full px-6 py-3 rounded-md text-white font-semibold transition duration-300 ${sendingEmail ? 'bg-blue-400 cursor-not-allowed dark:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800'}`}
                    disabled={sendingEmail}
                >
                    {sendingEmail ? "Sending..." : "Send Broadcast Email"}
                </button>

                {emailFeedback.message && (
                    <div className={`mt-4 p-3 rounded-md text-sm ${emailFeedback.type === "success" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-300"}`}>
                        {emailFeedback.message}
                    </div>
                )}
            </section>
        </div>
    );
}