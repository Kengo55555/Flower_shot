import { INDEXEDDB_NAME, INDEXEDDB_VERSION, INDEXEDDB_STORE_NAME } from "../constants";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(INDEXEDDB_NAME, INDEXEDDB_VERSION);
    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result;
      if (!database.objectStoreNames.contains(INDEXEDDB_STORE_NAME)) {
        database.createObjectStore(INDEXEDDB_STORE_NAME, { keyPath: "key" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveImage(key: string, blob: Blob): Promise<void> {
  const database = await openDB();
  const tx = database.transaction(INDEXEDDB_STORE_NAME, "readwrite");
  tx.objectStore(INDEXEDDB_STORE_NAME).put({ key, blob, savedAt: Date.now() });
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getImage(key: string): Promise<Blob | null> {
  const database = await openDB();
  const tx = database.transaction(INDEXEDDB_STORE_NAME, "readonly");
  const request = tx.objectStore(INDEXEDDB_STORE_NAME).get(key);
  return new Promise((resolve, reject) => {
    request.onsuccess = () => {
      resolve(request.result?.blob ?? null);
    };
    request.onerror = () => reject(request.error);
  });
}

export async function deleteImage(key: string): Promise<void> {
  const database = await openDB();
  const tx = database.transaction(INDEXEDDB_STORE_NAME, "readwrite");
  tx.objectStore(INDEXEDDB_STORE_NAME).delete(key);
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllImageKeys(): Promise<string[]> {
  const database = await openDB();
  const tx = database.transaction(INDEXEDDB_STORE_NAME, "readonly");
  const request = tx.objectStore(INDEXEDDB_STORE_NAME).getAllKeys();
  return new Promise((resolve, reject) => {
    request.onsuccess = () => resolve(request.result as string[]);
    request.onerror = () => reject(request.error);
  });
}

export async function clearAllImages(): Promise<void> {
  const database = await openDB();
  const tx = database.transaction(INDEXEDDB_STORE_NAME, "readwrite");
  tx.objectStore(INDEXEDDB_STORE_NAME).clear();
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getStorageEstimate(): Promise<{
  usage: number;
  quota: number;
}> {
  if (navigator.storage && navigator.storage.estimate) {
    const est = await navigator.storage.estimate();
    return { usage: est.usage || 0, quota: est.quota || 0 };
  }
  return { usage: 0, quota: 0 };
}
