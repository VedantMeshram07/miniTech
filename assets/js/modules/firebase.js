/**
 * Firebase Utilities Module
 * Handles Firebase Firestore database operations and configuration
 */

// Firebase instances
let db;
let storage;

/**
 * Initialize Firebase services
 * @returns {Promise} Firebase initialization promise
 */
export async function initFirebase() {
    try {
        if (typeof firebase !== 'undefined') {
            // Initialize Firestore if not already initialized
            if (!db && firebase.firestore) {
                db = firebase.firestore();
                console.log('✅ Firestore initialized successfully');
            }
            
            // Initialize Storage if not already initialized
            if (!storage && firebase.storage) {
                storage = firebase.storage();
                console.log('✅ Firebase Storage initialized successfully');
            }
            
            return { db, storage };
        } else {
            throw new Error('Firebase is not available');
        }
    } catch (error) {
        console.error('❌ Error initializing Firebase:', error);
        throw error;
    }
}

/**
 * Get Firestore database instance
 * @returns {Object} Firestore database instance
 */
export function getFirestore() {
    return db;
}

/**
 * Get Firebase Storage instance
 * @returns {Object} Firebase Storage instance
 */
export function getStorage() {
    return storage;
}

/**
 * Fetch document from Firestore
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise<Object>} Document data
 */
export async function getDocument(collection, docId) {
    try {
        if (!db) {
            await initFirebase();
        }
        const doc = await db.collection(collection).doc(docId).get();
        if (doc.exists) {
            return { id: doc.id, ...doc.data() };
        } else {
            console.warn(`Document ${docId} not found in ${collection}`);
            return null;
        }
    } catch (error) {
        console.error(`Error fetching document ${docId} from ${collection}:`, error);
        throw error;
    }
}

/**
 * Fetch all documents from a collection
 * @param {string} collection - Collection name
 * @param {Object} options - Query options (orderBy, limit, where)
 * @returns {Promise<Array>} Array of documents
 */
export async function getCollection(collection, options = {}) {
    try {
        if (!db) {
            await initFirebase();
        }
        
        let query = db.collection(collection);
        
        // Apply where clauses
        if (options.where) {
            options.where.forEach(([field, operator, value]) => {
                query = query.where(field, operator, value);
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
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
        console.error(`Error fetching collection ${collection}:`, error);
        throw error;
    }
}

/**
 * Add document to collection
 * @param {string} collection - Collection name
 * @param {Object} data - Document data
 * @param {string} docId - Optional document ID
 * @returns {Promise<string>} Document ID
 */
export async function addDocument(collection, data, docId = null) {
    try {
        if (!db) {
            await initFirebase();
        }
        
        const timestamp = firebase.firestore.FieldValue.serverTimestamp();
        const documentData = {
            ...data,
            createdAt: timestamp,
            updatedAt: timestamp
        };
        
        let docRef;
        if (docId) {
            docRef = db.collection(collection).doc(docId);
            await docRef.set(documentData);
        } else {
            docRef = await db.collection(collection).add(documentData);
        }
        
        console.log(`✅ Document added to ${collection}:`, docRef.id);
        return docRef.id;
    } catch (error) {
        console.error(`Error adding document to ${collection}:`, error);
        throw error;
    }
}

/**
 * Update document in collection
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @param {Object} data - Updated data
 * @returns {Promise} Update promise
 */
export async function updateDocument(collection, docId, data) {
    try {
        if (!db) {
            await initFirebase();
        }
        
        const updateData = {
            ...data,
            updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };
        
        await db.collection(collection).doc(docId).update(updateData);
        console.log(`✅ Document ${docId} updated in ${collection}`);
    } catch (error) {
        console.error(`Error updating document ${docId} in ${collection}:`, error);
        throw error;
    }
}

/**
 * Delete document from collection
 * @param {string} collection - Collection name
 * @param {string} docId - Document ID
 * @returns {Promise} Delete promise
 */
export async function deleteDocument(collection, docId) {
    try {
        if (!db) {
            await initFirebase();
        }
        
        await db.collection(collection).doc(docId).delete();
        console.log(`✅ Document ${docId} deleted from ${collection}`);
    } catch (error) {
        console.error(`Error deleting document ${docId} from ${collection}:`, error);
        throw error;
    }
}

/**
 * Listen for real-time updates on a collection
 * @param {string} collection - Collection name
 * @param {Function} callback - Callback function for updates
 * @param {Object} options - Query options
 * @returns {Function} Unsubscribe function
 */
export function listenToCollection(collection, callback, options = {}) {
    try {
        if (!db) {
            throw new Error('Firestore not initialized');
        }
        
        let query = db.collection(collection);
        
        // Apply where clauses
        if (options.where) {
            options.where.forEach(([field, operator, value]) => {
                query = query.where(field, operator, value);
            });
        }
        
        // Apply ordering
        if (options.orderBy) {
            query = query.orderBy(options.orderBy.field, options.orderBy.direction || 'asc');
        }
        
        return query.onSnapshot(
            (snapshot) => {
                const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                callback(docs);
            },
            (error) => {
                console.error(`Error listening to ${collection}:`, error);
            }
        );
    } catch (error) {
        console.error(`Error setting up listener for ${collection}:`, error);
        return () => {}; // Return empty unsubscribe function
    }
}

/**
 * Upload file to Firebase Storage
 * @param {File} file - File to upload
 * @param {string} path - Storage path
 * @returns {Promise<string>} Download URL
 */
export async function uploadFile(file, path) {
    try {
        if (!storage) {
            await initFirebase();
        }
        
        const storageRef = storage.ref().child(path);
        const snapshot = await storageRef.put(file);
        const downloadURL = await snapshot.ref.getDownloadURL();
        
        console.log('✅ File uploaded successfully:', downloadURL);
        return downloadURL;
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
}