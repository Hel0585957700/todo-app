import React, { useState } from "react";
import { signIn } from "../authService"; // לוודא שיש לך את הקובץ הזה כמו ששלחתי קודם

export default function Login({ onLogin, onRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email || !password) {
      alert("יש למלא גם אימייל וגם סיסמה!");
      return;
    }
    setLoading(true);
    try {
      // התחברות אמיתית ל-Firebase
      await signIn(email, password);
      if (onLogin) {
        onLogin(email); // תעביר הלאה לממשק שלך
      }
    } catch (error) {
      alert(error.message || "שגיאה בהתחברות");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card">
      <h2>ברוך הבא! התחבר או הירשם</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input
          type="email"
          placeholder="אימייל"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="סיסמה"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "מתחבר..." : "המשך"}
        </button>
      </form>
      <br />
      <button onClick={onRegister}>אין לי משתמש</button>
    </div>
  );
}
