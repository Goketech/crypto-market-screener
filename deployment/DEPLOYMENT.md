# Quick Deployment Reference

## Web Server Setup (Web01 & Web02)

```bash
# 1. Install Nginx
sudo apt update && sudo apt install nginx -y

# 2. Create directory and copy files
sudo mkdir -p /var/www/crypto-screener
sudo cp -r /path/to/crypto-market-screener/* /var/www/crypto-screener/

# 3. Copy Nginx config
sudo cp deployment/nginx.conf /etc/nginx/sites-available/crypto-screener

# 4. Enable site
sudo ln -s /etc/nginx/sites-available/crypto-screener /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Optional: remove default

# 5. Test and restart
sudo nginx -t
sudo systemctl restart nginx

# 6. Verify
curl http://localhost
```

## Load Balancer Setup (Lb01)

```bash
# 1. Install HAProxy
sudo apt update && sudo apt install haproxy -y

# 2. Edit HAProxy config
sudo nano /etc/haproxy/haproxy.cfg

# Add the configuration from deployment/haproxy.cfg
# IMPORTANT: Replace <WEB01_IP> and <WEB02_IP> with actual IPs

# 3. Enable and start
sudo systemctl enable haproxy
sudo systemctl start haproxy

# 4. Check status
sudo systemctl status haproxy

# 5. Verify load balancing
curl http://<LB01_IP>
```

## Testing Commands

```bash
# Test individual servers
curl http://<WEB01_IP>
curl http://<WEB02_IP>

# Test load balancer
curl http://<LB01_IP>

# Check load distribution (run multiple times)
for i in {1..10}; do 
    curl -s http://<LB01_IP> > /dev/null && echo "Request $i completed"
done
```

## Troubleshooting

### Nginx Issues
```bash
# Check Nginx status
sudo systemctl status nginx

# Check error logs
sudo tail -f /var/log/nginx/crypto-screener-error.log

# Test configuration
sudo nginx -t

# Restart Nginx
sudo systemctl restart nginx
```

### HAProxy Issues
```bash
# Check HAProxy status
sudo systemctl status haproxy

# Check HAProxy logs
sudo journalctl -u haproxy -f

# Test configuration
sudo haproxy -f /etc/haproxy/haproxy.cfg -c

# Restart HAProxy
sudo systemctl restart haproxy
```

### File Permissions
```bash
# Ensure correct permissions
sudo chown -R www-data:www-data /var/www/crypto-screener
sudo chmod -R 755 /var/www/crypto-screener
```

