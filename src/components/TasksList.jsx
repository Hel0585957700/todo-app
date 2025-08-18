import React from "react";

export default function TasksList({
  tasks,
  onTaskClick,
  onSetReminder,
  onEdit,
  onDelete
}) {
  
  if (!tasks || tasks.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>
        <p>אין משימות עדיין. לחץ על ➕ כדי להוסיף משימה ראשונה!</p>
      </div>
    );
  }

  return (
    <ul className="tasks-ul">
      {tasks.map((task) => (
        <li
          key={task.id}
          className={`task-item ${task.status}`}
          onClick={() => task.status !== "done" && onTaskClick(task.id)}
        >
          <div className="task-content">
            <div className="task-text">
              {task.text}
              {task.reminder && (
                <span className="reminder-text">
                  ⏰ {new Date(task.reminder).toLocaleString('he-IL')}
                </span>
              )}
            </div>

            {/* פעמון תזכורת — רק אם המשימה לא בוצעה */}
            {task.status !== "done" && (
              <span
                className="reminder-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  const reminder = prompt("מתי להזכיר לך? (תאריך/שעה/הערה)");
                  if (reminder) {
                    onSetReminder(task.id, reminder);
                  }
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
                  onEdit(task.id);
                }}
              >
                ערוך
              </button>
            )}

            {/* כפתור מחיקה */}
            {typeof onDelete === "function" && (
              <button
                className="task-edit-btn"
                style={{ background: '#ff4757', color: 'white', marginLeft: '8px' }}
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('האם אתה בטוח שברצונך למחוק את המשימה?')) {
                    onDelete(task.id);
                  }
                }}
                title="מחק משימה"
              >
                🗑️
              </button>
            )}
          </div>
        </li>
      ))}
    </ul>
  );
}