"use client";

import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export default function CustomDropdown({ 
    options, // Array of { value, label }
    value, 
    onChange, 
    placeholder = "Select an option",
    className = "",
    align = "left" // 'left' or 'right'
}) {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedOption = options.find(opt => opt.value === value);

    return (
        <div className={`relative ${className}`} ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between gap-3 px-5 py-3 bg-card/50 backdrop-blur-md border border-border-custom rounded-[2rem] hover:border-primary/50 transition-all font-black uppercase tracking-tighter text-xs"
            >
                <span className="truncate">{selectedOption ? selectedOption.label : placeholder}</span>
                <ChevronDown size={14} className={`text-gray-500 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {isOpen && (
                <div className={`absolute z-50 mt-2 ${align === 'right' ? 'right-0' : 'left-0'} w-full max-h-64 overflow-y-auto bg-card border border-border-custom rounded-2xl shadow-2xl backdrop-blur-3xl animate-in zoom-in-95 duration-200 custom-scrollbar`}>
                    <div className="p-2 flex flex-col gap-1">
                        {options.map((opt) => (
                            <button
                                key={opt.value}
                                onClick={() => {
                                    onChange(opt.value);
                                    setIsOpen(false);
                                }}
                                className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all font-bold uppercase tracking-widest text-[10px] ${
                                    value === opt.value
                                        ? 'bg-primary/10 text-primary'
                                        : 'text-gray-400 hover:bg-white/5 hover:text-white'
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
