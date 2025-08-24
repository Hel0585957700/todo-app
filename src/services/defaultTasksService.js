import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebase/firebase';

// קבלת משימות דיפולטיביות לפי סוג אירוע
export async function getDefaultTasks(eventType) {
  try {
    console.log(`🔍 Fetching default tasks for event type: "${eventType}"`);
    
    // שאילתה לקבלת משימות לפי סוג אירוע
    const q = query(
      collection(db, "defaultTasks"),
      where("eventType", "==", eventType)
    );
    
    const snapshot = await getDocs(q);
    
    console.log(`📊 Query executed. Found ${snapshot.size} documents`);
    
    if (snapshot.empty) {
      console.log(`❌ No default tasks found for event type: "${eventType}"`);
      return [];
    }
    
    const tasks = [];
    snapshot.forEach((doc, index) => {
      const data = doc.data();
      console.log(`📄 Document ${index + 1}:`, data);
      
      tasks.push({
        text: data.text || '',
        status: data.status || 'todo',
        category: data.category,
        priority: data.priority,
        description: data.description
      });
    });
    
    console.log(`✅ Successfully loaded ${tasks.length} default tasks for "${eventType}"`);
    return tasks;
    
  } catch (error) {
    console.error("❌ Error fetching default tasks:", error);
    return [];
  }
}

// קבלת כל סוגי האירועים הזמינים
export async function getAvailableEventTypes() {
  try {
    const snapshot = await getDocs(collection(db, "defaultTasks"));
    const eventTypes = new Set();
    
    snapshot.forEach((doc) => {
      const eventType = doc.data().eventType;
      if (eventType) {
        eventTypes.add(eventType);
      }
    });
    
    return Array.from(eventTypes);
    
  } catch (error) {
    console.error("Error fetching event types:", error);
    return ['חתן', 'כלה', 'בר מצווה']; // fallback לסוגים הקיימים
  }
}