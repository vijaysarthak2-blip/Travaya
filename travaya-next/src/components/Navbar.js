"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    Menu, X, Home, Map, Umbrella, Phone,
    Moon, Sun, User as UserIcon, LogOut, Settings, LayoutDashboard
} from "lucide-react";
import { useAuth } from "../context/AuthContext";

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, logout, theme, toggleTheme } = useAuth();
    const pathname = usePathname();

    const isHeroPage = pathname === "/" || pathname === "/packages" || pathname.startsWith("/packages/");

    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close menu on route change
    useEffect(() => {
        setIsMenuOpen(false);
    }, [pathname]);

    // Prevent body scroll when menu open
    useEffect(() => {
        if (isMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => { document.body.style.overflow = ""; };
    }, [isMenuOpen]);

    const navLinks = [
        { name: "Home", href: "/", icon: Home },
        { name: "Tours", href: "/packages", icon: Umbrella },
        { name: "Contact", href: "/contact", icon: Phone },
    ];

    const isActive = (href) => pathname === href;

    return (
        <>
            {/* Navbar */}
            <nav
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 px-6 py-4 border-b ${isScrolled
                    ? "bg-card/80 backdrop-blur-xl shadow-2xl shadow-black/20 border-border-custom/40"
                    : "bg-transparent border-white/0"
                    }`}
            >
                <div className="w-full flex justify-between items-center">
                    {/* Brand */}
                    <Link href="/" className="text-2xl font-bold text-primary tracking-tighter hover:opacity-80 transition-opacity z-50 relative">
                        Travaya
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex items-center gap-6">
                            {navLinks.map((link) => {
                                const Icon = link.icon;
                                return (
                                    <Link
                                        key={link.name}
                                        href={link.href}
                                        className={`flex items-center gap-2 text-sm font-medium transition-colors ${isActive(link.href)
                                            ? "text-primary"
                                            : (theme === "dark" || (!isScrolled && isHeroPage))
                                                ? "text-white/90 hover:text-primary"
                                                : "text-foreground/80 hover:text-primary"
                                            }`}
                                    >
                                        <Icon size={16} />
                                        <span>{link.name}</span>
                                    </Link>
                                );
                            })}
                        </div>

                        <div className={`flex items-center gap-4 border-l pl-6 transition-colors ${isScrolled ? "border-border-custom" : "border-white/20"}`}>
                            <button
                                onClick={toggleTheme}
                                className={`p-2 transition-colors ${(theme === "dark" || (!isScrolled && isHeroPage)) ? "text-white/80 hover:text-primary" : "text-foreground/80 hover:text-primary"}`}
                                aria-label="Toggle Theme"
                            >
                                {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                            </button>

                            {user ? (
                                <div className="group relative">
                                    <button className={`flex items-center gap-2 transition-colors ${(theme === "dark" || (!isScrolled && isHeroPage)) ? "text-white/80 hover:text-primary" : "text-foreground/80 hover:text-primary"}`}>
                                        <UserIcon size={20} />
                                        <span className="text-sm font-medium">{user.fullName?.split(' ')[0]}</span>
                                    </button>
                                    <div className="absolute right-0 mt-2 w-48 bg-card border border-border-custom rounded-xl shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                                        <div className="p-2 space-y-1">
                                            {user.role === 'admin' && (
                                                <Link href="/admin" className="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                                                    <LayoutDashboard size={16} />
                                                    <span>Admin Panel</span>
                                                </Link>
                                            )}
                                            <Link href="/profile" className="flex items-center gap-2 p-2 text-sm text-foreground hover:bg-primary/10 hover:text-primary rounded-lg transition-colors">
                                                <Settings size={16} />
                                                <span>My Account</span>
                                            </Link>
                                            <button
                                                onClick={logout}
                                                className="w-full flex items-center gap-2 p-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                            >
                                                <LogOut size={16} />
                                                <span>Logout</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <Link
                                    href="/login"
                                    className="bg-primary hover:bg-primary-dark text-black px-5 py-2 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
                                >
                                    Login
                                </Link>
                            )}
                        </div>
                    </div>

                    {/* Mobile Hamburger */}
                    <button
                        onClick={() => setIsMenuOpen(true)}
                        className={`md:hidden relative z-50 p-2 transition-colors ${(theme === "dark" || (!isScrolled && isHeroPage)) ? "text-white" : "text-foreground"} hover:text-primary`}
                        aria-label="Open Menu"
                    >
                        <Menu size={28} />
                    </button>
                </div>
            </nav>

            {/* Mobile Full-Screen Drawer Overlay */}
            {/* Backdrop */}
            <div
                onClick={() => setIsMenuOpen(false)}
                className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity duration-300 md:hidden ${isMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
                    }`}
            />

            {/* Drawer Panel */}
            <div
                className={`fixed top-0 right-0 bottom-0 z-[70] w-4/5 max-w-xs flex flex-col transition-transform duration-300 ease-out md:hidden bg-card ${isMenuOpen ? "translate-x-0" : "translate-x-full"
                    }`}
            >
                {/* Drawer Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-border-custom/50">
                    <Link href="/" onClick={() => setIsMenuOpen(false)} className="text-xl font-bold text-primary tracking-tighter">
                        Travaya
                    </Link>
                    <button
                        onClick={() => setIsMenuOpen(false)}
                        className="p-2 text-foreground/60 hover:text-primary transition-colors"
                        aria-label="Close Menu"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Nav Links */}
                <div className="flex flex-col gap-1 p-4 flex-1 overflow-y-auto">
                    {navLinks.map((link) => {
                        const Icon = link.icon;
                        const active = isActive(link.href);
                        return (
                            <Link
                                key={link.name}
                                href={link.href}
                                onClick={() => setIsMenuOpen(false)}
                                className={`flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-semibold transition-all ${active
                                    ? "bg-primary text-black"
                                    : "text-foreground/80 hover:bg-primary/10 hover:text-primary"
                                    }`}
                            >
                                <Icon size={22} />
                                <span>{link.name}</span>
                            </Link>
                        );
                    })}

                    {/* Divider */}
                    <div className="my-3 border-t border-border-custom/50" />

                    {user ? (
                        <>
                            {user.role === 'admin' && (
                                <Link
                                    href="/admin"
                                    onClick={() => setIsMenuOpen(false)}
                                    className="flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-semibold text-primary hover:bg-primary/10 transition-all"
                                >
                                    <LayoutDashboard size={22} />
                                    <span>Admin Panel</span>
                                </Link>
                            )}
                            <Link
                                href="/profile"
                                onClick={() => setIsMenuOpen(false)}
                                className="flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-semibold text-foreground/80 hover:bg-primary/10 hover:text-primary transition-all"
                            >
                                <Settings size={22} />
                                <span>My Account</span>
                            </Link>
                        </>
                    ) : (
                        <Link
                            href="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="flex items-center gap-4 px-4 py-4 rounded-2xl text-base font-semibold text-primary hover:bg-primary/10 transition-all"
                        >
                            <UserIcon size={22} />
                            <span>Login / Register</span>
                        </Link>
                    )}
                </div>

                {/* Drawer Footer */}
                <div className="px-6 py-5 border-t border-border-custom flex items-center justify-between bg-background/50">
                    <div className="flex flex-col">
                        {user ? (
                            <>
                                <span className="text-sm font-bold text-foreground">{user.fullName}</span>
                                <span className="text-xs text-foreground/50">{user.email}</span>
                            </>
                        ) : (
                            <span className="text-sm text-foreground/40">Not signed in</span>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={toggleTheme}
                            className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
                        >
                            {theme === "dark" ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        {user && (
                            <button
                                onClick={() => { setIsMenuOpen(false); logout(); }}
                                className="p-2.5 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                            >
                                <LogOut size={20} />
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default Navbar;
