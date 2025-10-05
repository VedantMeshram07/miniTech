# Render Deployment Configuration

## 🚀 Static Site Deployment on Render

### Build Settings:

- **Build Command**: `echo "No build required - static site"`
- **Publish Directory**: `techfest-website`

### Environment Variables:

Set these in Render Dashboard > Environment:

- `NODE_ENV=production`

### Important Notes:

- This is a static site (HTML/CSS/JS)
- No server-side processing required
- Firebase handles backend operations

---

## Alternative: If Render asks for more specific commands

### Option 1: Simple Static Site

```bash
Build Command: (leave empty or use "echo 'Static site ready'")
Publish Directory: techfest-website
```

### Option 2: With HTTP Server (if needed)

```bash
Build Command: npm install -g http-server
Start Command: http-server techfest-website -p $PORT
```

### Option 3: Python Server (current setup)

```bash
Build Command: echo "Static site - no build needed"
Start Command: cd techfest-website && python -m http.server $PORT
```

---

## 🔧 Recommended Render Configuration:

1. **Service Type**: Static Site
2. **Build Command**: `echo "Static site ready"`
3. **Publish Directory**: `techfest-website`
4. **Auto-Deploy**: Yes (on git push)

## 📁 File Structure for Render:

```
miniTech/
├── techfest-website/     ← This is your publish directory
│   ├── index.html        ← Main entry point
│   ├── admin/
│   ├── assets/
│   └── events/
└── render.yaml          ← Optional deployment config
```
