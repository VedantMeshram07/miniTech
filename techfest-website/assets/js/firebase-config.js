// Firebase Configuration
// Using Firebase v8 SDK (compatible with script tag loading)

// Your Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyB4LvZCZSeHRW4aiDLFLnHw4NFKc6kluOY",
  authDomain: "minitech-5cdcc.firebaseapp.com",
  projectId: "minitech-5cdcc",
  storageBucket: "minitech-5cdcc.firebasestorage.app",
  messagingSenderId: "124252547061",
  appId: "1:124252547061:web:2fabc1a9ff9997764822bc",
  measurementId: "G-KSX5PZVSYW"
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
        }
        
        // Initialize storage only if the SDK is available  
        if (typeof firebase.storage !== 'undefined') {
            storage = firebase.storage();
        }
        
        console.log('✅ Firebase initialized successfully');
        console.log('Project ID:', firebaseConfig.projectId);
        console.log('Auth Domain:', firebaseConfig.authDomain);
        
        // Make Firebase services available globally
        window.db = db;
        window.auth = auth;
        window.storage = storage;
        
        // Test Firebase connection
        auth.onAuthStateChanged((user) => {
            if (user) {
                console.log('✅ User authenticated:', user.email);
            } else {
                console.log('ℹ️ No user authenticated');
            }
        });
        
        // Test Firestore connection
        db.enablePersistence({ synchronizeTabs: true })
            .then(() => {
                console.log('✅ Firestore offline persistence enabled');
                // Test if we can actually read from Firestore
                testFirestoreConnection();
            })
            .catch((err) => {
                if (err.code == 'failed-precondition') {
                    console.warn('⚠️ Multiple tabs open, persistence can only be enabled in one tab at a time');
                } else if (err.code == 'unimplemented') {
                    console.warn('⚠️ The current browser does not support persistence');
                } else {
                    console.warn('⚠️ Firestore offline persistence failed:', err);
                }
                // Still test connection even if persistence fails
                testFirestoreConnection();
            });
            
    } else {
        console.error('❌ Firebase SDK not loaded. Please check script tags.');
        window.db = null;
        window.auth = null;
        window.storage = null;
    }
} catch (error) {
    console.error('❌ Error initializing Firebase:', error);
    console.error('Config used:', firebaseConfig);
    window.db = null;
    window.auth = null;
    window.storage = null;
}

// Test Firestore connection and data availability
async function testFirestoreConnection() {
    if (!window.db) {
        console.error('🚫 No Firestore database instance available');
        return;
    }

    try {
        console.log('🧪 Testing Firestore connection...');
        
        // Test 1: Try to read events collection
        const eventsSnapshot = await window.db.collection('events').limit(1).get();
        console.log(`📊 Events collection status: ${eventsSnapshot.empty ? 'EMPTY' : `${eventsSnapshot.size} documents found`}`);
        
        if (!eventsSnapshot.empty) {
            eventsSnapshot.forEach(doc => {
                console.log('📄 Sample event data:', { id: doc.id, ...doc.data() });
            });
        } else {
            console.warn('⚠️ No events found in Firestore - this might explain why data isn\'t loading');
        }
        
        // Test 2: Try to read from cache (offline)
        const cachedSnapshot = await window.db.collection('events').get({ source: 'cache' });
        console.log(`💾 Cached events: ${cachedSnapshot.empty ? 'EMPTY' : `${cachedSnapshot.size} documents`}`);
        
        // Test 3: Try to read from server (online)
        const serverSnapshot = await window.db.collection('events').get({ source: 'server' });
        console.log(`🌐 Server events: ${serverSnapshot.empty ? 'EMPTY' : `${serverSnapshot.size} documents`}`);
        
        console.log('✅ Firestore connection test completed');
        
    } catch (error) {
        console.error('❌ Firestore connection test failed:', error);
        if (error.code === 'permission-denied') {
            console.error('🔒 Permission denied - check Firestore security rules');
        } else if (error.code === 'unavailable') {
            console.error('🔌 Firestore unavailable - check internet connection');
        }
    }
}

