// Environment Variables Loader
// This module loads environment variables for the frontend application
// Note: In production, these should be injected at build time by your build process

class EnvironmentLoader {
    constructor() {
        this.env = {};
        this.isProduction = this.detectEnvironment();
        this.loadEnvironmentVariables();
    }

    detectEnvironment() {
        // Check if we're in production based on common indicators
        return window.location.protocol === 'https:' || 
               window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1';
    }

    loadEnvironmentVariables() {
        // First, try to load from build-time injected variables (production)
        if (typeof window.ENV_CONFIG !== 'undefined') {
            console.log('🔧 Loading environment from build-time config');
            this.env = { ...window.ENV_CONFIG };
            return;
        }

        // Development fallback - these values will be used in development
        // In production, these should be replaced by your build system
        console.log('🔧 Loading environment from development config');
        
        this.env = {
            FIREBASE_API_KEY: 'AIzaSyB4LvZCZSeHRW4aiDLFLnHw4NFKc6kluOY',
            FIREBASE_AUTH_DOMAIN: 'minitech-5cdcc.firebaseapp.com',
            FIREBASE_PROJECT_ID: 'minitech-5cdcc',
            FIREBASE_STORAGE_BUCKET: 'minitech-5cdcc.firebasestorage.app',
            FIREBASE_MESSAGING_SENDER_ID: '124252547061',
            FIREBASE_APP_ID: '1:124252547061:web:2fabc1a9ff9997764822bc',
            FIREBASE_MEASUREMENT_ID: 'G-KSX5PZVSYW'
        };

        // Log warning if using fallback in what appears to be production
        if (this.isProduction) {
            console.warn('⚠️ Using development Firebase config in production environment. Please configure proper environment variables.');
        }
    }

    get(key) {
        const value = this.env[key];
        if (!value) {
            console.error(`❌ Environment variable ${key} is not defined`);
        }
        return value;
    }

    getAll() {
        return { ...this.env };
    }

    isConfigured() {
        const requiredKeys = [
            'FIREBASE_API_KEY',
            'FIREBASE_AUTH_DOMAIN', 
            'FIREBASE_PROJECT_ID',
            'FIREBASE_STORAGE_BUCKET',
            'FIREBASE_MESSAGING_SENDER_ID',
            'FIREBASE_APP_ID'
        ];

        return requiredKeys.every(key => this.env[key]);
    }

    validateConfiguration() {
        if (!this.isConfigured()) {
            console.error('❌ Firebase configuration is incomplete. Check your environment variables.');
            return false;
        }
        
        console.log('✅ Firebase environment configuration is valid');
        return true;
    }
}

// Initialize and export
const envLoader = new EnvironmentLoader();

// Validate configuration
envLoader.validateConfiguration();

// Make available globally
window.ENV = envLoader;

// Also export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = envLoader;
}