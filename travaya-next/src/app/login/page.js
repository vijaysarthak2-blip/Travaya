"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Globe } from 'lucide-react';
import { API_BASE } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    
    const { login } = useAuth();
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Login failed');
            }

            login(data.user, data.token);
            router.push('/');
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${API_BASE}/api/auth/google`;
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 py-24">
            <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-card border border-border-custom rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="text-center space-y-2 mb-10">
                            <h1 className="text-3xl font-bold tracking-tight">Welcome Back</h1>
                            <p className="text-gray-500 text-sm">Log in to your Travaya account to continue</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type="email" 
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        className="w-full bg-background border border-border-custom rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-sm font-semibold">Password</label>
                                    <Link href="/forgot-password" size="sm" className="text-xs text-primary hover:underline">Forgot password?</Link>
                                </div>
                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-background border border-border-custom rounded-xl py-3 pl-12 pr-12 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-500"
                                    />
                                    <button 
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border-custom"></span>
                            </div>
                            <span className="relative px-4 bg-card text-xs text-gray-400 uppercase tracking-widest">Or continue with</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button 
                                onClick={handleGoogleLogin}
                                className="flex items-center justify-center gap-3 py-3 border border-border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/0/google.svg" alt="Google" className="w-5 h-5" />
                                <span className="text-sm font-medium">Google</span>
                            </button>
                            <button className="flex items-center justify-center gap-3 py-3 border border-border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                                <Globe size={20} />
                                <span className="text-sm font-medium">Github</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-white/2 bg-opacity-50 text-center border-t border-border-custom">
                        <p className="text-sm text-gray-500">
                            Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Sign up for free</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
