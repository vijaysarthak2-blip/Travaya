"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  BarChart, Wallet, Users, Map as MapIcon, 
  TrendingUp, Calendar, ArrowUpRight, ArrowDownRight,
  Loader2, ShieldAlert, Download, RefreshCcw, Ticket
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { API_BASE } from '../../config';

import dynamic from 'next/dynamic';

const DashboardTab = dynamic(() => import('./components/DashboardTab'), { 
    loading: () => <div className="flex items-center justify-center p-20"><Loader2 className="animate-spin text-primary" size={32} /></div>,
    ssr: false 
});
const UsersTab = dynamic(() => import('./components/UsersTab'), { ssr: false });
const DestinationsTab = dynamic(() => import('./components/DestinationsTab'), { ssr: false });
const BookingsTab = dynamic(() => import('./components/BookingsTab'), { ssr: false });

export default function AdminDashboard() {
    const { user, token, theme, loading: authLoading } = useAuth();
    const router = useRouter();
    
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');

    useEffect(() => {
        if (!authLoading) {
            if (!user || user.role !== 'admin') {
                router.push('/');
                return;
            }
            if (activeTab === 'dashboard') {
                fetchStats();
            } else {
                setLoading(false);
            }
        }
    }, [user, token, authLoading, activeTab]);

    const fetchStats = async () => {
        setIsRefreshing(true);
        if (!stats) setLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/admin/stats`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setStats(data);
            }
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (!user || user.role !== 'admin') return null;

    const navItems = [
        { id: 'dashboard', label: 'Dashboard', icon: BarChart },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'destinations', label: 'Destinations', icon: MapIcon },
        { id: 'bookings', label: 'Bookings', icon: Ticket },
    ];

    return (
        <div className="min-h-screen bg-background pt-20 pb-10 px-3 md:px-8 lg:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-6">
                
                {/* Sidebar / Top-nav */}
                <div className="w-full md:w-56 shrink-0">
                    {/* Header — only visible text, tighter on mobile */}
                    <div className="flex items-center justify-between mb-3 md:mb-4 md:flex-col md:items-start md:gap-0.5 px-1">
                        <div>
                            <div className="flex items-center gap-1.5 text-primary font-bold text-[10px] uppercase tracking-widest">
                                <ShieldAlert size={11} />
                                <span>Administrator</span>
                            </div>
                            <h1 className="text-base md:text-2xl font-black tracking-tighter uppercase italic leading-tight">
                                Control <span className="text-primary not-italic font-bold">Center</span>
                            </h1>
                        </div>
                    </div>

                    {/* Mobile: segmented pill strip inside a card */}
                    <div className="md:hidden bg-card border border-border-custom rounded-2xl p-1.5 flex gap-1 overflow-x-auto">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-bold transition-all whitespace-nowrap text-[11px] flex-1 justify-center ${
                                    activeTab === item.id
                                        ? 'bg-primary text-black shadow-md shadow-primary/30'
                                        : 'text-gray-400 hover:text-foreground hover:bg-background'
                                }`}
                            >
                                <item.icon size={13} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* Desktop: vertical sidebar list */}
                    <div className="hidden md:flex flex-col gap-1">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-2 px-4 py-3 rounded-xl font-bold transition-all text-sm ${
                                    activeTab === item.id
                                        ? 'bg-primary text-black shadow-lg shadow-primary/25'
                                        : 'hover:bg-card text-gray-500 hover:text-foreground'
                                }`}
                            >
                                <item.icon size={16} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">
                    {/* Action buttons */}
                    <div className="flex justify-end mb-4">
                        {activeTab === 'dashboard' && (
                            <div className="flex items-center gap-2">
                                <button 
                                    onClick={fetchStats}
                                    className={`flex items-center gap-1.5 px-3 md:px-5 py-2 bg-card border border-border-custom rounded-xl text-xs font-bold hover:border-primary transition-all shadow-sm ${isRefreshing ? 'opacity-50' : ''}`}
                                >
                                    <RefreshCcw size={14} className={isRefreshing ? 'animate-spin' : ''} />
                                    <span className="hidden sm:inline">Refresh</span>
                                </button>
                                <button className="flex items-center gap-1.5 px-3 md:px-5 py-2 bg-primary text-black rounded-xl text-xs font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95">
                                    <Download size={14} />
                                    <span className="hidden sm:inline">Export</span>
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Tab Views */}
                    {loading && activeTab === 'dashboard' && !stats ? (
                        <div className="flex items-center justify-center py-20">
                            <Loader2 className="animate-spin text-primary" size={48} />
                        </div>
                    ) : (
                        <>
                            {activeTab === 'dashboard' && <DashboardTab stats={stats} theme={theme} />}
                            {activeTab === 'users' && <UsersTab token={token} />}
                            {activeTab === 'destinations' && <DestinationsTab token={token} />}
                            {activeTab === 'bookings' && <BookingsTab token={token} />}
                        </>
                    )}
                </div>

            </div>
        </div>
    );
}
