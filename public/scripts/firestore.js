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
    limit
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

export const saveUserToCloud = async (userId, userData) => {
    await setDoc(doc(db, "users", userId), {
        ...userData,
        updatedAt: serverTimestamp()
    }, { merge: true });
};

export const fetchUserFromCloud = async (userId) => {
    const docSnap = await getDoc(doc(db, "users", userId));
    return docSnap.exists() ? docSnap.data() : null;
};

// Helper to get local date string YYYY-MM-DD
const getTodayStr = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

// Add expense logic based on user request
export const addExpenseToFirestore = async (userId, expense) => {
    return await addDoc(collection(db, "expenses"), {
        userId: userId,
        category: expense.category,
        amount: expense.amount,
        date: getTodayStr(), // consistency with app.js
        timestamp: Date.now()
    });
};

export const fetchExpensesFromFirestore = async (userId) => {
    const q = query(
        collection(db, "expenses"), 
        where("userId", "==", userId),
        orderBy("id", "desc"),
        limit(50) // Performance: only show recent 50
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteExpenseFromFirestore = async (expenseDocId) => {
    await deleteDoc(doc(db, "expenses", expenseDocId));
};
