"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Globe, ShieldCheck } from 'lucide-react';
import { API_BASE } from '../../config';
import { useRouter } from 'next/navigation';

export default function Register() {
    const [formData, setFormData] = useState({ 
        fullName: '', 
        email: '', 
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);
    
    const router = useRouter();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password !== formData.confirmPassword) {
            return setError("Passwords do not match");
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    fullName: formData.fullName,
                    email: formData.email,
                    password: formData.password
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Registration failed');
            }

            setSuccess(true);
            setTimeout(() => {
                router.push('/login');
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-6">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mx-auto">
                        <ShieldCheck size={48} />
                    </div>
                    <h1 className="text-3xl font-bold">Account Created!</h1>
                    <p className="text-gray-500 leading-relaxed">
                        Your account has been successfully created. We've sent a verification email to <strong>{formData.email}</strong>. 
                        Redirecting to login...
                    </p>
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-primary h-full animate-[progress_3s_linear]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-6 py-24">
             <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-secondary/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px]" />
            </div>

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-card border border-border-custom rounded-3xl shadow-2xl overflow-hidden">
                    <div className="p-8 md:p-12">
                        <div className="text-center space-y-2 mb-10">
                            <h1 className="text-3xl font-bold tracking-tight">Create Account</h1>
                            <p className="text-gray-500 text-sm">Join the Travaya community today</p>
                        </div>

                        {error && (
                            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-in fade-in slide-in-from-top-2">
                                {error}
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-sm font-semibold ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        name="fullName"
                                        required
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full bg-background border border-border-custom rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-500"
                                    />
                                </div>
                            </div>

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

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Password</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            name="password"
                                            required
                                            value={formData.password}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-background border border-border-custom rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-500"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Confirm</label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <input 
                                            type={showPassword ? "text" : "password"}
                                            name="confirmPassword"
                                            required
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            placeholder="••••••••"
                                            className="w-full bg-background border border-border-custom rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-500"
                                        />
                                    </div>
                                </div>
                            </div>
                            
                            <div className="flex items-center gap-2 ml-1">
                                <button 
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="text-xs text-gray-500 hover:text-primary flex items-center gap-1 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                                    <span>{showPassword ? "Hide" : "Show"} password</span>
                                </button>
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
                                        <span>Create Account</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="relative my-8 text-center">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border-custom"></span>
                            </div>
                            <span className="relative px-4 bg-card text-xs text-gray-400 uppercase tracking-widest">Or sign up with</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <button className="flex items-center justify-center gap-3 py-3 border border-border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
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
                            Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in here</Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
