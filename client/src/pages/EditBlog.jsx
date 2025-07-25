/* eslint-disable no-unused-vars */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
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
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import AdvancedToolbarPlugin from './ToolbarPlugin';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot } from 'lexical';
import ImageUploader from '../components/ImageUpload';
import { useTheme } from '../App';

const API_BASE_URL = 'http://localhost:5000/api';

function InjectInitialHTML({ htmlContent }) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!htmlContent) return;
        editor.update(() => {
            const parser = new DOMParser();
            const dom = parser.parseFromString(htmlContent, 'text/html');
            const nodes = $generateNodesFromDOM(editor, dom);
            const root = $getRoot();
            root.clear();
            root.append(...nodes);
        });
    }, [editor, htmlContent]);

    return null;
}

const EditBlog = () => {
    const { firebaseUser } = useAuth();
    const { refreshCategories } = useCategory();
    const navigate = useNavigate();
    const { id } = useParams();
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
        const fetchBlog = async () => {
            try {
                const res = await axios.get(`${API_BASE_URL}/blogs/${id}`);
                const blog = res.data;

                setForm({
                    title: blog.title,
                    content: blog.content,
                    category: blog.category,
                    tags: blog.tags.join(', '),
                    images: blog.imageGallery || [],
                    previewImage: blog.previewImage || ''
                });
                setCharCount(blog.title.length);
            } catch (err) {
                console.error('Failed to fetch blog:', err);
            }
        };
        fetchBlog();
    }, [id]);

    useEffect(() => {
        axios.get(`${API_BASE_URL}/categories`)
            .then(res => setCategories(res.data))
            .catch(() => setCategories([]));
    }, []);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
        if (e.target.name === 'title') setCharCount(e.target.value.length);
    };

    const onEditorChange = useCallback((editorState) => {
        editorState.read(() => {
            try {
                const htmlString = $generateHtmlFromNodes(editorState, null);
                setForm(prev => ({ ...prev, content: htmlString }));
            } catch (err) {
                console.error('Failed to generate HTML from editor state:', err);
            }
        });
    }, []);

    const handleImageUpload = (uploadedUrls, previewIndex) => {
        setForm(prev => ({
            ...prev,
            images: uploadedUrls,
            previewImage: uploadedUrls[previewIndex] || uploadedUrls[0]
        }));
    };

    const submitUpdate = async (status = 'published') => {
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

            await axios.put(`${API_BASE_URL}/blogs/${id}`, blogData, {
                headers: { Authorization: `Bearer ${token}` }
            });

            refreshCategories();
            setTimeout(() => {
                navigate(`/blog/${id}`, { replace: true });
            }, 100);
        } catch (err) {
            console.error('Failed to update blog:', err);
            alert('Error updating blog.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const editorConfig = {
        namespace: 'BlogEditor',
        theme: {},
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
        <div className={`min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-50'
            }`}>
            <div className="relative z-10 max-w-6xl mx-auto px-4 py-8">
              

                {/* Main Content Card with Clean Border */}
                <div className={`relative rounded-3xl overflow-hidden mt-20 ${darkMode
                        ? 'bg-gray-800/50 border border-gray-700/50 shadow-xl shadow-gray-900/20'
                        : 'bg-white/100 border border-gray-200/50 shadow-xl shadow-gray-300/20'
                    } backdrop-blur-xl`}>
                   
                    {/* Glass shine effect */}
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none rounded-3xl" />

                    {/* Floating particles effect */}
                    <div className="absolute inset-0 overflow-hidden rounded-3xl pointer-events-none">
                        <div className={`absolute w-2 h-2 rounded-full ${darkMode ? 'bg-blue-400/20' : 'bg-blue-500/20'
                            } animate-bounce`} style={{
                                top: '20%',
                                left: '10%',
                                animationDelay: '0s',
                                animationDuration: '3s'
                            }} />
                        <div className={`absolute w-1 h-1 rounded-full ${darkMode ? 'bg-purple-400/20' : 'bg-purple-500/20'
                            } animate-bounce`} style={{
                                top: '60%',
                                right: '15%',
                                animationDelay: '1s',
                                animationDuration: '4s'
                            }} />
                        <div className={`absolute w-1.5 h-1.5 rounded-full ${darkMode ? 'bg-pink-400/20' : 'bg-pink-500/20'
                            } animate-bounce`} style={{
                                bottom: '30%',
                                left: '20%',
                                animationDelay: '2s',
                                animationDuration: '5s'
                            }} />
                    </div>

                    <div className="relative z-10 p-8 md:p-12">
                        <form onSubmit={(e) => { e.preventDefault(); submitUpdate('published'); }} className="space-y-8">

                            {/* Image Upload Section with Hover Effects */}
                            <div className={`group p-6 rounded-2xl transition-all duration-300 hover:scale-[1.02] ${darkMode
                                    ? 'bg-gray-800/50 border border-gray-700/50 hover:bg-gray-800/70'
                                    : 'bg-white/10 border border-gray-200/50 hover:bg-white/70'
                                } backdrop-blur-sm`}>
                                <div className="flex items-center justify-between mb-4">
                                    <h3 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-gray-900'
                                        }`}>
                                        Featured Images
                                    </h3>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${form.images.length > 0
                                            ? 'bg-green-500 text-white transform rotate-12'
                                            : darkMode
                                                ? 'bg-gray-700 text-gray-400'
                                                : 'bg-gray-200 text-gray-500'
                                        }`}>
                                        {form.images.length > 0 ? '✓' : '📸'}
                                    </div>
                                </div>
                                <ImageUploader
                                    onUpload={handleImageUpload}
                                    darkMode={darkMode}
                                    initialImages={form.images}
                                    initialPreview={form.previewImage}
                                />
                            </div>

                            {/* Form Fields Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Title Field */}
                                <div className="lg:col-span-2">
                                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Blog Title
                                        <span className={`ml-2 text-xs ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            ({charCount} characters)
                                        </span>
                                    </label>
                                    <input
                                        name="title"
                                        value={form.title}
                                        onChange={handleChange}
                                        placeholder="Enter an engaging title..."
                                        className={`w-full px-6 py-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${darkMode
                                                ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50'
                                                : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50'
                                            } backdrop-blur-sm`}
                                    />
                                </div>

                                {/* Category Field */}
                                <div>
                                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Category
                                    </label>
                                    <select
                                        name="category"
                                        value={form.category}
                                        onChange={handleChange}
                                        className={`w-full px-6 py-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${darkMode
                                                ? 'bg-gray-800/50 border-gray-700/50 text-white focus:ring-blue-500/50 focus:border-blue-500/50'
                                                : 'bg-white/80 border-gray-200/50 text-gray-900 focus:ring-blue-500/50 focus:border-blue-500/50'
                                            } backdrop-blur-sm`}
                                    >
                                        <option value="">Select a category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.name} value={cat.name}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                {/* Tags Field */}
                                <div>
                                    <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                        }`}>
                                        Tags
                                    </label>
                                    <input
                                        name="tags"
                                        value={form.tags}
                                        onChange={handleChange}
                                        placeholder="tech, programming, tutorial"
                                        className={`w-full px-6 py-4 rounded-xl border transition-all duration-200 focus:outline-none focus:ring-2 ${darkMode
                                                ? 'bg-gray-800/50 border-gray-700/50 text-white placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50'
                                                : 'bg-white/80 border-gray-200/50 text-gray-900 placeholder-gray-400 focus:ring-blue-500/50 focus:border-blue-500/50'
                                            } backdrop-blur-sm`}
                                    />
                                </div>
                            </div>

                            {/* Content Editor */}
                            <div>
                                <label className={`block text-sm font-medium mb-3 ${darkMode ? 'text-gray-300' : 'text-gray-700'
                                    }`}>
                                    Content
                                </label>
                                <div className={`rounded-xl border overflow-hidden ${darkMode
                                        ? 'bg-gray-800/50 border-gray-700/50'
                                        : 'bg-white/80 border-gray-200/50'
                                    } backdrop-blur-sm`}>
                                    <LexicalComposer initialConfig={editorConfig}>
                                        <InjectInitialHTML htmlContent={form.content} />
                                        <AdvancedToolbarPlugin darkMode={darkMode} />
                                        <RichTextPlugin
                                            contentEditable={
                                                <ContentEditable className={`min-h-[400px] p-6 focus:outline-none ${darkMode ? 'text-white' : 'text-gray-900'
                                                    }`} />
                                            }
                                            placeholder={
                                                <div className={`p-6 pointer-events-none ${darkMode ? 'text-gray-400' : 'text-gray-500'
                                                    }`}>
                                                    Start writing your blog content...
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
                            {/* Clean Progress Indicator */}
                            <div className="mb-2">
                                <div className={`flex items-center justify-between p-4 rounded-2xl ${darkMode
                                    ? 'bg-gray-800/50 border border-gray-700/50'
                                    : 'bg-white/80 border border-gray-200/50'
                                    } backdrop-blur-xl shadow-lg`}>
                                    <div className="flex items-center space-x-4">
                                        <div className={`flex items-center space-x-2 ${form.title.trim() ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            <div className={`w-3 h-3 rounded-full ${form.title.trim() ? 'bg-green-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                                } transition-colors duration-200`} />
                                            <span className="text-sm font-medium">Title</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${form.category.trim() ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            <div className={`w-3 h-3 rounded-full ${form.category.trim() ? 'bg-green-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                                } transition-colors duration-200`} />
                                            <span className="text-sm font-medium">Category</span>
                                        </div>
                                        <div className={`flex items-center space-x-2 ${form.content.trim() ? 'text-green-500' : darkMode ? 'text-gray-400' : 'text-gray-500'
                                            }`}>
                                            <div className={`w-3 h-3 rounded-full ${form.content.trim() ? 'bg-green-500' : darkMode ? 'bg-gray-600' : 'bg-gray-300'
                                                } transition-colors duration-200`} />
                                            <span className="text-sm font-medium">Content</span>
                                        </div>
                                    </div>
                                    <div className={`text-sm font-medium ${isFormValid
                                        ? 'text-green-500'
                                        : darkMode ? 'text-gray-400' : 'text-gray-600'
                                        }`}>
                                        {isFormValid ? '✓ Ready to publish' : 'Fill required fields'}
                                    </div>
                                </div>
                            </div>
                            {/* Action Buttons with Ripple Effect */}
                            <div className="flex flex-col sm:flex-row gap-4 pt-6">
                                <button
                                    type="button"
                                    onClick={() => submitUpdate('draft')}
                                    disabled={isSubmitting}
                                    className={`group relative flex-1 sm:flex-none px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden ${isSubmitting
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:shadow-xl'
                                        } ${darkMode
                                            ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg shadow-yellow-500/20'
                                            : 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white shadow-lg shadow-yellow-400/20'
                                        }`}
                                >
                                    {/* Ripple effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <span className="relative z-10 flex items-center justify-center">
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                📝 Save as Draft
                                            </>
                                        )}
                                    </span>
                                </button>

                                <button
                                    type="submit"
                                    disabled={isSubmitting || !isFormValid}
                                    className={`group relative flex-1 sm:flex-none px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] overflow-hidden ${isSubmitting || !isFormValid
                                            ? 'opacity-50 cursor-not-allowed'
                                            : 'hover:shadow-xl'
                                        } ${darkMode
                                            ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                                            : 'bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg shadow-blue-500/20'
                                        }`}
                                >
                                    {/* Ripple effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                                    <span className="relative z-10 flex items-center justify-center">
                                        {isSubmitting ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                                                Updating...
                                            </>
                                        ) : (
                                            <>
                                                🚀 Update & Publish
                                            </>
                                        )}
                                    </span>
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditBlog;