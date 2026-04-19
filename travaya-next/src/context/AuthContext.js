"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { API_BASE } from '../config';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(true);
    const [theme, setTheme] = useState('light');
    const [wishlist, setWishlist] = useState([]);
    const pathname = usePathname();

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('authToken');
        const storedTheme = localStorage.getItem('theme') || 'light';
        const storedWishlist = localStorage.getItem('travaya_wishlist');

        if (storedUser && storedToken) {
            try {
                setUser(JSON.parse(storedUser));
                setToken(storedToken);
            } catch (e) {
                console.error("Failed to parse stored user", e);
            }
        }

        if (storedWishlist) {
            try { setWishlist(JSON.parse(storedWishlist)); } catch (e) {}
        }

        setTheme(storedTheme);
        document.documentElement.classList.toggle('dark', storedTheme === 'dark');
        setLoading(false);
    }, []);

    // Re-assert dark mode forcefully on route changes to survive Next.js BF-cache wipes
    useEffect(() => {
        if (!loading) {
            document.documentElement.classList.toggle('dark', theme === 'dark');
        }
    }, [pathname, theme, loading]);

    const login = (userData, authToken) => {
        setUser(userData);
        setToken(authToken);
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('authToken', authToken);
        localStorage.setItem('isLoggedIn', 'true');
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        localStorage.removeItem('user');
        localStorage.removeItem('authToken');
        localStorage.removeItem('isLoggedIn');
        window.location.href = '/';
    };

    const toggleTheme = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        localStorage.setItem('theme', newTheme);
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
    };

    // Wishlist: stores destination objects { id, name, state, price, image }
    const toggleWishlist = useCallback((dest) => {
        setWishlist(prev => {
            const exists = prev.some(d => d.id === dest.id);
            const updated = exists
                ? prev.filter(d => d.id !== dest.id)
                : [...prev, dest];
            localStorage.setItem('travaya_wishlist', JSON.stringify(updated));
            return updated;
        });
    }, []);

    const isWishlisted = useCallback((id) => {
        return wishlist.some(d => d.id === id);
    }, [wishlist]);

    return (
        <AuthContext.Provider value={{ user, token, loading, login, logout, theme, toggleTheme, wishlist, toggleWishlist, isWishlisted }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
