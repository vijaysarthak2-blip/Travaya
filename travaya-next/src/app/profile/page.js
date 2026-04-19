"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  User, Mail, Briefcase, Lock, Settings, 
  LogOut, Trash2, Calendar, Users, MapPin,
  CheckCircle2, AlertCircle, Loader2, ShieldCheck,
  ChevronRight, Camera, Sparkles, Compass, CreditCard, Heart, ArrowRight
} from 'lucide-react';
import { API_BASE } from '../../config';
import { useAuth } from '../../context/AuthContext';
import { useCurrency } from '../../context/CurrencyContext';

export default function Profile() {
    const { user, token, logout, loading: authLoading, wishlist, toggleWishlist } = useAuth();
    const { formatPrice } = useCurrency();
    const router = useRouter();
    
    const [activeTab, setActiveTab] = useState('profile');
    const [bookings, setBookings] = useState([]);
    const [bookingsLoading, setBookingsLoading] = useState(false);
    
    // Review State
    const [reviewModalOpen, setReviewModalOpen] = useState(null);
    const [reviewForm, setReviewForm] = useState({ rating: 5, text: '' });
    
    // Form States
    const [profileForm, setProfileForm] = useState({ fullName: '', email: '' });
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    
    const [status, setStatus] = useState({ type: '', message: '' });
    const [isActionLoading, setIsActionLoading] = useState(false);

    useEffect(() => {
        if (!authLoading && !token && !localStorage.getItem('authToken')) {
            router.push('/login?redirect=/profile');
            return;
        }

        if (user) {
            setProfileForm({ fullName: user.fullName || '', email: user.email || '' });
        }
    }, [user, token, authLoading]);

    useEffect(() => {
        if (activeTab === 'bookings' && token) {
            fetchBookings();
        }
    }, [activeTab, token]);

    const fetchBookings = async () => {
        setBookingsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            }
        } catch (err) {
            console.error("Failed to fetch bookings:", err);
        } finally {
            setBookingsLoading(false);
        }
    };

    const handleCancelTrip = async (bookingId) => {
        if (!window.confirm("Are you sure you want to cancel this trip? This action cannot be undone.")) return;
        
        try {
            const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setStatus({ type: 'success', message: 'Trip successfully cancelled.' });
                setBookings(prev => prev.filter(b => b._id !== bookingId));
            } else {
                throw new Error("Failed to cancel trip.");
            }
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setIsActionLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(`${API_BASE}/api/user/profile`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(profileForm)
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Update failed");

            setStatus({ type: 'success', message: "Profile updated successfully!" });
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleReviewSubmit = async (booking) => {
        setIsActionLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(`${API_BASE}/api/destinations/${booking.destinationId._id}/reviews`, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating: reviewForm.rating,
                    reviewText: reviewForm.text
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Review submission failed");

            setStatus({ type: 'success', message: "Thank you! Your verified review has been published." });
            setReviewModalOpen(null);
            setReviewForm({ rating: 5, text: '' });
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            return setStatus({ type: 'error', message: "Passwords do not match" });
        }

        setIsActionLoading(true);
        setStatus({ type: '', message: '' });

        try {
            const res = await fetch(`${API_BASE}/api/user/change-password`, {
                method: 'PUT',
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    currentPassword: passwordForm.currentPassword,
                    newPassword: passwordForm.newPassword
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Password change failed");

            setStatus({ type: 'success', message: "Password changed successfully!" });
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err) {
            setStatus({ type: 'error', message: err.message });
        } finally {
            setIsActionLoading(false);
        }
    };

    const handleDeleteAccount = async () => {
        const confirmed = window.confirm("Are you sure? This will permanently delete your account and all bookings.");
        if (!confirmed) return;

        const doubleConfirm = window.prompt("Type 'DELETE' to confirm:");
        if (doubleConfirm !== "DELETE") return;

        try {
            const res = await fetch(`${API_BASE}/api/user/account`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                logout();
            }
        } catch (err) {
            setStatus({ type: 'error', message: "Failed to delete account" });
        }
    };

    if (authLoading || !user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="relative">
                     <Loader2 className="animate-spin text-primary" size={64} />
                     <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full" />
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'profile', label: 'Persona', icon: User, desc: 'Personal Identity' },
        { id: 'bookings', label: 'Journeys', icon: Briefcase, desc: 'Trip History' },
        { id: 'saved', label: 'Saved', icon: Heart, desc: `${wishlist.length} Destinations` },
        { id: 'security', label: 'Vault', icon: Lock, desc: 'Security Access' },
        { id: 'settings', label: 'Control', icon: Settings, desc: 'Account Management' },
    ];

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Immersive Dashboard Header */}
            <div className="relative h-[40vh] bg-black overflow-hidden flex items-end pb-12 px-6 md:px-12">
                 <div className="absolute inset-0 z-0">
                      <img src="/jaipur.jpg" alt="Background" className="w-full h-full object-cover opacity-50 blur-sm scale-110" />
                      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                 </div>
                 
                 <div className="max-w-7xl mx-auto w-full relative z-10 flex flex-col md:flex-row items-center md:items-end gap-10">
                    <div className="relative group">
                        <div className="w-40 h-40 bg-primary/20 backdrop-blur-3xl rounded-[3rem] border-4 border-background flex items-center justify-center text-7xl font-black text-primary italic shadow-2xl transition-transform duration-500 group-hover:scale-105">
                            {user.fullName.charAt(0)}
                        </div>
                        <button className="absolute bottom-4 right-4 bg-primary text-black p-3 rounded-2xl shadow-xl hover:scale-110 transition-transform">
                            <Camera size={20} />
                        </button>
                    </div>
                    
                    <div className="text-center md:text-left space-y-4 pb-4">
                         <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.2em] backdrop-blur-md">
                             <Sparkles size={14} />
                             <span>Premium {user.role || 'Explorer'}</span>
                         </div>
                         <h1 className="text-4xl md:text-6xl font-black text-foreground tracking-tighter leading-none">{user.fullName}</h1>
                         <div className="flex flex-wrap items-center justify-center md:justify-start gap-6 text-gray-500 font-bold uppercase tracking-widest text-xs">
                             <div className="flex items-center gap-2 px-4 py-2 bg-card rounded-xl border border-border-custom shadow-sm lowercase font-medium text-sm tracking-normal">
                                 <Mail size={14} className="text-primary" />
                                 <span>{user.email}</span>
                             </div>
                             <div className="flex items-center gap-2">
                                 <Compass size={14} className="text-primary" />
                                 <span>Joined {new Date(user.createdAt || Date.now()).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                             </div>
                         </div>
                    </div>
                 </div>
            </div>

            <div className="max-w-7xl mx-auto px-6 md:px-12 -mt-10 relative z-30">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                    
                    {/* Modern Tab Navigation */}
                    <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                        <div className="bg-card/70 backdrop-blur-3xl border border-border-custom rounded-[3rem] p-3 shadow-2xl space-y-2 animate-in fade-in slide-in-from-left-10 duration-1000">
                             {tabs.map(tab => {
                                 const Icon = tab.icon;
                                 return (
                                     <button
                                         key={tab.id}
                                         onClick={() => setActiveTab(tab.id)}
                                         className={`w-full flex items-center gap-5 p-5 rounded-[2.5rem] transition-all group relative overflow-hidden ${
                                             activeTab === tab.id 
                                             ? 'bg-primary text-black shadow-xl shadow-primary/20' 
                                             : 'text-gray-500 hover:bg-primary/10 hover:text-primary'
                                         }`}
                                     >
                                         <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${activeTab === tab.id ? 'bg-black/10' : 'bg-background border border-border-custom group-hover:border-primary/30'}`}>
                                             <Icon size={24} />
                                         </div>
                                         <div className="text-left">
                                             <p className="text-sm font-black uppercase tracking-tighter">{tab.label}</p>
                                             <p className={`text-[10px] font-bold uppercase tracking-widest transition-opacity ${activeTab === tab.id ? 'opacity-70' : 'opacity-40'}`}>{tab.desc}</p>
                                         </div>
                                         {activeTab === tab.id && (
                                             <div className="ml-auto">
                                                 <ChevronRight size={20} />
                                             </div>
                                         )}
                                     </button>
                                 );
                             })}
                        </div>

                        <button 
                            onClick={logout}
                            className="w-full flex items-center justify-center gap-4 p-6 text-red-500 font-black uppercase tracking-tighter bg-red-500/5 border border-red-500/20 rounded-[2.5rem] hover:bg-red-500 hover:text-white transition-all shadow-xl shadow-red-500/10 group"
                        >
                            <LogOut size={24} className="group-hover:-translate-x-1 transition-transform" />
                            <span>Sign Out</span>
                        </button>
                    </div>

                    {/* Dashboard Content Panes */}
                    <main className="lg:col-span-8 xl:col-span-9 animate-in fade-in zoom-in duration-1000">
                        <div className="bg-card/40 backdrop-blur-3xl border border-border-custom rounded-[4rem] shadow-2xl p-10 md:p-16 min-h-[650px] relative overflow-hidden">
                            
                            {/* Visual Branding Element */}
                            <div className="absolute top-0 right-0 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                            {/* Status Notifications */}
                            {status.message && (
                                <div className={`mb-12 p-6 rounded-[2rem] flex items-center gap-4 text-sm font-black uppercase tracking-tight animate-in fade-in slide-in-from-top-6 ${
                                    status.type === 'success' ? 'bg-primary/10 text-primary border border-primary/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'
                                }`}>
                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${status.type === 'success' ? 'bg-primary/20' : 'bg-red-500/20'}`}>
                                        {status.type === 'success' ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
                                    </div>
                                    <span>{status.message}</span>
                                </div>
                            )}

                            {activeTab === 'profile' && (
                                <div className="space-y-16 animate-in fade-in duration-700">
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Persona <span className="text-primary tracking-normal not-italic">& Identity</span></h2>
                                        <p className="text-gray-500 font-medium text-lg leading-relaxed">Update your explorer credentials and how the world sees you.</p>
                                    </div>

                                    <form onSubmit={handleProfileUpdate} className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-3">Full Legal Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input 
                                                    type="text" 
                                                    value={profileForm.fullName}
                                                    onChange={(e) => setProfileForm({...profileForm, fullName: e.target.value})}
                                                    className="w-full bg-background/50 border border-border-custom rounded-2xl py-5 pl-16 pr-6 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-3">Communication Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input 
                                                    type="email" 
                                                    value={profileForm.email}
                                                    onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                                                    className="w-full bg-background/50 border border-border-custom rounded-2xl py-5 pl-16 pr-6 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg"
                                                />
                                            </div>
                                        </div>
                                        <div className="md:col-span-2 pt-10">
                                            <button 
                                                type="submit" 
                                                disabled={isActionLoading}
                                                className="bg-primary hover:bg-primary-dark text-black font-black px-12 py-5 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all transform active:scale-95 disabled:opacity-50 flex items-center gap-4 text-xl uppercase tracking-tighter"
                                            >
                                                {isActionLoading ? <Loader2 className="animate-spin" size={24} /> : (
                                                    <>
                                                       <span>Update Profile</span>
                                                       <ArrowRight size={24} />
                                                    </>
                                                )}
                                            </button>
                                        </div>
                                    </form>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-8 border-t border-border-custom">
                                         <div className="p-8 bg-background/50 rounded-3xl border border-border-custom space-y-4">
                                              <MapPin className="text-primary" size={32} />
                                              <h4 className="font-black uppercase tracking-tighter text-lg">Passport Origins</h4>
                                              <p className="text-gray-500 text-sm font-medium">India (Verified)</p>
                                         </div>
                                         <div className="p-8 bg-background/50 rounded-3xl border border-border-custom space-y-4">
                                              <CreditCard className="text-primary" size={32} />
                                              <h4 className="font-black uppercase tracking-tighter text-lg">Loyalty Status</h4>
                                              <p className="text-gray-500 text-sm font-medium">Elite Membership Tier</p>
                                         </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'bookings' && (
                                <div className="space-y-16 animate-in fade-in duration-700">
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Adventure <span className="text-primary tracking-normal not-italic">Ledger</span></h2>
                                        <p className="text-gray-500 font-medium text-lg leading-relaxed">Your curated history of world discoveries and upcoming horizons.</p>
                                    </div>

                                    {bookingsLoading ? (
                                        <div className="flex flex-col items-center justify-center py-32 gap-8">
                                            <div className="relative">
                                                <Loader2 className="animate-spin text-primary" size={64} />
                                                <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                                            </div>
                                            <p className="text-gray-500 font-black uppercase tracking-[0.3em] animate-pulse">Syncing Global Trails...</p>
                                        </div>
                                    ) : bookings.length > 0 ? (
                                        <div className="grid grid-cols-1 gap-10">
                                            {bookings.map((booking, index) => (
                                                <div 
                                                    key={booking._id} 
                                                    style={{ animationDelay: `${index * 100}ms` }}
                                                    className="group flex flex-col md:flex-row gap-8 p-10 bg-background/40 backdrop-blur-xl border border-border-custom rounded-[3rem] hover:border-primary/50 transition-all shadow-xl hover:-translate-y-1 duration-500 animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                                                >
                                                     <div className="w-full md:w-48 h-48 shrink-0 overflow-hidden rounded-[2rem] shadow-2xl relative">
                                                         <img src={booking.destinationId?.image || '/hero.jpg'} alt="Trip" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                                         <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                                     </div>
                                                     <div className="flex-1 min-w-0 space-y-4">
                                                         <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2">
                                                             <div className="space-y-1 min-w-0">
                                                                 <div className="inline-flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                                                                      <MapPin size={12} />
                                                                      <span className="truncate">{booking.destinationId?.state}, India</span>
                                                                 </div>
                                                                 <h3 className="text-2xl font-black tracking-tighter uppercase italic leading-tight group-hover:text-primary transition-colors truncate">{booking.destinationId?.name || 'Destination'}</h3>
                                                             </div>
                                                             <div className="flex flex-row sm:flex-col items-center sm:items-end gap-2 shrink-0">
                                                                 <div className="bg-primary/20 border border-primary/30 text-primary text-[10px] font-black italic px-3 py-1.5 rounded-xl uppercase shadow-inner whitespace-nowrap">
                                                                     TRIP-{booking._id.substring(booking._id.length - 6).toUpperCase()}
                                                                 </div>
                                                                 <p className="text-[9px] font-black text-gray-500 uppercase tracking-widest whitespace-nowrap">
                                                                     Booked {new Date(booking.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                                 </p>
                                                             </div>
                                                         </div>
                                                        
                                                        <div className="grid grid-cols-2 md:grid-cols-3 gap-6 py-6 border-y border-border-custom">
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Departure</p>
                                                                <div className="flex items-center gap-2 font-bold text-foreground">
                                                                    <Calendar size={16} className="text-primary" />
                                                                    <span>{new Date(booking.date).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                                                                </div>
                                                            </div>
                                                            <div className="space-y-1">
                                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Expedition Size</p>
                                                                <div className="flex items-center gap-2 font-bold text-foreground">
                                                                    <Users size={16} className="text-primary" />
                                                                    <span>{booking.travelers} Persons</span>
                                                                </div>
                                                            </div>
                                                            <div className="hidden md:block space-y-1">
                                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Status</p>
                                                                <div className="flex items-center gap-2 font-bold text-green-500">
                                                                    <CheckCircle2 size={16} />
                                                                    <span>Confirmed</span>
                                                                </div>
                                                            </div>
                                                        </div>

                                                                                                                 <div className="flex flex-col md:flex-row items-start md:items-center justify-between pt-2 gap-4">
                                                              <p className="text-2xl font-black text-foreground">{formatPrice(booking.destinationId?.price || 0)}</p>
                                                              <div className="flex flex-wrap gap-4">
                                                                <button onClick={() => setReviewModalOpen(reviewModalOpen === booking._id ? null : booking._id)} className="px-8 py-3 bg-primary/10 text-primary border border-primary/20 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all shadow-inner">Review Trip</button>
                                                                <Link href={`/packages/${booking.destinationId?._id}`} className="px-8 py-3 bg-secondary/10 border border-border-custom rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-black hover:border-primary transition-all shadow-inner block text-center">Itinerary</Link>
                                                                <button onClick={() => handleCancelTrip(booking._id)} className="px-8 py-3 text-red-500/50 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all">Cancel Trip</button>
                                                              </div>
                                                         </div>
                                                         
                                                         {/* Review Dropdown UI */}
                                                         {reviewModalOpen === booking._id && (
                                                             <div className="pt-6 border-t border-border-custom mt-6 animate-in slide-in-from-top-4 duration-500 space-y-4">
                                                                 <div className="flex items-center justify-between">
                                                                     <h4 className="text-sm font-black uppercase italic tracking-tighter">Verified Expedition Review</h4>
                                                                     <button onClick={() => setReviewModalOpen(null)} className="text-gray-500 hover:text-white uppercase text-[10px] font-bold tracking-widest">Close</button>
                                                                 </div>
                                                                 
                                                                 <div className="space-y-4 bg-background/50 p-6 rounded-3xl border border-border-custom">
                                                                     <div className="flex items-center gap-4">
                                                                         <span className="text-[10px] uppercase font-black text-gray-500 tracking-[0.3em]">Rating Score</span>
                                                                         <div className="flex gap-2">
                                                                             {[1,2,3,4,5].map(star => (
                                                                                 <button 
                                                                                     key={star} 
                                                                                     onClick={() => setReviewForm({...reviewForm, rating: star})}
                                                                                     className={`text-2xl transition-all ${star <= reviewForm.rating ? 'text-primary drop-shadow-[0_0_8px_rgba(186,220,88,0.8)]' : 'text-gray-600'}`}
                                                                                 >
                                                                                     ★
                                                                                 </button>
                                                                             ))}
                                                                         </div>
                                                                     </div>
                                                                     
                                                                     <textarea 
                                                                         value={reviewForm.text}
                                                                         onChange={(e) => setReviewForm({...reviewForm, text: e.target.value})}
                                                                         placeholder="Describe the adventure, the guides, and your overall experience..."
                                                                         className="w-full bg-background border border-border-custom rounded-2xl p-4 focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none transition-all h-24 font-medium text-sm resize-none"
                                                                     />
                                                                     
                                                                     <button 
                                                                        onClick={() => handleReviewSubmit(booking)}
                                                                        disabled={!reviewForm.text.trim() || isActionLoading}
                                                                        className="w-full py-4 bg-primary text-black font-black uppercase tracking-tighter rounded-xl hover:bg-white transition-all disabled:opacity-50"
                                                                     >
                                                                        {isActionLoading ? 'Broadcasting...' : 'Publish Official Record'}
                                                                     </button>
                                                                 </div>
                                                             </div>
                                                         )}
                                                     </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 text-center gap-8 animate-in zoom-in duration-700">
                                            <div className="w-32 h-32 bg-primary/10 text-primary rounded-[3rem] flex items-center justify-center relative shadow-2xl">
                                                <Briefcase size={64} className="opacity-50" />
                                                <div className="absolute inset-0 bg-primary/10 blur-3xl rounded-full animate-pulse" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-3xl font-black tracking-tighter uppercase italic">No Active Trails</h3>
                                                <p className="text-gray-500 font-medium text-lg max-w-sm mx-auto leading-relaxed">Your traveler's journal is remarkably clean. Let's fix that immediately.</p>
                                            </div>
                                            <button 
                                                onClick={() => router.push('/packages')} 
                                                className="bg-primary hover:bg-primary-dark text-black font-black px-12 py-5 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all transform active:scale-95 uppercase tracking-tighter"
                                            >
                                                Discover Destinations
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'saved' && (
                                <div className="space-y-16 animate-in fade-in duration-700">
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Saved <span className="text-primary tracking-normal not-italic">Destinations</span></h2>
                                        <p className="text-gray-500 font-medium text-lg leading-relaxed">Your curated collection of dream destinations, saved for when the time is right.</p>
                                    </div>

                                    {wishlist.length > 0 ? (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            {wishlist.map((dest, index) => (
                                                <div
                                                    key={dest.id}
                                                    style={{ animationDelay: `${index * 80}ms` }}
                                                    className="group relative bg-background/50 border border-border-custom rounded-[2.5rem] overflow-hidden hover:border-primary/50 hover:-translate-y-1 transition-all duration-500 shadow-xl animate-in fade-in slide-in-from-bottom-8 fill-mode-both"
                                                >
                                                    <div className="relative h-48 overflow-hidden">
                                                        <img
                                                            src={dest.image?.startsWith('http') || dest.image?.startsWith('/') ? dest.image : `/${dest.image}`}
                                                            alt={dest.name}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=600&q=80'; }}
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                                                        <button
                                                            onClick={() => toggleWishlist(dest)}
                                                            className="absolute top-4 right-4 p-2.5 bg-red-500 border border-red-400 rounded-xl text-white hover:bg-red-600 transition-all shadow-lg"
                                                            aria-label="Remove from saved"
                                                        >
                                                            <Heart size={16} className="fill-white" />
                                                        </button>
                                                    </div>
                                                    <div className="p-6 space-y-4">
                                                        <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em]">
                                                            <MapPin size={12} />
                                                            <span>{dest.state}, India</span>
                                                        </div>
                                                        <h3 className="text-xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">{dest.name}</h3>
                                                        <div className="flex items-center justify-between pt-2 border-t border-border-custom">
                                                            <div>
                                                                <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest">Base Fee</p>
                                                                <p className="text-lg font-black italic">₹{dest.price?.toLocaleString()}</p>
                                                            </div>
                                                            <Link href={`/packages/${dest.id}`} className="flex items-center gap-2 bg-primary text-black px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-tighter hover:bg-black hover:text-primary transition-all">
                                                                <span>Explore</span>
                                                                <ArrowRight size={14} />
                                                            </Link>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-32 text-center gap-8 animate-in zoom-in duration-700">
                                            <div className="w-32 h-32 bg-red-500/10 text-red-400 rounded-[3rem] flex items-center justify-center relative shadow-2xl">
                                                <Heart size={64} className="opacity-50" />
                                                <div className="absolute inset-0 bg-red-500/10 blur-3xl rounded-full animate-pulse" />
                                            </div>
                                            <div className="space-y-3">
                                                <h3 className="text-3xl font-black tracking-tighter uppercase italic">No Saved Destinations</h3>
                                                <p className="text-gray-500 font-medium text-lg max-w-sm mx-auto leading-relaxed">Hit the heart icon on any destination card to save it here for later.</p>
                                            </div>
                                            <button onClick={() => router.push('/packages')} className="bg-primary hover:bg-primary-dark text-black font-black px-12 py-5 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all transform active:scale-95 uppercase tracking-tighter">
                                                Browse Destinations
                                            </button>
                                        </div>
                                    )}
                                </div>
                            )}

                            {activeTab === 'security' && (
                                <div className="space-y-16 animate-in fade-in duration-700">
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Security <span className="text-primary tracking-normal not-italic">& Vault</span></h2>
                                        <p className="text-gray-500 font-medium text-lg leading-relaxed">Manage your encrypted access and protocol credentials.</p>
                                    </div>

                                    <form onSubmit={handlePasswordChange} className="max-w-xl space-y-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-3">Current Protocol Password</label>
                                            <div className="relative group">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input 
                                                    type="password"
                                                    required
                                                    value={passwordForm.currentPassword}
                                                    onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                                                    className="w-full bg-background/50 border border-border-custom rounded-2xl py-5 pl-16 pr-6 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-3">New Protocol</label>
                                                <input 
                                                    type="password"
                                                    required
                                                    value={passwordForm.newPassword}
                                                    onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                                                    className="w-full bg-background/50 border border-border-custom rounded-2xl py-5 px-8 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] ml-3">Verify New Protocol</label>
                                                <input 
                                                    type="password"
                                                    required
                                                    value={passwordForm.confirmPassword}
                                                    onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                                                    className="w-full bg-background/50 border border-border-custom rounded-2xl py-5 px-8 focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all font-bold text-lg"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>
                                        <button 
                                            type="submit"
                                            disabled={isActionLoading}
                                            className="w-full md:w-auto bg-primary hover:bg-primary-dark text-black font-black px-12 py-5 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-4 text-xl uppercase tracking-tighter"
                                        >
                                            {isActionLoading ? <Loader2 className="animate-spin" size={24} /> : (
                                                <>
                                                 <span>Commit Changes</span>
                                                 <ChevronRight size={24} />
                                                </>
                                            )}
                                        </button>
                                    </form>
                                    
                                    <div className="p-8 bg-blue-500/5 border border-blue-500/20 rounded-[2.5rem] flex items-start gap-6">
                                         <ShieldCheck className="text-blue-500 shrink-0" size={32} />
                                         <div className="space-y-2">
                                              <h4 className="font-black uppercase tracking-tighter">Security Recommendation</h4>
                                              <p className="text-gray-500 text-sm font-medium leading-relaxed">
                                                  Use a password with at least 12 characters, including numbers and symbols, to ensure your travel data remains isolated and secure.
                                              </p>
                                         </div>
                                    </div>
                                </div>
                            )}

                            {activeTab === 'settings' && (
                                <div className="space-y-16 animate-in fade-in duration-700">
                                    <div className="space-y-4">
                                        <h2 className="text-4xl md:text-5xl font-black tracking-tighter uppercase italic">Danger <span className="text-red-500 tracking-normal not-italic">& Termination</span></h2>
                                        <p className="text-gray-500 font-medium text-lg leading-relaxed">Irreversible account control protocols and finality settings.</p>
                                    </div>

                                    <div className="p-12 border-4 border-red-500/10 bg-red-500/5 rounded-[4rem] flex flex-col items-center text-center space-y-10 group relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full blur-[80px] -mr-32 -mt-32" />
                                        
                                        <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                                            <Trash2 size={48} className="group-hover:rotate-12 transition-transform duration-500" />
                                        </div>
                                        
                                        <div className="space-y-4 max-w-xl">
                                            <h3 className="text-3xl font-black uppercase tracking-tighter">Terminate Permanent Profile</h3>
                                            <p className="text-gray-500 font-medium leading-relaxed">
                                                Deletion will permanently erase all journey history, loyalty statuses, and profile information from the Travaya mainframe. This protocol cannot be reversed once initialized.
                                            </p>
                                        </div>
                                        
                                        <button 
                                            onClick={handleDeleteAccount}
                                            className="px-12 py-5 bg-red-500 text-white font-black rounded-[2rem] hover:bg-red-600 transition-all shadow-2xl shadow-red-500/20 uppercase tracking-tighter text-lg transform hover:-translate-y-1 active:scale-95"
                                        >
                                            Confirm Termination
                                        </button>
                                    </div>
                                    
                                    <div className="flex justify-center pt-8">
                                         <div className="flex items-center gap-4 text-gray-500 font-black uppercase tracking-[0.4em] text-[10px]">
                                              <AlertCircle size={14} className="text-red-500" />
                                              <span>Proceed with extreme caution</span>
                                         </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}
