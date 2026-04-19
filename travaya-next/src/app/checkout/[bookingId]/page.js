"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { 
    CreditCard, ShieldCheck, Lock, CheckCircle2, 
    ArrowLeft, Loader2, Info, ArrowRight, MapPin, 
    Calendar, Users, User, QrCode
} from 'lucide-react';
import { API_BASE } from '../../../config';
import { useAuth } from '../../../context/AuthContext';

export default function CheckoutPage({ params }) {
    const { bookingId } = useParams() || {};
    const router = useRouter();
    const { token } = useAuth();
    
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    
    const [paymentMethod, setPaymentMethod] = useState('card');
    const [upiId, setUpiId] = useState('');
    
    const [cardData, setCardData] = useState({
        cardNumber: '',
        expiry: '',
        cvv: '',
        cardholder: ''
    });

    useEffect(() => {
        const fetchBooking = async () => {
            if (!token) return;
            try {
                const res = await fetch(`${API_BASE}/bookings/${bookingId}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                if (!res.ok) {
                    throw new Error("Failed to load booking details");
                }
                const data = await res.json();
                setBooking(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [bookingId, token]);

    const handleCardChange = (e) => {
        let { name, value } = e.target;
        
        if (name === 'cardNumber') {
            value = value.replace(/\D/g, '').slice(0, 16);
            if (value.length > 0) value = value.match(/.{1,4}/g)?.join(' ') || value;
        } else if (name === 'expiry') {
            value = value.replace(/\D/g, '').slice(0, 4);
            if (value.length > 2) value = `${value.slice(0, 2)}/${value.slice(2)}`;
        } else if (name === 'cvv') {
            value = value.replace(/\D/g, '').slice(0, 3);
        }

        setCardData({ ...cardData, [name]: value });
    };

    const handlePaymentSubmit = async (e) => {
        e.preventDefault();
        setPaymentProcessing(true);
        setError('');

        try {
            const res = await fetch(`${API_BASE}/payments/process`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    bookingId,
                    method: paymentMethod,
                    cardNumber: paymentMethod === 'card' ? cardData.cardNumber.replace(/\s/g, '') : undefined,
                    expiry: paymentMethod === 'card' ? cardData.expiry : undefined,
                    cvv: paymentMethod === 'card' ? cardData.cvv : undefined,
                    upiId: paymentMethod === 'upi' ? upiId : undefined
                })
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || 'Payment failed');

            setPaymentSuccess(true);
            setTimeout(() => router.push('/profile'), 4000);
        } catch (err) {
            setError(err.message);
            setPaymentProcessing(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background">
                <Loader2 className="animate-spin text-primary" size={48} />
            </div>
        );
    }

    if (error && !booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center space-y-6">
                <Info size={48} className="text-red-500" />
                <h2 className="text-2xl font-bold uppercase">{error}</h2>
                <button onClick={() => router.back()} className="px-6 py-3 bg-card border rounded-xl hover:border-primary">Go Back</button>
            </div>
        );
    }

    if (paymentSuccess) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background px-6">
                <div className="max-w-md w-full text-center space-y-8 animate-in fade-in zoom-in duration-500 bg-card p-12 border border-green-500/30 rounded-[3rem] shadow-2xl">
                    <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
                        <div className="absolute inset-0 bg-green-500/20 rounded-full animate-ping" />
                        <div className="relative w-20 h-20 bg-green-500 text-black rounded-full flex items-center justify-center shadow-xl">
                            <CheckCircle2 size={48} />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Payment Successful</h1>
                        <p className="text-gray-400 font-medium">Your expedition is secured. Prepare for an unforgettable journey.</p>
                    </div>
                    <div className="w-full bg-gray-200/10 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full animate-[progress_4s_linear]" />
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background pt-32 pb-24 px-6">
            <div className="max-w-6xl mx-auto space-y-8">
                
                <div className="space-y-6">
                    <button 
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-primary transition-colors cursor-pointer w-fit"
                    >
                        <ArrowLeft size={16} />
                        Return to Details
                    </button>
                    
                    <div className="space-y-2">
                        <h1 className="text-4xl font-black uppercase tracking-tighter italic">Secure <span className="text-primary not-italic">Checkout</span></h1>
                        <p className="text-gray-500 font-medium tracking-tight">SSL encrypted payment gateway. Demo Mode Active.</p>
                    </div>

                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-2xl animate-in slide-in-from-top flex gap-4 w-full">
                            <Info size={20} />
                            <span className="text-sm font-bold">{error}</span>
                        </div>
                    )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                    
                    {/* Left: Secure Payment Form */}
                    <div className="lg:col-span-7">

                        <form onSubmit={handlePaymentSubmit} className="bg-card/50 backdrop-blur-3xl border border-border-custom rounded-[2.5rem] p-8 md:p-10 shadow-2xl relative overflow-hidden group">
                            
                            {/* Animated Background Highlights */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-[60px] pointer-events-none group-focus-within:bg-primary/20 transition-colors duration-1000" />
                            
                            <div className="relative z-10 flex flex-col gap-6">
                                
                                <div className="flex gap-4 p-1 bg-background/50 rounded-2xl mb-2">
                                    <button type="button" onClick={() => setPaymentMethod('card')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl uppercase font-black text-xs tracking-widest transition-all ${paymentMethod === 'card' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}>
                                        <CreditCard size={18} /> Card
                                    </button>
                                    <button type="button" onClick={() => setPaymentMethod('upi')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl uppercase font-black text-xs tracking-widest transition-all ${paymentMethod === 'upi' ? 'bg-primary text-black shadow-lg shadow-primary/20' : 'text-gray-500 hover:text-white'}`}>
                                        <QrCode size={18} /> UPI
                                    </button>
                                </div>

                                {paymentMethod === 'card' ? (
                                    <>
                                        <div className="flex items-center justify-between pb-6 border-b border-border-custom">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-background border border-border-custom flex items-center justify-center shadow-inner">
                                                    <CreditCard className="text-primary" size={20} />
                                                </div>
                                                <div>
                                                    <h3 className="font-black uppercase tracking-tight text-sm">Credit / Debit Card</h3>
                                                    <p className="text-[10px] uppercase text-gray-500 tracking-widest">Powered by Stripe Demo</p>
                                                </div>
                                            </div>
                                            <div className="flex bg-background border border-border-custom px-4 py-2 rounded-lg text-xs font-black italic tracking-widest text-primary shadow-inner">
                                                VISA · MC · AMEX
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pt-4">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Card Number</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    name="cardNumber"
                                                    value={cardData.cardNumber}
                                                    onChange={handleCardChange}
                                                    required={paymentMethod === 'card'}
                                                    minLength="19"
                                                    placeholder="0000 0000 0000 0000"
                                                    className="w-full bg-background border border-border-custom py-4 pl-4 pr-12 rounded-2xl font-mono text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-600"
                                                />
                                                <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Expiry Date</label>
                                                <input 
                                                    type="text" 
                                                    name="expiry"
                                                    value={cardData.expiry}
                                                    onChange={handleCardChange}
                                                    required={paymentMethod === 'card'}
                                                    placeholder="MM/YY"
                                                    className="w-full bg-background border border-border-custom py-4 px-4 rounded-2xl font-mono text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-600 text-center"
                                                />
                                            </div>
                                            <div className="space-y-1.5">
                                                <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Security Code (CVV)</label>
                                                <input 
                                                    type="password" 
                                                    name="cvv"
                                                    value={cardData.cvv}
                                                    onChange={handleCardChange}
                                                    required={paymentMethod === 'card'}
                                                    maxLength="4"
                                                    placeholder="•••"
                                                    className="w-full bg-background border border-border-custom py-4 px-4 rounded-2xl font-mono text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-600 text-center"
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-1.5 pb-6">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1">Cardholder Name</label>
                                            <input 
                                                type="text" 
                                                name="cardholder"
                                                value={cardData.cardholder}
                                                onChange={handleCardChange}
                                                required={paymentMethod === 'card'}
                                                placeholder="JOHN DOE"
                                                className="w-full bg-background border border-border-custom py-4 px-4 rounded-2xl uppercase focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-600 font-bold"
                                            />
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex flex-col items-center py-6 border-b border-border-custom border-dashed mb-6">
                                        <div className="w-48 h-48 bg-white rounded-3xl p-4 flex items-center justify-center border-4 border-gray-200 mb-6 shadow-xl text-black">
                                            <QrCode size={140} />
                                        </div>
                                        
                                        <div className="w-full space-y-1.5">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest ml-1 text-center block">Enter UPI ID / VPA</label>
                                            <div className="relative">
                                                <input 
                                                    type="text" 
                                                    value={upiId}
                                                    onChange={(e) => setUpiId(e.target.value.toLowerCase())}
                                                    required={paymentMethod === 'upi'}
                                                    placeholder="username@okbank"
                                                    className="w-full bg-background border border-border-custom py-4 pl-4 pr-12 rounded-2xl text-lg focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all placeholder:text-gray-600 font-bold text-center"
                                                />
                                                <ShieldCheck className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] uppercase text-gray-500 font-bold tracking-widest text-center mt-6">Scan QR with any UPI App (GPay, PhonePe, Paytm)</p>
                                    </div>
                                )}

                                <button 
                                    type="submit" 
                                    disabled={paymentProcessing}
                                    className="w-full bg-primary hover:bg-black hover:text-primary text-black py-5 rounded-[1.5rem] font-black text-xl uppercase tracking-tighter shadow-xl shadow-primary/20 flex items-center justify-center gap-3 transition-all transform active:scale-[0.98] disabled:opacity-50"
                                >
                                    {paymentProcessing ? (
                                        <>
                                            <Loader2 className="animate-spin" size={24} />
                                            <span>Processing...</span>
                                        </>
                                    ) : (
                                        <>
                                            <span>Pay ₹{booking.totalAmount?.toLocaleString()}</span>
                                            <ArrowRight size={24} />
                                        </>
                                    )}
                                </button>
                                
                                <div className="flex items-center justify-center gap-2 text-[10px] uppercase font-black tracking-widest text-gray-400 mt-2">
                                    <ShieldCheck size={14} className="text-green-500" />
                                    <span>256-bit Encryption Verified</span>
                                </div>
                            </div>
                        </form>
                    </div>

                    {/* Right: Booking Summary Receipt */}
                    <div className="lg:col-span-5">
                         <div className="sticky top-32 space-y-6">
                             <div className="bg-card border border-border-custom rounded-[2.5rem] p-8 shadow-xl relative overflow-hidden">
                                 {/* Receipt Tear Effect */}
                                 <div className="absolute inset-x-0 bottom-0 flex justify-between px-[1rem] translate-y-1/2 z-20 overflow-hidden pointer-events-none opacity-50">
                                     {[...Array(14)].map((_,i) => (
                                         <div key={i} className="w-4 h-4 bg-background rounded-full border border-border-custom" />
                                     ))}
                                 </div>
                                 
                                 <h3 className="text-2xl font-black uppercase tracking-tighter italic border-b border-border-custom pb-6 mb-6 flex items-center gap-3">
                                     <MapPin className="text-primary" />
                                     Order Ledger
                                 </h3>

                                 {booking.destinationId && (
                                     <div className="flex gap-6 items-center mb-8 bg-background/50 p-4 rounded-[1.5rem] border border-white/5">
                                         <img 
                                             src={booking.destinationId.image} 
                                             alt="Destination"
                                             className="w-24 h-24 rounded-xl object-cover"
                                         />
                                         <div className="space-y-1">
                                             <h4 className="font-black text-lg uppercase tracking-tight">{booking.destinationId.name}</h4>
                                             <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">{booking.destinationId.state}</p>
                                         </div>
                                     </div>
                                 )}

                                 <div className="space-y-6 border-b border-white/5 pb-8">
                                     <div className="flex justify-between items-center text-sm">
                                         <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-tight">
                                            <Calendar size={16} /> Date
                                         </div>
                                         <span className="font-bold">{new Date(booking.date).toLocaleDateString()}</span>
                                     </div>
                                     <div className="flex justify-between items-center text-sm">
                                         <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-tight">
                                            <Users size={16} /> Travelers
                                         </div>
                                         <span className="font-bold">{booking.travelers} Persons</span>
                                     </div>
                                     <div className="flex justify-between items-center text-sm">
                                         <div className="flex items-center gap-2 text-gray-400 font-bold uppercase tracking-tight">
                                            <User size={16} /> Guest
                                         </div>
                                         <span className="font-bold">{booking.name}</span>
                                     </div>
                                 </div>

                                 <div className="pt-8">
                                     <div className="flex justify-between items-center">
                                         <span className="text-[10px] uppercase tracking-widest font-black text-gray-500">Total Price</span>
                                         <span className="text-4xl italic font-black text-white tracking-tighter">₹{booking.totalAmount?.toLocaleString()}</span>
                                     </div>
                                     <p className="text-[10px] text-primary/80 uppercase font-black tracking-widest text-right mt-2">Taxes Included</p>
                                 </div>
                             </div>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
