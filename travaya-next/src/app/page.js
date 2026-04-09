"use client";

import React, { useState, useEffect } from 'react';
import { Search, MapPin, Plane, Sparkles, TrendingUp } from 'lucide-react';
import { API_BASE } from '../config';
import DestinationCard from '../components/DestinationCard';

export default function Home() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);

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
                <div className="relative z-10 w-full max-w-4xl px-6 text-center space-y-8">
                    <div className="space-y-4">
                        {/* Badge */}
                        <div className="animate-hero-badge inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-bold uppercase tracking-widest backdrop-blur-sm">
                            <Plane size={14} />
                            <span>Your Journey Begins Here</span>
                        </div>
                        {/* Headline */}
                        <h1 className="animate-hero-title text-5xl md:text-7xl font-bold text-white tracking-tighter">
                            Discover Your Next <br />
                            <span className="text-primary italic">Great Adventure</span>
                        </h1>
                        {/* Subtitle */}
                        <p className="animate-hero-subtitle text-lg md:text-xl text-gray-200 max-w-2xl mx-auto font-light leading-relaxed">
                            Explore breathtaking destinations across India.
                            From pristine beaches to majestic mountains, find the perfect escape.
                        </p>
                    </div>

                    {/* Search Bar */}
                    <div className="animate-hero-search max-w-2xl mx-auto p-2 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl shadow-2xl flex items-center gap-2">
                        <div className="flex-1 flex items-center gap-3 px-4">
                            <MapPin className="text-primary" size={20} />
                            <input
                                type="text"
                                placeholder="Where do you want to go?"
                                className="w-full bg-transparent border-none text-white placeholder-gray-400 focus:ring-0 text-sm md:text-base"
                            />
                        </div>
                        <button className="bg-primary hover:bg-primary-dark text-black font-bold px-8 py-3 rounded-xl transition-all shadow-lg flex items-center gap-2 hover:scale-105 active:scale-95">
                            <Search size={18} />
                            <span className="hidden sm:inline">Explore</span>
                        </button>
                    </div>
                </div>
            </section>

            {/* Popular Destinations */}
            <section className="pt-10 pb-20 px-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-primary font-bold text-sm uppercase tracking-widest">
                            <TrendingUp size={16} />
                            <span>Popular Choice</span>
                        </div>
                        <h2 className="text-4xl font-bold">Recommended for You</h2>
                        <p className="text-gray-500 max-w-md">
                            Handpicked destinations that travelers love the most this season.
                        </p>
                    </div>
                    <Link href="/packages" className="text-primary font-bold flex items-center gap-2 group hover:underline underline-offset-4">
                        View all Packages
                        <Sparkles size={16} className="transition-transform group-hover:rotate-12" />
                    </Link>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="h-[400px] rounded-2xl bg-border-custom animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
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
