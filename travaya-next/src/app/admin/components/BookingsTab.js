"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Search, MapPin, Users, Calendar, Loader2, Trash2 } from 'lucide-react';
import { API_BASE } from '../../../config';
import ConfirmDialog from './ConfirmDialog';

export default function BookingsTab({ token }) {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    const [confirm, setConfirm] = useState({ open: false, id: null });

    const fetchBookings = useCallback(async () => {
        try {
            const res = await fetch(`${API_BASE}/api/admin/bookings`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setBookings(data);
            } else {
                console.error('Fetch bookings failed:', res.status);
            }
        } catch (err) {
            console.error("Failed to fetch bookings", err);
        } finally {
            setLoading(false);
        }
    }, [token]);

    useEffect(() => {
        fetchBookings();
    }, [fetchBookings]);

    const handleDeleteClick = (id) => {
        setConfirm({ open: true, id });
    };

    const handleDeleteConfirm = async () => {
        const id = confirm.id;
        setConfirm({ open: false, id: null });
        setActionLoading(id);
        try {
            const res = await fetch(`${API_BASE}/api/admin/bookings/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setBookings(prev => prev.filter(b => b._id !== id));
            } else {
                const errData = await res.json().catch(() => ({}));
                console.error('Delete failed:', res.status, errData);
                alert(`Delete failed (${res.status}): ${errData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Delete error:', err);
            alert(`Network error: ${err.message}`);
        } finally {
            setActionLoading(null);
        }
    };

    const s = search.toLowerCase();
    const filteredBookings = bookings.filter(b =>
        (!s) ||
        (b.destinationId?.name && b.destinationId.name.toLowerCase().includes(s)) ||
        (b.userId?.fullName && b.userId.fullName.toLowerCase().includes(s)) ||
        (b._id && b._id.toLowerCase().includes(s))
    );

    if (loading) {
        return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;
    }

    return (
        <>
            <ConfirmDialog
                isOpen={confirm.open}
                title="Delete Booking"
                message="Are you sure you want to permanently delete this booking? This cannot be undone."
                confirmText="Delete"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setConfirm({ open: false, id: null })}
            />

            <div className="space-y-4 md:space-y-6 bg-card border border-border-custom rounded-2xl md:rounded-[2.5rem] p-4 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-3">
                    <div className="space-y-0.5">
                        <h2 className="text-lg md:text-2xl font-black italic uppercase tracking-tighter">System <span className="text-primary not-italic font-bold">Bookings</span></h2>
                        <p className="text-xs text-gray-500 font-medium">Monitor all platform reservations ({bookings.length} total)</p>
                    </div>
                    <div className="relative w-full md:max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={15} />
                        <input
                            type="text"
                            placeholder="Search by ID, User, or Destination..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-border-custom rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                </div>

                {/* Mobile card list */}
                <div className="md:hidden space-y-3">
                    {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                        <div key={booking._id} className="bg-background border border-border-custom rounded-2xl p-4 space-y-2.5">
                            <div className="flex items-start justify-between gap-2">
                                <div className="min-w-0">
                                    <div className="flex items-center gap-1.5 mb-1">
                                        <div className="p-1 bg-primary/10 rounded-md text-primary"><MapPin size={11}/></div>
                                        <span className="font-bold text-sm truncate">{booking.destinationId?.name || 'Deleted'}</span>
                                    </div>
                                    <p className="text-xs text-gray-400 truncate">{booking.userId?.fullName || 'Unknown'}</p>
                                    <p className="text-[10px] text-gray-500 truncate">{booking.userId?.email}</p>
                                </div>
                                <button
                                    onClick={() => handleDeleteClick(booking._id)}
                                    disabled={actionLoading === booking._id}
                                    className="p-1.5 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/10 transition-colors shrink-0"
                                >
                                    {actionLoading === booking._id ? <Loader2 size={13} className="animate-spin" /> : <Trash2 size={13} />}
                                </button>
                            </div>
                            <div className="flex items-center justify-between pt-1 border-t border-border-custom">
                                <div className="flex items-center gap-3 text-[10px] text-gray-400 font-medium">
                                    <span className="flex items-center gap-1"><Calendar size={11}/> {new Date(booking.date).toLocaleDateString()}</span>
                                    <span className="flex items-center gap-1"><Users size={11}/> {booking.travelers}p</span>
                                </div>
                                <span className="text-xs font-black">₹{(booking.travelers * (booking.destinationId?.price || 0)).toLocaleString()}</span>
                            </div>
                        </div>
                    )) : (
                        <p className="py-8 text-center text-gray-500 text-sm">{search ? `No bookings match "${search}"` : 'No bookings found.'}</p>
                    )}
                </div>

                {/* Desktop table */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-border-custom text-xs text-gray-500 font-bold uppercase tracking-widest">
                                <th className="py-4 px-4 whitespace-nowrap">Booking ID</th>
                                <th className="py-4 px-4 whitespace-nowrap">User</th>
                                <th className="py-4 px-4 whitespace-nowrap">Destination</th>
                                <th className="py-4 px-4 whitespace-nowrap">Details</th>
                                <th className="py-4 px-4 whitespace-nowrap">Amount</th>
                                <th className="py-4 px-4 whitespace-nowrap text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border-custom">
                            {filteredBookings.length > 0 ? filteredBookings.map(booking => (
                                <tr key={booking._id} className="group hover:bg-primary/5 transition-colors">
                                    <td className="py-4 px-4 text-xs font-mono text-gray-400">
                                        #{booking._id.slice(-8)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col">
                                            <span className="font-bold text-sm">{booking.userId?.fullName || 'Unknown User'}</span>
                                            <span className="text-xs text-gray-500">{booking.userId?.email}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center gap-2">
                                            <div className="p-1.5 bg-primary/10 rounded-lg text-primary"><MapPin size={14} /></div>
                                            <span className="font-bold text-sm">{booking.destinationId?.name || 'Deleted'}</span>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex flex-col gap-1 text-xs font-medium text-gray-400">
                                            <div className="flex items-center gap-1.5"><Calendar size={12} /> {new Date(booking.date).toLocaleDateString()}</div>
                                            <div className="flex items-center gap-1.5"><Users size={12} /> {booking.travelers} Traveler(s)</div>
                                        </div>
                                    </td>
                                    <td className="py-4 px-4">
                                        <span className="text-sm font-bold">
                                            ₹{(booking.travelers * (booking.destinationId?.price || 0)).toLocaleString()}
                                        </span>
                                    </td>
                                    <td className="py-4 px-4 text-right">
                                        <button
                                            onClick={() => handleDeleteClick(booking._id)}
                                            disabled={actionLoading === booking._id}
                                            className="p-2 border border-red-500/30 text-red-500 rounded-xl hover:bg-red-500/10 transition-colors"
                                            title="Delete Booking"
                                        >
                                            {actionLoading === booking._id
                                                ? <Loader2 size={16} className="animate-spin" />
                                                : <Trash2 size={16} />
                                            }
                                        </button>
                                    </td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="6" className="py-12 text-center text-gray-500 text-sm">
                                        {search ? `No bookings match "${search}"` : 'No bookings found.'}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </>
    );
}
