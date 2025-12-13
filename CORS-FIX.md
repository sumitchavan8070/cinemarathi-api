# CORS Error Fix

## What Was Fixed

1. **Enhanced CORS Configuration** in `server.js`:
   - Added comprehensive CORS options
   - Allowed credentials (cookies, authorization headers)
   - Added explicit preflight handling
   - Configured allowed methods and headers
   - Added origin whitelist for production

2. **Updated API Requests** in `lib/api.ts`:
   - Added `credentials: 'include'` to fetch requests
   - Added `mode: 'cors'` to explicitly enable CORS

## How to Deploy the Fix

### Step 1: Upload the updated files to your server

```bash
# Upload server.js
scp server.js user@your-server:/var/www/cinemarathi-api/

# Upload lib/api.ts (if it exists on server, or it will be built)
scp lib/api.ts user@your-server:/var/www/cinemarathi-api/lib/
```

### Step 2: Restart the API server

```bash
# SSH into your server
ssh user@your-server

# Restart the API
cd /var/www/cinemarathi-api
pm2 restart cinemarathi-api

# Check logs
pm2 logs cinemarathi-api --lines 50
```

### Step 3: Rebuild the frontend (if api.ts changes affect build)

```bash
# On server
cd /var/www/cinemarathi-api
pm2 stop cinemarathi-admin
npm run build
pm2 restart cinemarathi-admin
```

## CORS Configuration Details

The CORS configuration now:

- **Allows all origins in development** for easier testing
- **Allows credentials** (cookies, authorization headers)
- **Handles preflight requests** (OPTIONS)
- **Allows common HTTP methods**: GET, POST, PUT, PATCH, DELETE, OPTIONS, HEAD
- **Allows necessary headers**: Content-Type, Authorization, etc.
- **Exposes Authorization header** in responses

## Allowed Origins (Production)

The following origins are allowed:
- `http://localhost:3000` (local development)
- `http://localhost:3001` (local API)
- `https://admin.cine.fluttertales.tech`
- `https://cinemarathi.fluttertales.tech`
- `http://cinemarathi.fluttertales.tech`
- `https://api.cine.fluttertales.tech`
- `https://api.cinemarathi.fluttertales.tech`
- Any origin from environment variables

## Testing CORS

After deploying, test by:

1. **Open browser DevTools** (F12)
2. **Go to Network tab**
3. **Make an API request** from your admin panel
4. **Check the request headers** - should see:
   - `Access-Control-Allow-Origin: *` (or your origin)
   - `Access-Control-Allow-Credentials: true`
5. **Check for CORS errors** in Console tab

## Troubleshooting

### Still getting CORS errors?

1. **Check server logs**:
   ```bash
   pm2 logs cinemarathi-api --lines 100
   ```
   Look for `[CORS]` messages

2. **Verify the origin**:
   - Check what origin your browser is sending
   - Make sure it matches one of the allowed origins

3. **Check Nginx configuration** (if using reverse proxy):
   - Make sure Nginx isn't blocking CORS headers
   - Verify proxy headers are being passed correctly

4. **Clear browser cache**:
   - Hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
   - Or clear cache completely

5. **Test with curl**:
   ```bash
   curl -H "Origin: https://admin.cine.fluttertales.tech" \
        -H "Access-Control-Request-Method: POST" \
        -H "Access-Control-Request-Headers: Content-Type,Authorization" \
        -X OPTIONS \
        https://api.cine.fluttertales.tech/api/admin-auth/login \
        -v
   ```
   Should see CORS headers in response

## Security Note

Currently, the CORS configuration allows all origins in production for easier debugging. Once you've confirmed everything works, you can restrict it to only your admin panel domain by changing:

```javascript
callback(null, true) // Allow all
```

to:

```javascript
callback(new Error('Not allowed by CORS')) // Block unauthorized origins
```
