# Henry's Tires UI - Deployment Guide

## ✅ Safe to Push to GitHub

This Angular application is **already secure** and ready to push to GitHub:

- ✅ No API keys or secrets stored in code
- ✅ Uses relative URLs (`/api/v1/...`) for API calls
- ✅ No hardcoded backend URLs
- ✅ Proxy configuration only contains localhost (development)

## 🚀 Deployment Options

### Option 1: Vercel (Recommended - Easiest)

1. **Push to GitHub:**
   ```bash
   cd /Users/david/Documents/areas/work/henrys/UI
   git init
   git add .
   git commit -m "Initial commit: Henry's Tires UI"
   git remote add origin https://github.com/YOUR_USERNAME/henrys-tires-ui.git
   git push -u origin main
   ```

2. **Deploy to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Angular configuration
   - Click "Deploy"

3. **Configure API URL** (in Vercel dashboard):
   - Go to Settings → Environment Variables
   - Add: `API_BASE_URL` = `https://your-api-url.com`
   - (Optional) Update `angular.json` to use this variable

### Option 2: Netlify

1. Push code to GitHub (same as above)
2. Go to [netlify.com](https://netlify.com)
3. Click "New site from Git"
4. Select your repository
5. Build command: `npm run build`
6. Publish directory: `dist/your-app-name`

### Option 3: GitHub Pages

```bash
npm install -g angular-cli-ghpages
ng build --configuration production --base-href "/henrys-tires-ui/"
ngh --dir=dist/your-app-name
```

## ⚙️ Configuration for Production

### Update API URLs (when deploying)

Since you're using relative URLs (`/api/v1/...`), you have two options:

#### Option A: Use Proxy/Rewrite Rules (Recommended)

Configure your hosting platform to proxy `/api` to your backend:

**Vercel** - Create `vercel.json`:
```json
{
  "rewrites": [
    {
      "source": "/api/:path*",
      "destination": "https://your-backend-api.com/api/:path*"
    }
  ]
}
```

**Netlify** - Create `netlify.toml`:
```toml
[[redirects]]
  from = "/api/*"
  to = "https://your-backend-api.com/api/:splat"
  status = 200
  force = true
```

#### Option B: Environment-based API URL

1. Create `src/environments/environment.prod.ts`:
```typescript
export const environment = {
  production: true,
  apiUrl: 'https://your-backend-api.com'
};
```

2. Update services to use:
```typescript
import { environment } from '../../environments/environment';

private readonly API_URL = `${environment.apiUrl}/api/v1/items`;
```

## 📝 Development vs Production

### Development (Current Setup)
- Uses `proxy.conf.json`
- Backend: `http://localhost:5099`
- Frontend: `http://localhost:4200`
- Proxy forwards `/api` to `localhost:5099`

### Production (After Deployment)
- Frontend: `https://your-app.vercel.app`
- Backend: `https://your-api.railway.app` (or wherever you deploy the API)
- Use rewrite rules or environment variables to connect them

## 🔧 Build Commands

### Development
```bash
npm start
# or
ng serve --proxy-config proxy.conf.json
```

### Production Build
```bash
npm run build
# or
ng build --configuration production
```

Output will be in `dist/` folder.

## 📦 What Gets Deployed

When you push to GitHub, these files are **included**:
- ✅ All source code (`src/`)
- ✅ `package.json` and `package-lock.json`
- ✅ `angular.json`
- ✅ `proxy.conf.json` (only used in development)
- ✅ `.gitignore`

These files are **excluded** (in `.gitignore`):
- ❌ `node_modules/`
- ❌ `dist/` (build output)
- ❌ `.angular/` (cache)
- ❌ `.DS_Store`

## 🚀 Ready to Deploy!

Your UI is now ready to push to GitHub and deploy to any hosting platform!

```bash
cd /Users/david/Documents/areas/work/henrys/UI
git init
git add .
git commit -m "Initial commit: Henry's Tires UI"
git push
```

## 🔗 Connecting Frontend to Backend

After deploying both:

1. **Deploy API first** → Get API URL (e.g., `https://api.example.com`)
2. **Deploy Frontend** → Configure proxy/rewrite to point to API URL
3. **Test** → Frontend should now connect to deployed backend

Example: If your API is at `https://henrys-api.railway.app`, configure Vercel rewrites to forward `/api/*` to that URL.
