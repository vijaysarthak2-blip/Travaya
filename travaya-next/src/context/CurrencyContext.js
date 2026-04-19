"use client";

import React, { createContext, useContext, useState, useMemo } from 'react';

const CurrencyContext = createContext();

export const CURRENCIES = {
    INR: { symbol: '₹', code: 'INR', rate: 1 },
    USD: { symbol: '$', code: 'USD', rate: 0.012 }, // Mock live rate
    EUR: { symbol: '€', code: 'EUR', rate: 0.011 },
    GBP: { symbol: '£', code: 'GBP', rate: 0.0095 },
};

export function CurrencyProvider({ children }) {
    const [currency, setCurrency] = useState('INR');

    const formatPrice = (priceInINR) => {
        if (!priceInINR && priceInINR !== 0) return '';
        const currentCurrency = CURRENCIES[currency];
        const converted = priceInINR * currentCurrency.rate;
        
        return `${currentCurrency.symbol}${converted.toLocaleString(undefined, { 
            minimumFractionDigits: currency === 'INR' ? 0 : 2,
            maximumFractionDigits: currency === 'INR' ? 0 : 2 
        })}`;
    };

    const value = useMemo(() => ({
        currency,
        setCurrency,
        formatPrice,
        currencyDetails: CURRENCIES[currency]
    }), [currency]);

    return (
        <CurrencyContext.Provider value={value}>
            {children}
        </CurrencyContext.Provider>
    );
}

export const useCurrency = () => {
    const context = useContext(CurrencyContext);
    if (context === undefined) {
        throw new Error('useCurrency must be used within a CurrencyProvider');
    }
    return context;
};
