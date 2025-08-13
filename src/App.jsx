import React, { useState, useEffect } from "react";
import Login from "./components/Login";
import Register from "./components/Register";
import TasksList from "./components/TasksList";
import FloatingMenu from "./components/FloatingMenu";
import AddOrEditTaskModal from "./components/AddOrEditTaskModal";
import GROOM_TASKS from "./data/groomTasks";
import BRIDE_TASKS from "./data/brideTasks";
import BAR_MITZVA_TASKS from "./data/barMitzvaTasks";
import {
  saveUserToStorage,
  loadUserFromStorage,
  getAllUserEmails,
  saveTasksToStorage,
  loadTasksFromStorage,
  addUserToIndex,
} from "./utils/storage";

const TASKS_BY_TYPE = {
  חתן: GROOM_TASKS,
  כלה: BRIDE_TASKS,
  "בר מצווה": BAR_MITZVA_TASKS,
};

export default function App() {
  const [step, setStep] = useState("login");
  const [email, setEmail] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  // טעינה ראשונית: אם אין משתמשים — עובר אוטומטית ל-register
  useEffect(() => {
    const users = getAllUserEmails();
    if (users.length === 0) setStep("register");
  }, []);

  // שמירת משימות אוטומטית
  useEffect(() => {
    if (currentUser && currentUser.email) {
      saveTasksToStorage(currentUser.email, tasks);
    }
  }, [tasks, currentUser]);

  // Register handler
  function handleRegister(form) {
    console.log("נרשם משתמש:", form);
    if (!form.email) {
      alert("יש למלא אימייל!");
      return;
    }
    saveUserToStorage(form);
    addUserToIndex(form.email);
    setEmail(form.email);
    setCurrentUser(form);
    // משימות ברירת מחדל:
    const rawTasks = TASKS_BY_TYPE[form.eventType] || [];
    const fixedTasks = rawTasks.map((task) =>
      typeof task === "string" ? { text: task, status: "todo" } : task
    );
    setTasks(fixedTasks);
    setStep("tasks");
  }

  // Login handler
  function handleLogin(emailInput) {
    const user = loadUserFromStorage(emailInput);
    if (user) {
      setCurrentUser(user);
      setEmail(user.email);
      // טען משימות למשתמש זה:
      const tasksFromStorage = loadTasksFromStorage(user.email);
      setTasks(tasksFromStorage.length > 0 ? tasksFromStorage : []);
      setStep("tasks");
    } else {
      alert("משתמש לא נמצא! אנא הירשם.");
      setStep("register");
    }
  }

  // הוספת משימה חדשה
  function handleAddTask(newTask) {
    setTasks((tasks) => [newTask, ...tasks]);
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
          email={email}
          setEmail={setEmail}
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
            שלום {currentUser?.firstName}! המשימות שלך ({currentUser?.eventType}
            ):
          </h2>
          <TasksList
            tasks={tasks}
            onTaskClick={handleTaskClick}
            onSetReminder={handleSetReminder}
            onEdit={openEditTaskModal}
          />
        </div>
      )}

      <FloatingMenu
        onAddUser={() => alert("חיבור משתמש - בקרוב!")}
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
