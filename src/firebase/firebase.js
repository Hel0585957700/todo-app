// src/firebase.js

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// קוד config שקיבלת (תיקנתי את storageBucket)
const firebaseConfig = {
  apiKey: "AIzaSyAAOzm_e-ehEIBkZ8NnrwbayiCyLt4KESQ",
  authDomain: "todo-770.firebaseapp.com",
  projectId: "todo-770",
  storageBucket: "todo-770.appspot.com", // <--- כך נכון!
  messagingSenderId: "912634383860",
  appId: "1:912634383860:web:4b8fff086b5fce5fa17da1",
  measurementId: "G-K2NWSN2YEZ",
};

// Initialize Firebase once בלבד!
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
