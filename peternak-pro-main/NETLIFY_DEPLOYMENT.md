# Netlify Deployment Guide

## Prerequisites
- Netlify account (free at https://netlify.com)
- GitHub account with this repository

## Deployment Steps

### 1. Connect to Netlify
1. Go to https://app.netlify.com
2. Click "Add new site" → "Import an existing project"
3. Choose "GitHub" as your provider
4. Select this repository

### 2. Configure Build Settings
Netlify will automatically detect the settings from `netlify.toml`, but you can verify:

- **Build command**: `npm run build`
- **Publish directory**: `dist`
- **Base directory**: `peternak-pro-main/peternak-pro-main`

### 3. Environment Variables (if needed)
If you have environment variables:
1. Go to Site settings → Environment variables
2. Add your variables (e.g., Supabase URL, API keys)

### 4. Deploy
1. Click "Deploy site"
2. Netlify will automatically build and deploy
3. Your site will be available at `https://your-site-name.netlify.app`

## Custom Domain (Optional)
1. Go to Site settings → Domain management
2. Add custom domain
3. Follow DNS configuration instructions

## Automatic Deployments
- Netlify will automatically rebuild and deploy when you push to the main branch
- You can also set up deploy previews for pull requests

## Troubleshooting
- Check build logs in Netlify dashboard if deployment fails
- Ensure all dependencies are in `package.json`
- Verify `netlify.toml` configuration is correct