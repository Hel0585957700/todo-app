import { useState, useEffect } from 'react';
import { 
  subscribeToEventTasks, 
  saveEventTasks, 
  getEventTasks 
} from '../services/eventsService';
import { getDefaultTasks } from '../services/defaultTasksService';

export function useEventTasks(eventId) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  // טעינת משימות ואזנה לשינויים בזמן אמת
  useEffect(() => {
    if (!eventId) {
      setTasks([]);
      setLoading(false);
      return;
    }

    setLoading(true);

    // אזנה לשינויים בזמן אמת
    const unsubscribe = subscribeToEventTasks(eventId, (tasksData) => {
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
      setLoading(false);
    });

    return () => unsubscribe();
  }, [eventId]);

  // שמירת משימות
  const saveTasks = async (newTasks) => {
    if (!eventId) return false;
    
    try {
      const success = await saveEventTasks(eventId, newTasks);
      return success;
    } catch (error) {
      console.error("Error saving event tasks:", error);
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
    
    let newStatus;
    if (task.status === "todo") {
      newStatus = "inprogress";
    } else if (task.status === "inprogress") {
      newStatus = "done";
    } else {
      newStatus = "todo";
    }
    
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

  // הוספת משימות דיפולטיביות למשימות הקיימות
  const addDefaultTasks = async (eventType) => {
    try {
      console.log(`🔄 Adding default tasks for event type: "${eventType}"`);
      
      const defaultTasksData = await getDefaultTasks(eventType);
      
      if (!Array.isArray(defaultTasksData) || defaultTasksData.length === 0) {
        console.log("❌ No default tasks to add");
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

  // הסרת משימות דיפולטיביות
  const removeDefaultTasks = async () => {
    try {
      console.log(`🗑️ Removing default tasks...`);
      
      // סנן רק משימות שלא דיפולטיביות
      const nonDefaultTasks = tasks.filter(task => 
        !task.id.startsWith('default_') && !task.id.startsWith('additional_')
      );
      
      console.log(`📝 Keeping ${nonDefaultTasks.length} non-default tasks`);
      console.log(`🗑️ Removing ${tasks.length - nonDefaultTasks.length} default tasks`);
      
      const result = await saveTasks(nonDefaultTasks);
      
      if (result) {
        console.log(`✅ Successfully removed default tasks`);
      } else {
        console.log(`❌ Failed to remove default tasks`);
      }
      
      return result;
      
    } catch (error) {
      console.error("❌ Error removing default tasks:", error);
      return false;
    }
  };

  return {
    tasks,
    loading,
    addTask,
    updateTask,
    toggleTask,
    editTask,
    setReminder,
    deleteTask,
    saveTasks,
    addDefaultTasks,
    removeDefaultTasks
  };
}