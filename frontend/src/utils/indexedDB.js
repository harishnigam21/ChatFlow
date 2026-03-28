const DB_NAME = "chat_media";
const STORE_NAME = "media";

export const openDB = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      db.createObjectStore(STORE_NAME);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const saveToDB = async (key, blob) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);
  store.put(
    {
      blob,
      createdAt: Date.now(),
    },
    key,
  );
  return tx.complete;
};

export const getFromDB = async (key) => {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readonly");
  const store = tx.objectStore(STORE_NAME);
  return new Promise((resolve, reject) => {
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

//on logout
export const clearMediaCache = async (st) => {
  const db = await openDB();
  const tx = db.transaction(st, "readwrite");
  const store = tx.objectStore(st);
  store.clear();
};

//after every downloads
export const cleanupOldMedia = async (st, limit = 50) => {
  const db = await openDB();
  const tx = db.transaction(st, "readwrite");
  const store = tx.objectStore(st);

  const items = [];

  const request = store.openCursor();

  request.onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor) {
      const value = cursor.value;

      items.push({
        key: cursor.key,
        createdAt: value.createdAt,
      });

      cursor.continue();
    } else {
      if (items.length <= limit) return;
      items.sort((a, b) => a.createdAt - b.createdAt);
      const toDelete = items.slice(0, items.length - limit);
      toDelete.forEach((item) => {
        store.delete(item.key);
      });
    }
  };
};

// on app start
export const cleanupExpiredMedia = async (st) => {
  const MAX_AGE = 7 * 24 * 60 * 60 * 1000;
  const db = await openDB();
  const tx = db.transaction(st, "readwrite");
  const store = tx.objectStore(st);

  const request = store.openCursor();

  request.onsuccess = (event) => {
    const cursor = event.target.result;

    if (cursor) {
      const item = cursor.value;
      const now = Date.now();

      if (now - item.createdAt > MAX_AGE) {
        cursor.delete();
      }

      cursor.continue();
    }
  };
};
