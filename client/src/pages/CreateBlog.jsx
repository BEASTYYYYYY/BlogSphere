/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useCategory } from '../context/CategoryContext';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import AdvancedToolbarPlugin from './ToolbarPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { $generateHtmlFromNodes } from '@lexical/html';
import ImageUploader from '../components/ImageUpload';
import { useTheme } from '../App';

const API_BASE_URL = 'http://localhost:5000/api';

const CreateBlog = () => {
    const { firebaseUser } = useAuth();
    const { refreshCategories } = useCategory();
    const navigate = useNavigate();
    const { darkMode } = useTheme();

    const [form, setForm] = useState({
        title: '',
        content: '',
        category: '',
        tags: '',
        images: [],
        previewImage: ''
    });
    const [categories, setCategories] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [charCount, setCharCount] = useState(0);

    useEffect(() => {
        const fetchCategories = async () => {
            if (!firebaseUser) return; // Only fetch if user is logged in
            try {
                const token = await firebaseUser.getIdToken();
                const res = await axios.get(`${API_BASE_URL}/categories`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCategories(res.data);
            } catch (error) {
                console.error("Failed to fetch categories:", error.response?.data || error.message);
                setCategories([]);
            }
        };

        fetchCategories();
    }, [firebaseUser]); // Add firebaseUser as a dependency

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.name === 'title') setCharCount(e.target.value.length);
    };

    const onEditorChange = useCallback((editorState, editor) => {
        editor.update(() => {
            const htmlString = $generateHtmlFromNodes(editor, null);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = htmlString;
            const textContent = tempDiv.textContent || '';
            setForm((prev) => ({ ...prev, content: htmlString }));
            setCharCount(textContent.trim().length);
        });
    }, []);

    const handleImageUpload = (uploadedUrls, previewIdx) => {
        setForm((prev) => ({
            ...prev,
            images: uploadedUrls,
            previewImage: uploadedUrls[previewIdx] || uploadedUrls[0]
        }));
    };

    const submitBlog = async (status = 'published') => {
        if (!form.title.trim() || !form.content.trim() || !form.category.trim()) {
            alert('Please fill in all required fields.');
            return;
        }
        setIsSubmitting(true);
        try {
            const token = await firebaseUser.getIdToken();
            const blogData = {
                title: form.title,
                content: form.content,
                category: form.category,
                tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
                status,
                previewImage: form.previewImage,
                imageGallery: form.images
            };
            await axios.post(`${API_BASE_URL}/blogs`, blogData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            refreshCategories();
            navigate('/user');
        } catch (err) {
            console.error("Error creating blog:", err.response?.data || err.message);
            alert("Failed to create blog. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const editorConfig = {
        namespace: 'BlogEditor',
        theme: {
            text: {
                bold: 'font-bold',
                italic: 'italic',
                underline: 'underline',
                strikethrough: 'line-through',
                underlineStrikethrough: 'underline line-through',
                code: `${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-900'} px-2 py-1 rounded font-mono text-sm`
            },
            quote: `border-l-4 ${darkMode ? 'border-purple-500' : 'border-blue-500'} pl-4 italic ${darkMode ? 'text-gray-300' : 'text-gray-700'}`,
            heading: {
                h1: `text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`,
                h2: `text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`,
                h3: `text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`
            },
            list: {
                nested: { listitem: 'list-none' },
                ol: 'list-decimal list-inside',
                ul: 'list-disc list-inside',
                listitem: 'mb-1'
            },
            link: `${darkMode ? 'text-purple-400 hover:text-purple-300' : 'text-blue-600 hover:text-blue-800'} underline`,
            code: `${darkMode ? 'bg-gray-800 text-gray-200' : 'bg-gray-100 text-gray-900'} font-mono text-sm p-3 rounded-lg block`
        },
        onError: (error) => console.error(error),
        nodes: [
            HeadingNode,
            ListNode,
            ListItemNode,
            QuoteNode,
            CodeNode,
            CodeHighlightNode,
            LinkNode,
            AutoLinkNode
        ]
    };

    const isFormValid = form.title.trim() && form.content.trim() && form.category.trim();

    return (
        <div className={`min-h-screen ${darkMode
            ? 'bg-gray-900'
            : 'bg-gray-50'
            }`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-13">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2">
                        <form onSubmit={(e) => { e.preventDefault(); submitBlog('published'); }} className="space-y-6">

                            {/* Image Upload Section */}
                            <div className={`rounded-lg border-2 border-dashed transition-all duration-300 hover:border-blue-400 ${darkMode
                                ? 'border-gray-600 bg-gray-800 hover:bg-gray-700'
                                : 'border-gray-300 bg-gray-50 hover:bg-gray-100'
                                }`}>
                                <ImageUploader
                                    onUpload={handleImageUpload}
                                    darkMode={darkMode}
                                />
                            </div>

                            {/* Title Input */}
                            <div className="space-y-2">
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Title *
                                </label>
                                <input
                                    name="title"
                                    value={form.title}
                                    onChange={handleChange}
                                    placeholder="Enter an engaging title for your post..."
                                    className={`w-full px-4 py-3 text-base border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                                        ? 'bg-gray-800 border-gray-600 text-white placeholder-gray-400'
                                        : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                        }`}
                                />
                            </div>

                            {/* Rich Text Editor */}
                            <div className="space-y-2">
                                <label className={`block text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    Content *
                                </label>
                                <div className={`border rounded-lg overflow-hidden transition-all duration-200 ${darkMode
                                    ? 'border-gray-600 bg-gray-800'
                                    : 'border-gray-300 bg-white'
                                    }`}>
                                    <LexicalComposer initialConfig={editorConfig}>
                                        <AdvancedToolbarPlugin darkMode={darkMode} />
                                        <RichTextPlugin
                                            contentEditable={
                                                <ContentEditable
                                                    className={`min-h-[400px] p-4 focus:outline-none ${darkMode ? 'text-gray-200' : 'text-gray-900'
                                                        }`}
                                                />
                                            }
                                            placeholder={
                                                <div className={`p-4 pointer-events-none ${darkMode ? 'text-gray-500' : 'text-gray-400'
                                                    }`}>
                                                    Start writing your amazing content here...
                                                </div>
                                            }
                                            ErrorBoundary={LexicalErrorBoundary}
                                        />
                                        <ListPlugin />
                                        <LinkPlugin />
                                        <HistoryPlugin />
                                        <TabIndentationPlugin />
                                        <OnChangePlugin onChange={onEditorChange} />
                                    </LexicalComposer>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="sticky space-y-6">
                            <div className={`rounded-lg border ${darkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200 shadow-sm'
                                }`}>
                                <div className="p-6">
                                    <div className="flex items-center space-x-2 mb-4">
                                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                        <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                            Publish Settings
                                        </h3>
                                    </div>

                                    <div className="space-y-4">
                                        {/* Category Selection */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Category *
                                            </label>
                                            <select
                                                name="category"
                                                value={form.category}
                                                onChange={handleChange}
                                                className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white'
                                                    : 'bg-white border-gray-300 text-gray-900'
                                                    }`}
                                            >
                                                <option value="">Select category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.name} value={cat.name}>{cat.name}</option>
                                                ))}
                                            </select>
                                        </div>

                                        {/* Tags Input */}
                                        <div>
                                            <label className={`block text-sm font-medium mb-2 ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                                Tags
                                            </label>
                                            <input
                                                name="tags"
                                                value={form.tags}
                                                onChange={handleChange}
                                                placeholder="tech, tutorial, guide"
                                                className={`w-full px-3 py-2.5 border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${darkMode
                                                    ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400'
                                                    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-500'
                                                    }`}
                                            />
                                            <p className={`text-xs mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                                                Separate tags with commas
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Quick Stats Card */}
                            <div className={`rounded-lg border ${darkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-white border-gray-200 shadow-sm'
                                }`}>
                                <div className="p-6">
                                    <h3 className={`text-lg font-semibold mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        Quick Stats
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="text-center">
                                            <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                {charCount}
                                            </div>
                                            <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Characters
                                            </div>
                                        </div>
                                        <div className="text-center">
                                            <div className={`text-3xl font-bold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                                {form.images.length}
                                            </div>
                                            <div className={`text-sm font-medium ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
                                                Images
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => submitBlog('published')}
                                    disabled={isSubmitting || !isFormValid}
                                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 ${isFormValid && !isSubmitting
                                        ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
                                        : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                                        }`}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                                            <span>Publishing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                            </svg>
                                            <span>Publish Post</span>
                                        </>
                                    )}
                                </button>

                                <button
                                    type="button"
                                    onClick={() => submitBlog('draft')}
                                    disabled={isSubmitting}
                                    className={`w-full px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center justify-center space-x-2 border ${darkMode
                                        ? 'bg-gray-700 hover:bg-gray-600 text-gray-200 border-gray-600'
                                        : 'bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-300'
                                        }`}
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12" />
                                    </svg>
                                    <span>Save as Draft</span>
                                </button>
                            </div>

                            {/* Tips Card */}
                            <div className={`rounded-lg border ${darkMode
                                ? 'bg-gray-800 border-gray-700'
                                : 'bg-blue-50 border-blue-200'
                                }`}>
                                <div className="p-6">
                                    <h3 className={`text-lg font-semibold mb-3 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                                        💡 Writing Tips
                                    </h3>
                                    <ul className={`space-y-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                        <li>• Use compelling headlines</li>
                                        <li>• Add relevant images</li>
                                        <li>• Include proper tags</li>
                                        <li>• Write engaging content</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CreateBlog;