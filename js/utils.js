/**
 * Utility functions for formatting numbers and data
 */

/**
 * Format a number as currency (USD)
 * @param {number} value - The number to format
 * @returns {string} Formatted currency string
 */
function formatCurrency(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '$0.00';
    }
    
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    }).format(value);
}

/**
 * Format large numbers with abbreviations (K, M, B)
 * @param {number} value - The number to format
 * @returns {string} Formatted string with abbreviation
 */
function formatLargeNumber(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '$0';
    }
    
    const absValue = Math.abs(value);
    
    if (absValue >= 1e9) {
        return '$' + (value / 1e9).toFixed(2) + 'B';
    } else if (absValue >= 1e6) {
        return '$' + (value / 1e6).toFixed(2) + 'M';
    } else if (absValue >= 1e3) {
        return '$' + (value / 1e3).toFixed(2) + 'K';
    } else {
        return formatCurrency(value);
    }
}

/**
 * Format percentage with sign
 * @param {number} value - The percentage value
 * @returns {string} Formatted percentage string with + or - sign
 */
function formatPercentage(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return '0.00%';
    }
    
    const sign = value >= 0 ? '+' : '';
    return sign + value.toFixed(2) + '%';
}

/**
 * Get CSS class for price change based on value
 * @param {number} value - The price change percentage
 * @returns {string} CSS class name
 */
function getPriceChangeClass(value) {
    if (value === null || value === undefined || isNaN(value)) {
        return 'price-neutral';
    }
    
    if (value > 0) {
        return 'price-positive';
    } else if (value < 0) {
        return 'price-negative';
    } else {
        return 'price-neutral';
    }
}

/**
 * Format timestamp to readable date/time string
 * @param {Date} date - Date object
 * @returns {string} Formatted date/time string
 */
function formatTimestamp(date) {
    if (!date || !(date instanceof Date)) {
        return 'Never';
    }
    
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
}

/**
 * Sanitize user input to prevent XSS
 * @param {string} input - User input string
 * @returns {string} Sanitized string
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') {
        return '';
    }
    
    const div = document.createElement('div');
    div.textContent = input;
    return div.innerHTML;
}

