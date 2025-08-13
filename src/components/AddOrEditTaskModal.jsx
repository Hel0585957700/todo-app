import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export default function AddOrEditTaskModal({
  open,
  onClose,
  onSave,
  initialTask,
}) {
  const [text, setText] = useState("");
  const [status, setStatus] = useState("todo");
  const [reminder, setReminder] = useState(null);

  useEffect(() => {
    if (initialTask) {
      setText(initialTask.text || "");
      setStatus(initialTask.status || "todo");
      setReminder(initialTask.reminder ? new Date(initialTask.reminder) : null);
    } else {
      setText("");
      setStatus("todo");
      setReminder(null);
    }
  }, [initialTask, open]);

  function handleSave() {
    if (!text.trim()) return;
    onSave({
      text,
      status,
      reminder: reminder ? reminder.toISOString() : "",
    });
    onClose();
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="modal-card"
            initial={{ opacity: 0, scale: 0.9, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            transition={{ 
              type: "spring", 
              stiffness: 300, 
              damping: 25,
              duration: 0.3 
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* כפתור סגירה */}
            <button
              className="modal-close-btn"
              onClick={onClose}
              aria-label="סגור"
            >
              ✕
            </button>

            <h3 className="modal-title">
              {initialTask ? "עריכת משימה" : "הוספת משימה"}
            </h3>

            <input
              className="modal-input"
              autoFocus
              placeholder="תיאור משימה"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={120}
            />

            <div className="status-group">
              <label className="status-label">
                <input
                  type="radio"
                  checked={status === "todo"}
                  onChange={() => setStatus("todo")}
                  className="status-radio"
                />{" "}
                <span className="status-text">לא בוצע</span>
              </label>
              <label className="status-label">
                <input
                  type="radio"
                  checked={status === "inprogress"}
                  onChange={() => setStatus("inprogress")}
                  className="status-radio"
                />{" "}
                <span className="status-text">בתהליך</span>
              </label>
              <label className="status-label">
                <input
                  type="radio"
                  checked={status === "done"}
                  onChange={() => setStatus("done")}
                  className="status-radio"
                />{" "}
                <span className="status-text">בוצע</span>
              </label>
            </div>

            <div className="reminder-section">
              <label className="reminder-label">
                מתי להזכיר לך על המשימה?
              </label>
              <DatePicker
                selected={reminder}
                onChange={(date) => setReminder(date)}
                showTimeSelect
                timeFormat="HH:mm"
                timeIntervals={15}
                dateFormat="dd/MM/yyyy HH:mm"
                placeholderText="בחר תאריך ושעה"
                isClearable
                className="modal-datepicker"
              />
            </div>

            <div className="modal-buttons">
              <button
                className="modal-btn modal-btn-cancel"
                onClick={onClose}
              >
                ביטול
              </button>
              <button
                className="modal-btn modal-btn-save"
                onClick={handleSave}
              >
                שמור משימה
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}