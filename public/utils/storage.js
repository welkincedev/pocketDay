export const loadState = (key, defaultVal) => {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : defaultVal;
};

export const saveState = (key, val) => {
    localStorage.setItem(key, JSON.stringify(val));
};

// Placeholder for Firestore sync
export const syncToCloud = async (collection, data) => {
    console.log(`Syncing ${collection} to cloud...`, data);
    // Future Firestore implementation
};
