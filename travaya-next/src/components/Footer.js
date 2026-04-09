import React from 'react';
import Link from 'next/link';
import { MessageCircle, Send, Camera, Mail, MapPin, Phone } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-[#1a1a1a] text-white pt-16 pb-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-16">
                    {/* Brand Section */}
                    <div className="space-y-6">
                        <Link href="/" className="text-3xl font-bold text-primary tracking-tighter">
                            Travaya
                        </Link>
                        <p className="text-gray-400 leading-relaxed max-w-sm">
                            Discover amazing travel destinations across the globe.
                            Your journey begins with us, exploring the unseen beauty of nature.
                        </p>
                        <div className="flex gap-4">
                            {[
                                { Icon: MessageCircle, href: "#", delay: "0s" },
                                { Icon: Send, href: "#", delay: "0.2s" },
                                { Icon: Camera, href: "#", delay: "0.4s" }
                            ].map(({ Icon, href, delay }, index) => (
                                <a
                                    key={index}
                                    href={href}
                                    style={{ animationDelay: delay }}
                                    className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center hover:bg-primary hover:text-black transition-all transform hover:-translate-y-1 animate-footer-float"
                                >
                                    <Icon size={20} />
                                </a>
                            ))}
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 text-primary">Quick Links</h3>
                        <ul className="space-y-4">
                            <li><Link href="/" className="text-gray-400 hover:text-primary transition-colors">Home</Link></li>
                            <li><Link href="/packages" className="text-gray-400 hover:text-primary transition-colors">Tours</Link></li>
                            <li><Link href="/destinations" className="text-gray-400 hover:text-primary transition-colors">Destinations</Link></li>
                            <li><Link href="/contact" className="text-gray-400 hover:text-primary transition-colors">Contact us</Link></li>
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 text-primary">Support</h3>
                        <ul className="space-y-4">
                            <li><Link href="/faq" className="text-gray-400 hover:text-primary transition-colors">FAQs</Link></li>
                            <li><Link href="/privacy" className="text-gray-400 hover:text-primary transition-colors">Privacy Policy</Link></li>
                            <li><Link href="/terms" className="text-gray-400 hover:text-primary transition-colors">Terms of Service</Link></li>
                            <li><Link href="/help" className="text-gray-400 hover:text-primary transition-colors">Help Center</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div>
                        <h3 className="text-xl font-bold mb-6 text-primary">Reach Us</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3">
                                <MapPin className="text-primary mt-1 shrink-0" size={18} />
                                <span className="text-gray-400">Swami Keshwanand Institute of Technology, Jaipur

                                    Rajasthan,India</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Phone className="text-primary shrink-0" size={18} />
                                <span className="text-gray-400">+91 9782344284</span>
                            </li>
                            <li className="flex items-center gap-3">
                                <Mail className="text-primary shrink-0" size={18} />
                                <span className="text-gray-400">vijaysarthak2@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-gray-500">
                    <p>© 2026 Travaya. All rights reserved.</p>
                    <p>Designed with ❤️ for Travelers</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
