import { Heart } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ;

export default function LikeButton({ blog, likes, setLikes }) {
    const { mongoUser, firebaseUser } = useAuth();
    const [isLiking, setIsLiking] = useState(false);
    const [localLiked, setLocalLiked] = useState(false);
    const [localLikesCount, setLocalLikesCount] = useState(0);

    // Initialize local state from props
    useEffect(() => {
        const likesArray = Array.isArray(likes) ? likes : [];
        setLocalLikesCount(likesArray.length);

        if (mongoUser) {
            const hasLiked = likesArray.some(id =>
                id === mongoUser._id ||
                (typeof id === 'object' && id._id === mongoUser._id)
            );
            setLocalLiked(hasLiked);
        }
    }, [likes, mongoUser]);

    const handleLike = async (e) => {
        e.stopPropagation();
        if (!firebaseUser || !mongoUser || isLiking) return;

        // Optimistic UI update
        setLocalLiked(true);
        setLocalLikesCount(prev => prev + 1);
        setIsLiking(true);

        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.post(`${API_BASE_URL}/blogs/${blog._id}/like`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update parent state with server response
            const newLikes = res.data.likesArr || res.data.likes || [];
            setLikes(newLikes);
            setLocalLikesCount(Array.isArray(newLikes) ? newLikes.length : newLikes);
        } catch (error) {
            // Revert optimistic update on error
            setLocalLiked(false);
            setLocalLikesCount(prev => Math.max(0, prev - 1));
            console.error('Error liking blog:', error);
        } finally {
            setIsLiking(false);
        }
    };

    const handleUnlike = async (e) => {
        e.stopPropagation();
        if (!firebaseUser || !mongoUser || isLiking) return;

        // Optimistic UI update
        setLocalLiked(false);
        setLocalLikesCount(prev => Math.max(0, prev - 1));
        setIsLiking(true);

        try {
            const token = await firebaseUser.getIdToken();
            const res = await axios.post(`${API_BASE_URL}/blogs/${blog._id}/unlike`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });

            // Update parent state with server response
            const newLikes = res.data.likesArr || res.data.likes || [];
            setLikes(newLikes);
            setLocalLikesCount(Array.isArray(newLikes) ? newLikes.length : newLikes);
        } catch (error) {
            // Revert optimistic update on error
            setLocalLiked(true);
            setLocalLikesCount(prev => prev + 1);
            console.error('Error unliking blog:', error);
        } finally {
            setIsLiking(false);
        }
    };

    return (
        <div className="flex items-center space-x-1">
            <button
                onClick={localLiked ? handleUnlike : handleLike}
                disabled={isLiking || !mongoUser}
                className={`
                    p-1 rounded-full transition-all duration-200 ease-out
                    focus:outline-none focus:ring-2 focus:ring-red-300 focus:ring-opacity-50 focus:ring-offset-1
                    ${!mongoUser ? 'cursor-not-allowed opacity-50' : 'hover:bg-red-50 dark:hover:bg-red-900/20 active:scale-90'}
                    ${isLiking ? 'animate-pulse' : ''}
                `}
                title={!mongoUser ? 'Login to like this post' : localLiked ? 'Unlike' : 'Like'}
            >
                <Heart
                    className={`
                        w-4 h-4 transition-all duration-200 ease-out
                        ${localLiked
                            ? 'text-red-500 fill-red-500 dark:text-red-400 dark:fill-red-400 scale-110'
                            : 'text-gray-500 hover:text-red-500 dark:text-gray-400 dark:hover:text-red-400'
                        }
                        ${isLiking ? 'animate-bounce' : ''}
                    `}
                />
            </button>
            <span className={`
                text-sm font-medium tabular-nums
                ${localLiked
                    ? 'text-red-500 dark:text-red-400'
                    : 'text-gray-500 dark:text-gray-400'
                }
            `}>
                {localLikesCount}
            </span>
        </div>
    );
}