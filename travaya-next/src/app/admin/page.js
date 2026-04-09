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
        if (!stats) setLoading(true); // only show hard load initially
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
        { id: 'users', label: 'Manage Users', icon: Users },
        { id: 'destinations', label: 'Destinations', icon: MapIcon },
        { id: 'bookings', label: 'All Bookings', icon: Ticket },
    ];

    return (
        <div className="min-h-screen bg-background pt-24 pb-12 px-6 md:px-12">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row gap-8">
                
                {/* Sidebar */}
                <div className="w-full md:w-64 shrink-0 space-y-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2 text-primary font-bold text-xs uppercase tracking-widest">
                            <ShieldAlert size={14} />
                            <span>Administrator</span>
                        </div>
                        <h1 className="text-3xl font-black tracking-tighter uppercase italic">Control <span className="text-primary not-italic font-bold">Center</span></h1>
                    </div>

                    <div className="flex text-sm md:flex-col gap-2 overflow-x-auto pb-4 md:pb-0 scrollbar-hide">
                        {navItems.map(item => (
                            <button
                                key={item.id}
                                onClick={() => setActiveTab(item.id)}
                                className={`flex items-center gap-3 px-5 py-4 rounded-2xl font-bold transition-all whitespace-nowrap ${
                                    activeTab === item.id 
                                        ? 'bg-primary text-black shadow-lg shadow-primary/25' 
                                        : 'hover:bg-card text-gray-500 hover:text-foreground'
                                }`}
                            >
                                <item.icon size={20} />
                                <span>{item.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 w-full min-w-0">
                    <div className="flex justify-end mb-6">
                        {activeTab === 'dashboard' && (
                            <div className="flex items-center gap-3">
                                <button 
                                    onClick={fetchStats}
                                    className={`flex items-center gap-2 px-6 py-3 bg-card border border-border-custom rounded-2xl text-xs font-bold hover:border-primary transition-all shadow-sm ${isRefreshing ? 'opacity-50' : ''}`}
                                >
                                    <RefreshCcw size={16} className={isRefreshing ? 'animate-spin' : ''} />
                                    <span className="hidden sm:inline">Refresh Data</span>
                                </button>
                                <button className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-2xl text-xs font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95">
                                    <Download size={16} />
                                    <span className="hidden sm:inline">Export Report</span>
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
