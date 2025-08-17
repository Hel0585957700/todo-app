import React, { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../firebase/firebase";

export default function Login({ onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  async function handleLogin(e) {
    e.preventDefault();
    try {
      await signInWithEmailAndPassword(auth, email, password);
      setError("");
      // אין צורך ב-onLogin כי App.jsx מאזין ל-onAuthStateChanged
    } catch (err) {
      console.error(err);
      setError("שגיאה בהתחברות. בדוק אימייל או סיסמה.");
    }
  }

  return (
    <div className="login-container">
      <h2>כניסה לחשבון</h2>
      <form onSubmit={handleLogin}>
        <div>
          <label>אימייל:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>

        <div>
          <label>סיסמה:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit">התחבר</button>
      </form>

      <hr />

      <div style={{ marginTop: "1rem" }}>
        <p>אין לי חשבון?</p>
        <button onClick={onRegister}>פתח חשבון חדש</button>
      </div>
    </div>
  );
}
