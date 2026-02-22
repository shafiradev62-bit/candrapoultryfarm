# Netlify Blank Page Troubleshooting Guide

## Common Causes & Solutions

### 1. **Routing Issues** ⚠️ MOST COMMON
**Problem**: React Router not handling Netlify's static file serving
**Solution**: 
- Using `HashRouter` instead of `BrowserRouter` (already implemented)
- Added proper redirect rules in `netlify.toml`

### 2. **Asset Loading Failures**
**Problem**: CSS/JS files not loading due to incorrect paths
**Solution**:
- Updated Vite `base` from `'./'` to `'/'`
- Added proper asset caching headers
- Verified all assets build correctly

### 3. **Environment Variables**
**Problem**: Missing required environment variables
**Solution**:
- Check Netlify dashboard → Site settings → Environment variables
- Add any required variables (Supabase URL, API keys, etc.)

### 4. **JavaScript Errors**
**Problem**: Runtime errors preventing app from loading
**Solution**:
- Added ErrorBoundary component to catch and display errors
- Test locally first: `npm run build` then `npx serve dist`

## Diagnostic Steps

### 1. Check Netlify Build Logs
- Go to your Netlify site dashboard
- Click on "Deploys" tab
- Check the latest deploy logs for errors

### 2. Test Deployment URL
Try accessing these URLs:
- `https://your-site.netlify.app/` - Main app
- `https://your-site.netlify.app/test.html` - Diagnostic page
- `https://your-site.netlify.app/#/auth` - Auth page

### 3. Browser Console Debugging
1. Open your site in browser
2. Press F12 to open developer tools
3. Check the Console tab for errors
4. Check the Network tab to see if assets are loading

### 4. Local Testing
```bash
# Build the project
npm run build

# Serve locally
npx serve dist -p 3000

# Visit http://localhost:3000
```

## Quick Fix Checklist

- [ ] Verify `netlify.toml` is in root of repository
- [ ] Check that build command is `npm run build`
- [ ] Verify publish directory is `dist`
- [ ] Ensure all dependencies are in `package.json`
- [ ] Check for environment variable requirements
- [ ] Test build locally before deploying

## If Still Blank

1. **Force refresh**: Ctrl+F5 or Cmd+Shift+R
2. **Clear browser cache**
3. **Try incognito/private browsing**
4. **Check different browsers**
5. **Verify custom domain settings** (if using one)

## Contact Support

If issues persist:
- Netlify Community Forum: https://answers.netlify.com
- Create GitHub issue with build logs and error details