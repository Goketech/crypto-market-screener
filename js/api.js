/**
 * API integration with CoinGecko
 * Handles data fetching, caching, and error handling
 */

const API_BASE_URL = 'https://api.coingecko.com/api/v3/coins/markets';
const CACHE_DURATION = 60000; // 60 seconds in milliseconds

let cachedData = null;
let cacheTimestamp = null;

/**
 * Build API URL with parameters
 * @returns {string} Complete API URL
 */
function buildApiUrl() {
    const params = new URLSearchParams({
        vs_currency: 'usd',
        order: 'market_cap_desc',
        per_page: 100,
        page: 1,
        sparkline: false,
        price_change_percentage: '24h'
    });
    
    return `${API_BASE_URL}?${params.toString()}`;
}

/**
 * Check if cached data is still valid
 * @returns {boolean} True if cache is valid
 */
function isCacheValid() {
    if (!cachedData || !cacheTimestamp) {
        return false;
    }
    
    const now = Date.now();
    return (now - cacheTimestamp) < CACHE_DURATION;
}

/**
 * Get cached data if valid
 * @returns {Array|null} Cached coin data or null
 */
function getCachedData() {
    if (isCacheValid()) {
        return cachedData;
    }
    return null;
}

/**
 * Set cached data with timestamp
 * @param {Array} data - Coin data to cache
 */
function setCachedData(data) {
    cachedData = data;
    cacheTimestamp = Date.now();
}

/**
 * Handle API errors and return appropriate error message
 * @param {Error} error - Error object
 * @param {Response|null} response - Fetch response object
 * @returns {Object} Error object with type and message
 */
function handleApiError(error, response = null) {
    if (response) {
        if (response.status === 429) {
            return {
                type: 'rateLimited',
                message: 'Too many requests. Please wait a moment and try again.'
            };
        } else if (response.status >= 500) {
            return {
                type: 'serverError',
                message: 'CoinGecko API is currently unavailable. Please try again later.'
            };
        } else if (response.status >= 400) {
            return {
                type: 'clientError',
                message: 'Invalid request. Please try again.'
            };
        }
    }
    
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
        return {
            type: 'networkError',
            message: 'Unable to connect to CoinGecko. Please check your internet connection.'
        };
    }
    
    return {
        type: 'unknownError',
        message: 'An unexpected error occurred. Please try again.'
    };
}

/**
 * Fetch market data from CoinGecko API
 * @param {boolean} forceRefresh - Force refresh even if cache is valid
 * @returns {Promise<Array|null>} Array of coin data or null on error
 */
async function fetchMarketData(forceRefresh = false) {
    // Check cache first if not forcing refresh
    if (!forceRefresh) {
        const cached = getCachedData();
        if (cached) {
            return cached;
        }
    }
    
    try {
        const url = buildApiUrl();
        const response = await fetch(url);
        
        if (!response.ok) {
            const error = new Error(`HTTP ${response.status}`);
            throw { error, response };
        }
        
        const data = await response.json();
        
        // Validate response structure
        if (!Array.isArray(data)) {
            throw {
                error: new Error('Invalid response format'),
                response: null
            };
        }
        
        // Cache the data
        setCachedData(data);
        
        return data;
    } catch (err) {
        // Handle different error types
        const errorInfo = err.error ? handleApiError(err.error, err.response) : handleApiError(err);
        
        // Dispatch error event for app.js to handle
        window.dispatchEvent(new CustomEvent('apiError', {
            detail: errorInfo
        }));
        
        // Return cached data if available, even if expired
        if (cachedData) {
            console.warn('Using expired cache due to API error:', errorInfo.message);
            return cachedData;
        }
        
        return null;
    }
}

/**
 * Clear the cache
 */
function clearCache() {
    cachedData = null;
    cacheTimestamp = null;
}

