"use client";
import CustomDropdown from "../../components/CustomDropdown";
import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { 
  Search, Filter, SlidersHorizontal, MapPin, Loader2, 
  Compass, ArrowRight, Sparkles, LayoutGrid, List,
  ChevronDown, ArrowUpDown, Tag, Zap, Clock, Star, X, Check
} from 'lucide-react';
import { API_BASE } from '../../config';
import DestinationCard from '../../components/DestinationCard';
import dynamic from 'next/dynamic';

const DynamicMap = dynamic(() => import('../../components/MapComponent'), {
    ssr: false,
    loading: () => <div className="h-[500px] w-full bg-border-custom animate-[pulse_2s_ease-in-out_infinite] rounded-[3rem] border border-border-custom"></div>
});

const STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", 
    "Goa", "Gujarat", "Haryana", "Himachal Pradesh", "Jharkhand", "Karnataka", 
    "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur", "Meghalaya", "Mizoram", 
    "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", 
    "Telangana", "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal",
    "Andaman and Nicobar Islands", "Chandigarh", "Dadra and Nagar Haveli and Daman and Diu",
    "Delhi", "Jammu and Kashmir", "Ladakh", "Lakshadweep", "Puducherry"
];

const CATEGORIES = [
    { id: 'all', name: 'All Tours' },
    { id: 'nature', name: 'Nature & Wildlife' },
    { id: 'beach', name: 'Beaches' },
    { id: 'cultural', name: 'Cultural' },
    { id: 'adventure', name: 'Adventure' },
    { id: 'religious', name: 'Religious' }
];

const SORT_OPTIONS = [
    { id: 'featured', name: 'Featured' },
    { id: 'price-low', name: 'Price: Low to High' },
    { id: 'price-high', name: 'Price: High to Low' },
    { id: 'rating', name: 'Top Rated' }
];

