import { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { Trash2, Image as ImageIcon, Star, StarOff } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../App';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

const ImageUpload = ({ onUpload,  initialImages = [], initialPreview = '' }) => {
    const fileInputRef = useRef(null);
    const { firebaseUser } = useAuth();
    const [localFiles, setLocalFiles] = useState([]);
    const [previewIndex, setPreviewIndex] = useState(0);
    const { darkMode } = useTheme();

    useEffect(() => {
        if (!initialImages || initialImages.length === 0) return;

        const filesToShow = initialImages.map((url) => ({
            file: null,
            preview: url,
            uploaded: true,
            url,
        }));

        setLocalFiles(filesToShow);

        const previewIdx = initialImages.findIndex(url => url === initialPreview);
        setPreviewIndex(previewIdx >= 0 ? previewIdx : 0);
    }, [initialImages, initialPreview]);

    const handleDrop = (e) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files);
        handleFiles(files);
    };

    const handleFiles = (files) => {
        const imageFiles = files.filter(file => file.type.startsWith('image/'));
        const fileObjs = imageFiles.map(file => ({
            file,
            preview: URL.createObjectURL(file),
            uploaded: false,
            url: null
        }));

        setLocalFiles(prev => [...prev, ...fileObjs]);
    };

    const uploadAll = async () => {
        const uploaded = [];

        for (let i = 0; i < localFiles.length; i++) {
            const img = localFiles[i];

            if (img.uploaded) {
                uploaded.push({ url: img.url });
                continue;
            }

            const formData = new FormData();
            formData.append('image', img.file);

            try {
                const token = await firebaseUser.getIdToken();
                const res = await axios.post(`${API_BASE_URL}/blogs/upload-image`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                        Authorization: `Bearer ${token}`
                    }
                });

                const url = res.data.url;
                img.uploaded = true;
                img.url = url;
                uploaded.push({ url });
            } catch (err) {
                console.error('Upload failed:', err);
                alert('Image upload failed. Try again.');
                return;
            }
        }

        const uploadedUrls = uploaded.map(img => img.url);
        if (onUpload) {
            onUpload(uploadedUrls, previewIndex);
        }
    };

    useEffect(() => {
        if (localFiles.length && !localFiles.every(f => f.uploaded)) {
            uploadAll();
        }
    }, [localFiles]);

    const handleClick = () => fileInputRef.current.click();

    const handleSetPreview = (index) => {
        setPreviewIndex(index);
    };

    const handleRemove = (index) => {
        const updated = [...localFiles];
        updated.splice(index, 1);
        setLocalFiles(updated);
        if (previewIndex >= updated.length) {
            setPreviewIndex(0);
        }
    };

    return (
        <div
            className={`border-2 border-dashed p-4 rounded-lg cursor-pointer transition ${darkMode ? 'bg-gray-800 text-gray-200 border-gray-600' : 'bg-gray-50 text-gray-600 border-gray-300'}`}
            onClick={handleClick}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
        >
            <input
                type="file"
                accept="image/*"
                multiple
                hidden
                ref={fileInputRef}
                onChange={(e) => handleFiles(Array.from(e.target.files))}
            />

            <div className="flex justify-center items-center flex-col gap-2">
                <ImageIcon className="w-6 h-6 text-gray-400" />
                <p>Drag & drop images or click to select</p>
            </div>

            {localFiles.length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    {localFiles.map((img, idx) => (
                        <div key={idx} className="relative border rounded-lg overflow-hidden group">
                            <img src={img.preview} alt={`upload-${idx}`} className="object-cover w-full h-32" />
                            <div className="absolute top-1 right-1 flex gap-1">
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleSetPreview(idx); }} title="Set as preview">
                                    {previewIndex === idx ? (
                                        <Star className="w-5 h-5 text-yellow-400" />
                                    ) : (
                                        <StarOff className="w-5 h-5 text-gray-400" />
                                    )}
                                </button>
                                <button type="button" onClick={(e) => { e.stopPropagation(); handleRemove(idx); }} title="Remove">
                                    <Trash2 className="w-5 h-5 text-red-500" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageUpload;
