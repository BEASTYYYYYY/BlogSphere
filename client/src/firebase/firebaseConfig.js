// client/src/firebase/firebaseConfig.js
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { GoogleAuthProvider } from "firebase/auth";

const firebaseConfig = {
    apiKey: "AIzaSyBEagY44uAZF8grHYbmsb0roUnaZ75USDY",
    authDomain: "blogsphere-f8fcf.firebaseapp.com",
    projectId: "blogsphere-f8fcf",
    storageBucket: "blogsphere-f8fcf.firebasestorage.app",
    messagingSenderId: "22094913422",
    appId: "1:22094913422:web:0920dfc9e38d760128cedf",
    measurementId: "G-9W7EBM671M"
};

export const googleProvider = new GoogleAuthProvider();
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
