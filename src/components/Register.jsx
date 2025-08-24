import React, { useState } from "react";
import { signUp } from "../authService";

export default function Register({ onRegister, eventTypes, onBackToLogin }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
    firstName: "",
    lastName: "",
    nickname: "",
    eventType: "", // לא חובה יותר
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    // רק שם פרטי, אימייל וסיסמה חובה
    if (!form.email || !form.password || !form.firstName) {
      alert("יש למלא את כל שדות החובה (אימייל, סיסמה ושם פרטי)!");
      return;
    }
    setLoading(true);
    try {
      // רישום אמיתי ב-Firebase
      await signUp(form.email, form.password);

      // אחרי שנרשם — שמור גם פרטים אישיים באפליקציה
      if (onRegister) {
        onRegister(form);
      }
      alert("נרשמת בהצלחה! אפשר עכשיו לנהל אירועים.");
    } catch (error) {
      alert(error.message || "שגיאה ברישום");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card" style={{ maxWidth: 450 }}>
      <h2>הרשמה</h2>
      <form onSubmit={handleSubmit} autoComplete="off">
        <input
          type="email"
          name="email"
          placeholder="אימייל *"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="סיסמה (לפחות 6 תווים) *"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        <input
          name="firstName"
          placeholder="שם פרטי *"
          value={form.firstName}
          onChange={handleChange}
          required
        />
        <input
          name="lastName"
          placeholder="שם משפחה"
          value={form.lastName}
          onChange={handleChange}
        />
        <input
          name="nickname"
          placeholder="כינוי"
          value={form.nickname}
          onChange={handleChange}
        />
        <input
          type="tel"
          name="phone"
          placeholder="מספר טלפון"
          value={form.phone}
          onChange={handleChange}
        />

        {/* סוג אירוע עכשיו אופציונלי - רק למידע */}
        <div style={{ margin: "20px 0" }}>
          <label
            style={{ 
              fontWeight: "600", 
              display: "block", 
              marginBottom: 8,
              color: "#666",
              fontSize: "0.9rem"
            }}
          >
            איזה סוג אירוע אתה מתכנן? (אופציונלי)
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              justifyContent: "center",
            }}
          >
            {eventTypes.map((type) => (
              <button
                type="button"
                key={type}
                className={`eventTypeBtn ${
                  form.eventType === type ? "selected" : ""
                }`}
                onClick={() => setForm({ ...form, eventType: type })}
                style={{
                  padding: "10px 16px",
                  borderRadius: "12px",
                  border:
                    form.eventType === type
                      ? "2px solid #4253f0"
                      : "1px solid #ddd",
                  background: form.eventType === type ? "#f0f4ff" : "#fff",
                  fontWeight: 500,
                  cursor: "pointer",
                  fontSize: "0.85rem"
                }}
              >
                {type}
              </button>
            ))}
          </div>
          <p style={{ 
            fontSize: "0.8rem", 
            color: "#999", 
            textAlign: "center", 
            marginTop: "8px" 
          }}>
            תוכל ליצור ולנהל מספר אירועים אחרי ההרשמה
          </p>
        </div>

        <button type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "נרשם..." : "הירשם והמשך"}
        </button>
      </form>

      <hr style={{ margin: "20px 0" }} />

      <div style={{ textAlign: "center" }}>
        <p style={{ marginBottom: "10px" }}>כבר יש לי חשבון?</p>
        <button 
          type="button"
          onClick={onBackToLogin}
          style={{
            background: "transparent",
            color: "#4253f0",
            border: "2px solid #4253f0",
            fontWeight: "600"
          }}
        >
          חזור לכניסה
        </button>
      </div>
    </div>
  );
}