import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';

/**
 * Get all documents from a collection
 * @param {string} collectionName - Name of the Firestore collection
 * @returns {Promise<Array>} Array of documents with id included
 */
export const getCollection = async (collectionName) => {
  try {
    const collectionRef = collection(db, collectionName);
    const snapshot = await getDocs(collectionRef);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error getting collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Get a single document by ID
 * @param {string} collectionName - Name of the Firestore collection
 * @param {string} docId - Document ID
 * @returns {Promise<Object|null>} Document data with id or null if not found
 */
export const getDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return {
        id: docSnap.id,
        ...docSnap.data()
      };
    } else {
      return null;
    }
  } catch (error) {
    console.error(`Error getting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Add a new document to a collection
 * @param {string} collectionName - Name of the Firestore collection
 * @param {Object} data - Document data
 * @returns {Promise<Object>} Created document with generated id
 */
export const addDocument = async (collectionName, data) => {
  try {
    const collectionRef = collection(db, collectionName);
    const docRef = await addDoc(collectionRef, {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Return the created document with its ID
    return {
      id: docRef.id,
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    };
  } catch (error) {
    console.error(`Error adding document to ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Update an existing document
 * @param {string} collectionName - Name of the Firestore collection
 * @param {string} docId - Document ID
 * @param {Object} data - Fields to update
 * @returns {Promise<void>}
 */
export const updateDocument = async (collectionName, docId, data) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await updateDoc(docRef, {
      ...data,
      updatedAt: serverTimestamp()
    });
  } catch (error) {
    console.error(`Error updating document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Delete a document
 * @param {string} collectionName - Name of the Firestore collection
 * @param {string} docId - Document ID
 * @returns {Promise<void>}
 */
export const deleteDocument = async (collectionName, docId) => {
  try {
    const docRef = doc(db, collectionName, docId);
    await deleteDoc(docRef);
  } catch (error) {
    console.error(`Error deleting document ${docId} from ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Query a collection with filters and ordering
 * @param {string} collectionName - Name of the Firestore collection
 * @param {Array} filters - Array of filter objects: [{field, operator, value}]
 * @param {Object} options - Query options: {orderByField, orderDirection, limitCount}
 * @returns {Promise<Array>} Array of matching documents
 */
export const queryCollection = async (collectionName, filters = [], options = {}) => {
  try {
    const collectionRef = collection(db, collectionName);
    let q = collectionRef;
    
    // Build query with filters
    const constraints = [];
    
    filters.forEach(filter => {
      constraints.push(where(filter.field, filter.operator, filter.value));
    });
    
    // Add ordering
    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    
    // Add limit
    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    
    if (constraints.length > 0) {
      q = query(collectionRef, ...constraints);
    }
    
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error(`Error querying collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Subscribe to real-time updates on a collection
 * @param {string} collectionName - Name of the Firestore collection
 * @param {Function} callback - Callback function to receive updates
 * @param {Array} filters - Optional array of filter objects
 * @param {Object} options - Query options
 * @returns {Function} Unsubscribe function
 */
export const subscribeToCollection = (collectionName, callback, filters = [], options = {}) => {
  try {
    const collectionRef = collection(db, collectionName);
    let q = collectionRef;
    
    // Build query with filters
    const constraints = [];
    
    filters.forEach(filter => {
      constraints.push(where(filter.field, filter.operator, filter.value));
    });
    
    // Add ordering
    if (options.orderByField) {
      constraints.push(orderBy(options.orderByField, options.orderDirection || 'asc'));
    }
    
    // Add limit
    if (options.limitCount) {
      constraints.push(limit(options.limitCount));
    }
    
    if (constraints.length > 0) {
      q = query(collectionRef, ...constraints);
    }
    
    // Subscribe to real-time updates
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const documents = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      callback(documents);
    }, (error) => {
      console.error(`Error in subscription to ${collectionName}:`, error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error subscribing to collection ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Subscribe to a single document's real-time updates
 * @param {string} collectionName - Name of the Firestore collection
 * @param {string} docId - Document ID
 * @param {Function} callback - Callback function to receive updates
 * @returns {Function} Unsubscribe function
 */
export const subscribeToDocument = (collectionName, docId, callback) => {
  try {
    const docRef = doc(db, collectionName, docId);
    
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        callback({
          id: docSnap.id,
          ...docSnap.data()
        });
      } else {
        callback(null);
      }
    }, (error) => {
      console.error(`Error in subscription to document ${docId} in ${collectionName}:`, error);
    });
    
    return unsubscribe;
  } catch (error) {
    console.error(`Error subscribing to document ${docId} in ${collectionName}:`, error);
    throw error;
  }
};

// Export Firestore utilities
export { serverTimestamp, Timestamp };
