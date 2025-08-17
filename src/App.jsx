import React, { useState, useEffect } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { auth, db } from "./firebase/firebase";

import Login from "./components/Login";
import Register from "./components/Register";
import TasksList from "./components/TasksList";
import FloatingMenu from "./components/FloatingMenu";
import AddOrEditTaskModal from "./components/AddOrEditTaskModal";

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
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // מאזין למצב התחברות Firebase
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // משוך פרטים נוספים על המשתמש מה־Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const userData = userDoc.exists() ? userDoc.data() : {};
        setCurrentUser({ uid: user.uid, email: user.email, ...userData });

        // משוך משימות
        const tasksDoc = await getDoc(doc(db, "tasks", user.uid));
        if (tasksDoc.exists()) {
          setTasks(tasksDoc.data().list || []);
        } else {
          setTasks([]);
        }

        setStep("tasks");
      } else {
        setCurrentUser(null);
        setTasks([]);
        setStep("login");
      }
    });
    return () => unsubscribe();
  }, []);

  // שמירת משימות ל־Firestore בכל שינוי
  useEffect(() => {
    if (currentUser && currentUser.uid) {
      setDoc(doc(db, "tasks", currentUser.uid), { list: tasks });
    }
  }, [tasks, currentUser]);

  // שמירת משימות אוטומטית
useEffect(() => {
  if (!currentUser) return;

  const unsubscribe = subscribeUserTodos(currentUser.uid, setTasks);
  return () => unsubscribe();
}, [currentUser]);

  // Register handler
  async function handleRegister(form) {
    // אחרי שה־Register.jsx עשה signUp וקיבלנו משתמש מה־auth
    const user = auth.currentUser;
    if (!user) return;

    // שמור פרטים נוספים על המשתמש ב־Firestore
    await setDoc(doc(db, "users", user.uid), {
      email: form.email,
      firstName: form.firstName,
      lastName: form.lastName,
      phone: form.phone,
      nickname: form.nickname,
      eventType: form.eventType,
    });

    // צור משימות ברירת מחדל לפי סוג אירוע
    const rawTasks = TASKS_BY_TYPE[form.eventType] || [];
    const fixedTasks = rawTasks.map((task) =>
      typeof task === "string" ? { text: task, status: "todo" } : task
    );
    setTasks(fixedTasks);

    await setDoc(doc(db, "tasks", user.uid), { list: fixedTasks });

    setCurrentUser({ uid: user.uid, ...form });
    setStep("tasks");
  }

  // Login handler
  async function handleLogin() {
    // כאן אין צורך – Firebase כבר מטפל דרך onAuthStateChanged
  }

  // Logout handler
  async function handleLogout() {
    await signOut(auth);
    setCurrentUser(null);
    setTasks([]);
    setStep("login");
  }

function handleAddTask(newTaskText) {
  if (!newTaskText) return;

  // רשימת משתמשים שמורשים לראות את המשימה
  const allowedUsers = [currentUser.uid, "UID_OF_OTHER_USER"]; // אפשר להוסיף כמה משתמשים לפי הצורך

  // שמירה ל-Firebase
  addTodo(newTaskText, allowedUsers);

  // הוספה ל-State כדי שה-UI יתעדכן מיד (optional)
  setTasks((tasks) => [
    { text: newTaskText, done: false, allowedUsers },
    ...tasks
  ]);
}


  // עריכת משימה קיימת
  function handleEditTask(editedTask) {
    setTasks((tasks) =>
      tasks.map((task, i) => (i === editIndex ? editedTask : task))
    );
    setEditIndex(null);
  }

  function handleTaskClick(index) {
    setTasks((tasks) =>
      tasks.map((t, i) =>
        i === index
          ? { ...t, status: t.status === "done" ? "todo" : "done" }
          : t
      )
    );
  }

  function handleSetReminder(index, reminder) {
    setTasks((tasks) =>
      tasks.map((t, i) => (i === index ? { ...t, reminder } : t))
    );
  }

  function openAddTaskModal() {
    setEditIndex(null);
    setModalOpen(true);
  }

  function openEditTaskModal(index) {
    setEditIndex(index);
    setModalOpen(true);
  }

  return (
    <div className="app-container">
      {step === "login" && (
        <Login
          onLogin={handleLogin}
          onRegister={() => setStep("register")}
        />
      )}

      {step === "register" && (
        <Register
          onRegister={handleRegister}
          eventTypes={Object.keys(TASKS_BY_TYPE)}
        />
      )}

      {step === "tasks" && (
        <div className="card">
          <h2>
            שלום {currentUser?.firstName || currentUser?.email}! המשימות שלך (
            {currentUser?.eventType})
          </h2>
          <button onClick={handleLogout}>התנתק</button>
          <TasksList
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onSetReminder={handleSetReminder}
            onEdit={openEditTaskModal}
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
          setEditIndex(null);
        }}
        onSave={editIndex === null ? handleAddTask : handleEditTask}
        initialTask={editIndex === null ? null : tasks[editIndex]}
      />
    </div>
  );
}
