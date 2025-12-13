#!/bin/bash

# Script to upload UI files and deploy from local machine
# Usage: ./upload-and-deploy.sh [server-user] [server-host]

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

# Get server details
if [ -z "$1" ] || [ -z "$2" ]; then
  echo -e "${YELLOW}Usage: ./upload-and-deploy.sh [server-user] [server-host]${NC}"
  echo -e "${YELLOW}Example: ./upload-and-deploy.sh ubuntu ec2-13-201-23-2.ap-south-1.compute.amazonaws.com${NC}"
  exit 1
fi

SERVER_USER=$1
SERVER_HOST=$2
SERVER_PATH="/var/www/cinemarathi-api"
LOCAL_PATH="$(pwd)"

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}🚀 Uploading UI Changes to Production${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Server: ${SERVER_USER}@${SERVER_HOST}${NC}"
echo -e "${YELLOW}Target: ${SERVER_PATH}${NC}"
echo ""

# Step 1: Upload admin files
echo -e "${YELLOW}Step 1: Uploading admin UI files...${NC}"
scp -r app/admin/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/app/admin/
echo -e "${GREEN}✅ Files uploaded${NC}"
echo ""

# Step 2: Upload deployment script if it doesn't exist
echo -e "${YELLOW}Step 2: Ensuring deployment script exists...${NC}"
scp deploy-ui-update.sh ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/ 2>/dev/null || echo "Script already exists or upload failed"
echo ""

# Step 3: SSH and deploy
echo -e "${YELLOW}Step 3: Deploying on server...${NC}"
ssh ${SERVER_USER}@${SERVER_HOST} << EOF
cd ${SERVER_PATH}
bash deploy-ui-update.sh
EOF

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Clear your browser cache (Ctrl+Shift+R or Cmd+Shift+R)"
echo "2. Visit your admin panel"
echo "3. You should see the new UI!"
echo ""