// Database structure and helper functions
class DatabaseManager {
    constructor() {
        this.db = window.db;
    }
    
    // Site configuration methods
    async getSiteConfig() {
        if (!this.db) return null;
        
        try {
            const doc = await this.db.collection('siteConfig').doc('main').get();
            return doc.exists ? doc.data() : null;
        } catch (error) {
            console.error('Error fetching site config:', error);
            return null;
        }
    }
    
    async updateSiteConfig(config) {
        if (!this.db) throw new Error('Database not available');
        
        console.log('🔥 FIREBASE: updateSiteConfig called with:', config);
        console.log('🔥 FIREBASE: Config fields to save:', Object.keys(config));
        console.log('🔥 FIREBASE: Config values sample:', {
            title: config.title,
            eventName: config.eventName,
            siteName: config.siteName,
            techfestName: config.techfestName,
            heroTitle: config.heroTitle
        });
        
        try {
            console.log('🔥 FIREBASE: Calling Firestore set() with merge: true...');
            await this.db.collection('siteConfig').doc('main').set(config, { merge: true });
            console.log('✅ FIREBASE: Successfully saved to siteConfig/main');
            
            // Immediate verification
            try {
                console.log('🔍 FIREBASE: Verifying save by reading back...');
                const verifyDoc = await this.db.collection('siteConfig').doc('main').get();
                if (verifyDoc.exists) {
                    const savedData = verifyDoc.data();
                    console.log('✅ FIREBASE: Verification successful - saved data:', savedData);
                    console.log('✅ FIREBASE: Verification - saved fields:', Object.keys(savedData));
                } else {
                    console.error('❌ FIREBASE: Verification failed - document does not exist');
                }
            } catch (verifyError) {
                console.error('❌ FIREBASE: Verification error:', verifyError);
            }
            
            return true;
        } catch (error) {
            console.error('❌ FIREBASE: Error updating site config:', error);
            throw error;
        }
    }
    
    // Events methods
    async getEvents(activeOnly = true) {
        if (!this.db) return [];
        
        try {
            // Get all events first, then filter and sort in JavaScript to avoid composite index
            const snapshot = await this.db.collection('events').get();
            let events = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            
            // Filter active events if requested
            if (activeOnly) {
                events = events.filter(event => event.active === true);
            }
            
            // Sort by date
            events.sort((a, b) => {
                const dateA = new Date(a.date);
                const dateB = new Date(b.date);
                return dateA - dateB;
            });
            
            return events;
        } catch (error) {
            console.error('Error fetching events:', error);
            return [];
        }
    }
    
    async getEvent(eventId) {
        if (!this.db) return null;
        
        try {
            const doc = await this.db.collection('events').doc(eventId).get();
            return doc.exists ? { id: doc.id, ...doc.data() } : null;
        } catch (error) {
            console.error('Error fetching event:', error);
            return null;
        }
    }
    
