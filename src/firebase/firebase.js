// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// קוד config שקיבלת (תיקנתי את storageBucket)
const firebaseConfig = {
  apiKey: "AIzaSyAkvTRw0RMINTR9Vj2JfHZh1ZWpAL02RQY",
  authDomain: "todo-messimot.firebaseapp.com",
  projectId: "todo-messimot",
  storageBucket: "todo-messimot.firebasestorage.app",
  messagingSenderId: "817690742904",
  appId: "1:817690742904:web:3709eef6e5abeaa67edd8d",
  measurementId: "G-BX281FQZW1"
};

// Initialize Firebase once בלבד!
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
