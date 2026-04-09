import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight, Star, Clock, Heart, ShieldCheck, Flame } from 'lucide-react';
import { API_BASE } from '../config';
import { useAuth } from '../context/AuthContext';

const DestinationCard = ({ 
    id, name, state, price, image, description, 
    duration = "3D/2N", 
    rating = 4.8, 
    isTrending = false, 
    isBestValue = false,
    viewMode = 'grid'
}) => {
    const isList = viewMode === 'list';
    const { toggleWishlist, isWishlisted, user } = useAuth();
    const liked = isWishlisted(id);

    // Normalize Image Source: Handle local assets vs backend uploads
    const normalizedImage = useMemo(() => {
        const fallback = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80";
        if (!image) return fallback;
        if (image.startsWith('http')) return image;
        
        // Known local assets in public folder
        const localAssets = ['jaipur.jpg', 'udaipur.jpg', 'hero.jpg', 'packages-hero.png', 'contact-hero.png'];
        if (localAssets.includes(image)) {
            return `/${image}`;
        }
        
        if (image.startsWith('/')) {
            return image;
        }
        
        // For seed data like "tirupati.jpg" that do not exist locally or on backend, 
        // return the high-quality placeholder to prevent broken image icons.
        return fallback;
    }, [image]);

    const isUnoptimized = useMemo(() => {
        return normalizedImage.includes('localhost') || normalizedImage.includes('127.0.0.1');
    }, [normalizedImage]);

    return (
        <div className={`group bg-card rounded-[2.5rem] border border-border-custom hover:shadow-2xl hover:shadow-primary/10 transition-all duration-500 transform ${isList ? 'flex-row md:flex-row' : 'flex-col hover:-translate-y-3'} flex h-full will-change-transform`}>
            {/* Image Container */}
            <div className={`relative overflow-hidden ${isList ? 'w-full md:w-[400px] shrink-0 h-64 md:h-auto rounded-t-[2.5rem] md:rounded-l-[2.5rem] md:rounded-tr-none' : 'h-72 rounded-t-[2.5rem]'} will-change-contents`}>
                <Image 
                    src={normalizedImage} 
                    alt={name}
                    fill
                    unoptimized={isUnoptimized}
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 group-hover:scale-110 will-change-transform"
                />
                
                {/* Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent group-hover:from-primary/40 transition-colors duration-500" />
                
                {/* Badges Stack */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {isTrending && (
                        <div className="backdrop-blur-md bg-primary/90 text-black font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 animate-in slide-in-from-left-4 duration-300">
                            <Flame size={12} fill="currentColor" />
                            <span>Trending</span>
                        </div>
                    )}
                    {isBestValue && (
                        <div className="backdrop-blur-md bg-green-500/90 text-white font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-2xl flex items-center gap-2 animate-in slide-in-from-left-4 duration-300">
                             <ShieldCheck size={12} />
                             <span>Best Value</span>
                        </div>
                    )}
                </div>

                {/* Wishlist Button */}
                <button
                    onClick={(e) => {
                        e.preventDefault();
                        if (!user) { window.location.href = '/login'; return; }
                        toggleWishlist({ id, name, state, price, image });
                    }}
                    className={`absolute top-6 right-6 p-3 backdrop-blur-md border rounded-2xl transition-all transform duration-300 ${
                        liked
                            ? 'bg-red-500 border-red-500 text-white scale-110 opacity-100'
                            : 'bg-white/10 border-white/20 text-white opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 hover:bg-red-500 hover:border-red-500'
                    }`}
                    aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                    <Heart size={18} className={liked ? 'fill-white' : ''} />
                </button>
            </div>

            {/* Content Container */}
            <div className={`p-8 flex-1 flex flex-col ${isList ? 'justify-between' : ''}`}>
                <div className="space-y-4">
                    <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-primary text-[10px] font-black uppercase tracking-[0.3em] animate-in fade-in duration-500">
                            <MapPin size={14} className="shrink-0" />
                            <span>{state}, India</span>
                        </div>
                        <div className="flex items-center gap-1.5 bg-yellow-500/10 text-yellow-500 px-3 py-1 rounded-lg text-xs font-black">
                            <Star size={12} className="fill-yellow-500" />
                            <span>{rating}</span>
                        </div>
                    </div>

                    <h3 className={`font-black group-hover:text-primary transition-colors tracking-tighter leading-tight uppercase italic ${isList ? 'text-4xl' : 'text-2xl'} duration-300`}>
                        {name}
                    </h3>
                    
                    <p className={`text-gray-500 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity ${isList ? 'text-lg line-clamp-3' : 'text-sm line-clamp-2'} duration-300`}>
                        {description || "Experience the magical blend of heritage, nature, and adventure in this curated destination."}
                    </p>
                </div>

                <div className={`flex items-center flex-wrap gap-4 mt-8 pt-6 border-t border-border-custom ${isList ? 'justify-between' : 'justify-between'}`}>
                    <div className="space-y-1">
                        <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Base Fee</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-2xl font-black italic tracking-tighter">₹{price.toLocaleString()}</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">/ pp</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 text-gray-400">
                        <div className="flex items-center gap-2 px-4 py-2 bg-background border border-border-custom rounded-xl transition-colors duration-300">
                            <Clock size={16} className="text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-tighter">{duration}</span>
                        </div>
                        
                        <Link 
                            href={`/packages/${id}`}
                            className="flex items-center gap-3 bg-primary hover:bg-black hover:text-primary text-black px-6 py-3 rounded-2xl font-black uppercase tracking-tighter text-[10px] transition-all group/link shadow-xl shadow-primary/10 duration-300"
                        >
                            <span>Initialize</span>
                            <ArrowRight size={16} className="transition-transform group-hover/link:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default React.memo(DestinationCard);
