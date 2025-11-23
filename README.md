# Crypto Market Screener

A web-based cryptocurrency market screener that provides real-time market data, filtering, sorting, and search capabilities to help users make informed investment decisions.

![Crypto Market Screener](https://via.placeholder.com/800x400?text=Crypto+Market+Screener)

## Features

- **Real-time Market Data**: Fetches live cryptocurrency data from CoinGecko API
- **Search Functionality**: Real-time search by coin name or symbol (case-insensitive)
- **Advanced Filtering**: Filter by market cap rank (Top 10, Top 50), price movement (Gainers, Losers), or stability (Stablecoins)
- **Column Sorting**: Sort by Market Cap Rank, Price, 24h Change, Volume, or Market Cap
- **Smart Caching**: 60-second cache to prevent API rate limiting
- **Error Handling**: Comprehensive error handling for network issues, rate limiting, and API failures
- **Responsive Design**: Mobile-friendly interface that works on all screen sizes
- **Color-coded Data**: Visual indicators for price changes (green for gains, red for losses)
- **Formatted Numbers**: Human-readable number formatting (K, M, B abbreviations)

## Technologies Used

- **Frontend**: HTML5, CSS3, Vanilla JavaScript (ES6+)
- **API**: [CoinGecko API](https://www.coingecko.com/en/api/documentation) (Free tier, no authentication required)
- **Deployment**: Nginx web servers with HAProxy load balancer

## Local Setup

### Prerequisites

- A modern web browser (Chrome, Firefox, Safari, Edge)
- Python 3 (optional, for local development server)

### Running Locally

1. **Clone or download this repository**

```bash
git clone <repository-url>
cd crypto-market-screener
```

2. **Option 1: Open directly in browser**

Simply open `index.html` in your web browser.

3. **Option 2: Use a local web server (recommended)**

```bash
# Using Python 3
python3 -m http.server 8000

# Using Python 2
python -m SimpleHTTPServer 8000

# Using Node.js (if you have http-server installed)
npx http-server -p 8000
```

4. **Access the application**

Open your browser and navigate to:
- `http://localhost:8000` (if using a web server)
- Or open `index.html` directly

## Deployment

### Server Architecture

The application is designed to be deployed on:
- **Web01** and **Web02**: Nginx web servers hosting the static files
- **Lb01**: HAProxy load balancer distributing traffic between web servers

### Step 1: Deploy to Web Servers (Web01 & Web02)

1. **SSH into each web server**

```bash
ssh user@web01
ssh user@web02
```

2. **Install Nginx (if not already installed)**

```bash
sudo apt update
sudo apt install nginx -y
```

3. **Copy application files**

```bash
# Create application directory
sudo mkdir -p /var/www/crypto-screener

# Copy files (adjust path as needed)
sudo cp -r /path/to/crypto-market-screener/* /var/www/crypto-screener/
```

4. **Configure Nginx**

Create/edit the Nginx configuration file:

```bash
sudo nano /etc/nginx/sites-available/crypto-screener
```

Add the following configuration:

```nginx
server {
    listen 80;
    server_name _;

    root /var/www/crypto-screener;
    index index.html;

    location / {
        try_files $uri $uri/ =404;
    }

    # Cache static assets
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

5. **Enable the site and restart Nginx**

```bash
# Create symbolic link
sudo ln -s /etc/nginx/sites-available/crypto-screener /etc/nginx/sites-enabled/

# Remove default site (optional)
sudo rm /etc/nginx/sites-enabled/default

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

6. **Verify deployment**

```bash
curl http://localhost
```

### Step 2: Configure Load Balancer (Lb01)

1. **SSH into the load balancer**

```bash
ssh user@lb01
```

2. **Install HAProxy**

```bash
sudo apt update
sudo apt install haproxy -y
```

3. **Edit HAProxy configuration**

```bash
sudo nano /etc/haproxy/haproxy.cfg
```

Add the following configuration at the end of the file:

```haproxy
frontend http_front
    bind *:80
    default_backend http_back

backend http_back
    balance roundrobin
    server web01 <WEB01_IP>:80 check
    server web02 <WEB02_IP>:80 check
```

**Note**: Replace `<WEB01_IP>` and `<WEB02_IP>` with the actual IP addresses of your web servers.

4. **Enable and start HAProxy**

```bash
# Enable HAProxy to start on boot
sudo systemctl enable haproxy

# Start HAProxy
sudo systemctl start haproxy

# Check status
sudo systemctl status haproxy
```

5. **Verify load balancing**

```bash
# Test load balancer
curl http://<LB01_IP>

# Check load distribution (should alternate between servers)
for i in {1..10}; do 
    curl -s http://<LB01_IP> | grep -o "Server: web0[12]" || echo "Request $i"
done
```

### Step 3: Testing Deployment

1. **Test individual web servers**

```bash
curl http://<WEB01_IP>
curl http://<WEB02_IP>
```

2. **Test load balancer**

```bash
curl http://<LB01_IP>
```

3. **Access in browser**

Open your browser and navigate to `http://<LB01_IP>` to see the application.

## API Documentation

This application uses the [CoinGecko API](https://www.coingecko.com/en/api/documentation) to fetch cryptocurrency market data.

### Endpoint Used

```
GET https://api.coingecko.com/api/v3/coins/markets
```

### Parameters

- `vs_currency`: USD (default)
- `order`: market_cap_desc
- `per_page`: 100
- `page`: 1
- `sparkline`: false
- `price_change_percentage`: 24h

### Rate Limits

- **Free Tier**: 10-50 calls per minute
- **Caching**: Application implements 60-second cache to prevent rate limiting

### API Attribution

This application is powered by the [CoinGecko API](https://www.coingecko.com). Please refer to their [API Terms](https://www.coingecko.com/en/api_terms) for usage guidelines.

## Project Structure

```
crypto-market-screener/
├── index.html          # Main HTML file
├── css/
│   └── styles.css      # All styling
├── js/
│   ├── app.js          # Main application logic
│   ├── api.js          # API calls and data fetching
│   ├── filters.js      # Filter and search logic
│   ├── sort.js         # Sorting functionality
│   └── utils.js        # Formatting helpers
├── .gitignore          # Git ignore file
├── README.md           # This file
└── deployment/         # Deployment configs (optional)
    ├── nginx.conf      # Nginx configuration
    └── haproxy.cfg     # HAProxy configuration
```

## Usage Guide

### Searching

1. Type in the search box to filter coins by name or symbol
2. Search is case-insensitive and works in real-time
3. Example: Type "bitcoin" or "BTC" to find Bitcoin

### Filtering

Use the filter dropdown to view:
- **All Coins**: Top 100 cryptocurrencies by market cap
- **Top 10**: Top 10 cryptocurrencies
- **Top 50**: Top 50 cryptocurrencies
- **Gainers**: Coins with positive 24h price change
- **Losers**: Coins with negative 24h price change
- **Stablecoins**: Coins with minimal price volatility (±0.5%)

### Sorting

1. Click any column header to sort by that column
2. Click again to toggle between ascending and descending order
3. Sort indicators (↑/↓) show the current sort column and direction

### Refreshing Data

- Click the "Refresh" button to fetch the latest data
- Data is automatically cached for 60 seconds to prevent rate limiting
- The "Last updated" timestamp shows when data was last fetched

## Error Handling

The application handles various error scenarios:

- **Network Errors**: Displays a message when unable to connect to the API
- **Rate Limiting**: Shows a warning when too many requests are made
- **Server Errors**: Handles API server errors gracefully
- **Empty Results**: Shows a message when no coins match search/filter criteria

In case of errors, the application will:
- Display an error banner with a descriptive message
- Provide a "Retry" button to attempt fetching data again
- Use cached data if available (even if expired)

## Browser Compatibility

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## Performance Considerations

- **Caching**: 60-second cache reduces API calls
- **Efficient Rendering**: Only re-renders when data changes
- **Responsive Design**: Optimized for mobile and desktop
- **Lazy Loading**: Can be extended for larger datasets

## Security

- **No API Keys Required**: CoinGecko free tier doesn't require authentication
- **Input Sanitization**: Search input is sanitized to prevent XSS
- **HTTPS Ready**: Can be configured with SSL certificates in production
- **CORS**: CoinGecko API supports cross-origin requests

## Challenges & Solutions

### Challenge 1: API Rate Limiting
**Problem**: CoinGecko free tier has rate limits (10-50 calls/minute).

**Solution**: Implemented 60-second client-side caching to reduce API calls and prevent rate limiting.

### Challenge 2: Real-time Search Performance
**Problem**: Filtering large arrays on every keystroke could cause performance issues.

**Solution**: Used efficient array filtering methods and only re-rendered when necessary.

### Challenge 3: Responsive Table Design
**Problem**: Large tables don't work well on mobile devices.

**Solution**: Implemented horizontal scrolling for tables on mobile while maintaining readability.

### Challenge 4: Error Recovery
**Problem**: Network failures should not break the user experience.

**Solution**: Implemented comprehensive error handling with fallback to cached data and retry mechanisms.

## Future Enhancements

Potential features for future versions:

- [ ] Advanced visualization with sparkline charts
- [ ] Price change heat map
- [ ] LocalStorage caching for offline access
- [ ] Favorite coins/watchlist functionality
- [ ] Price alerts
- [ ] Historical data charts
- [ ] Dark mode theme
- [ ] Export data to CSV
- [ ] Docker containerization
- [ ] Multi-currency support

## Credits

- **CoinGecko API**: [https://www.coingecko.com](https://www.coingecko.com)
- **API Documentation**: [https://www.coingecko.com/en/api/documentation](https://www.coingecko.com/en/api/documentation)

## License

This project is open source and available for educational purposes.

## Demo Video

[Link to 2-minute demo video showcasing features and deployment]

---

**Note**: This application is for informational purposes only and should not be considered as financial advice. Always do your own research before making investment decisions.

