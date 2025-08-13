import React, { useState } from "react";
import { signUp } from "../authService"; // <- אתה צריך ליצור את הקובץ הזה כמו ששלחתי קודם

export default function Register({ onRegister, eventTypes }) {
  const [form, setForm] = useState({
    email: "",
    password: "",
    phone: "",
    firstName: "",
    lastName: "",
    nickname: "",
    eventType: "",
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.email || !form.password || !form.firstName || !form.eventType) {
      alert("יש למלא את כל שדות החובה (כולל סיסמה)!");
      return;
    }
    setLoading(true);
    try {
      // רישום אמיתי ב-Firebase
      await signUp(form.email, form.password);

      // אחרי שנרשם — שמור גם פרטים אישיים באפליקציה שלך (Firestore, או רק בזיכרון)
      if (onRegister) {
        onRegister(form);
      }
      alert("נרשמת בהצלחה! אפשר להיכנס עם המייל והסיסמה שלך.");
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
          placeholder="אימייל"
          value={form.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="סיסמה (לפחות 6 תווים)"
          value={form.password}
          onChange={handleChange}
          required
          minLength={6}
        />
        <input
          type="tel"
          name="phone"
          placeholder="מספר טלפון"
          value={form.phone}
          onChange={handleChange}
        />
        <input
          name="firstName"
          placeholder="שם פרטי"
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

        <div style={{ margin: "20px 0" }}>
          <label
            style={{ fontWeight: "bold", display: "block", marginBottom: 8 }}
          >
            בחר סוג אירוע:
          </label>
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "10px",
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
                  padding: "12px 18px",
                  borderRadius: "14px",
                  border:
                    form.eventType === type
                      ? "2px solid #4253f0"
                      : "1px solid #ddd",
                  background: form.eventType === type ? "#f0f4ff" : "#fff",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
        <button type="submit" style={{ width: "100%" }} disabled={loading}>
          {loading ? "נרשם..." : "הירשם והמשך"}
        </button>
      </form>
    </div>
  );
}
