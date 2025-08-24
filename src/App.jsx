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
import { getAvailableEventTypes } from "./services/defaultTasksService";
import { useTasks } from "./hooks/useTasks";

export default function App() {
  const [step, setStep] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [editTaskId, setEditTaskId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState(['חתן', 'כלה', 'בר מצווה']);

  // שימוש ב-custom hook לניהול משימות
  const {
    tasks,
    addTask,
    toggleTask,
    updateTask,
    setReminder,
    deleteTask,
    createDefaultTasks,
    addDefaultTasks
  } = useTasks(currentUser);

  // טעינת סוגי אירועים מ-Firestore
  useEffect(() => {
    async function loadEventTypes() {
      try {
        const types = await getAvailableEventTypes();
        setEventTypes(types);
      } catch (error) {
        console.error("Error loading event types:", error);
      }
    }
    loadEventTypes();
  }, []);

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

      // יצירת משימות ברירת מחדל מ-Firestore
      const tasksCreated = await createDefaultTasks(form.eventType);
      
      if (!tasksCreated) {
        console.warn("No default tasks were created");
      }

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

  // הוספת משימות דיפולטיביות
  async function handleAddDefaultTasks() {
    if (!currentUser?.eventType) {
      alert("לא ניתן לקבוע את סוג האירוע");
      return;
    }

    const confirm = window.confirm(
      `האם אתה בטוח שברצונך להוסיף את המשימות הדיפולטיביות עבור ${currentUser.eventType}?`
    );
    
    if (!confirm) return;

    const success = await addDefaultTasks(currentUser.eventType);
    
    if (success) {
      alert("המשימות הדיפולטיביות נוספו בהצלחה!");
    } else {
      alert("אירעה שגיאה בהוספת המשימות הדיפולטיביות");
    }
  }

  // טיפול בשמירת משימה מהמודל
  async function handleSaveTask(taskData) {
    if (editTaskId === null) {
      // הוספת משימה חדשה
      await addTask(taskData.text, taskData.category, taskData.priority);
    } else {
      // עריכת משימה קיימת
      const task = tasks.find(t => t.id === editTaskId);
      if (task) {
        const updates = {
          text: taskData.text,
          status: taskData.status || task.status,
          reminder: taskData.reminder || task.reminder,
          category: taskData.category || task.category,
          priority: taskData.priority || task.priority
        };
        
        // שימוש ב-updateTask מה-hook הקיים
        await updateTask(editTaskId, updates);
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
          eventTypes={eventTypes}
          onBackToLogin={() => setStep("login")}
        />
      )}

      {step === "tasks" && currentUser && (
        <div className="card">
          <h2>
            שלום {currentUser.firstName || currentUser.email}! המשימות שלך
            {currentUser.eventType && ` (${currentUser.eventType})`}
          </h2>
          
          <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
            <button onClick={handleLogout}>התנתק</button>
            <button 
              onClick={handleAddDefaultTasks}
              style={{ 
                background: 'linear-gradient(135deg, #28a745 0%, #20c997 100%)', 
                color: 'white' 
              }}
            >
              הוסף משימות ברירת מחדל
            </button>
          </div>
          
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