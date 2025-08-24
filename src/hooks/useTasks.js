import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import { getDefaultTasks } from '../services/defaultTasksService';

export function useTasks(currentUser) {
  const [tasks, setTasks] = useState([]);

  // טעינת משימות ואזנה לשינויים בזמן אמת
  useEffect(() => {
    if (!currentUser?.uid) {
      setTasks([]);
      return;
    }

    // אזנה לשינויים בזמן אמת
    const unsubscribe = onSnapshot(
      doc(db, "tasks", currentUser.uid),
      (doc) => {
        if (doc.exists()) {
          const tasksData = doc.data().list || [];
          // ודא שלכל משימה יש ID
          const tasksWithIds = tasksData.map((task, index) => ({
            id: task.id || `task_${Date.now()}_${index}`,
            text: task.text || '',
            status: task.status || 'todo',
            reminder: task.reminder || null,
            createdAt: task.createdAt || new Date().toISOString(),
            category: task.category || null,
            priority: task.priority || null,
            ...task
          }));
          setTasks(tasksWithIds);
        } else {
          setTasks([]);
        }
      },
      (error) => {
        console.error("Error fetching tasks:", error);
        setTasks([]);
      }
    );

    return () => unsubscribe();
  }, [currentUser?.uid]);

  // שמירת משימות לFirestore
  const saveTasks = async (newTasks) => {
    if (!currentUser?.uid) return false;
    
    try {
      await setDoc(doc(db, "tasks", currentUser.uid), { list: newTasks });
      return true;
    } catch (error) {
      console.error("Error saving tasks:", error);
      return false;
    }
  };

  // הוספת משימה חדשה
  const addTask = async (taskText, category = null, priority = null) => {
    if (!taskText?.trim()) return false;
    
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: taskText.trim(),
      status: "todo",
      createdAt: new Date().toISOString(),
      reminder: null,
      category,
      priority
    };
    
    const updatedTasks = [newTask, ...tasks];
    const success = await saveTasks(updatedTasks);
    
    if (!success) {
      console.error("Failed to add task");
    }
    
    return success;
  };

  // עדכון משימה
  const updateTask = async (taskId, updates) => {
    const updatedTasks = tasks.map(task =>
      task.id === taskId ? { ...task, ...updates } : task
    );
    return await saveTasks(updatedTasks);
  };

  // החלפת סטטוס משימה
  const toggleTask = async (taskId) => {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return false;
    
    const newStatus = task.status === "done" ? "todo" : "done";
    return await updateTask(taskId, { status: newStatus });
  };

  // עריכת טקסט משימה
  const editTask = async (taskId, newText) => {
    if (!newText?.trim()) return false;
    return await updateTask(taskId, { text: newText.trim() });
  };

  // הגדרת תזכורת
  const setReminder = async (taskId, reminder) => {
    return await updateTask(taskId, { reminder });
  };

  // מחיקת משימה
  const deleteTask = async (taskId) => {
    const updatedTasks = tasks.filter(task => task.id !== taskId);
    return await saveTasks(updatedTasks);
  };

  // יצירת משימות ברירת מחדל - עכשיו מ-Firestore
  const createDefaultTasks = async (eventType) => {
    try {
      console.log(`🚀 Creating default tasks for event type: "${eventType}"`);
      
      // קבלת המשימות מ-Firestore
      const defaultTasksData = await getDefaultTasks(eventType);
      
      if (!Array.isArray(defaultTasksData) || defaultTasksData.length === 0) {
        console.log("❌ No default tasks found or invalid data");
        return false;
      }
      
      console.log(`🔧 Processing ${defaultTasksData.length} tasks...`);
      
      const defaultTasks = defaultTasksData.map((task, index) => ({
        id: `default_${Date.now()}_${index}`,
        text: task.text,
        status: "todo",
        createdAt: new Date().toISOString(),
        reminder: null,
        category: task.category || null,
        priority: task.priority || null
      }));
      
      console.log(`💾 Saving ${defaultTasks.length} default tasks to user's collection`);
      const result = await saveTasks(defaultTasks);
      
      if (result) {
        console.log(`✅ Successfully created ${defaultTasks.length} default tasks`);
      } else {
        console.log(`❌ Failed to save default tasks`);
      }
      
      return result;
      
    } catch (error) {
      console.error("❌ Error creating default tasks:", error);
      return false;
    }
  };

  // הוספת משימות דיפולטיביות למשימות הקיימות (במקום להחליף)
  const addDefaultTasks = async (eventType) => {
    try {
      console.log(`🔄 Adding default tasks for event type: "${eventType}"`);
      
      const defaultTasksData = await getDefaultTasks(eventType);
      
      if (!Array.isArray(defaultTasksData) || defaultTasksData.length === 0) {
        console.log("❌ No default tasks to add");
        alert("לא נמצאו משימות ברירת מחדל עבור סוג האירוע הזה");
        return false;
      }
      
      console.log(`📝 Current tasks count: ${tasks.length}`);
      console.log(`➕ Adding ${defaultTasksData.length} default tasks`);
      
      const newDefaultTasks = defaultTasksData.map((task, index) => ({
        id: `additional_${Date.now()}_${index}`,
        text: task.text,
        status: "todo",
        createdAt: new Date().toISOString(),
        reminder: null,
        category: task.category || null,
        priority: task.priority || null
      }));
      
      const updatedTasks = [...tasks, ...newDefaultTasks];
      console.log(`💾 Saving total of ${updatedTasks.length} tasks`);
      
      const result = await saveTasks(updatedTasks);
      
      if (result) {
        console.log(`✅ Successfully added ${newDefaultTasks.length} default tasks`);
      } else {
        console.log(`❌ Failed to save updated tasks`);
      }
      
      return result;
      
    } catch (error) {
      console.error("❌ Error adding default tasks:", error);
      return false;
    }
  };

  return {
    tasks,
    addTask,
    updateTask,
    toggleTask,
    editTask,
    setReminder,
    deleteTask,
    saveTasks,
    createDefaultTasks,
    addDefaultTasks
  };
}