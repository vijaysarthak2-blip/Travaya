"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import dynamic from 'next/dynamic';
import { 
  Calendar, MapPin, Clock, Users, ArrowLeft, 
  CheckCircle2, Info, Star, ShieldCheck, 
  Map as MapIcon, Loader2, Sparkles, Compass, 
  ChevronRight, ArrowRight, Share2, Heart
} from 'lucide-react';
import { API_BASE } from '../../../config';
import { useAuth } from '../../../context/AuthContext';
import { useCurrency } from '../../../context/CurrencyContext';

const DynamicMap = dynamic(() => import('../../../components/MapComponent'), {
    ssr: false,
    loading: () => (
        <div className="h-[450px] w-full rounded-[3rem] bg-card border border-border-custom border-dashed flex flex-col items-center justify-center gap-4">
             <Loader2 className="animate-spin text-primary" size={32} />
             <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-500">Initializing GPS Network...</p>
        </div>
    )
});

export default function PackageDetailsClient({ initialDestination, initialItinerary }) {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const { formatPrice } = useCurrency();
    
    const [destination, setDestination] = useState(initialDestination);
    const [itinerary, setItinerary] = useState(initialItinerary);
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(!initialDestination);
    const [error, setError] = useState(null);

    // Robust Normalize Image Source
    const normalizedImage = useMemo(() => {
        const img = destination?.image || initialDestination?.image;
        if (!img) return "/hero.jpg";
        if (img.startsWith('http')) return img;
        
        // Known local assets in public folder
        const localAssets = ['jaipur.jpg', 'udaipur.jpg', 'hero.jpg', 'packages-hero.png', 'contact-hero.png'];
        if (localAssets.includes(img) || img.startsWith('/')) {
            return img.startsWith('/') ? img : `/${img}`;
        }
        
        // Backend uploads (ensure no double slashes)
        const baseUrl = API_BASE.replace(/\/$/, '');
        const path = img.startsWith('/') ? img : `/${img}`;
        return `${baseUrl}${path}`;
    }, [destination, initialDestination]);

    const isUnoptimized = useMemo(() => {
        return normalizedImage.includes('localhost') || normalizedImage.includes('127.0.0.1');
    }, [normalizedImage]);

    useEffect(() => {
        if (!initialDestination) {
            const fetchData = async () => {
                try {
                    const destRes = await fetch(`${API_BASE}/destinations/${id}`);
                    if (!destRes.ok) throw new Error("Destination not found");
                    const destData = await destRes.json();
                    setDestination(destData);

                    const itinRes = await fetch(`${API_BASE}/api/destinations/${id}/itinerary`);
                    if (itinRes.ok) {
                        const itinData = await itinRes.json();
                        setItinerary(itinData);
                    }

                    const revRes = await fetch(`${API_BASE}/api/destinations/${id}/reviews`);
                    if (revRes.ok) {
                        const revData = await revRes.json();
                        setReviews(revData);
                    }
                } catch (err) {
                    setError(err.message);
                } finally {
                    setLoading(false);
                }
            };
            if (id) fetchData();
        }
    }, [id, initialDestination]);

    const handleBooking = () => {
        if (!user) {
            router.push(`/login?redirect=/packages/${id}`);
        } else {
            router.push(`/booking?id=${id}`);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <div className="relative">
                     <Loader2 className="animate-spin text-primary" size={64} />
                     <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full" />
                </div>
            </div>
        );
    }

    if (error || !destination) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center space-y-10">
                <div className="w-24 h-24 bg-red-500/10 text-red-500 rounded-[2.5rem] flex items-center justify-center shadow-inner">
                    <Info size={48} />
                </div>
                <div className="space-y-4">
                    <h1 className="text-4xl font-black uppercase tracking-tighter italic">Oops! <span className="text-red-500">{error}</span></h1>
                    <p className="text-gray-500 font-medium max-w-sm mx-auto">It seems the trail ended unexpectedly. Let's get you back on track.</p>
                </div>
                <button 
                    onClick={() => router.push('/packages')}
                    className="flex items-center gap-3 bg-primary text-black px-8 py-4 rounded-2xl font-black uppercase tracking-tighter shadow-xl hover:-translate-y-1 transition-all"
                >
                    <ArrowLeft size={20} />
                    Back to Journeys
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pb-32">
            {/* Cinematic Hero Gallery */}
            <div className="relative h-[70vh] w-full overflow-hidden bg-black">
                <Image 
                    src={normalizedImage} 
                    alt={destination.name} 
                    fill
                    priority
                    unoptimized={isUnoptimized}
                    className="object-cover opacity-70 animate-in zoom-in duration-[10000ms]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-transparent" />
                
                {/* Visual Enhancers */}
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
                
                {/* Floating Navigation Controls */}
                <div className="absolute top-24 left-6 md:left-12 right-6 md:right-12 z-20 flex justify-between items-center animate-in slide-in-from-top-10 duration-1000">
                    <button 
                        onClick={() => router.back()}
                        className="p-4 bg-background/20 backdrop-blur-xl border border-white/10 rounded-[1.5rem] text-white hover:bg-primary hover:text-black transition-all shadow-2xl group"
                    >
                        <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                    </button>
                    <div className="flex gap-4">
                        <button className="p-4 bg-background/20 backdrop-blur-xl border border-white/10 rounded-[1.5rem] text-white hover:bg-white hover:text-black transition-all shadow-2xl">
                            <Share2 size={24} />
                        </button>
                        <button className="p-4 bg-background/20 backdrop-blur-xl border border-white/10 rounded-[1.5rem] text-white hover:bg-red-500 hover:border-red-500 transition-all shadow-2xl">
                            <Heart size={24} />
                        </button>
                    </div>
                </div>

                {/* Main Content Overlay */}
                <div className="absolute bottom-16 left-6 md:left-12 right-6 md:right-12 z-10 space-y-6 max-w-4xl animate-in slide-in-from-bottom-12 duration-1000">
                    <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl">
                        <Sparkles size={14} />
                        <span>Featured {destination.category || 'Package'}</span>
                    </div>
                    <div className="space-y-4">
                         <div className="flex items-center gap-3 text-white/70 font-black uppercase tracking-[0.4em] text-xs">
                             <MapPin size={16} className="text-primary" />
                             <span>{destination.state}, Northern India</span>
                         </div>
                         <h1 className="text-4xl md:text-6xl lg:text-8xl font-black text-white tracking-tighter leading-none italic uppercase">
                             {destination.name}
                         </h1>
                    </div>
                </div>
            </div>

            {/* Immersive Details Grid */}
            <div className="max-w-7xl mx-auto px-6 -mt-12 relative z-30">
                <div className="flex flex-col lg:flex-row gap-12">
                    
                    {/* Left: Narrative & Discovery */}
                    <div className="lg:w-7/12 xl:w-8/12 space-y-12">
                        
                        {/* Luxury Metadata Bar */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3 md:p-4 bg-card/60 backdrop-blur-3xl border border-border-custom rounded-2xl md:rounded-[2.5rem] shadow-2xl animate-in fade-in zoom-in duration-1000">
                            {[
                                { icon: Clock, label: "Duration", val: "3D/2N", color: "text-primary" },
                                { icon: Star, label: "Rating", val: "4.9 · 120", color: "text-secondary" },
                                { icon: Users, label: "Expedition", val: "12 Max", color: "text-blue-500" },
                                { icon: ShieldCheck, label: "Safety", val: "Gold Std", color: "text-green-500" }
                            ].map((stat, i) => (
                                <div key={stat.label} className="flex flex-col items-center justify-center p-4 md:p-6 bg-background/40 rounded-xl md:rounded-[2rem] border border-border-custom text-center space-y-1.5">
                                    <div className={`p-3 rounded-2xl bg-white/5 ${stat.color}`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <div className="space-y-0.5">
                                        <p className="text-[8px] font-black uppercase tracking-[0.2em] text-gray-500">{stat.label}</p>
                                        <p className="text-sm font-black whitespace-nowrap">{stat.val}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Narrative Overview */}
                        <section className="p-10 md:p-14 bg-card/40 backdrop-blur-xl border border-border-custom rounded-[3rem] space-y-10 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-200">
                             <div className="space-y-4">
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic">Deep <span className="text-primary tracking-normal not-italic">& Overview</span></h2>
                                <p className="text-gray-400 text-lg leading-relaxed font-medium">
                                    {destination.description}
                                </p>
                             </div>

                             <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-border-custom">
                                {[
                                    "Expert Expedition Guides",
                                    "Hand-picked Accommodations",
                                    "Luxury Private Transfers",
                                    "Traditional Gastronomy Trials",
                                    "All Hidden Entry Protocols",
                                    "24/7 Adventure Support"
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-4 group">
                                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
                                            <CheckCircle2 size={18} />
                                        </div>
                                        <span className="text-sm font-black uppercase tracking-tight text-gray-500 group-hover:text-foreground transition-colors">{item}</span>
                                    </div>
                                ))}
                             </div>
                        </section>

                        {/* Modern Journey Timeline */}
                        {itinerary && itinerary.days && itinerary.days.length > 0 && (
                            <section className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-400">
                                <div className="space-y-2">
                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                                        <Compass className="text-primary" size={32} />
                                        <span>Journey <span className="text-primary tracking-normal not-italic">Ledger</span></span>
                                    </h2>
                                    <p className="text-gray-500 font-medium ml-12 uppercase tracking-widest text-[10px]">Step-by-step expedition protocol</p>
                                </div>

                                <div className="relative space-y-8 pl-6 sm:pl-0 sm:ml-6 sm:border-l-2 sm:border-dashed sm:border-border-custom sm:pl-12">
                                    {itinerary.days.map((day, index) => (
                                        <div key={index} className="relative group">
                                            {/* Node — absolutely positioned left on sm+ */}
                                            <div className="hidden sm:flex absolute -left-[64px] top-6 w-12 h-12 rounded-3xl bg-card border-4 border-background items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                                                 <div className="absolute inset-0 bg-primary/20 rounded-full blur animate-pulse" />
                                                 <span className="relative z-10 font-black text-primary text-xs italic">D{day.day}</span>
                                            </div>
                                            {/* Mobile inline day badge */}
                                            <div className="sm:hidden flex items-center gap-2 mb-3">
                                                <span className="inline-flex items-center px-3 py-1 rounded-full bg-primary/15 text-primary font-black text-xs italic">Day {day.day}</span>
                                            </div>
                                            
                                            <div className="p-6 md:p-12 bg-card/30 backdrop-blur-xl border border-border-custom rounded-2xl md:rounded-[3rem] hover:border-primary/30 transition-all shadow-xl space-y-4 md:space-y-6 group/item overflow-hidden relative">
                                                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl -mr-16 -mt-16 group-hover/item:bg-primary/10 transition-colors" />
                                                
                                                <div className="space-y-1 relative z-10">
                                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-primary italic">Protocol Stage {index + 1}</p>
                                                    <h3 className="text-xl md:text-3xl font-black tracking-tighter uppercase italic">{day.title}</h3>
                                                </div>
                                                <p className="text-gray-500 leading-relaxed font-medium relative z-10 group-hover/item:text-foreground transition-colors">
                                                    {day.description}
                                                </p>
                                                
                                                <div className="pt-4 flex gap-3 relative z-10 flex-wrap">
                                                     <div className="px-4 py-2 bg-background border border-border-custom rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500">Morning Trials</div>
                                                     <div className="px-4 py-2 bg-background border border-border-custom rounded-xl text-[9px] font-black uppercase tracking-widest text-gray-500">Afternoon Discovery</div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}

                        {/* Interactive GPS Map Segment */}
                        <section className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-500 pt-8">
                            <div className="space-y-2">
                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                                    <MapPin className="text-primary" size={32} />
                                    <span>Geographic <span className="text-primary tracking-normal not-italic">Intel</span></span>
                                </h2>
                                <p className="text-gray-500 font-medium ml-12 uppercase tracking-widest text-[10px]">Real-time interactive satellite overlay</p>
                            </div>
                            
                            <DynamicMap stateName={destination.state} name={destination.name} />
                        </section>

                        {/* Reviews System */}
                        {reviews && reviews.length > 0 && (
                            <section className="space-y-12 animate-in fade-in slide-in-from-bottom-10 duration-1000 delay-700 pt-8 border-t border-border-custom">
                                <div className="space-y-2">
                                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter italic flex items-center gap-4">
                                        <Star className="text-primary" size={32} />
                                        <span>Verified <span className="text-primary tracking-normal not-italic">Records</span></span>
                                    </h2>
                                    <p className="text-gray-500 font-medium ml-12 uppercase tracking-widest text-[10px]">Authenticated traveler journals</p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    {reviews.map(review => (
                                        <div key={review._id} className="bg-card/30 backdrop-blur-xl border border-border-custom p-8 rounded-[3rem] shadow-xl hover:border-primary/30 transition-all space-y-6">
                                            <div className="flex justify-between items-start">
                                                <div className="space-y-1">
                                                    <h4 className="font-black uppercase tracking-tighter text-lg">{review.userId?.fullName || 'Anonymous Voyager'}</h4>
                                                    <p className="text-[10px] text-gray-500 uppercase tracking-[0.2em]">{new Date(review.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div className="flex items-center gap-1 bg-background px-3 py-1.5 rounded-full border border-border-custom shadow-inner">
                                                    <Star size={12} className="text-primary fill-primary" />
                                                    <span className="text-xs font-black">{review.rating}.0</span>
                                                </div>
                                            </div>
                                            <p className="text-gray-400 font-medium leading-relaxed italic">"{review.reviewText}"</p>
                                        </div>
                                    ))}
                                </div>
                            </section>
                        )}
                    </div>

                    {/* Right: The Boarding Pass Sidebar */}
                    <aside className="lg:w-5/12 xl:w-4/12 animate-in slide-in-from-right-12 duration-1000 min-w-0 overflow-hidden">
                        <div className="sticky top-32 space-y-8">
                            
                            {/* The "Booking Voucher" */}
                            <div className="bg-card/70 backdrop-blur-3xl border border-border-custom rounded-[4rem] shadow-2xl relative overflow-hidden group">
                                {/* Voucher Decorative Patterns */}
                                <div className="absolute inset-x-0 bottom-32 border-t-4 border-dashed border-background/50 z-20" />
                                <div className="absolute left-0 bottom-32 -ml-6 w-12 h-12 bg-background rounded-full border-4 border-border-custom z-30" />
                                <div className="absolute right-0 bottom-32 -mr-6 w-12 h-12 bg-background rounded-full border-4 border-border-custom z-30" />
                                
                                <div className="p-10 md:p-14 space-y-10">
                                    <div className="space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-primary uppercase tracking-[0.4em]">Protocol Value</p>
                                                <h4 className="text-sm font-black uppercase tracking-tight italic">Secure Your Spot</h4>
                                            </div>
                                            <Compass className="text-primary animate-spin-slow" size={32} />
                                        </div>
                                        
                                        <div className="space-y-1">
                                            <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Total Expedition Fee</p>
                                            <div className="flex flex-col gap-1">
                                                <span className="text-4xl md:text-6xl font-black italic tracking-tighter leading-tight">{formatPrice(destination.price)}</span>
                                                <span className="text-gray-500 font-bold uppercase text-[10px] tracking-widest ml-1">/ Per Head</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-6 pt-10">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-[0.3em] ml-3">Expedition Launch Date</label>
                                            <button onClick={handleBooking} className="w-full flex items-center justify-between p-6 bg-background/50 border border-border-custom rounded-3xl hover:border-primary/50 transition-all group/date">
                                                <div className="flex items-center gap-4">
                                                    <Calendar className="text-primary" size={20} />
                                                    <span className="text-sm font-black uppercase tracking-tighter">Manifest a Date</span>
                                                </div>
                                                <ChevronRight size={20} className="text-gray-400 group-hover/date:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                        
                                        <button 
                                            onClick={handleBooking}
                                            className="w-full bg-primary hover:bg-black hover:text-primary text-black font-black py-6 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-4 text-xl uppercase tracking-tighter transform active:scale-95 group/btn"
                                        >
                                            <span>{user ? "Confirm Journey" : "Initialize Login"}</span>
                                            <ArrowRight size={24} className="group-hover/btn:translate-x-2 transition-transform" />
                                        </button>

                                        <div className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-500 bg-background/30 py-3 rounded-2xl border border-border-custom">
                                            <ShieldCheck size={14} className="text-primary" />
                                            <span>Zero Advance Protocols Required</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Lower Stub Section */}
                                <div className="p-10 pt-16 mt-4 flex flex-col items-center text-center gap-4">
                                     <div className="w-full h-12 flex justify-center gap-2 overflow-hidden opacity-20 group-hover:opacity-40 transition-opacity">
                                         {[...Array(24)].map((_, i) => (
                                             <div key={i} className={`w-1 h-full bg-foreground rounded-full ${i % 3 === 0 ? 'h-8 mt-2' : ''}`} />
                                         ))}
                                     </div>
                                     <p className="text-[8px] font-black uppercase tracking-[0.5em] text-gray-500">TRAVAYA-AUTH-VERIFIED-JOURNEY</p>
                                </div>
                            </div>

                            {/* Trust Markers */}
                            <div className="p-8 bg-card border border-border-custom rounded-[2.5rem] shadow-xl space-y-6">
                                <h4 className="font-black uppercase tracking-tighter text-sm italic">Expedition <span className="text-primary tracking-normal not-italic">Assurance</span></h4>
                                <div className="space-y-4">
                                    {[
                                        { icon: ShieldCheck, text: "Unmatched Value Guarantee" },
                                        { icon: Clock, text: "24/7 Field Support Network" },
                                        { icon: Users, text: "Certified Group Manifests" }
                                    ].map((item, i) => (
                                        <div key={i} className="flex items-center gap-4 text-xs text-gray-400 font-black uppercase tracking-tight">
                                            <item.icon size={18} className="text-primary" />
                                            <span>{item.text}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
}
