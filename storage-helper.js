// Storage helper for large data (nodes.json) using IndexedDB
// Chrome storage has quotas, IndexedDB can store much larger files

const DB_NAME = 'HelmiesN8nAssistant';
const DB_VERSION = 1;
const STORE_NAME = 'largeData';

// Open IndexedDB
function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };
  });
}

// Store large data
async function storeLargeData(key, data) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put(data, key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Get large data
async function getLargeData(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readonly');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.get(key);
    
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Delete large data
async function deleteLargeData(key) {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(key);
    
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

// Check if data exists
async function hasLargeData(key) {
  try {
    const data = await getLargeData(key);
    return data !== undefined;
  } catch (error) {
    return false;
  }
}
