// src/components/ProfileEditModal.jsx
import { Save, X } from 'lucide-react';
import { useState } from 'react';

export default function ProfileEditModal({ show, setShow, userProfile = {}, onSave, darkMode }) {
    const [name, setName] = useState(userProfile.name || '');
    const [bio, setBio] = useState(userProfile.bio || '');

    const handleSave = () => {
        onSave({ ...userProfile, name, bio });
        setShow(false);
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className={`max-w-md w-full p-6 rounded-2xl ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                <div className="flex items-center justify-between mb-6">
                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Edit Profile</h3>
                    <button onClick={() => setShow(false)} className={`p-2 rounded-lg ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100'}`}>
                        <X className="w-4 h-4" />
                    </button>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Name</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className={`w-full p-3 rounded-lg border ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>

                    <div>
                        <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
                        <textarea
                            rows={3}
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            className={`w-full p-3 rounded-lg border resize-none ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        />
                    </div>

                    <div className="flex space-x-3 pt-4">
                        <button onClick={handleSave} className="flex-1 bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 flex items-center justify-center space-x-2">
                            <Save className="w-4 h-4" />
                            <span>Save Changes</span>
                        </button>
                        <button onClick={() => setShow(false)} className={`px-6 py-3 rounded-lg border ${darkMode ? 'border-gray-600 text-gray-400 hover:bg-gray-700' : 'border-gray-300 text-gray-600 hover:bg-gray-50'}`}>
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}