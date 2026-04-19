"use client";

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ 
    options,
    value, 
    onChange, 
    placeholder = "Select an option",
    className = "",
    align = "left"
}) {
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownStyle, setDropdownStyle] = useState({});
    const [isMounted, setIsMounted] = useState(false);
    const buttonRef = useRef(null);
    const dropdownRef = useRef(null);

    useEffect(() => { setIsMounted(true); }, []);

    // Position the portal dropdown under the button
    useEffect(() => {
        if (isOpen && buttonRef.current) {
            const rect = buttonRef.current.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            const menuHeight = Math.min(220, spaceBelow - 8);
            setDropdownStyle({
                position: 'fixed',
                top: rect.bottom + window.scrollY + 4,
                left: align === 'right' ? 'auto' : rect.left + window.scrollX,
                right: align === 'right' ? window.innerWidth - rect.right - window.scrollX : 'auto',
                width: rect.width,
                maxHeight: menuHeight,
                overflowY: 'auto',
                zIndex: 9999,
            });
        }
    }, [isOpen, align]);

    // Close on outside click
    useEffect(() => {
        const handleClick = (e) => {
            if (
                buttonRef.current && !buttonRef.current.contains(e.target) &&
                dropdownRef.current && !dropdownRef.current.contains(e.target)
            ) {
                setIsOpen(false);
            }
        };
        const handleScroll = () => setIsOpen(false);
        document.addEventListener('mousedown', handleClick);
        window.addEventListener('scroll', handleScroll, true);
        return () => {
            document.removeEventListener('mousedown', handleClick);
            window.removeEventListener('scroll', handleScroll, true);
        };
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    const menu = isOpen && isMounted ? createPortal(
        <div
            ref={dropdownRef}
            style={dropdownStyle}
            className="bg-card border border-border-custom rounded-2xl shadow-2xl backdrop-blur-xl animate-in zoom-in-95 duration-200"
        >
            <div className="p-2 flex flex-col gap-1">
                {options.map((opt) => (
                    <button
                        key={opt.value}
                        onClick={() => { onChange(opt.value); setIsOpen(false); }}
                        className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] text-left w-full ${
                            value === opt.value
                                ? 'bg-primary/10 text-primary'
                                : 'text-gray-400 hover:bg-white/5 hover:text-foreground'
                        }`}
                    >
                        <span className="truncate text-left pr-2">{opt.label}</span>
                        {value === opt.value && <Check size={14} className="shrink-0 text-primary" />}
                    </button>
                ))}
            </div>
        </div>,
        document.body
    ) : null;

    return (
        <div className={`relative ${className}`}>
            <button
                ref={buttonRef}
                type="button"
                onClick={() => setIsOpen(prev => !prev)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-card/50 backdrop-blur-md border border-border-custom rounded-[2rem] hover:border-primary/50 transition-all font-black uppercase tracking-tighter text-xs"
            >
                <span className="truncate text-left">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {menu}
        </div>
    );
}
