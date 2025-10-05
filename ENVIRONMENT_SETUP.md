# Environment Variables Setup Guide

This project uses environment variables to securely manage Firebase configuration and other sensitive data.

## Quick Setup

1. **Copy the template file:**
   ```bash
   cp .env.example .env
   ```

2. **Fill in your Firebase credentials:**
   Open `.env` and replace the placeholder values with your actual Firebase project credentials.

3. **Get Firebase credentials:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Select your project
   - Go to Project Settings (gear icon)
   - In the "Your apps" section, find your web app
   - Copy the configuration values

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `FIREBASE_API_KEY` | Firebase API Key | `AIzaSyB4LvZCZSeHRW4aiDLFLnHw4NFKc6kluOY` |
| `FIREBASE_AUTH_DOMAIN` | Firebase Auth Domain | `your-project.firebaseapp.com` |
| `FIREBASE_PROJECT_ID` | Firebase Project ID | `your-project-id` |
| `FIREBASE_STORAGE_BUCKET` | Firebase Storage Bucket | `your-project.firebasestorage.app` |
| `FIREBASE_MESSAGING_SENDER_ID` | Messaging Sender ID | `123456789012` |
| `FIREBASE_APP_ID` | Firebase App ID | `1:123456789012:web:abcdef123456` |
| `FIREBASE_MEASUREMENT_ID` | Google Analytics Measurement ID | `G-ABCD123456` |

## File Structure

```
├── .env                 # Your actual environment variables (NEVER COMMIT)
├── .env.example         # Template file (SAFE TO COMMIT)
├── assets/js/
│   ├── env-loader.js    # Environment variable loader
│   └── firebase-config.js # Firebase configuration using env vars
└── .gitignore          # Ensures .env is not committed
```

## Security Notes

- **NEVER commit the `.env` file to version control**
- The `.env` file is automatically ignored by `.gitignore`
- Only commit `.env.example` as a template
- In production, use your hosting platform's environment variable system
- For local development, always use the `.env` file

## Deployment

### Render
Add environment variables in your Render dashboard:
1. Go to your service settings
2. Navigate to "Environment"
3. Add each variable from your `.env` file

### Other Platforms
- **Vercel:** Add to project settings → Environment Variables
- **Netlify:** Add to site settings → Environment Variables
- **Firebase Hosting:** Use Firebase functions config

## Troubleshooting

**Problem:** Firebase not initializing
**Solution:** Check that all environment variables are set correctly

**Problem:** API key not found
**Solution:** Ensure `env-loader.js` is loaded before `firebase-config.js`

**Problem:** Environment variables not loading
**Solution:** Check browser console for errors and verify file paths

## Development vs Production

### Development
- Uses `.env` file for local development
- Fallback values are provided for testing

### Production
- Environment variables should be injected by your hosting platform
- Never deploy with hardcoded API keys
- Use build-time variable injection when possible