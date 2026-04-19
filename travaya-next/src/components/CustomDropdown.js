"use client";

import React, { useState, useRef, useEffect } from 'react';
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
    const dropdownRef = useRef(null);
    const listRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Auto-scroll to selected item when opening
    useEffect(() => {
        if (isOpen && listRef.current) {
            const selected = listRef.current.querySelector('[data-selected="true"]');
            if (selected) selected.scrollIntoView({ block: 'nearest' });
        }
    }, [isOpen]);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-card/50 backdrop-blur-md border border-border-custom rounded-[2rem] hover:border-primary/50 transition-all font-black uppercase tracking-tighter text-xs"
            >
                <span className="truncate text-left">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`text-gray-500 shrink-0 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div
                    ref={listRef}
                    className={`absolute z-[200] mt-2 ${align === 'right' ? 'right-0' : 'left-0'} w-full bg-card border border-border-custom rounded-2xl shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-200`}
                    style={{ maxHeight: '220px', overflowY: 'auto' }}
                >
                    <div className="p-2 flex flex-col gap-1">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                data-selected={value === opt.value ? "true" : "false"}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] ${
                                    value === opt.value
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-foreground'
                                }`}
                            >
                                <span className="truncate text-left pr-2">{opt.label}</span>
                                {value === opt.value && <Check size={14} className="shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
