// Mobile number validation and formatting utilities

export const formatMobileNumber = (value) => {
    // Remove all non-digit characters except + for country code
    let cleaned = value.replace(/[^\d+]/g, '');
    
    // If no country code, add +91 (India) as default
    if (!cleaned.startsWith('+') && cleaned.length === 10) {
        cleaned = '+91' + cleaned;
    }
    
    // Format for display: +91 XXXXX XXXXX
    if (cleaned.startsWith('+91') && cleaned.length === 13) {
        return cleaned.replace(/^(\+91)(\d{5})(\d{5})$/, '$1 $2 $3');
    }
    
    // General formatting: +XXX XXX XXX XXXX
    if (cleaned.startsWith('+') && cleaned.length >= 12) {
        const countryCode = cleaned.substring(0, 4);
        const remaining = cleaned.substring(4);
        return countryCode + ' ' + remaining.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
    }
    
    return cleaned;
};

export const validateMobileNumber = (mobile) => {
    if (!mobile) return { isValid: false, error: 'Mobile number is required' };
    
    // Remove formatting for validation
    const cleaned = mobile.replace(/[^\d+]/g, '');
    
    // Check if it starts with + and has valid length
    if (!cleaned.startsWith('+')) {
        return { isValid: false, error: 'Please include country code (e.g., +91)' };
    }
    
    // Remove country code for digit count check
    const digitsOnly = cleaned.replace(/^\+/, '');
    
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
        return { isValid: false, error: 'Mobile number must be 10-15 digits' };
    }
    
    // Check if all remaining characters are digits
    if (!/^\d+$/.test(digitsOnly)) {
        return { isValid: false, error: 'Invalid mobile number format' };
    }
    
    return { isValid: true, error: null };
};

export const normalizeMobileNumber = (mobile) => {
    // Remove all formatting for storage
    return mobile.replace(/[^\d+]/g, '');
};

export const maskMobileNumber = (mobile) => {
    const cleaned = mobile.replace(/[^\d+]/g, '');
    if (cleaned.length <= 6) return cleaned;
    
    // Show first 3 and last 2 digits, mask the rest
    const countryCode = cleaned.match(/^\+\d+/)?.[0] || '+';
    const digitsOnly = cleaned.replace(/^\+\d+/, '');
    
    if (digitsOnly.length <= 5) {
        return cleaned;
    }
    
    const firstThree = digitsOnly.substring(0, 3);
    const lastTwo = digitsOnly.substring(digitsOnly.length - 2);
    const maskedLength = digitsOnly.length - 5;
    const masked = '*'.repeat(maskedLength);
    
    return countryCode + firstThree + masked + lastTwo;
};
