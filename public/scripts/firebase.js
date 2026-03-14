import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth, GoogleAuthProvider } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBbjaIcKB_ig5A9_ziysaSoz_NS1EqdRl0",
    authDomain: "pocketday-6dfbe.firebaseapp.com",
    projectId: "pocketday-6dfbe",
    storageBucket: "pocketday-6dfbe.firebasestorage.app",
    messagingSenderId: "199820187736",
    appId: "1:199820187736:web:e8dbf411c1a3fe69d9522d"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();
