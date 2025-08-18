import { doc, getDoc, setDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../firebase/firebase';

// קבלת נתוני משתמש מ-Firestore
export async function getUserData(uid) {
  try {
    const userDoc = await getDoc(doc(db, "users", uid));
    return userDoc.exists() ? userDoc.data() : null;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

// שמירת נתוני משתמש ל-Firestore
export async function saveUserData(uid, userData) {
  try {
    await setDoc(doc(db, "users", uid), userData, { merge: true });
    return true;
  } catch (error) {
    console.error("Error saving user data:", error);
    return false;
  }
}

// אזנה מתמשכת לשינויי אימות
export function subscribeToAuth(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const userData = await getUserData(user.uid);
        callback({
          uid: user.uid,
          email: user.email,
          ...userData
        });
      } catch (error) {
        console.error("Error in subscribeToAuth:", error);
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}