// Environment Variables Loader
// Simple and reliable environment loader for static sites
// Works with Render and other static site hosts

class EnvironmentLoader {
    constructor() {
        this.env = {};
        this.isProduction = this.detectEnvironment();
        this.loadEnvironmentVariables();
    }

    detectEnvironment() {
        // Check if we're in production based on hostname and protocol
        const hostname = window.location.hostname;
        const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1' || hostname.includes('127.0.0.1');
        const isHTTPS = window.location.protocol === 'https:';
        
        return !isLocalhost || isHTTPS;
    }

    loadEnvironmentVariables() {
        // Production Firebase configuration
        // These values should match your Firebase project
        const productionConfig = {
            FIREBASE_API_KEY: 'AIzaSyB4LvZCZSeHRW4aiDLFLnHw4NFKc6kluOY',
            FIREBASE_AUTH_DOMAIN: 'minitech-5cdcc.firebaseapp.com',
            FIREBASE_PROJECT_ID: 'minitech-5cdcc',
            FIREBASE_STORAGE_BUCKET: 'minitech-5cdcc.firebasestorage.app',
            FIREBASE_MESSAGING_SENDER_ID: '124252547061',
            FIREBASE_APP_ID: '1:124252547061:web:2fabc1a9ff9997764822bc',
            FIREBASE_MEASUREMENT_ID: 'G-KSX5PZVSYW'
        };

        // Use the same config for both development and production
        // This ensures consistency across environments
        this.env = { ...productionConfig };
        
        const envType = this.isProduction ? 'production' : 'development';
        console.log(`🔧 Loading Firebase config for ${envType} environment`);
        console.log('📍 Environment details:', {
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            isProduction: this.isProduction
        });
    }

    get(key) {
        const value = this.env[key];
        if (!value && value !== '') {
            console.error(`❌ Environment variable ${key} is not defined`);
            return null;
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

        const missingKeys = requiredKeys.filter(key => !this.env[key]);
        
        if (missingKeys.length > 0) {
            console.error('❌ Missing required environment variables:', missingKeys);
            return false;
        }
        
        return true;
    }

    validateConfiguration() {
        if (!this.isConfigured()) {
            console.error('❌ Firebase configuration is incomplete. Check your environment variables.');
            return false;
        }
        
        console.log('✅ Firebase environment configuration is valid');
        console.log('🔥 Firebase Project ID:', this.env.FIREBASE_PROJECT_ID);
        console.log('🌐 Firebase Auth Domain:', this.env.FIREBASE_AUTH_DOMAIN);
        return true;
    }
}

// Initialize environment loader
console.log('🚀 Initializing Environment Loader...');
const envLoader = new EnvironmentLoader();

// Validate configuration
const isValid = envLoader.validateConfiguration();

if (!isValid) {
    console.error('🚨 Environment configuration validation failed!');
} else {
    console.log('🎉 Environment configuration loaded successfully!');
}

// Make available globally
window.ENV = envLoader;

// Also make the config directly available for easier access
window.FIREBASE_CONFIG = {
    apiKey: envLoader.get('FIREBASE_API_KEY'),
    authDomain: envLoader.get('FIREBASE_AUTH_DOMAIN'),
    projectId: envLoader.get('FIREBASE_PROJECT_ID'),
    storageBucket: envLoader.get('FIREBASE_STORAGE_BUCKET'),
    messagingSenderId: envLoader.get('FIREBASE_MESSAGING_SENDER_ID'),
    appId: envLoader.get('FIREBASE_APP_ID'),
    measurementId: envLoader.get('FIREBASE_MEASUREMENT_ID')
};

console.log('🔧 Firebase config object created:', window.FIREBASE_CONFIG);