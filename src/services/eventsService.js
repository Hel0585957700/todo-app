import { 
  collection, 
  doc, 
  addDoc, 
  getDoc, 
  getDocs, 
  setDoc, 
  query, 
  where, 
  orderBy,
  onSnapshot,
  updateDoc 
} from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getDefaultTasks } from './defaultTasksService';

// יצירת אירוע חדש
export async function createEvent(eventData) {
  try {
    console.log('🎉 Creating new event:', eventData);

    // יצירת האירוע
    const eventRef = await addDoc(collection(db, 'events'), {
      name: eventData.name,
      type: eventData.type,
      date: eventData.date,
      description: eventData.description,
      ownerId: eventData.ownerId,
      members: eventData.members || [eventData.ownerId],
      createdAt: eventData.createdAt,
      tasksCount: 0
    });

    console.log('✅ Event created with ID:', eventRef.id);

    // אם נבחר להוסיף משימות ברירת מחדל
    if (eventData.addDefaultTasks && eventData.type !== 'אחר') {
      console.log('📋 Adding default tasks for event type:', eventData.type);
      
      const defaultTasksData = await getDefaultTasks(eventData.type);
      
      if (defaultTasksData && defaultTasksData.length > 0) {
        const defaultTasks = defaultTasksData.map((task, index) => ({
          id: `default_${Date.now()}_${index}`,
          text: task.text,
          status: "todo",
          createdAt: new Date().toISOString(),
          reminder: null,
          category: task.category || null,
          priority: task.priority || null
        }));

        // שמירת המשימות הדיפולטיביות לאירוע
        await setDoc(doc(db, "eventTasks", eventRef.id), { 
          list: defaultTasks,
          lastUpdated: new Date().toISOString()
        });

        // עדכון מספר המשימות באירוע
        await updateDoc(doc(db, "events", eventRef.id), {
          tasksCount: defaultTasks.length
        });

        console.log(`✅ Added ${defaultTasks.length} default tasks to event`);
      }
    } else {
      // יצירת רשימת משימות ריקה
      await setDoc(doc(db, "eventTasks", eventRef.id), { 
        list: [],
        lastUpdated: new Date().toISOString()
      });
    }

    // החזרת האירוע עם ה-ID
    const eventWithId = {
      id: eventRef.id,
      name: eventData.name,
      type: eventData.type,
      date: eventData.date,
      description: eventData.description,
      ownerId: eventData.ownerId,
      members: eventData.members || [eventData.ownerId],
      createdAt: eventData.createdAt,
      tasksCount: eventData.addDefaultTasks && eventData.type !== 'אחר' ? 
        (await getDefaultTasks(eventData.type)).length : 0
    };

    return eventWithId;

  } catch (error) {
    console.error('❌ Error creating event:', error);
    return null;
  }
}

// קבלת כל האירועים של משתמש
export async function getUserEvents(userId) {
  try {
    console.log('📋 Fetching events for user:', userId);

    const q = query(
      collection(db, 'events'),
      where('members', 'array-contains', userId),
      orderBy('createdAt', 'desc')
    );

    const snapshot = await getDocs(q);
    const events = [];

    snapshot.forEach((doc) => {
      events.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(`✅ Found ${events.length} events for user`);
    return events;

  } catch (error) {
    console.error('❌ Error fetching user events:', error);
    return [];
  }
}

// קבלת אירוע לפי ID
export async function getEvent(eventId) {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    
    if (eventDoc.exists()) {
      return {
        id: eventDoc.id,
        ...eventDoc.data()
      };
    } else {
      console.log('❌ Event not found:', eventId);
      return null;
    }
  } catch (error) {
    console.error('❌ Error fetching event:', error);
    return null;
  }
}

// עדכון אירוע
export async function updateEvent(eventId, updates) {
  try {
    await updateDoc(doc(db, 'events', eventId), {
      ...updates,
      lastUpdated: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error('❌ Error updating event:', error);
    return false;
  }
}

// קבלת משימות של אירוע
export async function getEventTasks(eventId) {
  try {
    const tasksDoc = await getDoc(doc(db, 'eventTasks', eventId));
    
    if (tasksDoc.exists()) {
      return tasksDoc.data().list || [];
    } else {
      // אם אין מסמך משימות, צור אחד ריק
      await setDoc(doc(db, 'eventTasks', eventId), { 
        list: [],
        lastUpdated: new Date().toISOString()
      });
      return [];
    }
  } catch (error) {
    console.error('❌ Error fetching event tasks:', error);
    return [];
  }
}

// שמירת משימות אירוע
export async function saveEventTasks(eventId, tasks) {
  try {
    await setDoc(doc(db, 'eventTasks', eventId), { 
      list: tasks,
      lastUpdated: new Date().toISOString()
    });

    // עדכון מספר המשימות באירוע
    await updateDoc(doc(db, 'events', eventId), {
      tasksCount: tasks.length
    });

    return true;
  } catch (error) {
    console.error('❌ Error saving event tasks:', error);
    return false;
  }
}

// אזנה לשינויים במשימות אירוע בזמן אמת
export function subscribeToEventTasks(eventId, callback) {
  return onSnapshot(
    doc(db, 'eventTasks', eventId),
    (doc) => {
      if (doc.exists()) {
        const tasksData = doc.data().list || [];
        callback(tasksData);
      } else {
        callback([]);
      }
    },
    (error) => {
      console.error('❌ Error in event tasks subscription:', error);
      callback([]);
    }
  );
}

// הוספת חבר לאירוע
export async function addMemberToEvent(eventId, userId) {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    
    if (eventDoc.exists()) {
      const currentMembers = eventDoc.data().members || [];
      
      if (!currentMembers.includes(userId)) {
        const updatedMembers = [...currentMembers, userId];
        
        await updateDoc(doc(db, 'events', eventId), {
          members: updatedMembers
        });
        
        return true;
      }
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error adding member to event:', error);
    return false;
  }
}

// הסרת חבר מאירוע
export async function removeMemberFromEvent(eventId, userId) {
  try {
    const eventDoc = await getDoc(doc(db, 'events', eventId));
    
    if (eventDoc.exists()) {
      const currentMembers = eventDoc.data().members || [];
      const updatedMembers = currentMembers.filter(id => id !== userId);
      
      await updateDoc(doc(db, 'events', eventId), {
        members: updatedMembers
      });
      
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('❌ Error removing member from event:', error);
    return false;
  }
}