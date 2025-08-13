import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FloatingMenu({ onAddUser, onAddTask, onChatAI }) {
  const [open, setOpen] = useState(false);

  function handleOpen() {
    setOpen(true);
  }
  function handleClose() {
    setOpen(false);
  }

  const menuVariants = {
    hidden: { opacity: 0, y: 36, scale: 0.94 },
    visible: { opacity: 1, y: 0, scale: 1 },
  };

  return (
    <div
      className="fab-menu"
      style={{
        position: "fixed",
        left: 32,
        bottom: 32,
        zIndex: 30,
        display: "flex",
        flexDirection: "column-reverse", // תפריט מעל הפלוס
        alignItems: "center",
      }}
      tabIndex={0}
      // תפריט ייפתח ב-hover *וגם* בלחיצה (למובייל), ויסגר בקליק חוזר או ב-mouse leave
      onMouseEnter={handleOpen}
      onMouseLeave={handleClose}
    >
      <motion.button
        className="fab-main"
        aria-label="פעולות מהירות"
        animate={{
          rotate: open ? 45 : 0,
          scale: open ? 1.13 : 1,
        }}
        transition={{ type: "spring", stiffness: 320, damping: 15 }}
        style={{
          marginTop: "0",
        }}
        onClick={() => setOpen(!open)} // לוחצים — סוגר אם פתוח, פותח אם סגור
      >
        +
      </motion.button>
      <AnimatePresence>
        {open && (
          <motion.div
            className="fab-list-vertical"
            initial="hidden"
            animate="visible"
            exit="hidden"
            variants={menuVariants}
            transition={{ type: "spring", duration: 0.34 }}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "15px",
              marginBottom: "15px",
            }}
          >
            <motion.button
              className="fab-action"
              whileHover={{ scale: 1.12, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onAddUser();
                handleClose();
              }}
            >
              👥 חבר משתמש
            </motion.button>
            <motion.button
              className="fab-action"
              whileHover={{ scale: 1.12, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onAddTask();
                handleClose();
              }}
            >
              ➕ הוסף משימה
            </motion.button>
            <motion.button
              className="fab-action"
              whileHover={{ scale: 1.12, y: -4 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                onChatAI();
                handleClose();
              }}
            >
              🤖 שוחח עם AI
            </motion.button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
