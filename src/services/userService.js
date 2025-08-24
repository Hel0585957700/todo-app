import { doc, getDoc, setDoc, query, where, collection, getDocs } from 'firebase/firestore';
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

// חיפוש משתמש לפי מייל
export async function findUserByEmail(email) {
  try {
    console.log('🔍 Searching for user with email:', email);
    
    const q = query(
      collection(db, 'users'),
      where('email', '==', email.toLowerCase().trim())
    );
    
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      console.log('❌ No user found with email:', email);
      return null;
    }
    
    // יש רק משתמש אחד עם מייל זה
    const userDoc = querySnapshot.docs[0];
    const userData = {
      uid: userDoc.id,
      ...userDoc.data()
    };
    
    console.log('✅ Found user:', userData.firstName, userData.email);
    return userData;
    
  } catch (error) {
    console.error('❌ Error finding user by email:', error);
    return null;
  }
}

// קבלת פרטי משתמשים מרובים (לפי מערך של UIDs)
export async function getMultipleUsers(uids) {
  try {
    const usersData = await Promise.all(
      uids.map(async (uid) => {
        const userData = await getUserData(uid);
        return userData ? { uid, ...userData } : { uid, firstName: 'משתמש לא ידוע', email: '' };
      })
    );
    
    return usersData;
  } catch (error) {
    console.error('Error fetching multiple users:', error);
    return [];
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