import { db } from './firebase.js';
import { 
    collection, 
    addDoc, 
    deleteDoc, 
    doc, 
    query, 
    where, 
    getDocs, 
    orderBy,
    serverTimestamp,
    setDoc,
    getDoc,
    limit,
    onSnapshot
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const saveUserToCloud = async (uid, userData) => {
    await setDoc(doc(db, "users", uid), {
        ...userData,
        uid: uid,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

export const fetchUserFromCloud = async (uid) => {
    const docSnap = await getDoc(doc(db, "users", uid));
    return docSnap.exists() ? docSnap.data() : null;
};

// Helper to get local date string YYYY-MM-DD
const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Add expense logic based on user request - Ensuring 'uid' is included
export const addExpenseToFirestore = async (uid, expense) => {
    return await addDoc(collection(db, "expenses"), {
        uid: uid,
        category: expense.category,
        title: expense.title || '',
        amount: expense.amount,
        date: expense.date, // User provided date
        id: expense.id,     // Preserve original timestamp-based id
        timestamp: serverTimestamp() 
    });
};

export const fetchExpensesFromFirestore = async (uid) => {
    const q = query(
        collection(db, "expenses"), 
        where("uid", "==", uid),
        limit(100)
    );
    const querySnapshot = await getDocs(q);
    const expenses = querySnapshot.docs.map(doc => ({ 
        firestoreId: doc.id, 
        ...doc.data() 
    }));
    
    // Sort by 'id' (our timestamp) descending in JS to avoid composite index requirement
    return expenses.sort((a, b) => b.id - a.id);
};

// Real-time Listener for Expenses
export const listenToExpenses = (uid, callback) => {
    const q = query(
        collection(db, "expenses"),
        where("uid", "==", uid),
        limit(100)
    );

    return onSnapshot(q, (querySnapshot) => {
        const expenses = querySnapshot.docs.map(doc => ({
            firestoreId: doc.id,
            ...doc.data()
        }));
        
        // Sort by 'id' (our timestamp) descending in JS
        const sorted = expenses.sort((a, b) => b.id - a.id);
        callback(sorted);
    }, (error) => {
        console.error("Firestore Listen Error:", error);
    });
};

export const deleteExpenseFromFirestore = async (expenseDocId) => {
    await deleteDoc(doc(db, "expenses", expenseDocId));
};

// Achievement Persistence
export const saveAchievements = async (uid, achievements) => {
    return await setDoc(doc(db, "users", uid, "data", "achievements"), {
        list: achievements,
        updatedAt: serverTimestamp()
    });
};

export const loadAchievements = async (uid) => {
    const snap = await getDoc(doc(db, "users", uid, "data", "achievements"));
    return snap.exists() ? snap.data().list : [];
};
