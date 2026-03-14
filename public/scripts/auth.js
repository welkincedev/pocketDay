import { auth, googleProvider } from './firebase.js';
import { signInWithPopup, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

export const loginWithGoogle = async () => {
    try {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    } catch (error) {
        console.error("Auth Error:", error);
        throw error;
    }
};

export const logout = () => signOut(auth);

export const observeAuth = (callback) => {
    onAuthStateChanged(auth, callback);
};
