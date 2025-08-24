// קובץ זה מיושן - כל הפונקציונליות עברה ל-useEventTasks.js
// משאירים אותו לתאימות לאחור אם יש צורך

export function useTasks() {
  console.warn('useTasks hook is deprecated. Use useEventTasks instead.');
  
  return {
    tasks: [],
    addTask: () => false,
    updateTask: () => false,
    toggleTask: () => false,
    editTask: () => false,
    setReminder: () => false,
    deleteTask: () => false,
    saveTasks: () => false,
    createDefaultTasks: () => false,
    addDefaultTasks: () => false
  };
}