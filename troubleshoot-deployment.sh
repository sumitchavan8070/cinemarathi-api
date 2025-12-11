#!/bin/bash

echo "=========================================="
echo "CineMarathi Deployment Troubleshooting"
echo "=========================================="
echo ""

# 1. Check if nginx is running
echo "1. Checking nginx status..."
sudo systemctl status nginx --no-pager | head -5
echo ""

# 2. Check if ports are listening
echo "2. Checking if ports 3000 and 3001 are listening..."
echo "Port 3000 (Next.js):"
sudo netstat -tlnp | grep :3000 || echo "  ❌ Port 3000 is NOT listening"
echo ""
echo "Port 3001 (API):"
sudo netstat -tlnp | grep :3001 || echo "  ❌ Port 3001 is NOT listening"
echo ""

# 3. Check PM2 processes
echo "3. Checking PM2 processes..."
pm2 list
echo ""

# 4. Check PM2 logs
echo "4. Recent PM2 logs for cinemarathi-api:"
pm2 logs cinemarathi-api --lines 10 --nostream
echo ""
echo "5. Recent PM2 logs for cinemarathi-admin:"
pm2 logs cinemarathi-admin --lines 10 --nostream
echo ""

# 5. Check nginx config syntax
echo "6. Checking nginx configuration syntax..."
sudo nginx -t
echo ""

# 6. Check if nginx config is enabled
echo "7. Checking if nginx site is enabled..."
if [ -L /etc/nginx/sites-enabled/cinemarathi ]; then
    echo "  ✅ Config is enabled"
else
    echo "  ❌ Config is NOT enabled. Run: sudo ln -s /etc/nginx/sites-available/cinemarathi /etc/nginx/sites-enabled/"
fi
echo ""

# 7. Check firewall
echo "8. Checking firewall status..."
sudo ufw status | head -10
echo ""

# 8. Test local connections
echo "9. Testing local connections..."
echo "Testing API (port 3001):"
curl -s http://localhost:3001/ | head -3 || echo "  ❌ Cannot connect to API"
echo ""
echo "Testing Next.js (port 3000):"
curl -s http://localhost:3000/ | head -3 || echo "  ❌ Cannot connect to Next.js"
echo ""

echo "=========================================="
echo "Troubleshooting complete!"
echo "=========================================="
