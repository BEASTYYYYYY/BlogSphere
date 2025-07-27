import React, { useState, useEffect } from 'react';
import {PenTool,Heart,MessageCircle,Bookmark,TrendingUp,Users,Search,Tag,Star,ArrowRight,Globe,Zap,Shield,Sparkles,Eye
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LandingPageNavbar from './LandingPageNavbar'; // Import the new Navbar

const LandingPage = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [activeFeature, setActiveFeature] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const features = [
        {
            icon: PenTool,
            title: "Rich Text Editor",
            description: "Create beautiful blogs with our advanced editor featuring formatting, images, and more.",
            gradient: "from-purple-500 to-pink-500"
        },
        {
            icon: Heart,
            title: "Social Engagement",
            description: "Like, comment, and interact with fellow writers in our vibrant community.",
            gradient: "from-red-500 to-orange-500"
        },
        {
            icon: Bookmark,
            title: "Save & Organize",
            description: "Bookmark your favorite posts and organize them for easy access later.",
            gradient: "from-blue-500 to-cyan-500"
        },
        {
            icon: TrendingUp,
            title: "Discover Trending",
            description: "Stay updated with trending topics and popular content in your interests.",
            gradient: "from-green-500 to-emerald-500"
        },
        {
            icon: Users,
            title: "Follow Authors",
            description: "Connect with your favorite writers and never miss their latest posts.",
            gradient: "from-indigo-500 to-purple-500"
        },
        {
            icon: Search,
            title: "Smart Search",
            description: "Find exactly what you're looking for with our intelligent search system.",
            gradient: "from-yellow-500 to-orange-500"
        }
    ];

    const handleGetStarted = () => {
        navigate('/auth');
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-all duration-500">
            <LandingPageNavbar />
            <section className="relative overflow-hidden pt-48 pb-16 lg:pt-40 lg:pb-24">
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-pink-400/20 to-red-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className={`text-center transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                        {/* Logo/Brand */}
                        <div className="mb-8">
                            <div className="inline-flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                <Sparkles className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                                <h1 className="text-4xl lg:text-5xl font-bold">BlogSphere</h1>
                            </div>
                        </div>

                        {/* Main Headline */}
                        <h2 className="text-4xl lg:text-6xl xl:text-7xl font-bold text-gray-900 dark:text-white mb-6 leading-tight">
                            Where Stories
                            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"> Come Alive</span>
                        </h2>

                        <p className="text-xl lg:text-2xl text-gray-600 dark:text-gray-300 mb-12 max-w-4xl mx-auto leading-relaxed">
                            Join thousands of writers sharing their thoughts, experiences, and expertise.
                            Create, connect, and inspire in our vibrant blogging community.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
                        <button
                            onClick={handleGetStarted}
                            className="group bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center space-x-2"
                        >
                            <span>Start Writing Today</span>
                            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 lg:py-32 bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            Everything You Need to
                            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent"> Create & Connect</span>
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Our platform provides all the tools and features you need to share your stories with the world.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {features.map((feature, index) => (
                            <div
                                key={index}
                                className={`group bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-gray-100 dark:border-gray-700 hover:border-transparent hover:bg-gradient-to-br hover:from-white hover:to-gray-50 dark:hover:from-gray-800 dark:hover:to-gray-700 ${activeFeature === index ? 'ring-2 ring-blue-500/50' : ''
                                    }`}
                                onMouseEnter={() => setActiveFeature(index)}
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} p-4 mb-6 group-hover:scale-110 transition-transform duration-300`}>
                                    <feature.icon className="w-8 h-8 text-white" />
                                </div>

                                <h4 className="text-2xl font-bold text-gray-900 dark:text-white mb-4 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                                    {feature.title}
                                </h4>

                                <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Interactive Demo Section */}
            <section className="py-20 lg:py-32 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10"></div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h3 className="text-3xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-6">
                            See BlogSphere in
                            <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> Action</span>
                        </h3>
                        <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                            Experience the power of our platform with these key features that make writing and sharing effortless.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        {/* Left - Feature List */}
                        <div className="space-y-8">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                                        <PenTool className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Write with Style</h4>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Rich text editor with formatting, images, and real-time preview.</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                                        <Users className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Build Community</h4>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Connect with readers, follow authors, and engage through comments.</p>
                            </div>

                            <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-xl border border-gray-100 dark:border-gray-700">
                                <div className="flex items-center space-x-4 mb-4">
                                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-white" />
                                    </div>
                                    <h4 className="text-xl font-bold text-gray-900 dark:text-white">Discover Content</h4>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300">Find trending posts, explore categories, and discover new voices.</p>
                            </div>
                        </div>

                        {/* Right - Mock Interface */}
                        <div className="relative">
                            <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
                                {/* Mock Browser Header */}
                                <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center space-x-2">
                                    <div className="flex space-x-2">
                                        <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                    </div>
                                    <div className="flex-1 bg-white dark:bg-gray-600 rounded-lg px-3 py-1 mx-4">
                                        <span className="text-sm text-gray-500 dark:text-gray-400">blogsphere.com</span>
                                    </div>
                                </div>

                                {/* Mock Content */}
                                <div className="p-6 space-y-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                                        <div>
                                            <div className="w-24 h-3 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                            <div className="w-16 h-2 bg-gray-100 dark:bg-gray-700 rounded mt-1"></div>
                                        </div>
                                    </div>

                                    <div className="w-full h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                    <div className="w-3/4 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>
                                    <div className="w-5/6 h-4 bg-gray-200 dark:bg-gray-600 rounded"></div>

                                    <div className="flex items-center space-x-4 pt-4">
                                        <div className="flex items-center space-x-1">
                                            <Heart className="w-4 h-4 text-red-500" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">24</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <MessageCircle className="w-4 h-4 text-blue-500" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">8</span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                            <Bookmark className="w-4 h-4 text-green-500" />
                                            <span className="text-sm text-gray-500 dark:text-gray-400">Save</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Get Started Today Button - Moved Here */}
                                <div className="p-6 pt-0">
                                    <button
                                        onClick={handleGetStarted}
                                        className="group w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg shadow-2xl hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 flex items-center justify-center space-x-2 mt-4"
                                    >
                                        <span>Get Started Today</span>
                                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            {/* Floating Elements */}
                            <div className="absolute -top-4 -right-4 w-16 h-16 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-xl animate-bounce">
                                <Star className="w-8 h-8 text-white" />
                            </div>

                            <div className="absolute -bottom-4 -left-4 w-12 h-12 bg-gradient-to-r from-green-400 to-blue-500 rounded-xl flex items-center justify-center shadow-xl animate-pulse">
                                <Zap className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
};

export default LandingPage;