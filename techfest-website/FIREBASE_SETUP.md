# TechFest Website Setup

## 🔒 Security Configuration

### Firebase Setup

This project uses Firebase for backend services. For security reasons, the Firebase configuration is not included in the repository.

#### Setup Instructions:

1. **Copy the template file:**
   ```bash
   cp assets/js/firebase-config.template.js assets/js/firebase-config.js
   ```

2. **Create your Firebase project:**
   - Go to [Firebase Console](https://console.firebase.google.com/)
   - Create a new project or use an existing one
   - Enable Firestore Database
   - Enable Authentication (Email/Password)
   - Enable Storage (optional)

3. **Get your Firebase configuration:**
   - In your Firebase project, go to Project Settings
   - Scroll down to "Your apps" section
   - Click on the web app icon or "Add app" if no web app exists
   - Copy the Firebase configuration object

4. **Update the configuration file:**
   Open `assets/js/firebase-config.js` and replace the placeholder values:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-actual-api-key-here",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.firebasestorage.app",
     messagingSenderId: "123456789",
     appId: "your-app-id",
     measurementId: "your-measurement-id"
   };
   ```

### 🔐 Security Rules

Make sure to set up proper Firestore security rules in your Firebase console:

```javascript
// Firestore Rules
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Events collection - read public, write admin only
    match /events/{eventId} {
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
    
    // Registrations collection - authenticated users only
    match /registrations/{registrationId} {
      allow read, write: if request.auth != null;
    }
    
    // Admin collection - admin users only
    match /admin/{document} {
      allow read, write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

### 📁 File Structure

```
techfest-website/
├── assets/js/
│   ├── firebase-config.js          # Your actual config (not in git)
│   ├── firebase-config.template.js # Template file (in git)
│   └── ...
├── .gitignore                      # Protects sensitive files
└── README.md
```

### 🚫 Important Security Notes

- **Never commit** `firebase-config.js` to version control
- **Never share** your API keys publicly
- **Always use** environment-specific configurations
- **Set up proper** Firestore security rules
- **Enable** Firebase App Check for production

### 🔧 Development vs Production

For production deployment, consider using environment variables:

1. Set up environment variables in your hosting platform
2. Create a build script that generates the config file from environment variables
3. Use different Firebase projects for development and production

### 📞 Support

If you encounter any issues with the Firebase setup:

1. Check the browser console for error messages
2. Verify your Firebase configuration is correct
3. Ensure Firestore rules allow the required operations
4. Check that all necessary Firebase services are enabled

## 🚀 Getting Started

1. Clone the repository
2. Set up Firebase configuration (see above)
3. Open `index.html` in a web browser or serve via HTTP server
4. For admin access, go to `/admin/login.html`

## 📋 Features

- Event management system
- User registration
- Admin dashboard
- Real-time updates
- Responsive design
- Security-first approach

---

**Note:** This project prioritizes security by keeping sensitive information out of version control. Please follow the setup instructions carefully to ensure proper functionality.