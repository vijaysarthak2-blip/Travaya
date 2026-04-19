"use client";

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Phone } from 'lucide-react';
import { API_BASE } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useRouter } from 'next/navigation';
import OTPVerification from '../../components/OTPVerification';
import { formatMobileNumber, validateMobileNumber, normalizeMobileNumber } from '../../utils/mobileValidation';

export default function Login() {
    const [formData, setFormData] = useState({ email: '', password: '', mobile: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showMobileLogin, setShowMobileLogin] = useState(false);
    const [mobileMode, setMobileMode] = useState(false);
    
    const { login } = useAuth();
    const router = useRouter();

    const hasHandledOAuth = useRef(false);

    useEffect(() => {
        if (hasHandledOAuth.current) return;

        if (typeof window !== 'undefined') {
            const urlParams = new URLSearchParams(window.location.search);
            const token = urlParams.get('token');
            const userStr = urlParams.get('user');
            const popupError = urlParams.get('error');

            if (token && userStr) {
                hasHandledOAuth.current = true;
                window.history.replaceState({}, document.title, window.location.pathname);
                
                try {
                    const userObj = JSON.parse(decodeURIComponent(userStr));
                    login(userObj, token);
                    router.push('/');
                } catch (err) {
                    console.error("Failed to parse user from query", err);
                    setError("Failed to login with Google");
                }
            } else if (popupError) {
                hasHandledOAuth.current = true;
                window.history.replaceState({}, document.title, window.location.pathname);
                setError("Google login failed or was cancelled.");
            }
        }
    }, [login, router]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        if (name === 'mobile') {
            const formatted = formatMobileNumber(value);
            setFormData({ ...formData, [name]: formatted });
        } else {
            setFormData({ ...formData, [name]: value });
        }
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

    const handleMobileLogin = () => {
        setMobileMode(true);
        setError('');
    };

    const handleEmailMode = () => {
        setMobileMode(false);
        setError('');
    };

    const handleMobileVerified = (token, user) => {
        login(user, token);
        router.push('/');
    };

    const handleMobileOTPSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.mobile) {
            setError('Please enter mobile number first');
            return;
        }
        
        const validation = validateMobileNumber(formData.mobile);
        if (!validation.isValid) {
            setError(validation.error);
            return;
        }

        setShowMobileLogin(true);
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

                        <form onSubmit={mobileMode ? handleMobileOTPSubmit : handleSubmit} className="space-y-6">
                            {!mobileMode ? (
                                <>
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
                                </>
                            ) : (
                                <div className="space-y-1.5">
                                    <label className="text-sm font-semibold ml-1">Mobile Number</label>
                                    <div className="relative group">
                                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                        <input 
                                            type="tel" 
                                            name="mobile"
                                            required
                                            value={formData.mobile}
                                            onChange={handleChange}
                                            placeholder="+91 98765 43210"
                                            className="w-full bg-background border border-border-custom rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all placeholder:text-gray-500"
                                        />
                                    </div>
                                </div>
                            )}

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary hover:bg-primary-dark text-black font-bold py-3.5 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span>{mobileMode ? 'Send OTP' : 'Sign In'}</span>
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
                                onClick={mobileMode ? handleGoogleLogin : handleGoogleLogin}
                                className="flex items-center justify-center gap-3 py-3 border border-border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                                <svg viewBox="0 0 24 24" className="w-5 h-5">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
</svg>
                                <span className="text-sm font-medium">{mobileMode ? 'Google Login' : 'Google'}</span>
                            </button>
                            <button 
                                onClick={mobileMode ? handleEmailMode : handleMobileLogin}
                                className="flex items-center justify-center gap-3 py-3 border border-border-custom rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                            >
                                {mobileMode ? <Mail size={20} /> : <Phone size={20} />}
                                <span className="text-sm font-medium">{mobileMode ? 'Email Login' : 'Mobile OTP'}</span>
                            </button>
                        </div>
                    </div>

                    <div className="p-6 bg-gray-50 dark:bg-white/2 bg-opacity-50 text-center border-t border-border-custom">
                        <p className="text-sm text-gray-500">
                            Don't have an account? <Link href="/register" className="text-primary font-bold hover:underline">Sign up for free</Link>
                        </p>
                    </div>
                </div>

            {/* OTP Verification Modal */}
            {showMobileLogin && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-md bg-card border border-border-custom rounded-3xl shadow-2xl p-8 animate-in zoom-in-95 duration-200">
                        <OTPVerification
                            mobile={formData.mobile}
                            onVerified={handleMobileVerified}
                            onBack={() => setShowMobileLogin(false)}
                            mode="login"
                        />
                    </div>
                </div>
            )}
            </div>
        </div>
    );
}
