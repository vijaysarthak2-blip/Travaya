"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import {
    Mail, Phone, MapPin, Send,
    MessageSquare, User, CheckCircle2,
    ArrowRight, Loader2, Globe, Share2, Link as LinkIcon, Compass, Sparkles
} from 'lucide-react';

export default function Contact() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 2000));

        setIsSubmitting(false);
        setIsSuccess(true);
        setFormData({ name: '', email: '', subject: '', message: '' });

        // Reset success message after 5 seconds
        setTimeout(() => setIsSuccess(false), 5000);
    };

    const contactInfo = [
        {
            icon: Phone,
            title: "Instant Support",
            detail: "+91 9782344284",
            description: "Dedicated line for active travelers.",
            color: "text-blue-500",
            bg: "bg-blue-500/10",
            border: "group-hover:border-blue-500/30"
        },
        {
            icon: Mail,
            title: "Email Experts",
            detail: "vijaysarthak2@gmail.com",
            description: "Get customized travel itineraries.",
            color: "text-primary",
            bg: "bg-primary/10",
            border: "group-hover:border-primary/30"
        },
        {
            icon: MapPin,
            title: "Global HQ",
            detail: "Jaipur, Rajasthan",
            description: "Visit us at SKIT Campus.",
            color: "text-secondary",
            bg: "bg-secondary/10",
            border: "group-hover:border-secondary/30"
        }
    ];

    const socialLinks = [
        { icon: Share2, href: "#", label: "Instagram" },
        { icon: LinkIcon, href: "#", label: "Twitter" },
        { icon: Globe, href: "#", label: "Facebook" }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            
            {/* Cinematic Adventure Hero */}
            <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 z-0 scale-110 animate-[zoom_20s_ease-in-out_infinite]">
                    <Image 
                        src="/contact-hero.png" 
                        alt="Background" 
                        fill 
                        priority 
                        className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-background" />
                </div>

                <div className="max-w-7xl mx-auto px-6 relative z-10 text-center space-y-6 pb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/20 border border-primary/30 text-primary text-xs font-black uppercase tracking-[0.2em] backdrop-blur-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <MessageSquare size={14} />
                        <span>Get in Touch</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl lg:text-8xl font-black text-white tracking-tighter leading-none animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Let's Plan Your <span className="text-primary italic font-medium">Next Story</span>
                    </h1>
                    <p className="text-gray-300 max-w-xl mx-auto text-lg md:text-xl font-medium leading-relaxed opacity-90 animate-in fade-in slide-in-from-bottom-12 duration-1200">
                        Our world-class travel designers are ready to craft your perfect journey.
                    </p>
                </div>
            </section>

            {/* Info Section - Floating Cards */}
            <section className="relative z-20 -mt-20 px-6 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {contactInfo.map((info, i) => (
                        <div
                            key={i}
                            style={{ animationDelay: `${0.2 * i}s` }}
                            className={`animate-in fade-in slide-in-from-bottom-10 duration-1000 bg-card/80 backdrop-blur-2xl border border-border-custom p-6 md:p-10 rounded-2xl md:rounded-[3rem] shadow-2xl transition-all group hover:-translate-y-2 ${info.border}`}
                        >
                            <div className={`w-16 h-16 ${info.bg} ${info.color} rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-500 shadow-inner`}>
                                <info.icon size={32} />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight mb-2 uppercase">{info.title}</h3>
                            <p className="font-black text-lg mb-2 text-foreground group-hover:text-primary transition-colors">{info.detail}</p>
                            <p className="text-gray-500 text-sm font-bold uppercase tracking-widest">{info.description}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* Core Interaction Section */}
            <section className="py-32 px-6 max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-start">

                    {/* Premium Contact Form */}
                    <div className="animate-in fade-in slide-in-from-left-10 duration-1000">
                        <div className="bg-card border border-border-custom rounded-[2.5rem] md:rounded-[4rem] p-6 md:p-16 shadow-2xl relative overflow-hidden group">
                            {/* Success Overlay */}
                            {isSuccess && (
                                <div className="absolute inset-0 z-20 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-12 text-center animate-in fade-in zoom-in duration-500">
                                    <div className="relative mb-8">
                                        <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center animate-bounce">
                                            <CheckCircle2 size={56} />
                                        </div>
                                        <div className="absolute inset-0 bg-primary/20 blur-3xl animate-pulse" />
                                    </div>
                                    <h2 className="text-4xl font-black tracking-tighter uppercase mb-4">Message <span className="text-primary italic">Sent</span></h2>
                                    <p className="text-gray-500 font-medium leading-relaxed mb-10 text-lg">
                                        Your inquiry has been received. Our concierge will be in contact within 24 hours.
                                    </p>
                                    <button
                                        onClick={() => setIsSuccess(false)}
                                        className="px-10 py-4 bg-primary text-black font-black rounded-22xl hover:bg-primary-dark transition-all shadow-xl active:scale-95 uppercase tracking-tighter"
                                    >
                                        Send Another Request
                                    </button>
                                </div>
                            )}

                            <div className="space-y-12">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.3em]">
                                         <Sparkles size={16} />
                                         <span>Inquiry Form</span>
                                    </div>
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">Send <span className="text-primary italic">Adventure</span> Inquiry</h2>
                                    <p className="text-gray-500 font-medium text-lg">Complete the details below to receive a custom travel quote.</p>
                                </div>

                                <form onSubmit={handleSubmit} className="space-y-8">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Your Name</label>
                                            <div className="relative group">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    required
                                                    type="text"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    placeholder="e.g. Liam Smith"
                                                    className="w-full bg-background border border-border-custom rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold placeholder:text-gray-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Email Address</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" size={20} />
                                                <input
                                                    required
                                                    type="email"
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    placeholder="liam@travel.com"
                                                    className="w-full bg-background border border-border-custom rounded-2xl py-5 pl-16 pr-6 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold placeholder:text-gray-500 transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Travel Subject</label>
                                        <input
                                            required
                                            type="text"
                                            value={formData.subject}
                                            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                                            placeholder="What kind of adventure are you seeking?"
                                            className="w-full bg-background border border-border-custom rounded-2xl py-5 px-8 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold placeholder:text-gray-500 transition-all"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-2">Your Vision</label>
                                        <textarea
                                            required
                                            rows={6}
                                            value={formData.message}
                                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                            placeholder="Tell us about the destinations, style, and vibe you're looking for..."
                                            className="w-full bg-background border border-border-custom rounded-[2.5rem] py-6 px-8 outline-none focus:border-primary focus:ring-8 focus:ring-primary/5 transition-all text-base font-bold resize-none shadow-inner placeholder:text-gray-500 transition-all"
                                        ></textarea>
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-primary hover:bg-primary-dark text-black font-black py-6 rounded-[2rem] shadow-2xl shadow-primary/20 transition-all flex items-center justify-center gap-4 active:scale-[0.98] disabled:opacity-70 group overflow-hidden relative"
                                    >
                                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-500" />
                                        <div className="relative z-10 flex items-center justify-center gap-4 text-xl uppercase tracking-tighter">
                                            {isSubmitting ? (
                                                <>
                                                    <Loader2 className="animate-spin" size={24} />
                                                    <span>Broadcasting Request...</span>
                                                </>
                                            ) : (
                                                <>
                                                    <span>Launch Journey</span>
                                                    <Send size={24} className="group-hover:translate-x-2 group-hover:-translate-y-2 transition-transform duration-500" />
                                                </>
                                            )}
                                        </div>
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>

                    {/* Content Section / Decorative */}
                    <div className="pt-12 space-y-16 animate-in fade-in slide-in-from-right-10 duration-1200">
                        <div className="space-y-8">
                            <h2 className="text-3xl md:text-5xl font-black tracking-tighter italic">Why Choose <span className="text-primary underline decoration-primary/30 underline-offset-8">Travaya?</span></h2>
                            <p className="text-gray-500 text-xl font-medium leading-relaxed max-w-lg">
                                We believe travel is the only thing you buy that makes you richer. 
                                Our mission is to transform your vision into a reality that exceeds your wildest expectations.
                            </p>

                            <div className="grid grid-cols-1 gap-6 pt-4">
                                {[
                                    { text: "Curated itineraries designed by local experts", icon: Compass },
                                    { text: "Dedicated travel concierge available 24/7", icon: Phone },
                                    { text: "Exclusive access to private boutiques & lodges", icon: Sparkles },
                                    { text: "Seamless transitions from lobby to peak", icon: ArrowRight }
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-6 group">
                                        <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-black transition-all duration-500">
                                            <item.icon size={20} />
                                        </div>
                                        <span className="text-base font-black uppercase tracking-tight">{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-10 bg-card border border-border-custom rounded-[3rem] shadow-sm space-y-8 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-colors" />
                            <h3 className="text-2xl font-black uppercase tracking-tighter">Digital Trails</h3>
                            <div className="flex flex-wrap gap-4">
                                {socialLinks.map((social, i) => (
                                    <a
                                        key={i}
                                        href={social.href}
                                        className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-background border border-border-custom hover:border-primary hover:text-primary transition-all font-black text-sm uppercase tracking-tighter group/social"
                                    >
                                        <social.icon size={20} className="group-hover/social:scale-125 transition-transform" />
                                        <span>{social.label}</span>
                                    </a>
                                ))}
                            </div>
                        </div>

                        {/* Branding Element */}
                        <div className="h-64 w-full rounded-[4rem] bg-gradient-to-br from-primary/20 via-primary/5 to-secondary/10 border border-white/10 flex items-center justify-center p-12 text-center relative overflow-hidden group">
                            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
                            <div className="space-y-4 relative z-10 transition-transform duration-700 group-hover:scale-105">
                                <Globe className="text-primary mx-auto opacity-80" size={64} />
                                <div className="space-y-1">
                                    <p className="text-sm font-black uppercase tracking-[0.4em] text-gray-500">Est. 2026</p>
                                    <p className="text-xl font-black uppercase tracking-tighter text-foreground">Beyond the Horizon</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}
