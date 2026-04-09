"use client";

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';

export default function ConfirmDialog({ isOpen, title, message, onConfirm, onCancel, confirmText = 'Delete', confirmClass = 'bg-red-500 hover:bg-red-600 text-white' }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="w-full max-w-sm bg-card border border-border-custom rounded-3xl shadow-2xl p-6 space-y-5">
                <div className="flex items-start gap-4">
                    <div className="p-2 bg-red-500/10 rounded-xl shrink-0">
                        <AlertTriangle className="text-red-500" size={22} />
                    </div>
                    <div className="space-y-1 flex-1">
                        <h3 className="font-bold text-base">{title}</h3>
                        <p className="text-sm text-gray-400">{message}</p>
                    </div>
                    <button onClick={onCancel} className="text-gray-400 hover:text-foreground shrink-0">
                        <X size={18} />
                    </button>
                </div>
                <div className="flex justify-end gap-3 pt-2">
                    <button
                        onClick={onCancel}
                        className="px-5 py-2.5 rounded-xl text-sm font-bold border border-border-custom hover:bg-background transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-colors ${confirmClass}`}
                    >
                        {confirmText}
                    </button>
                </div>
            </div>
        </div>
    );
}
