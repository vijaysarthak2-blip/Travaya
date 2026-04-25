"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Plane, Sparkles, TrendingUp } from 'lucide-react';
import { API_BASE } from '../config';
import DestinationCard from '../components/DestinationCard';

import { useRouter } from 'next/navigation';

export default function Home() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const router = useRouter();

    useEffect(() => {
        const fetchPopular = async () => {
            try {
                const res = await fetch(`${API_BASE}/destinations`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setDestinations(data.slice(0, 4));
            } catch (err) {
                console.error("Error fetching destinations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPopular();
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            {/* Hero Section */}
            <section className="relative h-screen flex items-center justify-center overflow-hidden">
                {/* Background Image with Parallax & Overlay */}
                <div className="absolute inset-0 z-0">
                    <img
                        src="/hero.jpg"
                        alt="Hero Background"
                        className="w-full h-full object-cover animate-hero-zoom"
                    />
                    {/* Dark overlay for text readability */}
                    <div className="absolute inset-0 bg-gradient-to-b from-black/65 via-black/20 to-transparent" />
                    {/* Bottom fade to page background */}
                    <div className="absolute inset-0 bg-gradient-to-t from-background/60 via-background/15 to-transparent" />
                </div>

                {/* Hero Content */}
                <div className="relative z-10 w-full max-w-4xl px-4 sm:px-6 text-center space-y-4 sm:space-y-8">
                    <div className="space-y-3 sm:space-y-4">
                        {/* Badge */}
                        <div className="hidden sm:inline-flex animate-hero-badge items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                            <Plane size={12} />
                            <span>Your Journey Begins Here</span>
                        </div>
                        {/* Headline */}
                        <h1 className="animate-hero-title text-3xl md:text-5xl lg:text-7xl font-bold text-white tracking-tighter">
                            Discover Your Next <br />
                            <span className="text-primary italic">Great Adventure</span>
                        </h1>
                        {/* Subtitle */}
                        <p className="animate-hero-subtitle hidden sm:block text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                            Explore breathtaking destinations across India.
                            From pristine beaches to majestic mountains, find the perfect escape.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="animate-hero-search max-w-2xl mx-auto p-1.5 sm:p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-2 sm:gap-3 px-3 sm:px-4">
                            <MapPin className="text-primary" size={18} />
                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') router.push(`/packages${searchTerm ? '?search=' + encodeURIComponent(searchTerm) : ''}`)
                                }}
                                className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:outline-none focus:ring-0 outline-none text-sm md:text-base"
                            />
                        </div>
                        <button 
                            onClick={() => router.push(`/packages${searchTerm ? '?search=' + encodeURIComponent(searchTerm) : ''}`)}
                            className="bg-primary hover:bg-primary-dark text-black font-bold p-2.5 sm:px-8 sm:py-3 rounded-xl transition-all shadow-lg flex items-center justify-center gap-2 hover:scale-105 active:scale-95"
                        >
                            <Search size={16} />
                            <span className="hidden sm:inline">Explore</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="pt-6 sm:pt-10 pb-10 sm:pb-20 px-3 sm:px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-6 mb-5 sm:mb-12">
                    <div className="space-y-1 sm:space-y-2">
                        <div className="hidden sm:flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                            <TrendingUp size={14} />
                            <span>Popular Choice</span>
                        </div>
                        <h2 className="text-xl sm:text-2xl md:text-4xl font-bold">Recommended for You</h2>
                        <p className="text-gray-500 text-sm max-w-md hidden sm:block">
                            Handpicked destinations that travelers love the most this season.
                        </p>
                    </div>
                    <Link href="/packages" className="text-primary font-bold flex items-center gap-2 group hover:underline underline-offset-4 text-sm">
                        View all Packages
                        <Sparkles size={14} className="transition-transform group-hover:rotate-12" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[320px] sm:h-[400px] rounded-2xl bg-border-custom animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8">
                        {destinations.map(dest => (
                            <DestinationCard
                                key={dest._id}
                                id={dest._id}
                                name={dest.name}
                                state={dest.state}
                                price={dest.price}
                                image={dest.image}
                                description={dest.description}
                            />
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

import Link from 'next/link';
