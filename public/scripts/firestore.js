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
        amount: expense.amount,
        date: getTodayStr(), // consistency with app.js
        timestamp: serverTimestamp() // Using server side timestamp
    });
};

export const fetchExpensesFromFirestore = async (uid) => {
    const q = query(
        collection(db, "expenses"), 
        where("uid", "==", uid),
        orderBy("id", "desc"),
        limit(50) // Performance: only show recent 50
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

export const deleteExpenseFromFirestore = async (expenseDocId) => {
    await deleteDoc(doc(db, "expenses", expenseDocId));
};
