import React, { useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MapPin, ArrowRight, Star, Clock, Heart, ShieldCheck, Flame } from 'lucide-react';
import { API_BASE } from '../config';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';

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
    const { formatPrice } = useCurrency();
    const liked = isWishlisted(id);

    // Curated fallback images mapped by destination name - using authentic city/landmark photography
    const DESTINATION_IMAGES = {
        'jaipur': 'https://images.unsplash.com/photo-1477587458883-47145ed68045?w=600&q=75',
        'udaipur': 'https://images.unsplash.com/photo-1599661046289-e31897846e41?w=600&q=75',
        'mumbai': 'https://images.unsplash.com/photo-1522067448833-87a419409f92?w=600&q=75',
        'bangalore': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=75',
        'bengaluru': 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?w=600&q=75',
        'manali': 'https://images.unsplash.com/photo-1605649487212-4d4ce7bb8b42?w=600&q=75',
        'goa': 'https://images.unsplash.com/photo-1512343879784-a957bd828ec5?w=600&q=75',
        'panaji': 'https://images.unsplash.com/photo-1512343879784-a957bd828ec5?w=600&q=75',
        'kerala': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=75',
        'alleppey': 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?w=600&q=75',
        'munnar': 'https://images.unsplash.com/photo-1593693397690-362cb9666fc2?w=600&q=75',
        'varanasi': 'https://images.unsplash.com/photo-1561359313-0639aad3ecce?w=600&q=75',
        'agra': 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=600&q=75',
        'mysore': 'https://images.unsplash.com/photo-1600100397608-f010f41beb1cd?w=600&q=75',
        'mysuru': 'https://images.unsplash.com/photo-1600100397608-f010f41beb1cd?w=600&q=75',
        'amritsar': 'https://images.unsplash.com/photo-1514222026857-e92ed25d97f2?w=600&q=75',
        'tirupati': 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?w=600&q=75',
        'bodh gaya': 'https://images.unsplash.com/photo-1590623267568-7c87c4273391?w=600&q=75',
        'khajuraho': 'https://images.unsplash.com/photo-1621815132646-7c6d669c2773?w=600&q=75',
        'hampi': 'https://images.unsplash.com/photo-1600182610361-4b4d664e79dd?w=600&q=75',
        'kaziranga': 'https://images.unsplash.com/photo-1632766324269-8084aeb65c69?w=600&q=75',
        'kutch': 'https://images.unsplash.com/photo-1589410940428-115f22e7de11?w=600&q=75',
        'shimla': 'https://images.unsplash.com/photo-1597006819268-4b68c7d6b82f?w=600&q=75',
        'darjeeling': 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=75',
        'leh': 'https://images.unsplash.com/photo-1626015366386-acca87a74b53?w=600&q=75',
        'ladakh': 'https://images.unsplash.com/photo-1626015366386-acca87a74b53?w=600&q=75',
        'tawang': 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?w=600&q=75',
        'spiti': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=75',
        'visakhapatnam': 'https://images.unsplash.com/photo-1605663738466-9b0dabc1b0c6?w=600&q=75',
        'guwahati': 'https://images.unsplash.com/photo-1590050853504-20ce6b12a83c?w=600&q=75',
        'patna': 'https://images.unsplash.com/photo-1624635848206-a83d47f9c2d1?w=600&q=75',
        'raipur': 'https://images.unsplash.com/photo-1608755030283-9b90956b68ba?w=600&q=75',
        'lonavala': 'https://images.unsplash.com/photo-1575448324424-7ed5fdfb5f90?w=600&q=75',
        'bhopal': 'https://images.unsplash.com/photo-1591873322108-769a6eb1eb2b?w=600&q=75',
        'ranchi': 'https://images.unsplash.com/photo-1621217643501-7b003c004246?w=600&q=75',
        'gurgaon': 'https://images.unsplash.com/photo-1574513681422-0a1eb1808603?w=600&q=75',
        'ahmedabad': 'https://images.unsplash.com/photo-1600078686884-23e595dfda13?w=600&q=75',
        'rishikesh': 'https://images.unsplash.com/photo-1585128792020-803d29415281?w=600&q=75',
        'ooty': 'https://images.unsplash.com/photo-1609066861859-0fc70a24a2d6?w=600&q=75',
        'coorg': 'https://images.unsplash.com/photo-1592364395653-83e648b20cc2?w=600&q=75',
        'andaman': 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=75',
        'mussoorie': 'https://images.unsplash.com/photo-1608831609427-95d2b0eddaab?w=600&q=75',
    };

    // Normalize Image Source
    const normalizedImage = useMemo(() => {
        // Ultimate fallback picture reflecting heritage instead of a random mountain
        const fallback = "https://images.unsplash.com/photo-1524492412937-b28074a5d7da?w=800&q=80";
        if (!image && !name) return fallback;

        // First: check by destination name (most reliable for seeded data on ephemeral servers)
        const nameLower = (name || '').toLowerCase().trim();
        const nameMatch = Object.keys(DESTINATION_IMAGES).find(k => nameLower.includes(k));
        if (nameMatch) return DESTINATION_IMAGES[nameMatch];

        if (!image) return fallback;
        if (image.startsWith('http')) return image;

        // Local public assets
        const localAssets = ['jaipur.jpg', 'udaipur.jpg', 'hero.jpg', 'packages-hero.png', 'contact-hero.png'];
        if (localAssets.includes(image)) return `/${image}`;
        if (image.startsWith('/') && !image.startsWith('/uploads')) return image;

        // Backend upload via API_BASE
        const baseUrl = API_BASE.replace(/\/$/, '');
        const path = image.startsWith('/') ? image : `/uploads/${image}`;
        return `${baseUrl}${path}`;
    }, [image, name]);

    return (
        <div className={`group bg-card rounded-2xl md:rounded-[2.5rem] border border-border-custom hover:shadow-2xl hover:shadow-primary/10 transition-all duration-400 transform ${isList ? 'flex-row md:flex-row' : 'flex-col hover:-translate-y-3'} flex h-full will-change-[transform,opacity]`}>
            {/* Image Container */}
            <div className={`relative overflow-hidden ${isList ? 'w-full md:w-[400px] shrink-0 h-48 md:h-auto rounded-t-2xl md:rounded-l-[2.5rem] md:rounded-tr-none' : 'h-52 md:h-72 rounded-t-2xl md:rounded-t-[2.5rem]'} will-change-contents`}>
                <Image 
                    src={normalizedImage} 
                    alt={name}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 95vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-110 will-change-[transform,opacity]"
                />
                
                {/* Overlays */}
                <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/80 to-transparent group-hover:from-primary/40 transition-colors duration-300" />
                
                {/* Badges Stack */}
                <div className="absolute top-6 left-6 flex flex-col gap-2">
                    {isTrending && (
                        <div className="backdrop-blur-md bg-primary/90 text-black font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-md flex items-center gap-2 animate-in slide-in-from-left-4 duration-300">
                            <Flame size={12} fill="currentColor" />
                            <span>Trending</span>
                        </div>
                    )}
                    {isBestValue && (
                        <div className="backdrop-blur-md bg-green-500/90 text-white font-black px-4 py-1.5 rounded-xl text-[10px] uppercase tracking-[0.2em] shadow-md flex items-center gap-2 animate-in slide-in-from-left-4 duration-300">
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
                    className={`absolute top-3 right-3 md:top-6 md:right-6 p-2.5 md:p-3 backdrop-blur-md border rounded-xl md:rounded-2xl transition-all transform duration-300 ${
                        liked
                            ? 'bg-red-500 border-red-500 text-white scale-110 opacity-100'
                            : 'bg-white/10 border-white/20 text-white opacity-60 md:opacity-0 group-hover:opacity-100 md:translate-y-4 group-hover:translate-y-0 hover:bg-red-500 hover:border-red-500'
                    }`}
                    aria-label={liked ? 'Remove from wishlist' : 'Save to wishlist'}
                >
                    <Heart size={18} className={liked ? 'fill-white' : ''} />
                </button>
            </div>

            {/* Content Container */}
            <div className={`p-4 md:p-8 flex-1 flex flex-col ${isList ? 'justify-between' : ''}`}>
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

                    <h3 className={`font-black group-hover:text-primary transition-colors tracking-tighter leading-tight uppercase italic ${isList ? 'text-2xl md:text-4xl' : 'text-lg md:text-2xl'} duration-300`}>
                        {name}
                    </h3>
                    
                    <p className={`text-gray-500 leading-relaxed font-medium opacity-80 group-hover:opacity-100 transition-opacity ${isList ? 'text-base md:text-lg line-clamp-3' : 'text-xs md:text-sm line-clamp-2'} duration-300`}>
                        {description || "Experience the magical blend of heritage, nature, and adventure in this curated destination."}
                    </p>
                </div>

                <div className={`flex items-center flex-wrap gap-2 md:gap-4 mt-4 md:mt-8 pt-4 md:pt-6 border-t border-border-custom ${isList ? 'justify-between' : 'justify-between'}`}>
                    <div className="space-y-0.5">
                        <p className="text-[9px] md:text-[10px] font-black text-gray-500 uppercase tracking-widest">Base Fee</p>
                        <div className="flex items-baseline gap-1">
                            <span className="text-lg md:text-2xl font-black italic tracking-tighter">{formatPrice(price)}</span>
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">/ pp</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 md:gap-4 text-gray-400">
                        <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-background border border-border-custom rounded-xl transition-colors duration-300">
                            <Clock size={14} className="text-primary" />
                            <span className="text-[9px] font-black uppercase tracking-tighter">{duration}</span>
                        </div>
                        
                        <Link 
                            href={`/packages/${id}`}
                            className="flex items-center gap-2 bg-primary hover:bg-black hover:text-primary text-black px-4 md:px-6 py-2.5 md:py-3 rounded-xl md:rounded-2xl font-black uppercase tracking-tighter text-[9px] md:text-[10px] transition-all group/link shadow-xl shadow-primary/10 duration-300"
                        >
                            <span>Explore</span>
                            <ArrowRight size={14} className="transition-transform group-hover/link:translate-x-1" />
                        </Link>
                    </div>
                </div>
            </div>

        </div>
    );
};

export default React.memo(DestinationCard);
