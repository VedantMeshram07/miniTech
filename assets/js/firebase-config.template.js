// Firebase Configuration Template
// Copy this file to firebase-config.js and fill in your actual Firebase project details

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.firebasestorage.app",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID",
  measurementId: "YOUR_MEASUREMENT_ID"
};

// Initialize Firebase variables
let app, db, auth, storage;

// Initialize Firebase
try {
    // Check if Firebase SDK is loaded
    if (typeof firebase !== 'undefined') {
        console.log('Firebase SDK detected, initializing...');
        
        app = firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        
        // Initialize auth only if the SDK is available
        if (typeof firebase.auth !== 'undefined') {
            auth = firebase.auth();
        } else {
            console.warn('Firebase Auth SDK not loaded');
        }
        
        // Initialize storage only if the SDK is available
        if (typeof firebase.storage !== 'undefined') {
            storage = firebase.storage();
        } else {
            console.warn('Firebase Storage SDK not loaded');
        }
        
        console.log('Firebase initialized successfully');
        console.log('Project ID:', firebaseConfig.projectId);
        console.log('Auth Domain:', firebaseConfig.authDomain);
        
        // Test Firestore connection
        if (db) {
            db.enableNetwork().then(() => {
                console.log('Firestore connection enabled');
            }).catch((error) => {
                console.warn('Firestore connection issue:', error);
            });
        }
        
    } else {
        throw new Error('Firebase SDK not loaded. Please check your script tags.');
    }
} catch (error) {
    console.error('Firebase initialization failed:', error);
    
    // Provide helpful error messages
    if (error.code === 'auth/invalid-api-key') {
        console.error('Invalid API key. Please check your Firebase configuration.');
    } else if (error.code === 'auth/project-not-found') {
        console.error('Firebase project not found. Please check your project ID.');
    }
    
    console.error('Config used:', firebaseConfig);
    
    // Set fallback values to prevent further errors
    app = null;
    db = null;
    auth = null;
    storage = null;
}

// Export for use in other modules (if using modules)
if (typeof window !== 'undefined') {
    // Browser environment
    window.firebaseApp = app;
    window.firebaseDB = db;
    window.firebaseAuth = auth;
    window.firebaseStorage = storage;
    window.firebaseConfig = firebaseConfig;
}

// Database operations wrapper
class DatabaseManager {
    constructor() {
        this.db = db;
        this.isConnected = !!db;
    }

    async checkConnection() {
        if (!this.db) {
            throw new Error('Database not initialized');
        }
        
        try {
            // Test connection by trying to read from a collection
            await this.db.collection('_connection_test').limit(1).get();
            return true;
        } catch (error) {
            console.error('Database connection test failed:', error);
            return false;
        }
    }

    // Collection operations
    async getCollection(collectionName, options = {}) {
        if (!this.db) throw new Error('Database not initialized');
        
        try {
            let query = this.db.collection(collectionName);
            
            // Apply filters
            if (options.where) {
                options.where.forEach(condition => {
                    query = query.where(...condition);
                });
            }
            
            // Apply ordering
            if (options.orderBy) {
                query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
            }
            
            // Apply limit
            if (options.limit) {
                query = query.limit(options.limit);
            }
            
            const snapshot = await query.get();
            return snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
        } catch (error) {
            console.error('Error getting collection:', error);
            throw error;
        }
    }

    async getDocument(collectionName, docId) {
        if (!this.db) throw new Error('Database not initialized');
        
        try {
            const doc = await this.db.collection(collectionName).doc(docId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('Error getting document:', error);
            throw error;
        }
    }

    async addDocument(collectionName, data) {
        if (!this.db) throw new Error('Database not initialized');
        
        try {
            const docRef = await this.db.collection(collectionName).add({
                ...data,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error adding document:', error);
            throw error;
        }
    }

    async updateDocument(collectionName, docId, data) {
        if (!this.db) throw new Error('Database not initialized');
        
        try {
            await this.db.collection(collectionName).doc(docId).update({
                ...data,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating document:', error);
            throw error;
        }
    }

    async deleteDocument(collectionName, docId) {
        if (!this.db) throw new Error('Database not initialized');
        
        try {
            await this.db.collection(collectionName).doc(docId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting document:', error);
            throw error;
        }
    }

    // Listen to real-time updates
    listenToCollection(collectionName, callback, options = {}) {
        if (!this.db) throw new Error('Database not initialized');
        
        let query = this.db.collection(collectionName);
        
        // Apply filters
        if (options.where) {
            options.where.forEach(condition => {
                query = query.where(...condition);
            });
        }
        
        // Apply ordering
        if (options.orderBy) {
            query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
        }
        
        return query.onSnapshot(
            (snapshot) => {
                const data = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }));
                callback(data);
            },
            (error) => {
                console.error('Error in real-time listener:', error);
                callback(null, error);
            }
        );
    }
}

// Create global database manager instance
const dbManager = new DatabaseManager();

// Make it available globally
if (typeof window !== 'undefined') {
    window.dbManager = dbManager;
}

// Node.js export (if needed)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DatabaseManager, firebaseConfig };
}