"use client";

import React, { useMemo } from 'react';
import { Wallet, Users, Map as MapIcon, TrendingUp, Calendar, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement,
  LineElement, BarElement, Title, Tooltip, Legend, Filler, ArcElement,
} from 'chart.js';
import { Line, Doughnut, Bar } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  Title, Tooltip, Legend, Filler, ArcElement
);

export default function DashboardTab({ stats, theme }) {
    if (!stats) return null;

    const chartColors = useMemo(() => {
        const isDark = theme === 'dark';
        return {
            background: isDark ? 'rgba(154, 205, 50, 0.1)' : 'rgba(154, 205, 50, 0.05)',
            primary: '#9acd32',
            secondary: '#e77a2f',
            grid: isDark ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)',
            text: isDark ? '#999' : '#666'
        };
    }, [theme]);

    const trendData = {
        labels: stats.trends.map(t => t._id),
        datasets: [{
            label: 'Bookings',
            data: stats.trends.map(t => t.count),
            borderColor: chartColors.primary,
            backgroundColor: chartColors.background,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointBackgroundColor: chartColors.primary,
        }]
    };

    const popularityData = {
        labels: stats.popularity.map(p => p.name),
        datasets: [{
            label: 'Popularity',
            data: stats.popularity.map(p => p.count),
            backgroundColor: ['#9acd32', '#e77a2f', '#4f46e5', '#ec4899', '#f59e0b'],
            borderWidth: 0,
        }]
    };

    const verificationData = {
        labels: ['Verified', 'Unverified'],
        datasets: [{
            label: 'Users',
            data: [stats.overview.verifiedUsers, stats.overview.users - stats.overview.verifiedUsers],
            backgroundColor: ['#9acd32', '#6b7280'],
            borderRadius: 8,
        }]
    };

    const chartOptions = {
        responsive: true, maintainAspectRatio: false,
        plugins: {
            legend: { display: false },
            tooltip: {
                backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
                titleColor: theme === 'dark' ? '#fff' : '#000',
                bodyColor: theme === 'dark' ? '#ccc' : '#666',
                borderColor: chartColors.grid, borderWidth: 1, padding: 12, displayColors: false,
            }
        },
        scales: {
            x: { grid: { display: false }, ticks: { color: chartColors.text, font: { size: 10 } } },
            y: { grid: { color: chartColors.grid }, ticks: { color: chartColors.text, font: { size: 10 } } }
        }
    };

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Metrics */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
                {[
                    { label: 'Total Revenue', value: `₹${stats.overview.revenue.toLocaleString()}`, icon: Wallet, trend: '+12.5%', isUp: true },
                    { label: 'Total Bookings', value: stats.overview.bookings, icon: Calendar, trend: '+8.2%', isUp: true },
                    { label: 'Active Users', value: stats.overview.users, icon: Users, trend: '-2.4%', isUp: false },
                    { label: 'Destinations', value: stats.overview.destinations, icon: MapIcon, trend: '+3', isUp: true },
                ].map((metric, i) => (
                    <div key={i} className="bg-card border border-border-custom rounded-2xl md:rounded-3xl p-4 md:p-6 shadow-sm hover:border-primary/30 transition-all group relative overflow-hidden">
                         <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-2xl -mr-12 -mt-12 transition-transform group-hover:scale-150" />
                         <div className="relative z-10 flex flex-col gap-3">
                            <div className="flex justify-between items-center">
                                <div className="p-2 md:p-3 bg-primary/10 rounded-xl text-primary">
                                    <metric.icon size={18} />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded-lg ${metric.isUp ? 'text-green-500 bg-green-500/10' : 'text-red-500 bg-red-500/10'}`}>
                                    {metric.isUp ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
                                    <span>{metric.trend}</span>
                                </div>
                            </div>
                            <div className="space-y-0.5">
                                <p className="text-gray-500 text-[9px] md:text-xs font-bold uppercase tracking-widest">{metric.label}</p>
                                <h3 className="text-lg md:text-3xl font-black tracking-tight">{metric.value}</h3>
                            </div>
                         </div>
                    </div>
                ))}
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-8">
                <div className="lg:col-span-2 bg-card border border-border-custom rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-sm space-y-4 md:space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-0.5">
                            <h3 className="text-base md:text-xl font-bold flex items-center gap-2">
                                <TrendingUp className="text-primary" size={16} />
                                Booking Trends
                            </h3>
                            <p className="text-[10px] md:text-xs text-gray-500">Volume of reservations across the current period</p>
                        </div>
                    </div>
                    <div className="h-[200px] md:h-[300px] w-full">
                        <Line data={trendData} options={chartOptions} />
                    </div>
                </div>

                <div className="bg-card border border-border-custom rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-sm space-y-4 md:space-y-8">
                     <div className="space-y-0.5">
                        <h3 className="text-base md:text-xl font-bold flex items-center gap-2">
                            <MapIcon className="text-secondary" size={16} />
                            Popularity
                        </h3>
                         <p className="text-[10px] md:text-xs text-gray-500">Most booked destinations</p>
                    </div>
                    <div className="h-[180px] md:h-[240px] relative flex items-center justify-center">
                        <Doughnut 
                            data={popularityData} 
                            options={{ ...chartOptions, cutout: '70%', plugins: { ...chartOptions.plugins, legend: { display: false } } }} 
                        />
                        <div className="absolute flex flex-col items-center">
                            <span className="text-gray-400 text-[10px] uppercase font-bold">Top</span>
                            <span className="text-lg font-black italic text-primary">DEST</span>
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-3 bg-card border border-border-custom rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-sm space-y-4 md:space-y-8">
                    <div className="space-y-0.5">
                        <h3 className="text-base md:text-xl font-bold flex items-center gap-2">
                            <Users className="text-blue-500" size={16} />
                            User Verification
                        </h3>
                    </div>
                    <div className="h-[140px] md:h-[200px] w-full max-w-xl mx-auto">
                        <Bar 
                            data={verificationData} 
                            options={{ ...chartOptions, indexAxis: 'y', scales: { x: { display: false }, y: { grid: {display: false}, ticks: {color: chartColors.text, font: {size: 10, weight: 'bold'}} } } }} 
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}
