#!/bin/bash

# Deployment script to update UI changes in production
# Run this script on your server after making UI changes

set -e

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

PROJECT_DIR="/var/www/cinemarathi-api"

echo -e "${YELLOW}🚀 Starting UI update deployment...${NC}"
echo ""

# Check if running as root
if [ "$EUID" -eq 0 ]; then
  echo -e "${RED}Please do not run as root. Use sudo when needed.${NC}"
  exit 1
fi

cd $PROJECT_DIR

echo -e "${YELLOW}Step 1: Stopping PM2 processes...${NC}"
pm2 stop cinemarathi-admin || true
echo ""

echo -e "${YELLOW}Step 2: Installing/updating dependencies...${NC}"
npm install
echo ""

echo -e "${YELLOW}Step 3: Removing old build and cache...${NC}"
rm -rf .next
rm -rf .next/cache 2>/dev/null || true
echo ""

echo -e "${YELLOW}Step 4: Building Next.js application with latest changes...${NC}"
npm run build
echo ""

echo -e "${YELLOW}Step 5: Restarting PM2 processes...${NC}"
pm2 restart cinemarathi-admin
pm2 save
echo ""

echo -e "${YELLOW}Step 6: Clearing Next.js cache...${NC}"
rm -rf .next/cache 2>/dev/null || true
pm2 restart cinemarathi-admin
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ UI update deployment completed!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Current PM2 Status:${NC}"
pm2 status
echo ""
echo -e "${YELLOW}To view logs:${NC}"
echo "  pm2 logs cinemarathi-admin --lines 50"
echo ""
echo -e "${YELLOW}💡 Tip: Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R) to see the changes immediately${NC}"