export default function Packages() {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('featured');
    const [viewMode, setViewMode] = useState('grid');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [maxPrice, setMaxPrice] = useState(100000);
    const [visibleCount, setVisibleCount] = useState(15);
    const [showMobileFilters, setShowMobileFilters] = useState(false);

    // Debounce search query to reduce computation during fast typing
    const [debouncedSearch, setDebouncedSearch] = useState('');
    useEffect(() => {
        const timer = setTimeout(() => setDebouncedSearch(searchQuery), 300);
        return () => clearTimeout(timer);
    }, [searchQuery]);

    useEffect(() => {
        // Read URL parameters on mount
        const urlParams = new URL(window.location.href).searchParams;
        const initialSearch = urlParams.get('search');
        if (initialSearch) {
            setSearchQuery(initialSearch);
            setDebouncedSearch(initialSearch);
        }

        const fetchAll = async () => {
            try {
                const res = await fetch(`${API_BASE}/destinations`);
                if (!res.ok) throw new Error("Failed to fetch");
                const data = await res.json();
                setDestinations(data);
            } catch (err) {
                console.error("Error fetching destinations:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    const [scrolledToResults, setScrolledToResults] = useState(false);
    useEffect(() => {
        const urlParams = new URL(window.location.href).searchParams;
        if (urlParams.get('search') && !loading && !scrolledToResults) {
            setTimeout(() => {
                document.getElementById('results-grid')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 300); // Small delay to let React render the grid items
            setScrolledToResults(true);
        }
    }, [loading, scrolledToResults]);

    const filteredDestinations = useMemo(() => {
        let result = destinations.filter(dest => {
            const matchesSearch = dest.name.toLowerCase().includes(debouncedSearch.toLowerCase()) || 
                                 dest.state.toLowerCase().includes(debouncedSearch.toLowerCase());
            const matchesState = selectedState === '' || dest.state === selectedState;
            const matchesCategory = selectedCategory === 'all' || 
                                   (dest.type && dest.type.includes(selectedCategory));
            const matchesPrice = dest.price <= maxPrice;
            
            return matchesSearch && matchesState && matchesCategory && matchesPrice;
        });

        // Sorting Logic
        if (sortBy === 'price-low') result.sort((a, b) => a.price - b.price);
        if (sortBy === 'price-high') result.sort((a, b) => b.price - a.price);
        if (sortBy === 'rating') result.sort((a, b) => (b.rating || 0) - (a.rating || 0));

        return result;
    }, [destinations, debouncedSearch, selectedState, selectedCategory, sortBy, maxPrice]);

    return (
        <div className="min-h-screen bg-background pb-32 relative overflow-hidden">
            {/* Visual Texture Layer: Topographical Pattern - Optimized with will-change and opacity */}
            <div className="absolute inset-0 z-0 opacity-[0.02] pointer-events-none mix-blend-overlay will-change-[opacity]">
                <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <pattern id="topo" width="200" height="200" patternUnits="userSpaceOnUse">
                            <path d="M0 100 Q 50 50 100 100 T 200 100" fill="none" stroke="currentColor" strokeWidth="1" />
                            <path d="M0 50 Q 50 0 100 50 T 200 50" fill="none" stroke="currentColor" strokeWidth="0.5" />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#topo)" />
                </svg>
            </div>

            {/* Cinematic Hero */}
            <div className="relative h-[80vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 scale-110 animate-[zoom_20s_ease-in-out_infinite]">
                     <Image 
                        src="/packages-hero.png" 
                        alt="Background" 
                        fill 
                        priority 
                        className="object-cover" 
                     />
                     <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
                </div>
                
                <div className="relative z-10 max-w-5xl mx-auto text-center px-6 pt-32 space-y-12">
                    <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-[10px] font-black uppercase tracking-[0.3em] backdrop-blur-xl animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <Zap size={14} />
                        <span>Instant Discovery Protocol</span>
                    </div>
                    
                    {/* Clean Luxury Editorial Block */}
                    <div className="relative group/title inline-block py-12 px-6">
                         {/* Subtle Localized Backdrop */}
                         <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-background/40 to-primary/10 backdrop-blur-3xl rounded-[3rem] border border-white/5 opacity-40 group-hover:opacity-60 transition-opacity" />
                         
                         <h1 className="relative z-10 text-7xl md:text-[10rem] font-black tracking-[0.05em] leading-[0.9] animate-in fade-in slide-in-from-top-8 duration-1000 uppercase text-center">
                             <span className="text-white drop-shadow-2xl">Master</span>
                             <br />
                             <span className="text-primary italic drop-shadow-2xl brightness-125">Voyages</span>
                         </h1>

                         {/* Minimalist Divider Accent */}
                         <div className="flex items-center justify-center gap-4 mt-8 opacity-40 group-hover:opacity-100 transition-opacity">
                             <div className="h-[1px] w-12 bg-primary" />
                             <span className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-500">Established MMXXIV</span>
                             <div className="h-[1px] w-12 bg-primary" />
                         </div>
                    </div>

                    <p className="text-gray-300 max-w-3xl mx-auto text-xl md:text-2xl font-medium leading-relaxed opacity-90 animate-in fade-in slide-in-from-bottom-12 duration-1200">
                        Curated expeditions through the heart of the subcontinent. Every trail is a legacy in the making.
                    </p>
                </div>

                <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-background via-background/80 to-transparent z-10" />
            </div>

            {/* Advanced Search & Filtering Interface */}
            <div className="max-w-7xl mx-auto px-6 -mt-24 relative z-30 space-y-12">
                
                {/* Search & Control Station */}
                <div className="bg-card/40 backdrop-blur-3xl border border-border-custom rounded-[3.5rem] shadow-2xl p-6 md:p-10 space-y-8 animate-in fade-in zoom-in duration-1000">
                    <div className="flex flex-col md:flex-row gap-8 items-center">
                        <div className="relative flex-1 group w-full">
                            <Search className="absolute left-7 top-1/2 -translate-y-1/2 text-primary group-focus-within:scale-110 transition-transform" size={24} />
                            <input 
                                type="text" 
                                placeholder="Search by destination, state, or vibe..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    setVisibleCount(15);
                                }}
                                className="w-full bg-background/50 border border-border-custom pl-16 pr-8 py-6 rounded-3xl focus:ring-8 focus:ring-primary/5 focus:border-primary outline-none transition-all text-xl font-bold placeholder:text-gray-500 placeholder:uppercase placeholder:tracking-widest placeholder:text-[10px]"
                            />
                        </div>
                        
                        <div className="flex items-center gap-4 w-full md:w-auto">
                            {/* Mobile Filter Toggle */}
                            <button
                                onClick={() => setShowMobileFilters(true)}
                                className="lg:hidden flex items-center gap-2 px-4 py-3 bg-card/50 border border-border-custom rounded-2xl font-black uppercase tracking-widest text-xs hover:border-primary/50 transition-all"
                            >
                                <SlidersHorizontal size={16} className="text-primary" />
                                <span>Filters</span>
                            </button>
                            <div className="w-full md:w-64">
                                <CustomDropdown 
                                    value={sortBy}
                                    onChange={setSortBy}
                                    options={SORT_OPTIONS.map(opt => ({ value: opt.id, label: opt.name }))}
                                    className="w-full"
                                />
                            </div>

                            <div className="hidden md:flex p-1.5 bg-background/50 border border-border-custom rounded-3xl gap-1">
                                <button onClick={() => setViewMode('grid')} className={`p-4 rounded-2xl transition-all ${viewMode === 'grid' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-primary'}`}>
                                    <LayoutGrid size={20} />
                                </button>
                                <button onClick={() => setViewMode('list')} className={`p-4 rounded-2xl transition-all ${viewMode === 'list' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-primary'}`}>
                                    <List size={20} />
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-6 pt-6 border-t border-border-custom/50">
                        <div className="flex items-center gap-6">
                            <div className="flex items-center gap-3 px-5 py-2 bg-background/40 border border-border-custom rounded-2xl">
                                <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Live: <span className="text-foreground">{filteredDestinations.length}</span> Horizons Found</span>
                            </div>
                            <div className="hidden lg:flex items-center gap-3 text-gray-400 text-[10px] font-black uppercase tracking-widest">
                                <Tag size={14} className="text-primary" />
                                <span>Verified Expeditions Only</span>
                            </div>
                        </div>
                        
                        <button 
                            onClick={() => setViewMode(viewMode === 'map' ? 'grid' : 'map')}
                            className={`hidden md:flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:underline underline-offset-8 transition-colors ${viewMode === 'map' ? 'text-white' : 'text-primary'}`}
                        >
                            <MapPin size={14} />
                            <span>{viewMode === 'map' ? 'Close Map Overview' : 'Interactive Map Overview'}</span>
                        </button>
                    </div>
                </div>

                {/* Mobile Filter Drawer Overlay */}
                {showMobileFilters && (
                    <div className="fixed inset-0 z-[100] flex justify-end lg:hidden" onClick={() => setShowMobileFilters(false)}>
                        <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
                        <div
                            className="relative w-full max-w-sm h-full bg-card border-l border-border-custom overflow-y-auto p-8 space-y-8 animate-in slide-in-from-right-10 duration-300"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="flex items-center justify-between">
                                <h3 className="font-black uppercase tracking-tighter text-lg">Filters</h3>
                                <button onClick={() => setShowMobileFilters(false)} className="p-2 hover:text-primary transition-colors"><X size={20} /></button>
                            </div>

                            {/* Region Selector */}
                            <div className="space-y-4">
                                <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2"><Compass size={14} />Select Region</p>
                                <CustomDropdown
                                    value={selectedState}
                                    onChange={setSelectedState}
                                    options={[{ value: '', label: 'All Regions & UTs' }, ...STATES.map(s => ({ value: s, label: s }))]}
                                    className="w-full"
                                />
                            </div>

                            {/* Budget Slider */}
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <p className="text-primary font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2"><Tag size={14} />Budget Threshold</p>
                                    <span className="text-xs font-black">₹{maxPrice.toLocaleString()}</span>
                                </div>
                                <input type="range" min="5000" max="150000" step="5000" value={maxPrice} onChange={e => setMaxPrice(parseInt(e.target.value))} className="w-full h-2 bg-background border border-border-custom rounded-full appearance-none cursor-pointer accent-primary" />
                            </div>

                            {/* Categories */}
                            <div className="space-y-3">
                                <p className="text-gray-400 font-black text-[10px] uppercase tracking-[0.3em] flex items-center gap-2"><SlidersHorizontal size={14} />Classification</p>
                                <div className="space-y-2">
                                    {CATEGORIES.map(category => (
                                        <button
                                            key={category.id}
                                            onClick={() => { setSelectedCategory(category.id); setShowMobileFilters(false); }}
                                            className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all text-xs font-black uppercase tracking-tighter ${
                                                selectedCategory === category.id
                                                    ? 'bg-primary text-black'
                                                    : 'text-gray-500 hover:bg-primary/10 hover:text-primary'
                                            }`}
                                        >
                                            {category.name}
                                            {selectedCategory === category.id && <Check size={14} />}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={() => setShowMobileFilters(false)}
                                className="w-full py-4 bg-primary text-black font-black uppercase tracking-tighter rounded-2xl"
                            >
                                Apply Filters
                            </button>
                        </div>
                    </div>
                )}

                <div className="flex flex-col lg:flex-row gap-16">
                    {/* Floating Master Controls (Sidebar) - Desktop only */}
                    <aside className="hidden lg:block w-80 shrink-0 space-y-10 sticky top-32 h-fit animate-in fade-in slide-in-from-left-10 duration-1000">
                        
                        {/* Discovery Regions */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border-custom p-8 rounded-[3rem] shadow-xl space-y-8 relative group" style={{zIndex: 50}}>
                            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-3xl -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                            <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.3em] relative z-10">
                                <Compass size={18} />
                                <span>Select Region</span>
                            </div>
                            <div className="space-y-4">
                                <CustomDropdown 
                                        value={selectedState}
                                        onChange={setSelectedState}
                                        options={[
                                            { value: '', label: 'All Regions & UTs' },
                                            ...STATES.map(state => ({ value: state, label: state }))
                                        ]}
                                        placeholder="All Regions & UTs"
                                    />
                            </div>
                        </div>

                        {/* Budget Threshold */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border-custom p-8 rounded-[3rem] shadow-xl space-y-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 text-primary font-black text-[10px] uppercase tracking-[0.3em]">
                                    <Tag size={18} />
                                    <span>Budget Threshold</span>
                                </div>
                                <span className="text-xs font-black italic">₹{maxPrice.toLocaleString()}</span>
                            </div>
                            <input 
                                type="range" 
                                min="5000" 
                                max="150000" 
                                step="5000"
                                value={maxPrice}
                                onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                className="w-full h-2 bg-background border border-border-custom rounded-full appearance-none cursor-pointer accent-primary"
                            />
                            <div className="flex justify-between text-[8px] font-black text-gray-500 uppercase tracking-widest px-1">
                                <span>Base (₹5k)</span>
                                <span>Elite (₹150k)</span>
                            </div>
                        </div>

                        {/* Expedition Categories */}
                        <div className="bg-card/50 backdrop-blur-2xl border border-border-custom p-2 rounded-[3rem] shadow-xl overflow-hidden">
                            <div className="p-8 pb-4 flex items-center gap-3 text-gray-400 font-black text-[10px] uppercase tracking-[0.3em]">
                                <SlidersHorizontal size={18} />
                                <span>Classification</span>
                            </div>
                            <div className="p-3 space-y-2">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => setSelectedCategory(category.id)}
                                        className={`w-full flex items-center justify-between p-5 rounded-[2rem] transition-all group relative overflow-hidden ${
                                            selectedCategory === category.id 
                                            ? 'bg-primary text-black font-black shadow-xl shadow-primary/20' 
                                            : 'text-gray-500 hover:bg-primary/10 hover:text-primary'
                                        }`}
                                    >
                                        <div className="flex items-center gap-4 relative z-10">
                                            <div className={`w-2 h-2 rounded-full transition-all ${selectedCategory === category.id ? 'bg-black' : 'bg-primary/20 scale-0 group-hover:scale-100'}`} />
                                            <span className="text-xs uppercase tracking-tighter">{category.name}</span>
                                        </div>
                                        <ArrowRight size={14} className={`relative z-10 transition-all ${selectedCategory === category.id ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
                                    </button>
                                ))}
                            </div>
                        </div>
                    </aside>

                    {/* Master Gallery (Results) */}
                    <main id="results-grid" className="flex-1 scroll-mt-32">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-40 gap-8">
                                <div className="relative">
                                     <Loader2 className="animate-spin text-primary" size={80} />
                                     <div className="absolute inset-0 bg-primary/20 blur-[60px] rounded-full" />
                                </div>
                                <div className="text-center space-y-2">
                                    <p className="text-foreground font-black uppercase tracking-[0.4em] text-xs animate-pulse">Syncing Global Horizon Arrays</p>
                                    <p className="text-gray-500 text-[10px] font-bold uppercase tracking-widest">Protocol 4-9-X Active</p>
                                </div>
                            </div>
                        ) : filteredDestinations.length > 0 ? (
                            <div className="space-y-16 animate-in fade-in slide-in-from-bottom-12 duration-1000">
                                {viewMode === 'map' ? (
                                     <DynamicMap destinations={filteredDestinations} />
                                ) : (
                                    <div className={`${viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 gap-12' : 'flex flex-col gap-10'}`}>
                                    {filteredDestinations.slice(0, visibleCount).map((dest, index) => (
                                        <div key={dest._id} style={{ animationDelay: `${(index % 6) * 80}ms` }} className="animate-in fade-in slide-in-from-bottom-8 duration-700 fill-mode-both">
                                            <DestinationCard 
                                                id={dest._id}
                                                name={dest.name}
                                                state={dest.state}
                                                price={dest.price}
                                                image={dest.image}
                                                description={dest.description}
                                                // Enhanced props for the new travel look
                                                duration={dest.duration || "3D/2N"}
                                                rating={dest.rating || 4.8}
                                                isTrending={index === 0}
                                                isBestValue={dest.price < 35000}
                                                viewMode={viewMode}
                                            />
                                        </div>
                                    ))}
                                    </div>
                                )}

                                {visibleCount < filteredDestinations.length && viewMode !== 'map' && (
                                    <div className="flex justify-center pt-12">
                                        <button 
                                            onClick={() => setVisibleCount(prev => prev + 10)}
                                            className="group relative px-12 py-6 bg-card border border-border-custom rounded-[2.5rem] overflow-hidden hover:border-primary transition-all duration-500"
                                        >
                                            <div className="absolute inset-0 bg-primary translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                            <div className="relative z-10 flex items-center gap-4 text-xs font-black uppercase tracking-[0.3em] group-hover:text-black transition-colors">
                                                <span>Expand Discovery Array</span>
                                                <Compass size={20} className="animate-[spin_10s_linear_infinite]" />
                                            </div>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="bg-card/40 backdrop-blur-2xl border border-border-custom rounded-[4rem] p-24 text-center flex flex-col items-center gap-10 animate-in zoom-in duration-700">
                                <div className="w-40 h-40 bg-primary/10 text-primary rounded-[3rem] flex items-center justify-center relative shadow-2xl">
                                    <Compass size={80} className="animate-[spin_15s_linear_infinite] opacity-50" />
                                    <div className="absolute inset-0 bg-primary/10 rounded-full blur-3xl animate-pulse" />
                                </div>
                                <div className="space-y-4">
                                    <h3 className="text-4xl font-black tracking-tighter uppercase italic">No Trails Detected</h3>
                                    <p className="text-gray-500 max-w-sm mx-auto leading-relaxed font-medium text-lg">
                                        The expedition coordinates you provided yielded no matches in our current discovery database.
                                    </p>
                                </div>
                                <button 
                                    onClick={() => {
                                        setSelectedState('');
                                        setSelectedCategory('all');
                                        setSearchQuery('');
                                        setMaxPrice(100000);
                                    }}
                                    className="bg-primary hover:bg-black hover:text-primary text-black font-black px-16 py-6 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all transform active:scale-95 uppercase tracking-tighter italic text-xl"
                                >
                                    Re-initialize Discovery
                                </button>
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {/* Mobile Expedition Drawer */}
            <div className={`fixed inset-0 z-[100] lg:hidden transition-all duration-700 ${isSidebarOpen ? 'visible' : 'invisible'}`}>
                 <div 
                    className={`absolute inset-0 bg-black/90 backdrop-blur-xl transition-opacity duration-700 ${isSidebarOpen ? 'opacity-100' : 'opacity-0'}`}
                    onClick={() => setIsSidebarOpen(false)}
                />
                <div className={`absolute bottom-0 left-0 right-0 bg-background border-t border-border-custom rounded-t-[4rem] p-12 transition-transform duration-700 transform ${isSidebarOpen ? 'translate-y-0' : 'translate-y-full shadow-[0_-50px_100px_rgba(0,0,0,0.8)]'}`}>
                    <div className="w-20 h-2 bg-gray-300 dark:bg-white/10 rounded-full mx-auto mb-12 shadow-inner" />
                    <div className="space-y-16 overflow-y-auto max-h-[70vh] pb-12">
                        <section className="space-y-8">
                             <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.3em]">
                                <MapPin size={20} />
                                <span>Expedition Region</span>
                            </div>
                            <select 
                                value={selectedState}
                                onChange={(e) => {
                                    setSelectedState(e.target.value);
                                    setIsSidebarOpen(false);
                                }}
                                className="w-full bg-card border border-border-custom p-6 rounded-[2.5rem] outline-none font-black text-xl uppercase tracking-tighter appearance-none"
                            >
                                <option value="">Global Mapping (All)</option>
                                {STATES.map(state => <option key={state} value={state}>{state}</option>)}
                            </select>
                        </section>
                        
                        <section className="space-y-8">
                             <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.3em]">
                                <Tag size={20} />
                                <span>Budget Constraint (Base Fee)</span>
                            </div>
                            <div className="space-y-6">
                                <div className="flex justify-between font-black italic text-2xl">
                                    <span className="text-gray-500">Min</span>
                                    <span className="text-primary">₹{maxPrice.toLocaleString()}</span>
                                </div>
                                <input 
                                    type="range" 
                                    min="5000" 
                                    max="150000" 
                                    step="5000"
                                    value={maxPrice}
                                    onChange={(e) => setMaxPrice(parseInt(e.target.value))}
                                    className="w-full h-3 bg-card border border-border-custom rounded-full appearance-none cursor-pointer accent-primary"
                                />
                            </div>
                        </section>

                        <section className="space-y-8">
                             <div className="flex items-center gap-3 text-primary font-black text-xs uppercase tracking-[0.3em]">
                                <SlidersHorizontal size={20} />
                                <span>Discovery Classification</span>
                            </div>
                             <div className="grid grid-cols-1 gap-4">
                                {CATEGORIES.map(category => (
                                    <button
                                        key={category.id}
                                        onClick={() => {
                                            setSelectedCategory(category.id);
                                            setIsSidebarOpen(false);
                                        }}
                                        className={`p-6 rounded-[2rem] transition-all text-sm font-black uppercase tracking-[0.2em] relative overflow-hidden ${
                                            selectedCategory === category.id 
                                            ? 'bg-primary text-black shadow-2xl' 
                                            : 'bg-card border border-border-custom text-gray-500'
                                        }`}
                                    >
                                        <span className="relative z-10">{category.name}</span>
                                    </button>
                                ))}
                             </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