    async createEvent(eventData) {
        if (!this.db) throw new Error('Database not available');
        
        try {
            const docRef = await this.db.collection('events').add({
                ...eventData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating event:', error);
            throw error;
        }
    }
    
    async updateEvent(eventId, eventData) {
        if (!this.db) throw new Error('Database not available');
        
        try {
            // First check if document exists
            const docRef = this.db.collection('events').doc(eventId);
            const docSnap = await docRef.get();
            
            if (docSnap.exists) {
                // Document exists, update it
                await docRef.update({
                    ...eventData,
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            } else {
                // Document doesn't exist, create it with set
                await docRef.set({
                    ...eventData,
                    id: eventId,
                    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
                    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
                });
            }
            return true;
        } catch (error) {
            console.error('Error updating event:', error);
            throw error;
        }
    }
    
    async upsertEvent(eventId, eventData) {
        if (!this.db) throw new Error('Database not available');
        
        try {
            console.log(`🔄 Upserting event: ${eventId}`);
            // Use set with merge option - creates if doesn't exist, updates if exists
            await this.db.collection('events').doc(eventId).set({
                ...eventData,
                id: eventId,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            }, { merge: true });
            console.log(`✅ Event upserted successfully: ${eventId}`);
            return true;
        } catch (error) {
            console.error('Error upserting event:', error);
            throw error;
        }
    }
    
    async eventExists(eventId) {
        if (!this.db) throw new Error('Database not available');
        
        try {
            const docSnap = await this.db.collection('events').doc(eventId).get();
            return docSnap.exists;
        } catch (error) {
            console.error('Error checking event existence:', error);
            return false;
        }
    }
    
    async deleteEvent(eventId) {
        if (!this.db) throw new Error('Database not available');
        
        try {
            await this.db.collection('events').doc(eventId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting event:', error);
            throw error;
        }
    }
    
    // Coordinators methods
    async getCoordinators() {
        if (!this.db) return [];
        
        try {
            const snapshot = await this.db.collection('coordinators').orderBy('name', 'asc').get();
            return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
            console.error('Error fetching coordinators:', error);
            return [];
        }
    }
    
    async createCoordinator(coordinatorData) {
        if (!this.db) throw new Error('Database not available');
        
        try {
            const docRef = await this.db.collection('coordinators').add({
                ...coordinatorData,
                createdAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return docRef.id;
        } catch (error) {
            console.error('Error creating coordinator:', error);
            throw error;
        }
    }
    
    async updateCoordinator(coordinatorId, coordinatorData) {
        if (!this.db) throw new Error('Database not available');
        
        try {
            await this.db.collection('coordinators').doc(coordinatorId).update({
                ...coordinatorData,
                updatedAt: firebase.firestore.FieldValue.serverTimestamp()
            });
            return true;
        } catch (error) {
            console.error('Error updating coordinator:', error);
            throw error;
        }
    }
    
    async deleteCoordinator(coordinatorId) {
        if (!this.db) throw new Error('Database not available');
        
        try {
            await this.db.collection('coordinators').doc(coordinatorId).delete();
            return true;
        } catch (error) {
            console.error('Error deleting coordinator:', error);
            throw error;
        }
    }
    
    // Authentication methods
    async signInAdmin(email, password) {
        if (!this.auth) throw new Error('Authentication not available');
        
        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(email, password);
            return userCredential.user;
        } catch (error) {
            console.error('Error signing in:', error);
            throw error;
        }
    }
    
    async signOut() {
        if (!this.auth) throw new Error('Authentication not available');
        
        try {
            await this.auth.signOut();
            return true;
        } catch (error) {
            console.error('Error signing out:', error);
            throw error;
        }
    }
    
    getCurrentUser() {
        return this.auth ? this.auth.currentUser : null;
    }
    
    onAuthStateChanged(callback) {
        if (!this.auth) return () => {};
        
        return this.auth.onAuthStateChanged(callback);
    }
    
    // Storage methods
    async uploadImage(file, path) {
        if (!this.storage) throw new Error('Storage not available');
        
        try {
            const storageRef = this.storage.ref();
            const imageRef = storageRef.child(path);
            
            const snapshot = await imageRef.put(file);
            const downloadURL = await snapshot.ref.getDownloadURL();
            
            return downloadURL;
        } catch (error) {
            console.error('Error uploading image:', error);
            throw error;
        }
    }
    
    async deleteImage(path) {
        if (!this.storage) throw new Error('Storage not available');
        
        try {
            const storageRef = this.storage.ref();
            const imageRef = storageRef.child(path);
            
            await imageRef.delete();
            return true;
        } catch (error) {
            console.error('Error deleting image:', error);
            throw error;
        }
    }
}

// Make DatabaseManager available globally
window.DatabaseManager = DatabaseManager;
window.dbManager = new DatabaseManager();

// Export for module use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { DatabaseManager, firebaseConfig };
}

// Firestore security rules (for reference - to be set in Firebase console)
/*
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read access to site config and events for everyone
    match /siteConfig/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /events/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    match /coordinators/{document} {
      allow read: if true;
      allow write: if request.auth != null;
    }
    
    // Only authenticated users can access admin features
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
*/

// Storage security rules (for reference - to be set in Firebase console)
/*
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
*/