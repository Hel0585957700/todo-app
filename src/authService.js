import { auth } from "./firebase/firebase";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";

// רישום משתמש חדש
export function signUp(email, password) {
  return createUserWithEmailAndPassword(auth, email, password);
}

// התחברות משתמש קיים
export function signIn(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}
