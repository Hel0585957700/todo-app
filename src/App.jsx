import React, { useState, useEffect } from "react";
import { signOut } from "firebase/auth";
import { auth } from "./firebase/firebase";

// Components
import Login from "./components/Login";
import Register from "./components/Register";
import Dashboard from "./components/Dashboard";
import EventView from "./components/EventView";

// Services & Hooks
import { subscribeToAuth, saveUserData } from "./services/userService";
import { getAvailableEventTypes } from "./services/defaultTasksService";

export default function App() {
  const [step, setStep] = useState("login");
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [eventTypes, setEventTypes] = useState(['חתן', 'כלה', 'בר מצווה', 'אחר']);

  // טעינת סוגי אירועים מ-Firestore
  useEffect(() => {
    async function loadEventTypes() {
      try {
        const types = await getAvailableEventTypes();
        if (types.length > 0) {
          setEventTypes([...types, 'אחר']);
        }
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
      
      if (user) {
        setStep("dashboard");
      } else {
        setStep("login");
        setSelectedEvent(null); // נקה את האירוע הנבחר
      }
      
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
        registrationEventType: form.eventType, // שומרים כמידע היסטורי
      });

      if (!success) {
        alert("שגיאה בשמירת נתוני המשתמש");
        return;
      }

      // עדכון המשתמש הנוכחי
      setCurrentUser({ uid: user.uid, ...form });
      setStep("dashboard");
      
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
      setSelectedEvent(null); // נקה את האירוע הנבחר
    } catch (error) {
      console.error("Error signing out:", error);
    }
  }

  // בחירת אירוע לצפייה
  function handleSelectEvent(event) {
    console.log('Selected event:', event);
    setSelectedEvent(event);
    setStep("event");
  }

  // חזרה לדשבורד
  function handleBackToDashboard() {
    setSelectedEvent(null);
    setStep("dashboard");
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
      {/* מסך כניסה */}
      {step === "login" && (
        <Login onRegister={() => setStep("register")} />
      )}

      {/* מסך הרשמה */}
      {step === "register" && (
        <Register
          onRegister={handleRegister}
          eventTypes={eventTypes}
          onBackToLogin={() => setStep("login")}
        />
      )}

      {/* דשבורד - רשימת אירועים */}
      {step === "dashboard" && currentUser && (
        <Dashboard
          currentUser={currentUser}
          onLogout={handleLogout}
          onSelectEvent={handleSelectEvent}
        />
      )}

      {/* צפייה באירוע ומשימותיו */}
      {step === "event" && selectedEvent && currentUser && (
        <EventView
          event={selectedEvent}
          currentUser={currentUser}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
    </div>
  );
}