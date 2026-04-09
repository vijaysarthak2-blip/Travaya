"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Loader2, Trash2, Edit, X, MapPin, Map as MapIcon, Image as ImageIcon } from 'lucide-react';
import { API_BASE } from '../../../config';
import ImageUpload from '../../../components/ImageUpload';

export default function DestinationsTab({ token }) {
    const [destinations, setDestinations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [actionLoading, setActionLoading] = useState(null);
    
    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingDest, setEditingDest] = useState(null);
    const [formData, setFormData] = useState({
        name: '', state: '', description: '', price: '', type: '', image: '', itinerary: []
    });

    useEffect(() => {
        fetchDestinations();
    }, []);

    const fetchDestinations = async () => {
        try {
            const res = await fetch(`${API_BASE}/destinations`);
            if (res.ok) {
                const data = await res.json();
                setDestinations(data);
            }
        } catch (err) {
            console.error("Failed to fetch destinations", err);
        } finally {
            setLoading(false);
        }
    };

    const deleteDestination = async (id) => {
        if (!window.confirm('Are you sure you want to delete this destination? This affects existing bookings.')) return;
        setActionLoading(id);
        try {
            const res = await fetch(`${API_BASE}/api/admin/destinations/${id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
                setDestinations(destinations.filter(d => d._id !== id));
            }
        } catch (err) {
            console.error(err);
        } finally {
            setActionLoading(null);
        }
    };

    const openModal = (dest = null) => {
        if (dest) {
            setEditingDest(dest);
            const fetchItinerary = async () => {
                try {
                    const res = await fetch(`${API_BASE}/destinations/${dest._id}/itinerary`);
                    let itineraryDays = [];
                    if (res.ok) {
                        const itData = await res.json();
                        if (itData && itData.days) itineraryDays = itData.days;
                    }
                    setFormData({
                        name: dest.name, state: dest.state, description: dest.description,
                        price: dest.price, type: dest.type.join(', '), image: dest.image,
                        itinerary: itineraryDays
                    });
                    setIsModalOpen(true);
                } catch (err) {
                    console.error("Failed fetching itinerary", err);
                    setFormData({
                        name: dest.name, state: dest.state, description: dest.description,
                        price: dest.price, type: dest.type.join(', '), image: dest.image, itinerary: []
                    });
                    setIsModalOpen(true);
                }
            };
            fetchItinerary();
        } else {
            setEditingDest(null);
            setFormData({ name: '', state: '', description: '', price: '', type: '', image: '', itinerary: [] });
            setIsModalOpen(true);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log('Form submitted', formData); // Debug log
        
        // Validate required fields
        if (!formData.name || !formData.state || !formData.price || !formData.description) {
            alert('Please fill in all required fields');
            return;
        }

        setActionLoading('save');
        try {
            const bodyData = {
                name: formData.name, 
                state: formData.state, 
                description: formData.description,
                price: Number(formData.price), 
                type: formData.type, 
                image: formData.image,
                itinerary: JSON.stringify(formData.itinerary)
            };

            console.log('Sending data:', bodyData); // Debug log

            const url = editingDest 
                ? `${API_BASE}/api/admin/destinations/${editingDest._id}` 
                : `${API_BASE}/api/admin/destinations`;
            const method = editingDest ? 'PUT' : 'POST';

            console.log('Request URL:', url, 'Method:', method); // Debug log

            const res = await fetch(url, {
                method,
                headers: { 
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` 
                },
                body: JSON.stringify(bodyData)
            });

            console.log('Response status:', res.status); // Debug log

            if (res.ok) {
                await fetchDestinations();
                setIsModalOpen(false);
                console.log('Destination saved successfully');
            } else {
                const errorData = await res.json();
                console.error('Save failed:', errorData);
                alert(`Failed to save: ${errorData.error || 'Unknown error'}`);
            }
        } catch (err) {
            console.error('Error saving destination:', err);
            alert('Failed to save destination. Please try again.');
        } finally {
            setActionLoading(null);
        }
    };

    const addItineraryDay = () => setFormData({ ...formData, itinerary: [...formData.itinerary, { day: formData.itinerary.length + 1, title: '', description: '' }] });
    const removeItineraryDay = (index) => setFormData({ ...formData, itinerary: formData.itinerary.filter((_, i) => i !== index) });
    const updateItineraryDay = (index, field, value) => {
        const updated = [...formData.itinerary];
        updated[index][field] = value;
        setFormData({ ...formData, itinerary: updated });
    };

    const s = search.toLowerCase();
    const filteredDests = destinations.filter(d => 
        (d.name && d.name.toLowerCase().includes(s)) || 
        (d.state && d.state.toLowerCase().includes(s))
    );

    if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-primary" size={32} /></div>;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between md:items-center gap-4 bg-card border border-border-custom rounded-[2.5rem] p-8 shadow-sm">
                <div className="space-y-1">
                    <h2 className="text-2xl font-black italic uppercase tracking-tighter">Manage <span className="text-primary not-italic font-bold">Destinations</span></h2>
                    <p className="text-xs text-gray-500 font-medium">Create and modify travel packages</p>
                </div>
                <div className="flex items-center gap-4 w-full md:w-auto">
                    <div className="relative w-full max-w-xs">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-background border border-border-custom rounded-2xl pl-12 pr-4 py-3 text-sm focus:outline-none focus:border-primary transition-all"
                        />
                    </div>
                    <button 
                        onClick={() => openModal()}
                        className="flex items-center gap-2 px-6 py-3 bg-primary text-black rounded-2xl text-xs font-bold hover:bg-primary-dark transition-all shadow-lg active:scale-95 whitespace-nowrap"
                    >
                        <Plus size={16} /> New <span className="hidden sm:inline">Destination</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredDests.map(dest => (
                    <div key={dest._id} className="bg-card border border-border-custom rounded-3xl overflow-hidden shadow-sm group hover:border-primary/50 transition-all flex flex-col">
                        <div className="relative h-48 overflow-hidden">
                            <img src={dest.image} alt={dest.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute top-4 right-4 flex gap-2">
                                <button onClick={() => openModal(dest)} className="w-8 h-8 rounded-full bg-black/50 backdrop-blur-md text-white flex items-center justify-center hover:bg-primary transition-colors hover:text-black">
                                    <Edit size={14} />
                                </button>
                                <button onClick={() => deleteDestination(dest._id)} disabled={actionLoading === dest._id} className="w-8 h-8 rounded-full bg-red-500/80 backdrop-blur-md text-white flex items-center justify-center hover:bg-red-500 transition-colors">
                                    {actionLoading === dest._id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                                </button>
                            </div>
                        </div>
                        <div className="p-6 flex flex-col flex-1">
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-lg leading-tight">{dest.name}</h3>
                                <span className="text-xs font-bold bg-primary/10 text-primary px-2 py-1 rounded-lg">₹{dest.price}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-4 font-medium uppercase tracking-wider">
                                <MapPin size={12} /> {dest.state}
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-3 mb-4 flex-1">{dest.description}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal Overlay */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-3xl max-h-[90vh] bg-card border border-border-custom rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-border-custom shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <MapIcon className="text-primary" size={20} />
                                {editingDest ? 'Edit Destination' : 'Add Destination'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="w-8 h-8 rounded-full hover:bg-background flex items-center justify-center transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto flex-1 custom-scrollbar">
                            <form id="destForm" onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Name</label>
                                        <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">State/Region</label>
                                        <input required type="text" value={formData.state} onChange={e => setFormData({...formData, state: e.target.value})} className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price (₹)</label>
                                        <input required type="number" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                    </div>
                                    <ImageUpload 
    value={formData.image} 
    onChange={(image) => setFormData({...formData, image})} 
    placeholder="Upload destination image"
/>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Description</label>
                                    <textarea required rows={3} value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all resize-none"></textarea>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Categories (comma separated)</label>
                                    <input type="text" placeholder="nature, relaxing, historical" value={formData.type} onChange={e => setFormData({...formData, type: e.target.value})} className="w-full bg-background border border-border-custom rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary transition-all" />
                                </div>

                                {/* Itinerary Builder */}
                                <div className="pt-6 border-t border-border-custom space-y-4">
                                    <div className="flex justify-between items-center">
                                        <label className="text-sm font-bold uppercase tracking-widest">Itinerary Details</label>
                                        <button type="button" onClick={addItineraryDay} className="flex items-center gap-1.5 text-xs text-primary font-bold hover:underline">
                                            <Plus size={14} /> Add Day
                                        </button>
                                    </div>
                                    <div className="space-y-4">
                                        {formData.itinerary.map((day, index) => (
                                            <div key={index} className="flex gap-4 items-start bg-background p-4 rounded-2xl border border-border-custom relative group">
                                                <div className="w-10 h-10 shrink-0 bg-primary/10 rounded-xl flex items-center justify-center font-black italic text-primary">D{index + 1}</div>
                                                <div className="w-full space-y-3">
                                                    <input type="text" placeholder="Day Title (e.g., Arrival at Resort)" value={day.title} onChange={e => updateItineraryDay(index, 'title', e.target.value)} className="w-full bg-transparent border-b border-border-custom px-2 py-1 text-sm focus:outline-none focus:border-primary transition-colors font-bold" />
                                                    <textarea rows={2} placeholder="Day description..." value={day.description} onChange={e => updateItineraryDay(index, 'description', e.target.value)} className="w-full bg-transparent border border-border-custom rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-primary transition-colors resize-none"></textarea>
                                                </div>
                                                <button type="button" onClick={() => removeItineraryDay(index)} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        ))}
                                        {formData.itinerary.length === 0 && (
                                            <div className="text-center py-6 text-sm text-gray-500 border border-dashed border-border-custom rounded-2xl">No itinerary days added yet.</div>
                                        )}
                                    </div>
                                </div>

                                {/* Form Buttons */}
                                <div className="pt-6 border-t border-border-custom space-y-4">
                                    <div className="flex justify-end gap-3">
                                        <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-3 rounded-2xl text-sm font-bold border border-border-custom hover:bg-card transition-colors">Cancel</button>
                                        <button 
                                            type="submit" 
                                            disabled={actionLoading === 'save'} 
                                            onClick={(e) => {
                                                e.preventDefault();
                                                handleSubmit(e);
                                            }}
                                            className="flex items-center gap-2 px-8 py-3 rounded-2xl text-sm font-bold bg-primary text-black hover:bg-primary-dark transition-all disabled:opacity-50"
                                        >
                                            {actionLoading === 'save' ? <Loader2 size={16} className="animate-spin" /> : 'Save Details'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
