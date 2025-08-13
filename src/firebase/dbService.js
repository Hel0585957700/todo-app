import { db } from "./firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";

// הוספת משימה
export function addTask(userEmail, task) {
  return addDoc(collection(db, "tasks"), {
    user: userEmail,
    ...task,
  });
}

// שליפת משימות
export async function getUserTasks(userEmail) {
  const q = query(collection(db, "tasks"), where("user", "==", userEmail));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}
