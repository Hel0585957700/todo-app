import React from "react";

export default function TasksList({
  tasks,
  onTaskClick,
  onSetReminder,
  onEdit,
}) {
  return (
    <ul className="tasks-ul">
      {tasks.map((task, i) => (
        <li
          key={i}
          className={`task-item ${task.status}`}
          onClick={() => task.status !== "done" && onTaskClick(i)}
        >
          <div className="task-content">
            <div className="task-text">
              {task.text}
              {task.reminder && (
                <span className="reminder-text">⏰ {task.reminder}</span>
              )}
            </div>

            {/* פעמון תזכורת — רק אם המשימה לא בוצעה */}
            {task.status !== "done" && (
              <span
                className="reminder-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  const reminder = prompt("מתי להזכיר לך? (תאריך/שעה/הערה)");
                  onSetReminder(i, reminder);
                }}
                title="הוסף תזכורת"
              >
                🔔
              </span>
            )}

            {/* כפתור עריכה — רק אם המשימה לא בוצעה */}
            {task.status !== "done" && typeof onEdit === "function" && (
              <button
                className="task-edit-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(i);
                }}
              >
                ערוך
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}
