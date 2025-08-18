import { useState, useEffect } from 'react';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase';

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
  const addTask = async (taskText) => {
    if (!taskText?.trim()) return false;
    
    const newTask = {
      id: `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      text: taskText.trim(),
      status: "todo",
      createdAt: new Date().toISOString(),
      reminder: null
    };
    
    const updatedTasks = [newTask, ...tasks];
    const success = await saveTasks(updatedTasks);
    
    if (!success) {
      // אם השמירה נכשלה, עדכן את המצב המקומי בחזרה
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

  // יצירת משימות ברירת מחדל
  const createDefaultTasks = async (tasksList) => {
    if (!Array.isArray(tasksList)) return false;
    
    const defaultTasks = tasksList.map((task, index) => ({
      id: `default_${Date.now()}_${index}`,
      text: typeof task === "string" ? task : (task.text || ''),
      status: "todo",
      createdAt: new Date().toISOString(),
      reminder: null
    }));
    
    return await saveTasks(defaultTasks);
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
    createDefaultTasks
  };
}