/**
 * Sorting functionality for cryptocurrency data
 * Handles column sorting with ascending/descending toggle
 */

/**
 * Sort array of coins by specified column and direction
 * @param {Array} coins - Array of coin objects
 * @param {string} column - Column name to sort by
 * @param {string} direction - Sort direction ('asc' or 'desc')
 * @returns {Array} Sorted array of coins
 */
function sortCoins(coins, column, direction) {
    if (!Array.isArray(coins)) {
        return [];
    }
    
    // Create a copy to avoid mutating the original array
    const sorted = [...coins];
    
    sorted.sort((a, b) => {
        let aValue = a[column];
        let bValue = b[column];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) {
            aValue = direction === 'asc' ? Infinity : -Infinity;
        }
        if (bValue === null || bValue === undefined) {
            bValue = direction === 'asc' ? Infinity : -Infinity;
        }
        
        // Numeric comparison
        if (typeof aValue === 'number' && typeof bValue === 'number') {
            return direction === 'asc' ? aValue - bValue : bValue - aValue;
        }
        
        // String comparison
        if (typeof aValue === 'string' && typeof bValue === 'string') {
            const comparison = aValue.localeCompare(bValue);
            return direction === 'asc' ? comparison : -comparison;
        }
        
        // Fallback: convert to string and compare
        const aStr = String(aValue);
        const bStr = String(bValue);
        const comparison = aStr.localeCompare(bStr);
        return direction === 'asc' ? comparison : -comparison;
    });
    
    return sorted;
}

/**
 * Toggle sort direction
 * @param {string} currentDirection - Current sort direction
 * @returns {string} New sort direction
 */
function toggleSortDirection(currentDirection) {
    return currentDirection === 'asc' ? 'desc' : 'asc';
}

/**
 * Update sort indicators in table header
 * @param {string} activeColumn - Currently active column
 * @param {string} direction - Sort direction
 */
function updateSortIndicators(activeColumn, direction) {
    // Remove all active indicators
    const indicators = document.querySelectorAll('.sort-indicator');
    indicators.forEach(indicator => {
        indicator.classList.remove('active', 'asc', 'desc');
    });
    
    // Add active indicator to current column
    if (activeColumn) {
        const header = document.querySelector(`th[data-column="${activeColumn}"]`);
        if (header) {
            const indicator = header.querySelector('.sort-indicator');
            if (indicator) {
                indicator.classList.add('active', direction);
            }
        }
    }
}

