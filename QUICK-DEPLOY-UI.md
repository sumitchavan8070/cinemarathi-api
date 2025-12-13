# Quick Deploy UI Changes to Production

## The Problem
Your UI changes are on your local machine but not on the production server. You need to:
1. **Upload the changed files** to the server
2. **Rebuild** the Next.js app
3. **Restart** PM2

## Solution: Step-by-Step

### Step 1: Upload Changed Files to Server

**Option A: Using SCP (from your local machine)**

```bash
# Upload all admin UI files
scp -r app/admin/* user@your-server:/var/www/cinemarathi-api/app/admin/

# Or upload specific files that changed:
scp app/admin/login/page.jsx user@your-server:/var/www/cinemarathi-api/app/admin/login/
scp app/admin/layout.jsx user@your-server:/var/www/cinemarathi-api/app/admin/
scp app/admin/page.jsx user@your-server:/var/www/cinemarathi-api/app/admin/
scp app/admin/users/page.jsx user@your-server:/var/www/cinemarathi-api/app/admin/users/
scp app/admin/casting/page.jsx user@your-server:/var/www/cinemarathi-api/app/admin/casting/
scp app/admin/subscriptions/page.jsx user@your-server:/var/www/cinemarathi-api/app/admin/subscriptions/
scp app/admin/premium-users/page.jsx user@your-server:/var/www/cinemarathi-api/app/admin/premium-users/
scp app/admin/settings/page.jsx user@your-server:/var/www/cinemarathi-api/app/admin/settings/
scp app/admin/users/create/page.jsx user@your-server:/var/www/cinemarathi-api/app/admin/users/create/
```

**Option B: Using Git (if you have a git repo)**

```bash
# On server
cd /var/www/cinemarathi-api
git pull origin main  # or your branch name
```

**Option C: Manual Upload via SFTP**
- Use FileZilla, WinSCP, or similar
- Connect to your server
- Navigate to `/var/www/cinemarathi-api/app/admin/`
- Upload the changed files

### Step 2: SSH into Server and Deploy

```bash
# SSH into your server
ssh user@your-server

# Navigate to project
cd /var/www/cinemarathi-api

# Run the deployment script
bash deploy-ui-update.sh
```

### Step 3: Clear Browser Cache

After deployment, **hard refresh** your browser:
- **Chrome/Edge**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
- **Firefox**: `Ctrl+F5` (Windows) or `Cmd+Shift+R` (Mac)
- Or open DevTools (F12) → Right-click refresh → "Empty Cache and Hard Reload"

## Quick One-Liner (if using SCP)

From your **local machine**, run:

```bash
# Replace with your actual server details
SERVER_USER="ubuntu"
SERVER_HOST="your-server-ip-or-domain"
SERVER_PATH="/var/www/cinemarathi-api"

# Upload files
scp -r app/admin/* ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/app/admin/

# SSH and deploy
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH} && bash deploy-ui-update.sh"
```

## Verify Deployment

1. **Check PM2 status**:
   ```bash
   pm2 status
   pm2 logs cinemarathi-admin --lines 20
   ```

2. **Check build timestamp**:
   ```bash
   ls -la .next
   # Should show recent timestamps
   ```

3. **Test in browser**:
   - Visit your admin panel
   - Hard refresh (Ctrl+Shift+R)
   - Check if new UI appears

## Files That Changed

These are the files that were updated with the new UI:
- `app/admin/login/page.jsx`
- `app/admin/layout.jsx`
- `app/admin/page.jsx`
- `app/admin/users/page.jsx`
- `app/admin/casting/page.jsx`
- `app/admin/subscriptions/page.jsx`
- `app/admin/premium-users/page.jsx`
- `app/admin/settings/page.jsx`
- `app/admin/users/create/page.jsx`

## Troubleshooting

### Still seeing old UI?

1. **Verify files were uploaded**:
   ```bash
   # On server
   ls -la app/admin/login/page.jsx
   # Check the file modification time
   ```

2. **Check if build completed**:
   ```bash
   pm2 logs cinemarathi-admin | tail -50
   # Look for build errors
   ```

3. **Force rebuild**:
   ```bash
   cd /var/www/cinemarathi-api
   rm -rf .next
   npm run build
   pm2 restart cinemarathi-admin
   ```

4. **Clear Next.js cache**:
   ```bash
   rm -rf .next/cache
   pm2 restart cinemarathi-admin
   ```

5. **Check browser console**:
   - Open DevTools (F12)
   - Check Console for errors
   - Check Network tab - verify assets are loading

### Build Errors?

```bash
# Check for errors
npm run build

# Common fixes:
npm install
rm -rf node_modules .next
npm install
npm run build
```

## Need Help?

If you're still having issues, check:
1. Are the files actually on the server? (`ls -la app/admin/`)
2. Did the build succeed? (`pm2 logs cinemarathi-admin`)
3. Is PM2 running the new build? (`pm2 describe cinemarathi-admin`)
4. Did you clear browser cache?
