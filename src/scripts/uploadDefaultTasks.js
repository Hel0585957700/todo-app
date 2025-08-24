import { initializeApp } from 'firebase/app';
import { getFirestore, collection, doc, setDoc } from 'firebase/firestore';

// העתק את הקונפיגורציה מ-firebase.js
const firebaseConfig = {
  apiKey: "AIzaSyAkvTRw0RMINTR9Vj2JfHZh1ZWpAL02RQY",
  authDomain: "todo-messimot.firebaseapp.com",
  projectId: "todo-messimot",
  storageBucket: "todo-messimot.firebasestorage.app",
  messagingSenderId: "817690742904",
  appId: "1:817690742904:web:3709eef6e5abeaa67edd8d",
  measurementId: "G-BX281FQZW1"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// רשימת המשימות הדיפולטיביות
const defaultTasks = [
  // משימות חתן
  { eventType: "חתן", text: "תיאום וסיכום ראשוני בין הצדדים על תאריך ומקום החתונה", category: null, priority: null },
  { eventType: "חתן", text: "בדיקת ההכנות באולמות אופציונליים", category: null, priority: null },
  { eventType: "חתן", text: "כתיבה לרבי לקבלת ברכה לשידוך", category: null, priority: null },
  { eventType: "חתן", text: "הודעה לקרובים ולחברים", category: null, priority: null },
  { eventType: "חתן", text: "תיאום הדרכה לחתן", category: null, priority: null },
  { eventType: "חתן", text: "לימוד דיני ומנהגי החתונה", category: null, priority: null },
  { eventType: "חתן", text: "לימוד הלכות ייחוד", category: null, priority: null },
  { eventType: "חתן", text: "קניית סט כלה", category: null, priority: null },
  { eventType: "חתן", text: "קניית תכשיטים לכלה", category: null, priority: null },
  { eventType: "חתן", text: "רישום ברבנות", category: null, priority: null },
  { eventType: "חתן", text: "הדפסת הזמנות", category: null, priority: null },
  { eventType: "חתן", text: "בחירת אולם ותיאום אולם", category: null, priority: null },
  { eventType: "חתן", text: "צלם לחתונה", category: null, priority: null },
  { eventType: "חתן", text: "זמר לחתונה", category: null, priority: null },
  { eventType: "חתן", text: "כתיבת הכתובה", category: null, priority: null },

  // משימות כלה
  { eventType: "כלה", text: "ארגון הלחיים במידה ומתקיים בנפרד מהווארט", category: null, priority: null },
  { eventType: "כלה", text: "תיאום הדרכת כלות", category: null, priority: null },
  { eventType: "כלה", text: "בדיקת ההכנות באולמות אופציונליים", category: null, priority: null },
  { eventType: "כלה", text: "כתיבה לרבי לקבלת ברכה לשידוך", category: null, priority: null },
  { eventType: "כלה", text: "הודעה לקרובים ולחברים", category: null, priority: null },
  { eventType: "כלה", text: "רישום ברבנות", category: null, priority: null },
  { eventType: "כלה", text: "שמלת כלה", category: null, priority: null },
  { eventType: "כלה", text: "פאה", category: null, priority: null },
  { eventType: "כלה", text: "נעליים", category: null, priority: null },
  { eventType: "כלה", text: "מאפרת", category: null, priority: null },
  { eventType: "כלה", text: "צלם לחתונה", category: null, priority: null },
  { eventType: "כלה", text: "זמר לחתונה", category: null, priority: null },
  { eventType: "כלה", text: "הדפסת הזמנות", category: null, priority: null },
  { eventType: "כלה", text: "בחירת תפריט", category: null, priority: null },
  { eventType: "כלה", text: "לימוד הלכות טהרה", category: null, priority: null },

  // משימות בר מצווה
  { eventType: "בר מצווה", text: "ללמוד דרשה", category: null, priority: null },
  { eventType: "בר מצווה", text: "להזמין סנדקים", category: null, priority: null },
  { eventType: "בר מצווה", text: "לסגור אולם", category: null, priority: null },
  { eventType: "בר מצווה", text: "להזמין את הרב", category: null, priority: null },
  { eventType: "בר מצווה", text: "לקנות טלית ותפילין", category: null, priority: null },
  { eventType: "בר מצווה", text: "לארגן עליה לתורה", category: null, priority: null },
  { eventType: "בר מצווה", text: "להכין זריקה", category: null, priority: null },
  { eventType: "בר מצווה", text: "לקבוע צילום", category: null, priority: null },
];

async function uploadDefaultTasks() {
  console.log('🚀 Starting upload of default tasks...');
  
  try {
    for (let i = 0; i < defaultTasks.length; i++) {
      const task = defaultTasks[i];
      const docId = `${task.eventType}-${String(i + 1).padStart(3, '0')}`;
      
      await setDoc(doc(db, 'defaultTasks', docId), task);
      console.log(`✅ Uploaded: ${docId} - ${task.text.substring(0, 30)}...`);
    }
    
    console.log(`🎉 Successfully uploaded ${defaultTasks.length} default tasks!`);
    
  } catch (error) {
    console.error('❌ Error uploading tasks:', error);
  }
}

// רוץ את הפונקציה
uploadDefaultTasks();