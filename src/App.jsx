import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase/firebase";

// Components
import Login from "./components/Login";
import Register from "./components/Register";
import TasksList from "./components/TasksList";
import FloatingMenu from "./components/FloatingMenu";
import AddOrEditTaskModal from "./components/AddOrEditTaskModal";

// Services & Hooks
import { subscribeToAuth, saveUserData } from "./services/userService";
import { useTasks } from "./hooks/useTasks";

// Data
import GROOM_TASKS from "./data/groomTasks";
import BRIDE_TASKS from "./data/brideTasks";
import BAR_MITZVA_TASKS from "./data/barMitzvaTasks";

const TASKS_BY_TYPE = {
  חתן: GROOM_TASKS,
  כלה: BRIDE_TASKS,
  "בר מצווה": BAR_MITZVA_TASKS,
};

export default function App() {
  const [step, setStep] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [loading, setLoading] = useState(true);

  // שימוש ב-custom hook לניהול משימות
  const {
    tasks,
    addTask,
    toggleTask,
    editTask,
    setReminder,
    deleteTask,
    createDefaultTasks
  } = useTasks(currentUser);

  // אזנה למצב התחברות Firebase
  useEffect(() => {
    const unsubscribe = subscribeToAuth((user) => {
      console.log('Auth state changed:', user);
      setCurrentUser(user);
      setStep(user ? "tasks" : "login");
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  // Register handler
  async function handleRegister(form) {
    const user = auth.currentUser;
    if (!user) {
      console.error("No authenticated user found");
      return;
    }

    setLoading(true);
    try {
      // שמירת נתוני המשתמש
      const success = await saveUserData(user.uid, {
        email: form.email,
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        nickname: form.nickname,
        eventType: form.eventType,
      });

      if (!success) {
        alert("שגיאה בשמירת נתוני המשתמש");
        return;
      }

      // יצירת משימות ברירת מחדל
      const rawTasks = TASKS_BY_TYPE[form.eventType] || [];
      await createDefaultTasks(rawTasks);

      // עדכון המשתמש הנוכחי
      setCurrentUser({ uid: user.uid, ...form });
      setStep("tasks");
      
    } catch (error) {
      console.error("Error in registration:", error);
      alert("שגיאה ברישום: " + error.message);
    } finally {
      setLoading(false);
    }
  }

  // Logout handler
  async function handleLogout() {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  // טיפול בלחיצה על משימה (החלפת סטטוס)
  function handleTaskClick(taskId) {
    toggleTask(taskId);
  }

  // טיפול בהגדרת תזכורת
  function handleSetReminder(taskId, reminder) {
    if (reminder && reminder.trim()) {
      setReminder(taskId, reminder.trim());
    }
  }

  // פתיחת מודל הוספת משימה
  function openAddTaskModal() {
    setEditTaskId(null);
    setModalOpen(true);
  }

  // פתיחת מודל עריכת משימה
  function openEditTaskModal(taskId) {
    setEditTaskId(taskId);
    setModalOpen(true);
  }

  // טיפול בשמירת משימה מהמודל
  function handleSaveTask(taskData) {
    if (editTaskId === null) {
      // הוספת משימה חדשה
      addTask(taskData.text);
    } else {
      // עריכת משימה קיימת - נעדכן את כל הנתונים
      const task = tasks.find(t => t.id === editTaskId);
      if (task) {
        const updates = {
          text: taskData.text,
          status: taskData.status || task.status,
          reminder: taskData.reminder || task.reminder
        };
        
        // עדכון מספר שדות בבת אחת
        const updatedTasks = tasks.map(t =>
          t.id === editTaskId ? { ...t, ...updates } : t
        );
        
        // כאן נשתמש בפונקציה saveTasks ישירות
        const { saveTasks } = useTasks(currentUser);
        saveTasks(updatedTasks);
      }
    }
    
    setModalOpen(false);
    setEditTaskId(null);
  }

  // קבלת המשימה הנוכחית לעריכה
  function getCurrentTask() {
    if (editTaskId === null) return null;
    return tasks.find(task => task.id === editTaskId) || null;
  }

  // אם עדיין טוען
  if (loading) {
    return (
      <div className="app-container">
        <div className="card">
          <h2>טוען...</h2>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      {step === "login" && (
        <Login onRegister={() => setStep("register")} />
      )}

      {step === "register" && (
        <Register
          onRegister={handleRegister}
          eventTypes={Object.keys(TASKS_BY_TYPE)}
        />
      )}

      {step === "tasks" && currentUser && (
        <div className="card">
          <h2>
            שלום {currentUser.firstName || currentUser.email}! המשימות שלך
            {currentUser.eventType && ` (${currentUser.eventType})`}
          </h2>
          <button onClick={handleLogout}>התנתק</button>
          <TasksList
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onSetReminder={handleSetReminder}
            onEdit={openEditTaskModal}
            onDelete={deleteTask}
          />
        </div>
      )}

      <FloatingMenu
        onAddUser={() => alert("ניהול משתמשים - בקרוב!")}
        onAddTask={openAddTaskModal}
        onChatAI={() => alert("דו שיח עם AI - בקרוב!")}
      />

      <AddOrEditTaskModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditTaskId(null);
        }}
        onSave={handleSaveTask}
        initialTask={getCurrentTask()}
      />
    </div>
  );
}