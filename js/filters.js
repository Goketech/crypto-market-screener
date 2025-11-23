/**
 * Filter functionality for cryptocurrency data
 * Handles search, category filters, and combination of both
 */

/**
 * Apply category filter to coins array
 * @param {Array} coins - Array of coin objects
 * @param {string} filter - Filter type ('all', 'top10', 'top50', 'gainers', 'losers', 'stablecoins')
 * @returns {Array} Filtered array of coins
 */
function applyCategoryFilter(coins, filter) {
    if (!Array.isArray(coins)) {
        return [];
    }
    
    switch(filter) {
        case 'top10':
            return coins.filter(coin => coin.market_cap_rank <= 10);
        
        case 'top50':
            return coins.filter(coin => coin.market_cap_rank <= 50);
        
        case 'gainers':
            return coins.filter(coin => 
                coin.price_change_percentage_24h !== null && 
                coin.price_change_percentage_24h > 0
            );
        
        case 'losers':
            return coins.filter(coin => 
                coin.price_change_percentage_24h !== null && 
                coin.price_change_percentage_24h < 0
            );
        
        case 'stablecoins':
            return coins.filter(coin => {
                const change = coin.price_change_percentage_24h;
                return change !== null && Math.abs(change) <= 0.5;
            });
        
        case 'all':
        default:
            return coins;
    }
}

/**
 * Apply search filter to coins array
 * Searches by coin name or symbol (case-insensitive)
 * @param {Array} coins - Array of coin objects
 * @param {string} searchTerm - Search query
 * @returns {Array} Filtered array of coins
 */
function applySearchFilter(coins, searchTerm) {
    if (!Array.isArray(coins)) {
        return [];
    }
    
    if (!searchTerm || searchTerm.trim() === '') {
        return coins;
    }
    
    const term = searchTerm.toLowerCase().trim();
    
    return coins.filter(coin => {
        const name = (coin.name || '').toLowerCase();
        const symbol = (coin.symbol || '').toLowerCase();
        
        return name.includes(term) || symbol.includes(term);
    });
}

/**
 * Apply both search and category filters
 * @param {Array} coins - Array of coin objects
 * @param {string} searchTerm - Search query
 * @param {string} categoryFilter - Category filter type
 * @returns {Array} Filtered array of coins
 */
function applyAllFilters(coins, searchTerm, categoryFilter) {
    if (!Array.isArray(coins)) {
        return [];
    }
    
    // First apply category filter
    let filtered = applyCategoryFilter(coins, categoryFilter);
    
    // Then apply search filter
    filtered = applySearchFilter(filtered, searchTerm);
    
    return filtered;
}

