import { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { loginUser } from '../utils/login';
import axios from 'axios';

export default function LoginForm({ darkMode }) {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const user = await loginUser(formData.email, formData.password);
            const token = await user.getIdToken();
            await axios.post('/api/auth/login', {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const me = await axios.get('/api/users/me', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const role = me.data.role;
            window.location.href = role === 'admin' ? '/admin' : '/';
              
        } catch (err) {
            console.error(err);
          }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 pt-16">
            <div className="relative group">
                <Mail className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                    type="email"
                    name="email"
                    placeholder="Email Address"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-4 py-4 rounded-2xl border ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                />
            </div>

            <div className="relative group">
                <Lock className={`absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`} />
                <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="Password"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full pl-12 pr-12 py-4 rounded-2xl border ${darkMode ? 'bg-white/10 border-white/20 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                    required
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 transform -translate-y-1/2">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
            </div>

            <button type="submit" disabled={isLoading} className="w-full bg-blue-500 text-white py-4 rounded-2xl font-medium hover:scale-105 transition-all duration-300">
                {isLoading ? "Signing in..." : <><span>Sign In</span><ArrowRight className="w-5 h-5 ml-2 inline" /></>}
            </button>
        </form>
    );
}
