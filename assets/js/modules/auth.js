/**
 * Authentication Module
 * Handles Firebase authentication and user session management
 */

// Firebase authentication instance
let auth;

/**
 * Initialize Firebase Auth
 * @returns {Promise} Firebase auth initialization promise
 */
export async function initAuth() {
    try {
        if (typeof firebase !== 'undefined' && firebase.auth) {
            auth = firebase.auth();
            console.log('✅ Firebase Auth initialized successfully');
            return auth;
        } else {
            throw new Error('Firebase is not available');
        }
    } catch (error) {
        console.error('❌ Error initializing Firebase Auth:', error);
        throw error;
    }
}

/**
 * Wait for Firebase to be available
 * @param {number} timeout - Maximum wait time in milliseconds
 * @returns {Promise<boolean>} Whether Firebase is available
 */
export function waitForFirebase(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkFirebase = () => {
            if (typeof firebase !== 'undefined' && firebase.apps && firebase.apps.length > 0) {
                resolve(true);
            } else if (Date.now() - startTime > timeout) {
                reject(new Error(`Firebase not available after ${timeout}ms`));
            } else {
                setTimeout(checkFirebase, 100);
            }
        };
        
        checkFirebase();
    });
}

/**
 * Check if user is authenticated
 * @returns {boolean} Whether user is authenticated
 */
export function isUserAuthenticated() {
    return auth && auth.currentUser !== null;
}

/**
 * Get current user
 * @returns {Object|null} Current user object or null
 */
export function getCurrentUser() {
    return auth ? auth.currentUser : null;
}

/**
 * Sign in with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise} Sign in promise
 */
export async function signInWithEmailAndPassword(email, password) {
    try {
        if (!auth) {
            await initAuth();
        }
        const result = await auth.signInWithEmailAndPassword(email, password);
        console.log('✅ User signed in successfully');
        return result;
    } catch (error) {
        console.error('❌ Error signing in:', error);
        throw error;
    }
}

/**
 * Sign out current user
 * @returns {Promise} Sign out promise
 */
export async function signOut() {
    try {
        if (auth) {
            await auth.signOut();
            console.log('✅ User signed out successfully');
        }
    } catch (error) {
        console.error('❌ Error signing out:', error);
        throw error;
    }
}

/**
 * Listen for authentication state changes
 * @param {Function} callback - Callback function for auth state changes
 * @returns {Function} Unsubscribe function
 */
export function onAuthStateChanged(callback) {
    if (auth) {
        return auth.onAuthStateChanged(callback);
    }
    return () => {}; // Return empty function if auth not available
}

/**
 * Reset password for email
 * @param {string} email - User email
 * @returns {Promise} Password reset promise
 */
export async function sendPasswordResetEmail(email) {
    try {
        if (!auth) {
            await initAuth();
        }
        await auth.sendPasswordResetEmail(email);
        console.log('✅ Password reset email sent');
    } catch (error) {
        console.error('❌ Error sending password reset email:', error);
        throw error;
    }
}