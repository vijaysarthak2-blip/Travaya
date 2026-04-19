'use client';

import React, { useState } from 'react';
import { Shield, ArrowRight, RefreshCw, Loader2 } from 'lucide-react';
import { normalizeMobileNumber } from '../utils/mobileValidation';

export default function OTPVerification({ mobile, onVerified, onBack, mode = 'login' }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);
    const [error, setError] = useState('');
    const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
    const [canResend, setCanResend] = useState(false);

    // Countdown timer
    React.useEffect(() => {
        if (timeLeft > 0 && !canResend) {
            const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
            return () => clearTimeout(timer);
        } else if (timeLeft === 0) {
            setCanResend(true);
        }
    }, [timeLeft, canResend]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleChange = (index, value) => {
        if (value.length > 1) return; // Only allow single digit
        
        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);
        
        // Auto-focus next input
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            if (nextInput) nextInput.focus();
        }
        
        setError('');
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            if (prevInput) prevInput.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').slice(0, 6);
        const digits = pastedData.split('').filter(char => /\d/.test(char));
        
        if (digits.length === 6) {
            setOtp(digits);
            setError('');
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const otpValue = otp.join('');
        
        if (otpValue.length !== 6) {
            setError('Please enter all 6 digits');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const endpoint = mode === 'login' 
                ? '/api/auth/mobile-login' 
                : '/api/auth/verify-mobile-otp';
            
            const body = mode === 'login' 
                ? { mobile: normalizeMobileNumber(mobile), otp: otpValue }
                : { mobile: normalizeMobileNumber(mobile), otp: otpValue };

            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body)
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Verification failed');
            }

            if (mode === 'login') {
                // Login successful - pass token and user data
                onVerified(data.token, data.user);
            } else {
                // Verification successful - just notify
                onVerified();
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        setResending(true);
        setError('');

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE || 'http://localhost:5000'}/api/auth/send-mobile-otp`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mobile: normalizeMobileNumber(mobile) })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to resend OTP');
            }

            // Reset timer and OTP
            setTimeLeft(300);
            setCanResend(false);
            setOtp(['', '', '', '', '', '']);
        } catch (err) {
            setError(err.message);
        } finally {
            setResending(false);
        }
    };

    return (
        <div className="space-y-6">
            <div className="text-center space-y-2">
                <div className="flex justify-center">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center">
                        <Shield className="w-8 h-8 text-primary" />
                    </div>
                </div>
                <h2 className="text-2xl font-bold">Verify Mobile Number</h2>
                <p className="text-gray-500 text-sm">
                    Enter the 6-digit code sent to {mobile.substring(0, mobile.length - 4)}****{mobile.slice(-2)}
                </p>
            </div>

            {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm animate-in fade-in slide-in-from-top-2">
                    {error}
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                <div className="flex justify-center gap-2">
                    {otp.map((digit, index) => (
                        <input
                            key={index}
                            id={`otp-${index}`}
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={index === 0 ? handlePaste : undefined}
                            className="w-12 h-14 text-center text-lg font-bold bg-background border border-border-custom rounded-xl focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                            required
                        />
                    ))}
                </div>

                <div className="text-center space-y-4">
                    <div className="text-sm text-gray-500">
                        {canResend ? (
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={resending}
                                className="text-primary hover:underline flex items-center gap-2 mx-auto"
                            >
                                {resending ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <RefreshCw size={14} />
                                )}
                                Resend Code
                            </button>
                        ) : (
                            <span>Resend code in {formatTime(timeLeft)}</span>
                        )}
                    </div>

                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onBack}
                            className="flex-1 px-6 py-3 border border-border-custom rounded-xl font-semibold hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                        >
                            Back
                        </button>
                        <button
                            type="submit"
                            disabled={loading || otp.join('').length !== 6}
                            className="flex-1 bg-primary hover:bg-primary-dark text-black font-bold py-3 rounded-xl shadow-lg transition-all transform active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin" />
                            ) : (
                                <>
                                    <span>Verify</span>
                                    <ArrowRight size={18} />
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
}
