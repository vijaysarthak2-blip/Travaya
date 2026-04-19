"use client";

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { 
  Calendar, User, Mail, Phone, Users, 
  ArrowLeft, CheckCircle2, AlertCircle, Loader2, MapPin 
} from 'lucide-react';
import { API_BASE } from '../../config';
import { useAuth } from '../../context/AuthContext';

function BookingForm() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, token } = useAuth();
    
    const destinationId = searchParams.get('id');
    const [destination, setDestination] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetchLoading, setFetchLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        travelers: 1,
        date: ''
    });

    useEffect(() => {
        // Redirect if not logged in
        if (!token && !localStorage.getItem('authToken')) {
            router.push(`/login?redirect=/booking&id=${destinationId}`);
            return;
        }

        // Fill user data
        if (user) {
            setFormData(prev => ({
                ...prev,
                name: user.fullName || '',
                email: user.email || ''
            }));
        }

        // Fetch destination details
        const fetchDest = async () => {
            if (!destinationId) {
                setFetchLoading(false);
                return;
            }
            try {
                const res = await fetch(`${API_BASE}/destinations/${destinationId}`);
                if (res.ok) {
                    const data = await res.json();
                    setDestination(data);
                }
            } catch (err) {
                console.error("Failed to fetch destination:", err);
            } finally {
                setFetchLoading(false);
            }
        };

        fetchDest();
    }, [user, token, destinationId]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Date validation
        const selectedDate = new Date(formData.date);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (selectedDate < today) {
            return setError("Please select a future date for your trip");
        }

        setLoading(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    destinationId,
                    ...formData,
                    travelers: parseInt(formData.travelers, 10)
                })
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || "Booking failed");
            }

            setSuccess(true);
            setTimeout(() => {
                router.push(`/checkout/${data.bookingId}`);
            }, 3000);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (fetchLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center px-6">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto">
                        <CheckCircle2 size={48} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold">Booking Initialized!</h1>
                        <p className="text-gray-500 leading-relaxed">
                            Adventure awaits! Your itinerary for <span className="text-foreground font-bold">{destination?.name}</span> is reserved. 
                            Redirecting to secure payment gateway...
                        </p>
                    </div>
                    <div className="w-full bg-gray-200 h-1 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full animate-[progress_3s_linear]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-24 md:pt-32 pb-24 px-4 md:px-6">
            <div className="max-w-5xl mx-auto mb-10 space-y-6">
                 <button 
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors"
                >
                    <ArrowLeft size={16} />
                    Back to Details
                </button>

                <div className="space-y-4">
                    <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase">Plan Your <span className="text-primary italic">Perfect Trip</span></h1>
                    <p className="text-gray-500 font-medium leading-relaxed max-w-xl">
                        Complete the form to secure your spot. Our team will contact you for further customization.
                    </p>
                </div>
            </div>

            <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8 md:gap-12 items-start">
                {/* Left: Summary Card */}
                <div className="lg:col-span-2 lg:sticky lg:top-32">
                    {destination && (
                        <div className="bg-card border border-border-custom rounded-[2rem] shadow-2xl overflow-hidden p-3 relative group">
                            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                            <img
                                src={{
                                    'jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed68045?w=800&q=80',
                                    'manali': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=800&q=80',
                                    'goa': 'https://images.unsplash.com/photo-1587922546307-776227941871?w=800&q=80',
                                    'kerala': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=800&q=80',
                                    'udaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=800&q=80',
                                    'rishikesh': 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=800&q=80',
                                    'ladakh': 'https://images.unsplash.com/photo-1626015366386-acca87a74b53?w=800&q=80',
                                    'varanasi': 'https://images.unsplash.com/photo-1561361058-c24cecae35ca?w=800&q=80',
                                    'andaman': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80',
                                    'shimla': 'https://images.unsplash.com/photo-1597006819268-4b68c7d6b82f?w=800&q=80',
                                }[Object.keys({'jaipur':1,'manali':1,'goa':1,'kerala':1,'udaipur':1,'rishikesh':1,'ladakh':1,'varanasi':1,'andaman':1,'shimla':1}).find(k => (destination.name||'').toLowerCase().includes(k))] ||
                                (destination.image?.startsWith('http') && !destination.image?.includes('localhost') ? destination.image : null) ||
                                'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'}
                                alt={destination.name}
                                className="w-full h-48 md:h-56 object-cover rounded-[1.5rem]"
                            />
                            <div className="p-6 space-y-4">
                                <h3 className="font-black text-3xl uppercase italic tracking-tighter">{destination.name}</h3>
                                <div className="flex items-center gap-2 text-gray-400 font-bold text-sm uppercase tracking-widest">
                                    <MapPin size={16} className="text-primary" />
                                    <span>{destination.state}</span>
                                </div>
                                <div className="pt-6 mt-6 border-t border-border-custom flex justify-between items-center">
                                    <span className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] ml-1">Per Person</span>
                                    <span className="text-3xl font-black text-primary italic tracking-tighter">₹{destination.price?.toLocaleString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Right: Form Card */}
                <div className="lg:col-span-3">
                    <div className="bg-card border border-border-custom rounded-[2rem] shadow-2xl p-8 md:p-10">
                        {error && (
                            <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm flex items-center gap-3">
                                <AlertCircle size={18} />
                                <span>{error}</span>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Full Name</label>
                                <div className="relative group">
                                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type="text" 
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="John Doe"
                                        className="w-full bg-background border border-border-custom rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Email Address</label>
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type="email" 
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@example.com"
                                        className="w-full bg-background border border-border-custom rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Phone</label>
                                <div className="relative group">
                                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type="tel" 
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="+91 98765 43210"
                                        className="w-full bg-background border border-border-custom rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Travelers</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type="number" 
                                        name="travelers"
                                        required
                                        min="1"
                                        value={formData.travelers}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border-custom rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <div className="md:col-span-2 space-y-1.5">
                                <label className="text-xs font-bold uppercase text-gray-400 tracking-wider ml-1">Travel Date</label>
                                <div className="relative group">
                                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={18} />
                                    <input 
                                        type="date" 
                                        name="date"
                                        required
                                        value={formData.date}
                                        onChange={handleChange}
                                        className="w-full bg-background border border-border-custom rounded-xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="md:col-span-2 w-full bg-primary hover:bg-primary-dark text-black font-black py-4.5 rounded-2xl shadow-xl transition-all transform hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 text-lg uppercase tracking-tight"
                            >
                                {loading ? (
                                    <Loader2 className="animate-spin" size={20} />
                                ) : (
                                    <>
                                        <span>Confirm Booking</span>
                                        <CheckCircle2 size={20} />
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Booking() {
    return (
        <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>}>
            <BookingForm />
        </Suspense>
    );
}
