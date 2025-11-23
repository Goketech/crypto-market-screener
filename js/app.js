/**
 * Main application logic
 * Manages state, event listeners, and UI updates
 */

// Application state
let allCoins = [];
let filteredCoins = [];
let currentSort = {
    column: 'market_cap_rank',
    direction: 'asc'
};
let currentFilter = 'all';
let searchTerm = '';

// DOM elements
let refreshBtn, refreshIcon, refreshText;
let searchInput, filterSelect, resultsCount;
let tableBody, errorBanner, errorMessage, retryBtn;
let loadingIndicator, lastUpdated, timestamp;
let noResults;

/**
 * Initialize the application
 */
async function init() {
    // Get DOM elements
    refreshBtn = document.getElementById('refreshBtn');
    refreshIcon = document.getElementById('refreshIcon');
    refreshText = document.getElementById('refreshText');
    searchInput = document.getElementById('searchInput');
    filterSelect = document.getElementById('filterSelect');
    resultsCount = document.getElementById('resultsCount');
    tableBody = document.getElementById('tableBody');
    errorBanner = document.getElementById('errorBanner');
    errorMessage = document.getElementById('errorMessage');
    retryBtn = document.getElementById('retryBtn');
    loadingIndicator = document.getElementById('loadingIndicator');
    lastUpdated = document.getElementById('lastUpdated');
    timestamp = document.getElementById('timestamp');
    noResults = document.getElementById('noResults');
    
    // Attach event listeners
    attachEventListeners();
    
    // Load initial data
    await loadData();
}

/**
 * Attach all event listeners
 */
function attachEventListeners() {
    // Refresh button
    refreshBtn.addEventListener('click', handleRefresh);
    
    // Search input
    searchInput.addEventListener('input', handleSearch);
    
    // Filter select
    filterSelect.addEventListener('change', handleFilterChange);
    
    // Retry button
    retryBtn.addEventListener('click', handleRetry);
    
    // Sortable column headers
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const column = header.getAttribute('data-column');
            handleSort(column);
        });
    });
    
    // Listen for API errors
    window.addEventListener('apiError', handleApiErrorEvent);
}

/**
 * Load data from API
 * @param {boolean} forceRefresh - Force refresh even if cache is valid
 */
async function loadData(forceRefresh = false) {
    showLoading();
    hideError();
    
    const data = await fetchMarketData(forceRefresh);
    
    if (data && data.length > 0) {
        allCoins = data;
        updateTimestamp();
        applyFiltersAndSort();
    } else if (data === null && allCoins.length === 0) {
        // No data and no cache - show error
        showError('Unable to load cryptocurrency data. Please check your connection and try again.');
        tableBody.innerHTML = '<tr><td colspan="6" class="empty-state">No data available</td></tr>';
    } else if (allCoins.length > 0) {
        // Use existing data if API fails but we have cached data
        applyFiltersAndSort();
    }
    
    hideLoading();
}

/**
 * Handle refresh button click
 */
async function handleRefresh() {
    await loadData(true);
}

/**
 * Handle search input change
 */
function handleSearch() {
    searchTerm = searchInput.value;
    applyFiltersAndSort();
}

/**
 * Handle filter dropdown change
 */
function handleFilterChange() {
    currentFilter = filterSelect.value;
    applyFiltersAndSort();
}

/**
 * Handle sort column click
 * @param {string} column - Column name to sort by
 */
function handleSort(column) {
    if (currentSort.column === column) {
        // Toggle direction if same column
        currentSort.direction = toggleSortDirection(currentSort.direction);
    } else {
        // New column, default to ascending
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    
    applyFiltersAndSort();
}

/**
 * Handle retry button click
 */
async function handleRetry() {
    await loadData(true);
}

/**
 * Handle API error event
 * @param {CustomEvent} event - Error event
 */
function handleApiErrorEvent(event) {
    const errorInfo = event.detail;
    showError(errorInfo.message);
}

/**
 * Apply filters and sort, then render
 */
function applyFiltersAndSort() {
    // Apply filters
    filteredCoins = applyAllFilters(allCoins, searchTerm, currentFilter);
    
    // Apply sorting
    filteredCoins = sortCoins(
        filteredCoins,
        currentSort.column,
        currentSort.direction
    );
    
    // Update sort indicators
    updateSortIndicators(currentSort.column, currentSort.direction);
    
    // Render table
    renderTable(filteredCoins);
    
    // Update results count
    updateResultsCount(filteredCoins.length);
}

/**
 * Render the cryptocurrency table
 * @param {Array} coins - Array of coin objects to display
 */
function renderTable(coins) {
    if (!coins || coins.length === 0) {
        tableBody.innerHTML = '';
        noResults.classList.remove('hidden');
        return;
    }
    
    noResults.classList.add('hidden');
    
    tableBody.innerHTML = coins.map(coin => {
        const change = coin.price_change_percentage_24h;
        const changeClass = getPriceChangeClass(change);
        const changeFormatted = formatPercentage(change);
        
        return `
            <tr>
                <td>${coin.market_cap_rank || '-'}</td>
                <td>
                    <div class="coin-info">
                        <div>
                            <div class="coin-name">${sanitizeInput(coin.name || 'Unknown')}</div>
                            <div class="coin-symbol">${sanitizeInput(coin.symbol || 'N/A')}</div>
                        </div>
                    </div>
                </td>
                <td>${formatCurrency(coin.current_price)}</td>
                <td class="${changeClass}">${changeFormatted}</td>
                <td>${formatLargeNumber(coin.total_volume)}</td>
                <td>${formatLargeNumber(coin.market_cap)}</td>
            </tr>
        `;
    }).join('');
}

/**
 * Update results count display
 * @param {number} count - Number of results
 */
function updateResultsCount(count) {
    resultsCount.textContent = `${count} ${count === 1 ? 'result' : 'results'}`;
}

/**
 * Update last updated timestamp
 */
function updateTimestamp() {
    const now = new Date();
    timestamp.textContent = formatTimestamp(now);
}

/**
 * Show loading indicator
 */
function showLoading() {
    loadingIndicator.classList.remove('hidden');
    refreshBtn.disabled = true;
    refreshIcon.textContent = '⏳';
}

/**
 * Hide loading indicator
 */
function hideLoading() {
    loadingIndicator.classList.add('hidden');
    refreshBtn.disabled = false;
    refreshIcon.textContent = '🔄';
}

/**
 * Show error banner
 * @param {string} message - Error message to display
 */
function showError(message) {
    errorMessage.textContent = message;
    errorBanner.classList.remove('hidden');
}

/**
 * Hide error banner
 */
function hideError() {
    errorBanner.classList.add('hidden');
}

// Initialize app when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
} else {
    init();
}

